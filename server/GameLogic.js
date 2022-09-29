// Handles game logic

//dependency: file parsing
const fs = require('fs');
const path = require('path');

//get config values
const config = JSON.parse(
    fs.readFileSync(path.join(__dirname, '/config/config.json'))
);

//modules
// const utility = require(path.join(__dirname, '/module/Utility.js'));
// const ConsoleColor = require(path.join(__dirname, '/module/ConsoleColor.js'));
// const database = require(path.join(__dirname, '/module/Database.js'));
// const logs = require(path.join(__dirname, '/module/Logs.js'));

class GameLogic {
    constructor(io) {
        this.io = io;
    }

    init() {
        this.configurateSocketIO();
        this.registerModules();
        this.registerListeners();
    }

    configurateSocketIO() {
        //set up temp user ID if auth mode is disabled
        if (config.server.bypassAuth) {
            this.io.guestID = 0;
        }
    }

    registerModules() {
        //init chat log storage
        const chatLogs = require(path.join(__dirname, '/module/ChatLogs.js'));
        chatLogs.init(this.io);

        //init emotes
        // const emoteLib = require(path.join(__dirname, '/module/Emotes.js'));
        // emoteLib.init();

        //init global data
        const globalData = require(path.join(
            __dirname,
            '/module/GlobalData.js'
        ));
        globalData.init(this.io);

        //init twitch event subs
        // const twitch = require(path.join(__dirname, '/module/Twitch.js'));
        // twitch.init('pokelawls', app, globalData);

        //init donations
        // streamElements.init();
        const streamElements = require(path.join(
            __dirname,
            '/module/StreamElements.js'
        ));
        streamElements.updateDonations();
    }

    registerListeners() {
        //import connection event
        const Connection = require(path.join(
            __dirname,
            '/event/Connection.js'
        ));

        //on new websocket connection
        this.io.on('connection', async function (socket) {
            const connection = new Connection(io, socket);
            await connection.init();
        });
    }
}

module.exports = GameLogic;
