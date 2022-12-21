import axios from 'axios';

//modules
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

//config
import config from '../config/config.json' assert { type: 'json' };

export default class Connections {
    constructor(app) {
        //store web server
        this.app = app;

        //setup connections
        this.setup();
    }

    setup() {
        //user has completed authorization and has passed auth code to us
        this.app.get('/auth/discord', (req, res) => {
            //get discords user access token and verify their connections
            if (req.query && req.query.code) {
                this.getDiscordUsersAccessToken(
                    req.query.code,
                    (page, root) => {
                        res.sendFile(page, { root: root });
                    }
                );
            }
        });
    }

    //use auth code to get access token
    getDiscordUsersAccessToken(code, pageCallback) {
        axios
            .post(
                'https://discord.com/api/oauth2/token',
                new URLSearchParams({
                    client_id: config.discord.clientID,
                    client_secret: config.discord.clientSecret,
                    code: code,
                    grant_type: 'authorization_code',
                    redirect_uri: config.discord.redirectURI,
                    scope: 'identify',
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            )
            .then((response) => {
                getDiscordUsersData(response.data, pageCallback);
            })
            .catch((error) => {
                // NOTE: An unauthorized token will not throw an error
                // response.status will be 401
                if (error.response) {
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
            });
    }

    //get discord users connection using access token
    async getDiscordUsersData(data, pageCallback) {
        //get user data
        let userData = await axios
            .get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: data.token_type + ' ' + data.access_token,
                },
                responseType: 'json',
            })

            //successfully got discord user's connections
            .then((response) => {
                return response.data;
            })

            //error
            .catch((error) => {
                if (error.response) {
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
            });

        //get connections
        let userConnections = await axios
            .get('https://discord.com/api/users/@me/connections', {
                headers: {
                    authorization: data.token_type + ' ' + data.access_token,
                },
                responseType: 'json',
            })

            //successfully got discord user's connections
            .then((response) => {
                return response.data;
            })

            //error
            .catch((error) => {
                if (error.response) {
                    //log error
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
            });

        //tie this Discord user to their Twitch Account
        connectDiscordAccountToTwitchAccount(
            userData,
            userConnections,
            pageCallback
        );
    }

    //get discord users twitch account from connections data
    connectDiscordAccountToTwitchAccount(
        userData,
        userConnections,
        pageCallback
    ) {
        // //get discord users ID
        // let discordID = userData.id;
        // console.log(discordID);

        //discord user has a twitch connection
        if (
            userConnections &&
            userConnections.some((property) => property.type === 'twitch')
        ) {
            let twitchID = userConnections.find(
                (property) => property.type === 'twitch'
            ).id;
            console.log(twitchID);
        }

        //discord user does not have a twitch connection
        else {
            console.log('No Twitch Connection');
        }

        //give response page to authorization
        pageCallback('discord.html', 'client/html/auth');
    }
}
