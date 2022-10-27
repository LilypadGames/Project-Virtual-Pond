// Handles game logic

//imports: file parsing
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//get config values
import config from '../server/config/config.json' assert { type: 'json' };;

//modules
// const utility from '/module/Utility.js';
// import ConsoleColor from '../module/ConsoleColor.js';
// import database from '../server/module/Database.js';
// import logs from '../server/module/Logs.js';

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
        import chatLogs from '../server/module/ChatLogs.js';
        chatLogs.init(this.io);

        //init emotes
        // const emoteLib from '/module/Emotes.js';
        // emoteLib.init();

        //init global data
        const globalData = require(path.join(
            __dirname,
            '/module/GlobalData.js'
        ));
        globalData.init(this.io);

        //init twitch event subs
        // const twitch from '/module/Twitch.js';
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

export default GameLogic;
