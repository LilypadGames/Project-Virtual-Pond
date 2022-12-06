// PlayerData Events

//config
import config from '../config/config.json' assert { type: 'json' };

//imports
import utility from '../module/Utility.js';
import database from '../module/Database.js';
import logs from '../module/Logs.js';

//event handlers
import Inventory from '../event/Inventory.js';

class PlayerData {
    constructor(io, socket) {
        this.socket = socket;
        this.io = io;

        //get user data path
        if (config.server.bypassAuth) {
            //auth mode disabled
            this.userDataPath = 'users_temp/';
        } else {
            //auth mode enabled
            this.userDataPath = 'users/';
        }

        //init Inventory instance
        this.Inventory = new Inventory(this.io, this.socket, this);
    }

    async init() {
        //register events
        await this.register();

        //set up inventory instance
        await this.Inventory.init();
    }

    async register() {
        //triggers when client requests the players data
        this.socket.on('requestClientPlayerData', (cb) => {
            cb(
                this.requestParsedPlayerData(
                    this.socket.player,
                    this.socket.player
                )
            );
        });

        //triggers when client changes their player character data (Character Creator)
        this.socket.on('requestCharacterDataUpdate', (data, cb) => {
            this.requestCharacterDataUpdate(data);
            cb();
        });
    }

    //get player data from database
    async getPlayerData() {
        //initialize player if this is their first time logging in
        let playerData = await this.initPlayerData();

        //get character data from database
        if (
            await database.pathExists(
                this.userDataPath + playerData.id + '/character'
            )
        ) {
            playerData.character = utility.mergeObjects(
                await database.getValue(
                    this.userDataPath + playerData.id + '/character'
                ),
                playerData.character
            );
        }
        //no character data found: init them
        else {
            playerData.character = {
                color: 917248,
                eye_type: 'normal',
            };
            playerData.external = {
                newfrog: true,
            };
        }

        //get inventory data from database
        if (
            await database.pathExists(
                this.userDataPath + playerData.id + '/inventory'
            )
        ) {
            playerData.inventory = utility.mergeObjects(
                await database.getValue(
                    this.userDataPath + playerData.id + '/inventory'
                ),
                playerData.inventory
            );
        }

        //get stat data from database
        if (
            await database.pathExists(
                this.userDataPath + playerData.id + '/stat'
            )
        ) {
            playerData.stat = utility.mergeObjects(
                await database.getValue(
                    this.userDataPath + playerData.id + '/stat'
                ),
                playerData.stat
            );
        }

        //get currency data from database
        if (
            await database.pathExists(
                this.userDataPath + playerData.id + '/currency'
            )
        ) {
            playerData.currency = utility.mergeObjects(
                await database.getValue(
                    this.userDataPath + playerData.id + '/currency'
                ),
                playerData.currency
            );
        }

        return playerData;
    }

    //initialize player data in database
    async initPlayerData() {
        /////// BUG FIX
        if (
            typeof (await database.getValue(
                this.userDataPath +
                    this.socket.request.user.data[0].id +
                    '/character/eye_type'
            )) !== 'string'
        ) {
            await database.setValue(
                this.userDataPath +
                    this.socket.request.user.data[0].id +
                    '/character',
                ''
            );
        }

        //set up initial data
        var playerData = {
            //get ID
            id: this.socket.request.user.data[0].id,

            //get name
            name: this.socket.request.user.data[0].display_name,

            //generate direction
            direction: utility.randomFromArray(['right', 'left']),

            //character
            character: {},

            //stats
            stat: {},

            //login time
            internal: {
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

        //sponsor
        if (playerData.isAdmin || playerData.isMod || playerData.isVIP) {
            playerData.isSponsor = 1;
        } else {
            playerData.isSponsor = (await database.getValue(
                'donations/' +
                    this.socket.request.user.data[0].id +
                    '/donatorPerks'
            ))
                ? (await database.getValue(
                      'donations/' +
                          this.socket.request.user.data[0].id +
                          '/donatorPerks'
                  ))
                    ? 1
                    : 0
                : 0;
        }

        //default name color for sponsors is gold (#ffd700 / 16766720)
        if (
            playerData.isSponsor &&
            !(await database.getValue(
                'users/' +
                    this.socket.request.user.data[0].id +
                    '/character/nameColor'
            ))
        ) {
            playerData.character.nameColor = utility.hex.toDecimal('ffd700');
        }

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
        //name
        if (this.socket.player.name) {
            if (this.socket.player.name != undefined)
                database.setValue(
                    this.userDataPath + this.socket.player.id + '/name',
                    this.socket.player.name
                );
        }

        //character
        if (this.socket.player.character) {
            if (this.socket.player.character != undefined)
                database.setValue(
                    this.userDataPath + this.socket.player.id + '/character',
                    this.socket.player.character
                );
        }

        //inventory
        if (this.socket.player.inventory) {
            if (this.socket.player.inventory != undefined)
                database.setValue(
                    this.userDataPath + this.socket.player.id + '/inventory',
                    this.socket.player.inventory
                );
        }

        //stat
        if (this.socket.player.stat) {
            if (this.socket.player.stat != undefined)
                database.updateValue(
                    this.userDataPath + this.socket.player.id + '/stat',
                    this.socket.player.stat
                );
        }

        //currency
        if (this.socket.player.currency) {
            if (this.socket.player.currency != undefined)
                database.setValue(
                    this.userDataPath + this.socket.player.id + '/currency',
                    this.socket.player.currency
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
        database.setValue(
            this.userDataPath + this.socket.player.id + path,
            value
        );
    }

    //changes specific client player data from specified path
    async changeSpecificClientPlayerData(path, delta) {
        let currentData = await this.getSpecificClientPlayerData(path);
        database.setValue(
            this.userDataPath + this.socket.player.id + path,
            currentData + delta
        );
    }

    //triggers when player updates their characters look in the Character Creator
    requestCharacterDataUpdate(data) {
        //init data
        let characterData = { character: {} };

        //add color
        if (data.color && typeof data.color === 'number')
            characterData.character.color = data.color;

        //add eye type
        if (data.eye_type && typeof data.eye_type === 'string')
            characterData.character.eye_type = data.eye_type;

        //add accessory
        if (data.accessory && typeof data.accessory === 'string') {
            //set only if player owns the accessory
            if (this.socket.player.inventory) {
                if (data.accessory in this.socket.player.inventory.accessory) {
                    characterData.character.accessory = data.accessory;
                }
            }
        }

        //update player data
        this.updateClientPlayerData(characterData);
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
            this.socket.player.character = data.character;
        }

        //update stats
        if (!this.socket.player.stat && data.stat) this.socket.player.stat = {};
        if (data.stat) {
            this.socket.player.stat = data.stat;
        }

        //update currency
        if (!this.socket.player.currency && data.currency)
            this.socket.player.currency = {};
        if (data.currency) {
            this.socket.player.currency = data.currency;
        }
    }

    //triggers when client requests the players data
    // requestClientPlayerData() {
    //     //log
    //     let logMessage = utility.timestampString(
    //         'PLAYER ID: ' +
    //             this.socket.player.id +
    //             ' (' +
    //             this.socket.player.name +
    //             ')' +
    //             ' - Requested Player Data: ' +
    //             this.socket.player.id +
    //             ' (' +
    //             this.socket.player.name +
    //             ')'
    //     );
    //     logs.logMessage('debug', logMessage);

    //     //give ONLY the data the client needs from the server
    //     let playerData = {
    //         //ID
    //         id: this.socket.player.id,

    //         //name
    //         name: this.socket.player.name,

    //         //direction
    //         direction: this.socket.player.direction,

    //         //location
    //         x: this.socket.player.x,
    //         y: this.socket.player.y,

    //         //character data
    //         character: this.socket.player.character,

    //         //inventory data
    //         inventory: this.socket.player.inventory,
    //     };
    //     if (this.socket.player.external) playerData.external = this.socket.player.external;

    //     //send last room if available
    //     if (this.socket.player.stat !== undefined) {
    //         if (this.socket.player.stat.lastRoom !== undefined) {
    //             if (playerData.stat === undefined) playerData.stat = {};
    //             playerData.stat.lastRoom = this.socket.player.stat.lastRoom;
    //         }
    //     }

    //     //send this client's player data to ONLY THIS client
    //     return playerData;
    // }

    //parses data of the provided player to only give the client necessary information about them
    requestParsedPlayerData(player, requester) {
        //persistent data
        let playerData = {
            id: player.id,
            name: player.name,
            direction: player.direction,
            x: player.x,
            y: player.y,
            character: player.character,
            isSponsor: player.isSponsor,
        };

        //if client is requesting
        if (requester && requester === this.socket.player) {
            //if player has inventory
            if (player.inventory) playerData.inventory = player.inventory;

            //external
            if (player.external) playerData.external = player.external;
        }

        return playerData;
    }

    //get parsed data of all currently connected players
    async requestAllParsedPlayerData(room) {
        //init player data
        let playerData = [];

        //get list of all connected player data
        let playerList = await this.getAllPlayers(room);

        //parse player data
        for (let i = 0; i < playerList.length; i++) {
            playerData.push(
                this.requestParsedPlayerData(playerList[i], this.socket.player)
            );
        }

        return playerData;
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

    //triggers when player reloads their client and requests current player data
    async requestRoomUpdate() {
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
        const playerData = await this.requestAllParsedPlayerData(
            this.socket.roomID
        );
        return playerData;
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

export default PlayerData;
