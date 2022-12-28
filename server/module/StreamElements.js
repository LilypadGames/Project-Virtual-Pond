// StreamElements Connection

//config
import config from '../config/config.json' assert { type: 'json' };

//imports
import io from 'socket.io-client';

//modules
import database from '../module/Database.js';
import twitch from '../module/Twitch.js';
import log from '../module/Logs.js';

//stream elements donation api
import StreamElements from 'node-streamelements';

const seInstance = new StreamElements({
    token: config.streamelements.JWTToken,
    accountId: config.streamelements.accountId,
});

export default {
    //initialize websocket events from stream elements
    init: function () {
        //connect to realtime websocket interface
        const socket = io('https://realtime.streamelements.com', {
            transports: ['websocket'],
        });

        //handle low level events
        let onConnect = () => {
            //log
            log.info('StreamElements Events - Connected.');

            //authenticate
            socket.emit('authenticate', {
                method: 'jwt',
                token: config.streamelements.JWTToken,
            });
        };
        let onDisconnect = () => {
            //log
            log.warn('StreamElements Events - Disconnected.');
            // Reconnect
        };
        let onAuthenticated = (data) => {
            //log
            log.info(
                'StreamElements Events - Connected to Channel ID: ' +
                    data.channelId
            );
        };

        //register low level events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('authenticated', onAuthenticated);
        socket.on('unauthorized', console.error);

        //register events
        socket.on('event:test', (data) => {
            log.debug(data);
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
        });
        socket.on('event', (data) => {
            log.debug(data);
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
        });
        socket.on('event:update', (data) => {
            log.debug(data);
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
        });
        socket.on('event:reset', (data) => {
            log.debug(data);
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
        });
    },

    updateDonations: async function () {
        seInstance
            //get tips from stream elements api
            .getTips()

            //parse data and save to database
            .then(async (response) => {
                //parse through the data to create a compiled donation list by user ID
                let data = await this.parseDonations(response.docs);

                try {
                    //save donation list to database
                    database.setValue('donations', data);

                    //log
                    log.info('Fetched Donation Data');
                } catch (error) {
                    //log
                    log.error('Saving Donation Data -> ' + error);
                }
            })
            .catch((error) => {
                //log
                log.error('Fetch Donation Data -> ' + error);
            });
    },

    parseDonations: async function (donations) {
        //init list of donations
        let donationList = [];

        //loop through all donations
        for (var i = 0; i < donations.length; i++) {
            try {
                //get donation data only
                let donation = donations[i].donation;

                //get username
                let userName = donation.user.username.split('/')[0];

                //get user id from username
                let userID = await twitch.getUserIDByName(userName);

                //get amount
                let amount = donation.amount;

                //combine donations from the same twitch user
                if (donationList[userID]) {
                    //combine amount
                    donationList[userID].amount =
                        donationList[userID].amount + amount;

                    //apply donator perks if they surpass the donation threshold
                    donationList[userID].donatorPerks = this.hasPerks(
                        donationList[userID].amount
                    );
                }

                //add new users donation to the list of donations
                else {
                    donationList[userID] = {
                        name: userName,
                        amount,
                        donatorPerks: this.hasPerks(amount),
                    };
                }
            } catch (error) {
                //log
                log.error('Parsing Donation Data -> ' + error);
            }
        }

        return donationList;
    },

    hasPerks: function (amount) {
        return amount >= 4.2 ? true : false;
    },
};
