// StreamElements Connection

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const io = require('socket.io-client');

//modules
const utility = require(path.join(__dirname, '../module/Utility.js'));
const ConsoleColor = require(path.join(__dirname, '../module/ConsoleColor.js'));
const database = require(path.join(__dirname, '../module/Database.js'));
const twitch = require(path.join(__dirname, '../module/Twitch.js'));

//stream elements donation api
const seAPI = require('node-streamelements');
const seInstance = new seAPI({
    token: config.streamelements.JWTToken,
    accountId: config.streamelements.accountId,
});

module.exports = {
    //initialize websocket events from stream elements
    init: function () {
        //connect to realtime websocket interface
        const socket = io('https://realtime.streamelements.com', {
            transports: ['websocket'],
        });

        //handle low level events
        let onConnect = () => {
            console.log(
                ConsoleColor.Cyan,
                utility.timestampString('StreamElements Events> Connected.')
            );
            socket.emit('authenticate', {
                method: 'jwt',
                token: config.streamelements.JWTToken,
            });
        }
        let onDisconnect = () => {
            console.log(
                ConsoleColor.Red,
                utility.timestampString('StreamElements Events> Disconnected.')
            );
            // Reconnect
        }
        let onAuthenticated = (data) => {
            const { channelId } = data;
            console.log(
                ConsoleColor.Cyan,
                utility.timestampString('StreamElements Events> Connected to Channel ID: ' + channelId)
            );
        }

        //register low level events
        socket.on('connect', onConnect);
        socket.on('disconnect', onDisconnect);
        socket.on('authenticated', onAuthenticated);
        socket.on('unauthorized', console.error);

        //register events
        socket.on('event:test', (data) => {
            console.log(utility.timestampString(data));
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
        });
        socket.on('event', (data) => {
            console.log(utility.timestampString(data));
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-event
        });
        socket.on('event:update', (data) => {
            console.log(utility.timestampString(data));
            // Structure as on https://github.com/StreamElements/widgets/blob/master/CustomCode.md#on-session-update
        });
        socket.on('event:reset', (data) => {
            console.log(utility.timestampString(data));
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
                data = await this.parseDonations(response.docs);

                try {
                    //save donation list to database
                    database.setValue('donations', data);

                    //log
                    console.log(
                        ConsoleColor.Cyan,
                        utility.timestampString('Fetched Donation Data')
                    );
                } catch (error) {
                    console.log(
                        ConsoleColor.Red,
                        utility.timestampString('Save Donation Data - ' + error)
                    );
                }
            })
            .catch((error) => {
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString('Fetch Donation Data - ' + error)
                );
            });
    },

    parseDonations: async function (donations) {
        //init list of donations
        let donationList = [];

        //loop through all donations
        for (var i = 0; i < donations.length; i++) {
            try {
                //get donation data only
                donation = donations[i].donation;

                //get username
                userName = donation.user.username.split('/')[0];

                //get user id from username
                userID = await twitch.getUserIDByName(userName);

                //get amount
                amount = donation.amount;

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
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString('Parse Donation Data - ' + error)
                );
            }
        }

        return donationList;
    },

    hasPerks: function (amount) {
        return amount >= 4.2 ? true : false;
    },
};
