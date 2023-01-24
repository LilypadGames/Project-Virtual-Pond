//imports
import util from 'util';

//server classes
import WebServer from '../server/setup/WebServer.js';
import Websockets from '../server/setup/Websockets.js';
import API from '../server/setup/API.js';

//modules
import log from '../server/module/Logs.js';

//config
import config from '../server/config/config.json' assert { type: 'json' };

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
import globalData from '../server/module/GlobalData.js';
await globalData.init(websockets.io);

//init chat log storage
import chatLogs from '../server/module/ChatLogs.js';
chatLogs.init(websockets.io);

// init emotes
import emotes from '../server/module/Emotes.js';
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
import wordFilter from '../server/module/WordFilter.js';
wordFilter.init();

//init twitch event subs
// const twitch from '/module/Twitch.js';
// try {
//     twitch.init('pokelawls', app, globalData);
// } catch (error) {
//     log.error(error);
// }

//init donations
import streamElements from '../server/module/StreamElements.js';
if (config.server.online) {
    try {
        // streamElements.init();
        streamElements.updateDonations();
    } catch (error) {
        log.error(error);
    }
}

//init client connection event
import Connection from '../server/event/Connection.js';
websockets.io.on('connection', async function (socket) {
    const connection = new Connection(websockets.io, socket, api);
    await connection.init();
});
