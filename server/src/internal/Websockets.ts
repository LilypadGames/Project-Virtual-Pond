import { Server as SocketIOServer } from 'socket.io';
import http from "http";

//modules
import log from '../module/Logs.js';

//config
import config from '../../config.json' assert { type: 'json' };
import Authentication from './Authentication.js';

export default class Websockets {
    auth: Authentication;
    io: SocketIOServer;

    constructor(server: http.Server, auth: Authentication) {
        //store authentication instance
        this.auth = auth;

        //init socket.io
        this.io = new SocketIOServer(server);

        //authentication
        this.auth.websocketAuthentication(this.io);

        //log
        log.info(
            'Websockets Initialized - Authentication: ' +
                (config.server.bypassAuth ? 'DISABLED' : 'ENABLED')
        );
    }
}
