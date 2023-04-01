//imports
import util from 'util';

//server classes
import WebServer from './internal/WebServer.js';
import Websockets from './internal/Websockets.js';
import API from './internal/API.js';

//modules
import log from './module/Logs.js';

//config
import config from '../config.json' assert { type: 'json' };

//environment settings
process.env.NODE_ENV = config.production ? 'production' : 'development';

//init logging
log.initLogs();

//send console logs to server log file
console.log = function () {
    //format message
    const message = util.format.apply(null, arguments);

    //log to file
    log.message(message, {
        file: ['server', 'debug'],
    });

    //log to console
    process.stdout.write(message + '\n');
};
console.error = console.log;

// DEBUG
process.on('warning', (e) => console.warn(e.stack));

//start web server
let webServer = new WebServer();

//start websockets
let websockets = new Websockets(webServer.server, webServer.auth);

//set up API
let api = new API(webServer.app, websockets.io);

//set up temp user ID if auth mode is disabled
if (config.server.bypassAuth) websockets.io.guestID = 0;

//init global data
import globalData from './module/GlobalData.js';
await globalData.init(websockets.io);

//init chat log storage
import chatLogs from './module/ChatLogs.js';
chatLogs.init(websockets.io);

// init emotes
import emotes from './module/Emotes.js';
if (config.server.online) {
    try {
        (async () => {
            await emotes.init('pokelawls');
        })();
    } catch (error) {
        log.error(error);
    }
}

//init bad words filter
import wordFilter from './module/WordFilter.js';
wordFilter.init();

//init twitch event subs
// const twitch from '/module/Twitch.js';
// try {
//     twitch.init('pokelawls', app, globalData);
// } catch (error) {
//     log.error(error);
// }

//init donations
import streamElements from './module/StreamElements.js';
if (config.server.online) {
    try {
        // streamElements.init();
        streamElements.updateDonations();
    } catch (error) {
        log.error(error);
    }
}

//init client connection event
import Connection from './event/Connection.js';
websockets.io.on('connection', async function (socket) {
    const connection = new Connection(websockets.io, socket, api);
    await connection.init();
});
