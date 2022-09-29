// Global Data

//dependency: file path
const path = require('path');

//config
const config = require(path.join(__dirname, '../config/config.json'));

//dependency: twitch API
const twitch = require(path.join(__dirname, '../module/Twitch.js'));

//global data variable
var globalData = JSON.parse(JSON.stringify(require(path.join(__dirname, '../data/globalData.json'))));

module.exports = {
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
