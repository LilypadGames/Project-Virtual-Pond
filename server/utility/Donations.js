// Donation Updater

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const database = require(path.join(__dirname, '../utility/Database.js'));

//twitch api
const twurpleAuth = require('@twurple/auth');
const twurpleAPI = require('@twurple/api');
const authProvider = new twurpleAuth.ClientCredentialsAuthProvider(
    config.twitch.clientID,
    config.twitch.clientSecret
);
const twitchAPI = new twurpleAPI.ApiClient({ authProvider });

//stream elements donation api
const seAPI = require('node-streamelements');
const seInstance = new seAPI({
    token: config.streamelements.JWTToken,
    accountId: config.streamelements.accountId,
});

module.exports = {
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
                    console.log('Donation Save Error: ' + error);
                }
            })
            .catch((error) => {
                console.log('Donation Fetch Error: ' + error);
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
                user = await twitchAPI.users.getUserByName(userName);
                userID = user.id;

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
                console.log('Donation Parse Error: ' + error);
            }
        }

        return donationList;
    },

    hasPerks: function (amount) {
        return amount >= 4.2 ? true : false;
    },
};
