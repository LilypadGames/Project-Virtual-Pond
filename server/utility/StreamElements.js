// StreamElements Connection

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const database = require(path.join(__dirname, '../utility/Database.js'));
const twitch = require(path.join(__dirname, '../utility/Twitch.js'));

//stream elements donation api
const seAPI = require('node-streamelements');
const seInstance = new seAPI({
    token: config.streamelements.JWTToken,
    accountId: config.streamelements.accountId,
});

module.exports = {
    //initialize websocket events from stream elements
    init: function () {
        // AccessToken is grabbed from OAuth2 authentication of the account.
        const accessToken = '';
        const socket = io('https://realtime.streamelements.com', {
            transports: ['websocket'],
        });
        // Socket connected
        socket.on('connect', onConnect);

        // // Socket got disconnected
        // socket.on('disconnect', onDisconnect);

        // // Socket is authenticated
        // socket.on('authenticated', onAuthenticated);

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

        function onConnect() {
            console.log(
                utility.timestampString('Connected to StreamElements Events')
            );
            socket.emit('authenticate', {
                method: 'oauth2',
                token: accessToken,
            });
            //socket.emit('authenticate', {method: 'jwt', token: config.streamelements.JWTToken});
        }
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
                        utility.timestampString('Fetched Donation Data')
                    );
                } catch (error) {
                    console.log(
                        utility.timestampString('Donation Save Error: ' + error)
                    );
                }
            })
            .catch((error) => {
                console.log(
                    utility.timestampString('Donation Fetch Error: ' + error)
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
                    utility.timestampString('Donation Parse Error: ' + error)
                );
            }
        }

        return donationList;
    },

    hasPerks: function (amount) {
        return amount >= 4.2 ? true : false;
    },
};
