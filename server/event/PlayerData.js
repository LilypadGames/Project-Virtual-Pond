// PlayerData Events

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const database = require(path.join(__dirname, '../utility/Database.js'));
const logs = require(path.join(__dirname, '../utility/Logs.js'));

class PlayerData {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;

        //get user data path
        if (config.server.bypassAuth) {
            //auth mode disabled
            this.userDataPath = 'users_temp/'
        }
        else {
            //auth mode enabled
            this.userDataPath = 'users/'
        }
    }

    //get player data from database
    async getPlayerData() {
        //initialize player if this is their first time logging in
        let playerData = await this.initPlayerData();

        //get character data from database
        if (
            await database.pathExists(this.userDataPath + playerData.id + '/character')
        ) {
            playerData.character = utility.mergeObjects(
                await database.getValue(
                    this.userDataPath + playerData.id + '/character'
                ),
                playerData.character
            );
        }

        //get stat data from database
        if (await database.pathExists(this.userDataPath + playerData.id + '/stat')) {
            playerData.stat = utility.mergeObjects(
                await database.getValue(this.userDataPath + playerData.id + '/stat'),
                playerData.stat
            );
        }

        //get currency data from database
        if (await database.pathExists(this.userDataPath + playerData.id + '/currency')) {
            playerData.currency = utility.mergeObjects(
                await database.getValue(this.userDataPath + playerData.id + '/currency'),
                playerData.currency
            );
        }

        return playerData;
    }

    //initialize player data in database
    async initPlayerData() {
        //set up initial data
        var playerData = {
            //get ID
            id: this.socket.request.user.data[0].id,

            //get name
            name: this.socket.request.user.data[0].display_name,

            //generate direction
            direction: utility.randomFromArray(['right', 'left']),

            //login time
            stat: {
                loginTime: Date.now(),
            },

            //permissions
            isAdmin: (await database.getValue(
                'permissions/admin/' + this.socket.request.user.data[0].id
            ))
                ? await database.getValue(
                      'permissions/admin/' + this.socket.request.user.data[0].id
                  )
                : 0,
            isMod: (await database.getValue(
                'permissions/mod/' + this.socket.request.user.data[0].id
            ))
                ? await database.getValue(
                      'permissions/mod/' + this.socket.request.user.data[0].id
                  )
                : 0,
            isVIP: (await database.getValue(
                'permissions/vip/' + this.socket.request.user.data[0].id
            ))
                ? await database.getValue(
                        'permissions/vip/' + this.socket.request.user.data[0].id
                    )
                : 0,
        };

        //first login stat
        if (
            !(await database.getValue(
                this.userDataPath + playerData.id + '/stat' + '/firstLogin'
            ))
        ) {
            //get first login data
            playerData.stat.firstLogin = Date.now();

            //push current data to database
            this.socket.player = playerData;
            this.storePlayerData();
        }

        return playerData;
    }

    //store player data in database
    storePlayerData() {
        //init path
        var path;

        //name
        if (this.socket.player.name) {
            var path = this.userDataPath + this.socket.player.id;
            if (this.socket.player.name != undefined)
                database.setValue(path + '/name', this.socket.player.name);
        }

        //character
        if (this.socket.player.character) {
            var path = this.userDataPath + this.socket.player.id + '/character';
            if (this.socket.player.character.eye_type != undefined)
                database.setValue(
                    path + '/eye_type',
                    this.socket.player.character.eye_type
                );
            if (this.socket.player.character.color != undefined)
                database.setValue(
                    path + '/color',
                    this.socket.player.character.color
                );
        }

        //stat
        if (this.socket.player.stat) {
            var path = this.userDataPath + this.socket.player.id + '/stat';
            if (this.socket.player.stat.lastLogin != undefined)
                database.setValue(
                    path + '/lastLogin',
                    this.socket.player.stat.lastLogin
                );
            if (this.socket.player.stat.firstLogin != undefined)
                database.setValue(
                    path + '/firstLogin',
                    this.socket.player.stat.firstLogin
                );
            if (this.socket.player.stat.playTime != undefined)
                database.setValue(
                    path + '/playTime',
                    this.socket.player.stat.playTime
                );
            if (this.socket.player.stat.lastRoom != undefined)
                database.setValue(
                    path + '/lastRoom',
                    this.socket.player.stat.lastRoom
                );
        }

        //currency
        if (this.socket.player.currency) {
            path = this.userDataPath + this.socket.player.id + '/currency';
            if (this.socket.player.currency.clovers != undefined)
                database.setValue(
                    path + '/clovers',
                    this.socket.player.currency.clovers
                );
        }
    }

    //gets specific client player data from specified path
    async getSpecificClientPlayerData(path) {
        let value = await database.getValue(
            this.userDataPath + this.socket.player.id + path
        );
        return value;
    }

    //sets specific client player data from specified path
    async setSpecificClientPlayerData(path, value) {
        database.setValue(this.userDataPath + this.socket.player.id + path, value);
    }

    //changes specific client player data from specified path
    async changeSpecificClientPlayerData(path, delta) {
        let currentData = await this.getSpecificClientPlayerData(path);
        database.setValue(
            this.userDataPath + this.socket.player.id + path,
            currentData + delta
        );
    }

    //triggers when client requests the players data
    requestClientPlayerData() {
        //log
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' - Requested Player Data: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')'
        );
        logs.logMessage('debug', logMessage);

        //give ONLY the data the client needs from the server
        let playerData = {
            //ID
            id: this.socket.player.id,

            //name
            name: this.socket.player.name,

            //direction
            direction: this.socket.player.direction,

            //location
            x: this.socket.player.x,
            y: this.socket.player.y,

            //character data
            character: this.socket.player.character,
        };

        //send last room if available
        if (this.socket.player.stat !== undefined) {
            if (this.socket.player.stat.lastRoom !== undefined) {
                if (playerData.stat === undefined) playerData.stat = {};
                playerData.stat.lastRoom = this.socket.player.stat.lastRoom;
            }
        }

        //send this client's player data to ONLY THIS client
        return playerData;
    }

    //triggers when player reloads their client and requests current player data
    async requestAllPlayersInRoom() {
        //log
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' - Reloaded Room: ' +
                this.socket.roomID
        );
        logs.logMessage('debug', logMessage);

        //send current position of all connected players in this room to ONLY THIS client
        const currentPlayers = await this.getAllPlayers(this.socket.roomID);
        return currentPlayers;
    }

    //triggers when client changes their player data and may want to go to next scene only AFTER the data has been updated
    updateClientPlayerData(data) {
        //log
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' - Updated Player Data'
        );
        logs.logMessage('debug', logMessage);

        //update character
        if (!this.socket.player.character && data.character)
            this.socket.player.character = {};
        if (data.character) {
            if (data.character.eye_type != undefined)
                this.socket.player.character.eye_type = data.character.eye_type;
            if (data.character.color != undefined)
                this.socket.player.character.color = data.character.color;
        }

        //update stats
        if (!this.socket.player.stat && data.stat) this.socket.player.stat = {};
        if (data.stat) {
            if (data.stat.lastLogin != undefined)
                this.socket.player.stat.lastLogin = data.stat.lastLogin;
            if (data.stat.firstLogin != undefined)
                this.socket.player.stat.firstLogin = data.stat.firstLogin;
            if (data.stat.playTime != undefined)
                this.socket.player.stat.playTime = data.stat.playTime;
            if (data.stat.lastRoom != undefined)
                this.socket.player.stat.lastRoom = data.stat.lastRoom;
        }

        //update currency
        if (!this.socket.player.currency && data.currency)
            this.socket.player.currency = {};
        if (data.currency) {
            if (data.currency.clovers != undefined)
                this.socket.player.currency.clovers = data.currency.clovers;
        }
    }

    //get currently connected players as an array
    async getAllPlayers(room) {
        //init connected player list
        var connectedPlayers = [];
        var connectedClients;

        //get connected clients
        if (room) {
            connectedClients = await this.io.in(room).fetchSockets();
        } else {
            connectedClients = await this.io.fetchSockets();
        }

        //loop through connected clients
        for (const client of connectedClients) {
            //get player information from this client
            var player = client.player;

            //if there is player information, add them to the connected player list
            if (player) {
                connectedPlayers.push(player);
            }
        }

        //return list of connected players
        return connectedPlayers;
    }

    //reset message data
    resetMessageData(messageID) {
        //reset message data if its the same as the players current message
        if (this.socket.player.message) {
            if (this.socket.player.message.id == messageID)
                delete this.socket.player.message;
        }
    }
}

module.exports = PlayerData;
