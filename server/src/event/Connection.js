// Connection Events

//imports: file parsing
import jsonPath from 'jsonpath';

//config
import config from '../../config.json' assert { type: 'json' };
import roomData from '../../data/roomData.json' assert { type: 'json' };

//modules
import utility from '../module/Utility.js';
import log from '../module/Logs.js';
import chatLogs from '../module/ChatLogs.js';
import serverMetrics from '../module/ServerMetrics.js';
import moderation from '../module/Moderation.js';
import globalData from '../module/GlobalData.js';

//event handlers
import PlayerData from './PlayerData.js';
import Events from './Events.js';
import Room from './Room.js';

class Connection {
    constructor(io, socket, api) {
        //store socket and socket.io instance
        this.socket = socket;
        this.io = io;

        //store api
        this.api = api;

        // OVERRIDES
        this.socket.removeListener = function (name) {
            if (socket.events.hasOwnProperty(name)) {
                delete socket.events[name];
            }
        };

        //init PlayerData instance
        this.PlayerData = new PlayerData(this.io, this.socket);

        //init Events instance
        this.Events = new Events(this.io, this.socket, this.PlayerData);
    }

    async init() {
        //auth enabled
        if (!config.server.bypassAuth) {
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
                // //send global data
                // this.socket.emit('payloadGlobalData', globalData.get());

                //kick other connection instances of this player
                await moderation.kickClientsWithID(
                    this.io,
                    this.socket.request.user.data[0].id
                );

                //set up player data
                this.socket.player = await this.PlayerData.getPlayerData();

                //max player count reached
                if (
                    serverMetrics.getPlayerCount() >= config.server.playerLimit
                ) {
                    //if player is not a sponsor, admin, mod, or vip, then kick them
                    if (
                        !this.socket.player.isSponsor ||
                        !this.socket.player.isVIP ||
                        !this.socket.player.isAdmin ||
                        !this.socket.player.isMod
                    ) {
                        await moderation.kickSocket(
                            this.socket,
                            'Server is Currently Full. Please Try Again Later.'
                        );
                        return;
                    }
                }

                //register events
                await this.register();
            }
        }

        //auth disabled
        else {
            // //send global data
            // this.socket.emit('payloadGlobalData', globalData.get());

            //set up player data
            this.socket.player = {
                id: this.io.guestID,
                name: 'Guest',
                direction: 'left',
                character: {
                    eye_type: 'happy',
                    color: 0,
                },
            };

            //register events
            await this.register();

            //increment ID
            this.io.guestID = this.io.guestID + 1;
        }

        //init playerdata events
        await this.PlayerData.init();

        //init party events
        await this.Events.init();
    }

    async register() {
        //add 1 to player count
        serverMetrics.playerJoined(this.socket);

        //log
        log.socketAction(
            this.socket,
            'Connected [Players Online: ' + serverMetrics.getPlayerCount() + ']'
        );

        //latency calculation
        this.socket.on('ping', (cb) => {
            if (typeof cb === 'function') cb();
        });

        //triggers when client requests the players data
        this.socket.on('requestLoadData', async (cb) => {
            var loadData = {};
            loadData['player'] = this.PlayerData.requestParsedPlayerData(
                this.socket.player,
                this.socket.player
            );

            cb(loadData);
        });

        //triggers when client requests global data
        this.socket.on('requestGlobalData', async (cb) => {
            let data = await globalData.get();
            cb(data);
        });

        //triggers when client is attempting to join a room
        this.socket.on('requestRoom', async (room, cb) => {
            cb(await this.requestRoom(utility.sanitize.string(room)));
        });

        //triggers when client leaves a room
        this.socket.on('leaveRoom', () => this.leaveRoom());

        //triggers when client joins a room
        this.socket.on('joinRoom', async (room, cb) => {
            cb(await this.joinRoom(utility.sanitize.string(room)));
        });

        //triggers on connection error
        this.socket.on('connect_error', (err) => {
            log.socketAction(this.socket, 'Connection Error: ' + err);
        });

        //logout
        this.socket.on('logout', () => {
            //log
            log.socketAction(this.socket, 'Logged Out');

            //disconnect
            this.socket.disconnect();
        });

        //triggers when player disconnects their client
        this.socket.on('disconnect', () => this.onDisconnect());
    }

    //triggers when client is attempting to join a room
    requestRoom(room) {
        //no room provided
        if (!room) {
            //check for last room
            if (this.socket.player.room) {
                room = this.socket.player.room;
            }
            //otherwise provide default room
            else {
                room = 'forest';
            }
        }

        //log
        log.socketAction(this.socket, 'Attempting to Join Room: ' + room, {
            file: 'debug',
        });

        //determine whether player can join this room

        //send room joined
        return room;
    }

    //triggers when client leaves a room
    leaveRoom() {
        //log
        log.socketAction(this.socket, 'Left Room: ' + this.socket.player.room);

        //send the removal of the player for ALL clients in this room
        this.io
            .in(this.socket.player.room)
            .emit('removePlayer', this.socket.player.id);

        //leave rooms
        this.leaveAllSocketRooms();
    }

    //triggers on player loading into new room
    async joinRoom(room) {
        //leave rooms currently in
        if (this.socket.player.room) this.leaveRoom();

        //log
        log.socketAction(this.socket, 'Joined Room: ' + room);

        //add player to room
        this.joinSocketRoom(room);

        //store player data if authentication is enabled
        if (!config.server.bypassAuth) {
            //store player data in database
            this.PlayerData.storePlayerData();
        }

        //register room events
        if (!this.roomInstance) {
            //new room instance
            this.roomInstance = new Room(
                this.io,
                this.socket,
                this.PlayerData,
                room
            );
            await this.roomInstance.init();
        } else {
            //store room
            this.roomInstance.changeRoom(room);
        }

        //get room spawnpoint data
        const roomSpawnpoint = jsonPath.query(
            roomData,
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
        let newPlayerData = this.PlayerData.requestParsedPlayerData(
            this.socket.player
        );
        this.socket
            .to(this.socket.player.room)
            .emit('payloadNewPlayerData', newPlayerData);

        //init room info
        var roomInfo = {};

        //send all currently connected players in this room to ONLY THIS client
        roomInfo['players'] = await this.PlayerData.requestAllParsedPlayerData(
            this.socket.player.room
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
        this.socket.player.room = room;
    }

    //remove player from all rooms
    leaveAllSocketRooms() {
        //leave room
        this.socket.leave(this.socket.player.room);

        //delete players room ID
        delete this.socket.player.room;
    }

    //on disconnect
    onDisconnect() {
        //remove 1 from player count
        serverMetrics.playerLeft(this.socket);

        //log
        log.socketAction(
            this.socket,
            'Disconnected [Players Online: ' +
                serverMetrics.getPlayerCount() +
                ']'
        );

        //pass disconnect to other classes
        this.Events.onDisconnect();

        //auth enabled
        if (!config.server.bypassAuth) {
            //calculate player's play time
            let totalPlayTimeInSeconds = this.socket.player.stat.playTime
                ? this.socket.player.stat.playTime
                : 0;
            let sessionPlayTimeInSeconds = Math.floor(
                (Date.now() - this.socket.player.internal.loginTime) / 1000
            );
            this.socket.player.stat.playTime =
                totalPlayTimeInSeconds + sessionPlayTimeInSeconds;

            //store last login date
            this.socket.player.stat.lastLogin = Date.now();

            //store player data in database
            this.PlayerData.storePlayerData();
        }

        //send the removal of the player for ALL clients in this room
        this.io
            .in(this.socket.player.room)
            .emit('removePlayer', this.socket.player.id);
    }
}

export default Connection;
