//import
import emoteParser from 'tmi-emote-parse';

//modules
import ConsoleColor from '../module/ConsoleColor.js';
import utility from '../module/Utility.js';

//lists
let emotes = [];
let emoteLengthIndex = [];
let cachedEmotes = [];
let notEmotes = [];

// DEBUG
// emoteParser.events.on("error", e => {
//     console.log("Error:", e);
// })

export default {
    init: async function (streamer) {
        //first fetch emotes
        await this.fetchEmotes(streamer);

        //then index the emote lengths so they can be searched through more efficiently
        this.indexEmotes(emoteLengthIndex);

        console.log(emote);
    },

    //fetch 7tv, BTTV, and FFZ emotes from a specified twitch streamer
    fetchEmotes: async function (streamer) {
        //request emotes for given streamer from api
        return new Promise((resolve) => {
            //load twitch channels assets
            emoteParser.loadAssets(streamer);

            //catch errors
            emoteParser.events.on('error', (error) => {
                //log
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString(
                        'Emote Parser (' + streamer + ') - ' + error.error
                    )
                );
            });

            //wait for emote load event
            emoteParser.events.on('emotes', (event) => {
                // get all Twitch (Global/Sub), BTTV (Global/Channel), FFZ (Global/Channel), and 7tv (Global/Channel) emotes
                emotes = emoteParser.getAllEmotes(event.channel);

                //log
                console.log(
                    ConsoleColor.Cyan,
                    utility.timestampString(
                        'Fetched Emotes For Channel: ' + streamer
                    )
                );

                //resolved
                resolve(resolve);
            });
        });
    },

    //index the emotes so its easier to search through
    indexEmotes: function () {
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

    //verify if a specified input is an emote, and return the index of the emote if found
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

    //checks if input is an emote or not, and caches it if so returning the path to the cached emote
    getEmote: async function (input) {
        //check list of words that are NOT emotes
        if (notEmotes.includes(input)) {
            return false;
        }

        //check if emote has already been cached
        if (cachedEmotes.includes(input)) {
            // return emotes
        }

        //check the list if the emote exists and get its index
        let emoteIndex = isEmote(input, true);

        //if emote exists, cache it
        if (emoteIndex !== false) {
            console.log(emotes[index]);
            //return emote path
            // return emotes[index];

            //emote does not exist
        } else {
            //add word to list of words that are NOT emotes
            notEmotes.push(input);
            return false;
        }
    },

    //get all emotes
    getEmotes: function () {
        return emotes;
    },
};
