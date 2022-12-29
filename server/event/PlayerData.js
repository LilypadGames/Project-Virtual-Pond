// PlayerData Events

//config
import config from '../config/config.json' assert { type: 'json' };
import rankData from '../data/rankData.json' assert { type: 'json' };

//imports
import utility from '../module/Utility.js';
import database from '../module/Database.js';
import log from '../module/Logs.js';

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
        /// BUG FIX
        //if they have the old eye_type, reset their character data
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
        //if they have the old lastRoom stat, remove it
        if (
            await database.getValue(
                this.userDataPath +
                    this.socket.request.user.data[0].id +
                    '/stat/lastRoom'
            )
        ) {
            await database.removeValue(
                this.userDataPath +
                    this.socket.request.user.data[0].id +
                    '/stat/lastRoom'
            );
        }

        //set up initial data
        var playerData = {
            //get ID
            id: this.socket.request.user.data[0].id,

            //get name
            name: this.socket.request.user.data[0].display_name,

            //room
            room: (await database.getValue(
                this.userDataPath +
                    this.socket.request.user.data[0].id +
                    '/room'
            ))
                ? await database.getValue(
                      this.userDataPath +
                          this.socket.request.user.data[0].id +
                          '/room'
                  )
                : 'forest',

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
                ? 1
                : 0,
            isMod: (await database.getValue(
                'permissions/mod/' + this.socket.request.user.data[0].id
            ))
                ? 1
                : 0,
            isVIP: (await database.getValue(
                'permissions/vip/' + this.socket.request.user.data[0].id
            ))
                ? 1
                : 0,
            isSponsor: (await database.getValue(
                'donations/' +
                    this.socket.request.user.data[0].id +
                    '/donatorPerks'
            ))
                ? 1
                : 0,
        };

        //vip name color
        if (playerData.isVIP) {
            playerData.character.nameColor = utility.hex.toDecimal(
                rankData.vip.nametag.color
            );
        }
        //sponsor name color
        else if (playerData.isSponsor) {
            playerData.character.nameColor = utility.hex.toDecimal(
                rankData.sponsor.nametag.color
            );
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
        if (this.socket.player.room) {
            if (this.socket.player.room != undefined)
                database.setValue(
                    this.userDataPath + this.socket.player.id + '/room',
                    this.socket.player.room
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
        log.socketAction(this.socket, 'Updated Player Data', {
            debug: true,
            console: false,
        });

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
            isVIP: player.isVIP,
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
        log.socketAction(
            this.socket,
            'Reloaded Room: ' + this.socket.player.room,
            { debug: true, console: false }
        );

        //send current position of all connected players in this room to ONLY THIS client
        const playerData = await this.requestAllParsedPlayerData(
            this.socket.player.room
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
