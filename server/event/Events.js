// Events Events

//imports: file parsing
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//modules
import globalData from '../module/GlobalData.js';

//event handlers
import FF22Event from '../event/events/FF22Event.js';

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

export default Events;
