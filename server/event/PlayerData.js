// PlayerData Events

//dependencies
const path = require('path');

//get config values
const roomConfig = require(path.join(__dirname, '../config/room.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const database = require(path.join(__dirname, '../utility/Database.js'));

class PlayerData {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;
    }

    //get player data
    async getPlayerData() {
        //get room spawnpoint data
        const roomSpawnpoint = roomConfig.forest.spawnpoint;

        //set up initial data
        var playerData = {
            //get ID
            id: this.socket.request.user.data[0].id,

            //get name
            name: this.socket.request.user.data[0].display_name,

            // //generate starting location
            // x: utility.getRandomInt(roomSpawnpoint.minX, roomSpawnpoint.maxX),
            // y: utility.getRandomInt(roomSpawnpoint.minY, roomSpawnpoint.maxY),

            //generate direction
            direction: utility.randomFromArray(['right', 'left']),
        };

        //check if character data exists
        var pathExists = await database.pathExists(
            'users/' + this.socket.request.user.data[0].id + '/character'
        );

        //get character data from database
        if (pathExists) {
            playerData.character = {
                eye_type: await database.getValue(
                    'users/' +
                        this.socket.request.user.data[0].id +
                        '/character/eye_type'
                ),
                color: await database.getValue(
                    'users/' +
                        this.socket.request.user.data[0].id +
                        '/character/color'
                ),
            };
        }

        //check if currency data exists
        pathExists = await database.pathExists(
            'users/' + this.socket.request.user.data[0].id + '/currency'
        );

        //get currency data from database
        if (pathExists) {
            playerData.currency = {
                clovers: await database.getValue(
                    'users/' +
                        this.socket.request.user.data[0].id +
                        '/currency/clovers'
                ),
            };
        }

        return playerData;
    }

    //store player data in database
    storePlayerData() {
        //init path
        var path;

        //character
        if (this.socket.player.character) {
            var path = 'users/' + this.socket.player.id + '/character';
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

        //currency
        if (this.socket.player.currency) {
            path = 'users/' + this.socket.player.id + '/currency';
            if (this.socket.player.currency.clovers != undefined)
                database.setValue(
                    path + '/clovers',
                    this.socket.player.currency.clovers
                );
        }
    }

    //triggers when client requests the players data
    requestClientPlayerData() {
        //log
        console.log(
            utility.timestampString(
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
            )
        );

        //send this client's player data to ONLY THIS client
        return this.socket.player;
    }

    //triggers when player reloads their client and requests current player data
    async requestAllPlayersInRoom() {
        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Reloaded Room: ' +
                    this.socket.roomID
            )
        );

        //send current position of all connected players in this room to ONLY THIS client
        const currentPlayers = await this.getAllPlayers(this.socket.roomID);
        return currentPlayers;
    }

    //triggers when client changes their player data and may want to go to next scene only AFTER the data has been updated
    updateClientPlayerData(data) {
        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Updated Player Data'
            )
        );

        //update character
        if (!this.socket.player.character && data.character)
            this.socket.player.character = {};
        if (data.character) {
            if (data.character.eye_type != undefined)
                this.socket.player.character.eye_type = data.character.eye_type;
            if (data.character.color != undefined)
                this.socket.player.character.color = data.character.color;
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
