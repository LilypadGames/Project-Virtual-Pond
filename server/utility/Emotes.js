//dependency
const emoteParser = require('tmi-emote-parse');

//emotes
var emotes = undefined;

module.exports = {
    init: function () {
        //get twitch emotes
        emoteParser.loadAssets('pokelawls');
        emoteParser.events.on('emotes', (event) => {
            // get all Twitch, BTTV, FFZ, and 7tv emotes
            emotes = emoteParser.getAllEmotes(event.channel);
        });
    },

    getEmotes: function () {
        while (emotes === undefined) {}
        return emotes;
    },
};
