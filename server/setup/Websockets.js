import { Server as SocketIOServer } from 'socket.io';

//modules
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

//config
import config from '../config/config.json' assert { type: 'json' };

export default class Websockets {
    constructor(server, auth) {
        //store authentication instance
        this.auth = auth;

        //init socket.io
        this.io = new SocketIOServer(server);

        //setup socket.io
        this.setup();
    }

    setup() {
        //authentication
        this.auth.websocketAuthentication(this.io);

        //log
        console.log(
            ConsoleColor.Blue,
            utility.timestampString(
                'Websockets Initialized> Authentication: ' +
                    (config.server.bypassAuth ? 'DISABLED' : 'ENABLED')
            )
        );
    }
}
