// Events Events

//file parsing
const path = require('path');

//modules
const globalData = require(path.join(__dirname, '../module/GlobalData.js'));

//event handlers
const FF22Event = require(path.join(__dirname, 'events/FF22Event.js'));

class Events {
    constructor(io, socket, playerData) {
        //save socket and socket.io instance
        this.socket = socket;
        this.io = io;

        //save PlayerData instance
        this.PlayerData = playerData;
    }

    async init() {
        //init current events
        if (globalData.getObject('currentEvents').includes('FF22')) {
            this.FF22Event = new FF22Event(
                this.io,
                this.socket,
                this.PlayerData
            );
            await this.FF22Event.init();
        }
    }

    async register() {}

    async onDisconnect() {
        //pass player disconnect event
        if (globalData.getObject('currentEvents').includes('FF22'))
            await this.FF22Event.onDisconnect();
    }
}

module.exports = Events;
