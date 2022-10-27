// Global Data

//config
import config from '../config/config.json' assert { type: 'json' };

//dependency: twitch API
import twitch from '../module/Twitch.js';

//global data variable
import globalData from '../data/globalData.json' assert { type: 'json' };

export default {
    init: async function (io) {
        //save socket.io instance
        this.io = io;

        //get game version
        globalData.gameVersion = config.version;

        //is stream live?
        globalData.streamLive = await twitch.isStreamLive('pokelawls');
    },

    set: function (object, data) {
        globalData[object] = data;

        //update connected clients
        this.io.emit('payloadGlobalDataUpdate', object, data);
    },

    get: function () {
        return globalData;
    },

    getObject: function (object) {
        return globalData[object];
    },
};
