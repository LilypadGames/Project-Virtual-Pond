// Twitch functions and events

//dependency: events
import events from 'events';

//config
import config from '../config/config.json' assert { type: 'json' };

//imports
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

//twitch api
import { ClientCredentialsAuthProvider } from '@twurple/auth';

import { ApiClient } from '@twurple/api';
import { EventSubListener, EventSubMiddleware } from '@twurple/eventsub';
if (!config.production) {
    import('@twurple/eventsub-ngrok')
    .then((exports) => {});
}
const authProvider = new ClientCredentialsAuthProvider(
    config.twitch.clientID,
    config.twitch.clientSecret
);
const twitchAPI = new ApiClient({ authProvider });
import { randomUUID } from 'crypto';
const fixedSecret = new randomUUID().toString();

//init twitch events emitter
const twitchEvent = new events.EventEmitter();

export default {
    //set up event subs
    init: async function (streamerName, app, globalData) {
        //save global data instance
        this.globalData = globalData;

        //remove past subscriptions
        await twitchAPI.eventSub.deleteAllSubscriptions();

        //init listener
        let listener;

        //development environment
        if (!config.production) {
            //use ngrok for local SSL encrypted eventsubbing
            listener = new EventSubListener({
                apiClient: twitchAPI,
                adapter: new NgrokAdapter(),
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
            const middleware = new EventSubMiddleware({
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
                ConsoleColor.Cyan,
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
            async (event) => {
                console.log(
                    ConsoleColor.Cyan,
                    utility.timestampString(
                        `${event.broadcasterDisplayName} just went live!`
                    )
                );

                //set stream live to true
                await this.globalData.set('streamLive', true);

                //trigger live event
                twitchEvent.emit('streamLive', true);
            }
        );

        //offline event
        const onOffline = await listener.subscribeToStreamOfflineEvents(
            streamerID,
            async (event) => {
                console.log(
                    ConsoleColor.Cyan,
                    utility.timestampString(
                        `${event.broadcasterDisplayName} just went offline.`
                    )
                );

                //set stream live to false
                await this.globalData.set('streamLive', false);

                //trigger live event
                twitchEvent.emit('streamLive', false);
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
            let live = (await twitchAPI.streams.getStreamByUserName(streamerName))
                ? true
                : false;
            console.log(
                ConsoleColor.Cyan,
                utility.timestampString(
                    'Stream Live: (' + streamerName + ') ' + live
                )
            );
            return live;
        } catch (error) {
            console.log(
                ConsoleColor.Red,
                utility.timestampString(
                    'Fetch Stream Status (' + streamerName + ') - ' + error
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

    getListener() {
        return twitchEvent;
    },
};
