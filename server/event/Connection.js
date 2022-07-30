// Connection Events

//dependencies: file parsing
const path = require('path');
const jsonPath = require('jsonpath');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));
const roomConfig = require(path.join(__dirname, '../config/room.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const chatLogs = require(path.join(__dirname, '../utility/ChatLogs.js'));
const serverMetrics = require(path.join(
    __dirname,
    '../utility/ServerMetrics.js'
));
const moderation = require(path.join(__dirname, '../utility/Moderation.js'));
const emoteLib = require(path.join(__dirname, '../utility/Emotes.js'));

//import events
const PlayerData = require(path.join(__dirname, 'PlayerData.js'));
const Room = require(path.join(__dirname, 'Room.js'));

class Connection {
    //LOCAL VARIABLES
    roomInstance;
    playerData;

    constructor(io, socket) {
        //save socket and socket.io instance
        this.socket = socket;
        this.io = io;

        // OVERRIDES
        this.socket.removeListener = function (name) {
            if (socket.events.hasOwnProperty(name)) {
                delete socket.events[name];
            }
        };

        //init PlayerData instance
        this.playerData = new PlayerData(io, socket);
    }

    async init() {
        //user info not found
        if (!this.socket.request.user) {
            //kick instance
            this.socket.disconnect();

            return;
        }

        //id not found
        if (!this.socket.request.user.data[0].id) {
            //kick instance
            this.socket.disconnect();

            return;
        }

        //id exists
        else {
            //send game version
            this.socket.emit('payloadGameVer', config.version);

            //kick other connection instances of this player
            await moderation.kickClientsWithID(
                this.io,
                this.socket.request.user.data[0].id
            );

            //set up player data
            this.socket.player = await this.playerData.getPlayerData();

            //register events
            this.register();
        }
    }

    async register() {
        //add 1 to player count
        serverMetrics.playerJoined();

        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Connected' +
                    ' [Online Players: ' +
                    serverMetrics.getPlayerCount() +
                    ']'
            )
        );

        //latency calculation
        this.socket.on('ping', (cb) => {
            if (typeof cb === 'function') cb();
        });

        //triggers when client requests emotes
        // this.socket.on('requestEmotes', () => this.requestEmotes());

        //triggers when client requests the players data
        this.socket.on('requestLoadData', (cb) => {
            var loadData = {};
            loadData['player'] = this.playerData.requestClientPlayerData();
            // loadData['emotes'] = emoteLib.getEmotes();

            cb(loadData);
        });

        //triggers when client requests the players data
        this.socket.on('requestClientPlayerData', (cb) => {
            cb(this.playerData.requestClientPlayerData());
        });

        //triggers when client changes their player data and may want to go to next scene only AFTER the data has been updated
        this.socket.on('updateClientPlayerData', (data, cb) => {
            this.playerData.updateClientPlayerData(data);
            cb();
        });

        //triggers when client leaves a room
        this.socket.on('leaveRoom', () => this.leaveRoom());

        //triggers when client joins a room
        this.socket.on('joinRoom', async (room, cb) => {
            cb(await this.joinRoom(room));
        });

        //triggers on connection error
        this.socket.on('connect_error', (err) => {
            console.log(
                utility.timestampString(
                    'PLAYER ID: ' +
                        this.socket.player.id +
                        ' (' +
                        this.socket.player.name +
                        ')' +
                        ' - Connection Error: ' +
                        err
                )
            );
        });

        //triggers when player disconnects their client
        this.socket.on('disconnect', () => this.onDisconnect());
    }

    //triggers when client leaves a room
    leaveRoom() {
        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Left Room: ' +
                    this.socket.roomID
            )
        );

        //send the removal of the player for ALL clients in this room
        this.io
            .in(this.socket.roomID)
            .emit('removePlayer', this.socket.player.id);

        //leave rooms
        this.leaveAllSocketRooms();
    }

    //triggers on player loading into new room
    async joinRoom(room) {
        //leave rooms currently in
        if (this.socket.roomID) this.leaveRoom();

        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Joined Room: ' +
                    room
            )
        );

        //store player data in database
        this.playerData.storePlayerData();

        //add player to room
        this.joinSocketRoom(room);

        //register room events
        if (!this.roomInstance) {
            //new room instance
            this.roomInstance = new Room(this.io, this.socket, room);
            await this.roomInstance.init();
        } else {
            //store room
            this.roomInstance.room = room;
        }

        //get room spawnpoint data
        const roomSpawnpoint = jsonPath.query(
            roomConfig,
            '$..' + room + '.spawnpoint'
        )[0];

        //set new location for this client dependent on room config
        this.socket.player.x = utility.getRandomInt(
            roomSpawnpoint.minX,
            roomSpawnpoint.maxX
        );
        this.socket.player.y = utility.getRandomInt(
            roomSpawnpoint.minY,
            roomSpawnpoint.maxY
        );

        //send new player to ONLY OTHER clients in this room
        this.socket
            .to(this.socket.roomID)
            .emit('payloadNewPlayerData', this.socket.player);

        //init room info
        var roomInfo = {};

        //send all currently connected players in this room to ONLY THIS client
        roomInfo['players'] = await this.playerData.getAllPlayers(
            this.socket.roomID
        );

        //send chat log of this room to this player
        roomInfo['chatLog'] = chatLogs.getRoomLogs(room);

        return roomInfo;
    }

    //add player to room
    joinSocketRoom(room) {
        //join new room
        this.socket.join(room);

        //set as current room
        this.socket.roomID = room;
    }

    //remove player from all rooms
    leaveAllSocketRooms() {
        //leave room
        this.socket.leave(this.socket.roomID);

        //delete players room ID
        delete this.socket.roomID;
    }

    //on disconnect
    onDisconnect() {
        //remove 1 from playercount
        serverMetrics.playerLeft();

        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Disconnected' +
                    ' [Online Players: ' +
                    serverMetrics.getPlayerCount() +
                    ']'
            )
        );

        //calculate player's play time
        let totalPlayTimeInSeconds = this.socket.player.stat.playTime
            ? this.socket.player.stat.playTime
            : 0;
        let sessionPlayTimeInSeconds = Math.floor(
            (Date.now() - this.socket.player.stat.loginTime) / 1000
        );
        this.socket.player.stat.playTime =
            totalPlayTimeInSeconds + sessionPlayTimeInSeconds;

        //store last login date
        this.socket.player.stat.lastLogin = Date.now();

        //store players last room
        this.socket.player.stat.lastRoom = this.socket.roomID;

        //store player data in database
        this.playerData.storePlayerData();

        //send the removal of the player for ALL clients in this room
        this.io
            .in(this.socket.roomID)
            .emit('removePlayer', this.socket.player.id);
    }

    //triggers when client requests emotes
    requestEmotes() {
        //send emotes to this client
        this.socket.emit('payloadEmotes', this.socket.player);
    }
}

module.exports = Connection;
