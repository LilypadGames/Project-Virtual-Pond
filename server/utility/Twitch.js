// Twitch functions and events

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));

//twitch api
const twurpleAuth = require('@twurple/auth');
const twurpleAPI = require('@twurple/api');
const twurpleEvent = require('@twurple/eventsub');
const authProvider = new twurpleAuth.ClientCredentialsAuthProvider(
    config.twitch.clientID,
    config.twitch.clientSecret
);
const twitchAPI = new twurpleAPI.ApiClient({ authProvider });
const { randomUUID } = require('crypto');
const fixedSecret = new randomUUID().toString();

module.exports = {
    //set up event subs
    init: async function (streamerName, app) {
        //remove past subscriptions
        await twitchAPI.eventSub.deleteAllSubscriptions();

        //init listener
        let listener;

        //development environment
        if (config.server.local) {
            //get twurple ngrok middleware
            const twurpleEventLocal = require('@twurple/eventsub-ngrok');

            //use ngrok for local SSL encrypted eventsubbing
            listener = new twurpleEvent.EventSubListener({
                apiClient: twitchAPI,
                adapter: new twurpleEventLocal.NgrokAdapter(),
                secret: fixedSecret,
                strictHostCheck: true,
            });

            //start listener
            await listener.listen();

            //register events
            this.registerEvents(listener, streamerName);
        }

        //production environment
        else {
            //set up listener
            const middleware = new twurpleEvent.EventSubMiddleware({
                apiClient: twitchAPI,
                hostName: config.server.hostName,
                pathPrefix: '/twitch',
                secret: config.twitch.clientSecret,
                strictHostCheck: true,
            });

            //pass express app
            await middleware.apply(app);

            //listen to events
            app.listen(3000, async () => {
                //wait for the middleware to initialize
                await middleware.markAsReady();

                //register events
                this.registerEvents(middleware, streamerName);
            });
        }
    },

    registerEvents: async function (listener, streamerName) {
        //get steamer ID from user name
        let streamerID = await this.getUserIDByName(streamerName);

        //verify event subscriptions
        listener.onVerify((success, subscription) =>
            console.log(
                utility.timestampString(
                    'Stream Event: (' +
                        streamerName +
                        ') ' +
                        subscription._cliName +
                        ' | Verified: ' +
                        success
                )
            )
        );

        //online event
        const onLive = await listener.subscribeToStreamOnlineEvents(
            streamerID,
            (event) => {
                console.log(
                    utility.timestampString(
                        `${event.broadcasterDisplayName} just went live!`
                    )
                );
            }
        );

        //offline event
        const onOffline = await listener.subscribeToStreamOfflineEvents(
            streamerID,
            (event) => {
                console.log(
                    utility.timestampString(
                        `${event.broadcasterDisplayName} just went offline.`
                    )
                );
            }
        );

        // await onLive.getCliTestCommand();

        //DEBUG
        // await listener.subscribeToChannelFollowEvents(streamerID, async (event) => {
        //     let user = await (await event.getUser()).displayName;
        //     console.log(
        //         utility.timestampString(
        //             `${event.broadcasterDisplayName} just got a follower: ${user}`
        //         )
        //     );
        // });
    },

    isStreamLive: async function (streamerName) {
        try {
            live = (await twitchAPI.streams.getStreamByUserName(streamerName))
                ? true
                : false;
            console.log(
                utility.timestampString(
                    'Stream Live: (' + streamerName + ') ' + live
                )
            );
            return live;
        } catch (error) {
            console.log(
                utility.timestampString(
                    'Stream Live (' + streamerName + ') Check Error: ' + error
                )
            );
        }
    },

    getUserByName: async function (userName) {
        return await twitchAPI.users.getUserByName(userName);
    },

    getUserIDByName: async function (userName) {
        let user = await this.getUserByName(userName);
        return user.id;
    },
};
