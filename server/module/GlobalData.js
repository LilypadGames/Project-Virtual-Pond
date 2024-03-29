// Global Data

//config
import config from '../config/config.json' assert { type: 'json' };

//dependencies
import twitch from '../module/Twitch.js';
import { JsonDB, Config } from 'node-json-db';

//global data variable
var globalData = new JsonDB(
    new Config('server/data/globalData.json', true, true, '/')
);

export default {
    init: async function (io) {
        //save socket.io instance
        this.io = io;

        //update game version
        await globalData.push('/gameVersion', config.version);

        //update stream status
        let streamLive = await twitch.isStreamLive('pokelawls');
        await globalData.push('/streamLive', streamLive);

        //init paths
        try {
            await globalData.getData('/currentEvents');
        } catch {
            await globalData.push('/currentEvents', []);
        }

        try {
            await globalData.getData('/leaderboard');
        } catch {
            await globalData.push('/leaderboard', {});
        }
    },

    set: async function (path, value) {
        //set value
        await globalData.push('/' + path, value);

        //update connected clients
        this.io.emit('payloadGlobalDataUpdate', await this.get());
    },

    get: async function () {
        return await globalData.getData('/');
    },

    getPath: async function (path) {
        return await globalData.getData('/' + path);
    },
};
