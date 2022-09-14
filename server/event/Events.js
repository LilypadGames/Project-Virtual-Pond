// Events Events

//dependencies: file parsing
const path = require('path');

// //get config values
// const config = require(path.join(__dirname, '../config/config.json'));

// //imports
// const utility = require(path.join(__dirname, '../utility/Utility.js'));
// const logs = require(path.join(__dirname, '../utility/Logs.js'));

// //import events
// const PlayerData = require(path.join(__dirname, 'PlayerData.js'));
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
        this.FF22Event = new FF22Event(this.io, this.socket, this.PlayerData);
        await this.FF22Event.init();
    }

    async register() {}
}

module.exports = Events;
