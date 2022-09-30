//dependency
const emoteParser = require('tmi-emote-parse');

emotes = [];
emoteLengthIndex = [];

module.exports = {
    init: async function (streamer) {
        //first fetch emotes
        await this.fetchEmotes(streamer);

        //then index the emote lengths so they can be searched through more efficiently
        this.indexEmotes();
    },

    fetchEmotes: async function(streamer) {
        //set twitch channel to pull emotes from
        emoteParser.loadAssets(streamer);

        //request emotes for given streamer from api
        return new Promise((resolve) => {
            emoteParser.events.on('emotes', (event) => {
                // get all Twitch (Global/Sub), BTTV (Global/Channel), FFZ (Global/Channel), and 7tv (Global/Channel) emotes
                emotes = emoteParser.getAllEmotes(event.channel);

                //resolved
                resolve(resolve);
            });
        });
    },

    indexEmotes: function() {
        //init current emote length
        let currentEmoteLength;

        //make a list of each index that shows where a new character length of emotes starts
        emotes.forEach((element, index) => {
            //check if this emote's name is shorter than the last one
            if (index === 0 || element.name.length < currentEmoteLength) {
                //store current emote length
                currentEmoteLength = element.name.length;

                //store index of this emote in the emote length index array
                emoteLengthIndex[currentEmoteLength] = index;
            }
        });
    },

    isEmote: function (input, getIndex = false) {
        //does input contain a space? (emotes cannot contain spaces)
        if (input.indexOf(' ') >= 0) return false;

        //get length of text
        let inputLength = input.length;

        //is there an emote with this length?
        if (!emoteLengthIndex[inputLength]) return false;

        //get max and min of the emote array that this emote could possibly be found in
        let min = emoteLengthIndex[inputLength];
        let max = emoteLengthIndex[inputLength - 1]
            ? emoteLengthIndex[inputLength - 1]
            : emoteLengthIndex[inputLength];

        //search between min and max for a matching string
        for (let index = min; index < max; index++) {
            //match found
            if (emotes[index].name === input) {
                if (getIndex) {
                    return index;
                } else {
                    return true;
                }
            }
        }

        //not found
        return false;
    },

    getEmoteByName: function(input) {
        let index = isEmote(input, true);
        if (index !== false) {
            return emotes[index];
        } else {
            return false;
        }
    },

    getEmotes: function () {
        return emotes;
    },
};