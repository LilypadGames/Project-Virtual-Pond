// Connection Events

// //dependencies: file parsing
// const path = require('path');

// //get config values
// const config = require(path.join(__dirname, '../config/config.json'));

// //imports
// const utility = require(path.join(__dirname, '../utility/Utility.js'));
// const logs = require(path.join(__dirname, '../utility/Logs.js'));

// //import events
// const PlayerData = require(path.join(__dirname, 'PlayerData.js'));

class FF22Event {
    constructor(io, socket, playerData) {
        //save socket and socket.io instance
        this.socket = socket;
        this.io = io;

        //save PlayerData instance
        this.PlayerData = playerData;
    }

    async init() {
        //register events
        this.register();
    }

    async register() {
        //triggers when client requests the players ticket count
        this.socket.on('FF22requestTicketCount', async (cb) => {
            cb(await this.getTicketCount());
        });
    }

    //triggers when client requests the players ticket count
    async getTicketCount() {
        //get ticket count
        let ticketCount = await this.PlayerData.getSpecificClientPlayerData(
            '/event/ff22/tickets'
        );

        //init if unset
        if (ticketCount === undefined) {
            ticketCount = 0;
            this.PlayerData.setSpecificClientPlayerData(
                '/event/ff22/tickets',
                ticketCount
            );
        }

        //return ticket count
        return ticketCount;
    }
}

module.exports = FF22Event;
