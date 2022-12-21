//file parsing
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//imports
import axios from 'axios';
import emoteParser from 'tmi-emote-parse';

//modules
import ConsoleColor from '../module/ConsoleColor.js';
import utility from '../module/Utility.js';

//config
import config from '../config/config.json' assert { type: 'json' };

//lists
let twitchCredentials = {};
let emotes = [];
let emoteLengthIndex = [];
let cachedEmotes = [];
let notEmotes = [];

//cached emote path
let cachedEmotePath = '../../' + config.paths.cache + '/';
utility.createDirectory(path.join(__dirname, cachedEmotePath));
cachedEmotePath = cachedEmotePath + 'emotes/';
utility.createDirectory(path.join(__dirname, cachedEmotePath));

//clear cache
fs.readdir(path.join(__dirname, cachedEmotePath), (err, files) => {
    if (err) throw err;

    for (const file of files) {
        fs.unlink(
            path.join(path.join(__dirname, cachedEmotePath), file),
            (err) => {
                if (err) throw err;
            }
        );
    }
});

// DEBUG
emoteParser.setDebug(true);

export default {
    init: async function (streamer) {
        //get OAuth Token
        await axios
            .post('https://id.twitch.tv/oauth2/token', {
                client_id: config.twitch.clientID,
                client_secret: config.twitch.clientSecret,
                grant_type: 'client_credentials',
            })
            .then(function (response) {
                //save access token
                twitchCredentials = response.data;
            })
            .catch(function (error) {
                //log error
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString(
                        'ERROR ' +
                            error.response.status +
                            ': ' +
                            error.response.data.error
                    )
                );
            });

        //first fetch emotes
        await this.fetchEmotes(streamer);

        //then index the emote lengths so they can be searched through more efficiently
        this.indexEmotes(emoteLengthIndex);
    },

    //fetch 7tv, BTTV, and FFZ emotes from a specified twitch streamer
    fetchEmotes: async function (streamer) {
        //set credentials
        emoteParser.setTwitchCredentials(
            config.twitch.clientID,
            twitchCredentials.access_token
        );

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

    //download and save emote image, properly converting between webp to png/gif
    cacheEmote: async function (emoteName, emoteURL) {
        //determine image type
        let urlExtension = emoteURL.split('.').pop();
        let fileExtension = 'png';
        if (['webp', 'png', 'gif'].includes(urlExtension)) {
            switch (urlExtension) {
                case 'webp':
                    emoteURL = urlExtension.join() + '.' + 'png';
                    console.log(emoteURL);
                    break;
                case 'png':
                    emoteURL = urlExtension.join() + '.' + 'png';
                    console.log(emoteURL);
                    break;
                case 'gif':
                    emoteURL = urlExtension.join() + '.' + 'gif';
                    console.log(emoteURL);
                    break;
            }
        }

        //determine file path
        const filePath = path.resolve(
            __dirname,
            cachedEmotePath,
            emoteName + '.' + fileExtension
        );

        //init write stream (to write the file)
        const writer = fs.createWriteStream(filePath);

        //run axios http request to CDN
        await axios({
            url: emoteURL,
            method: 'GET',
            responseType: 'stream',
        }).then(
            (response) => {
                //tie response to write stream
                response.data.pipe(writer);
            },
            (error) => {
                //log error
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString(
                        'ERROR ' +
                            error.response.status +
                            ': ' +
                            error.response.data.error
                    )
                );
            }
        );

        //wait for http request to resolve
        return new Promise((resolve, reject) => {
            //emote cached
            writer.on('finish', () => {
                //add emote to cache
                cachedEmotes[emoteName] = filePath;

                //return cached emote path
                resolve(filePath);
            });

            //emote had issue caching
            writer.on('error', () => {
                //log error
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString('ERROR: ' + reject)
                );

                //reject
                reject(reject);
            });
        });
    },

    //checks if input is an emote or not, and caches it if so returning the path to the cached emote
    getEmote: async function (input) {
        //check list of words that are NOT emotes
        if (notEmotes.includes(input)) return false;

        //check if emote has already been cached
        if (cachedEmotes[input]) return cachedEmotes[input];

        //check if emote exists and get its index
        let emoteIndex = this.isEmote(input, true);

        //if emote exists, cache it
        if (emoteIndex !== false) {
            //get emote info
            const emote = emotes[emoteIndex];

            //get and cache emote
            let emotePath = await this.cacheEmote(emote.name, emote.img);

            //return cached emote path
            return emotePath;
        }
        //emote does not exist
        else {
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
