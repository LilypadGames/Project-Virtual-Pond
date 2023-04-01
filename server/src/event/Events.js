// Events Events

//modules
import globalData from '../module/GlobalData.js';

//event handlers
import FF22Event from './events/FF22Event.js';

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
        let data = await globalData.getPath('currentEvents');
        if (data.includes('FF22')) {
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
        let data = await globalData.getPath('currentEvents');
        if (data.includes('FF22'))
            await this.FF22Event.onDisconnect();
    }
}

export default Events;
