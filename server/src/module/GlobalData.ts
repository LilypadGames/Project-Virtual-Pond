// Global Data

//config
import config from '../../config.json' assert { type: 'json' };

//dependencies
import twitch from './Twitch.js';
import { JsonDB, Config } from 'node-json-db';

//global data variable
var globalData = new JsonDB(
    new Config('server/../data/globalData.json', true, true, '/')
);

export default {
    init: async function (io) {
        //save socket.io instance
        this.io = io;

        //update game version
        await globalData.push('/gameVersion', config.version);

        //update stream status
        if (config.server.online) {
            try {
                var streamLive = await twitch.isStreamLive('pokelawls');
            } catch {
                var streamLive = false;
            }
        }
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
