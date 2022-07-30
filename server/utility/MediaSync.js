// Donation Updater

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));

//twitch api
const twurpleAuth = require('@twurple/auth');
const twurpleAPI = require('@twurple/api');
const authProvider = new twurpleAuth.ClientCredentialsAuthProvider(
    config.twitch.clientID,
    config.twitch.clientSecret
);
const twitchAPI = new twurpleAPI.ApiClient({ authProvider });

module.exports = {
    isStreamLive: async function (stream) {
        try {
            live = (await twitchAPI.streams.getStreamByUserName(stream))
                ? true
                : false;
            console.log(
                utility.timestampString('Is ' + stream + ' Live?: ' + live)
            );
        } catch (error) {
            console.log(
                utility.timestampString('Stream Live Check Error: ' + error)
            );
        }
    },
};
