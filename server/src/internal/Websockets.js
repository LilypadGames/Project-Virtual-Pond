import { Server as SocketIOServer } from 'socket.io';

//modules
import log from '../module/Logs.js';

//config
import config from '../../config.json' assert { type: 'json' };

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
        log.info(
            'Websockets Initialized - Authentication: ' +
                (config.server.bypassAuth ? 'DISABLED' : 'ENABLED')
        );
    }
}
