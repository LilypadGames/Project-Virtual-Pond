// typings
import { Express as ExpressServer } from "express";

// imports
import axios from 'axios';

//modules
import log from '../module/Logs.js';

//config
import config from '../../config.json' assert { type: 'json' };

export default class Connections {
    app;

    constructor(app: ExpressServer) {
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
                    req.query.code as string,
                    // callback, which sends a page to the user after this is all done
                    (page: string, root: string) => {
                        res.sendFile(page, { root: root });
                    }
                );
            }
        });
    }

    //use auth code to get access token
    getDiscordUsersAccessToken(code: string, pageCallback: Function) {
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
                this.getDiscordUsersData(response.data, pageCallback);
            })
            .catch((error) => {
                // NOTE: An unauthorized token will not throw an error
                // response.status will be 401
                if (error.response) {
                    //log
                    log.error(
                        'Fetching Access Token For Discord User -> ' +
                            error.response.status +
                            ': ' +
                            error.response.data.error
                    );
                }
            });
    }

    //get discord users connection using access token
    async getDiscordUsersData(data: {token_type:string, access_token:string}, pageCallback: Function) {
        //get user data
        let userData = await axios
            .get('https://discord.com/api/users/@me', {
                headers: {
                    authorization: data.token_type + ' ' + data.access_token,
                },
                responseType: 'json',
            })

            //successfully got discord user's data
            .then((response) => {
                return response.data;
            })

            //error
            .catch((error) => {
                if (error.response) {
                    //log
                    log.error(
                        'Fetching Discord Users Data -> ' +
                            error.response.status +
                            ': ' +
                            error.response.data.error
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
                    //log
                    log.error(
                        'Fetching Discord Users Connections -> ' +
                            error.response.status +
                            ': ' +
                            error.response.data.error
                    );
                }
            });

        //tie this Discord user to their Twitch Account
        this.connectDiscordAccountToTwitchAccount(
            userData,
            userConnections,
            pageCallback
        );
    }

    //get discord users twitch account from connections data
    connectDiscordAccountToTwitchAccount(
        userData: any,
        userConnections: any,
        pageCallback: Function
    ) {
        //get discord users ID
        let discordID = userData.id;
        console.log(discordID);

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
            // console.log('No Twitch Connection');
        }

        //give response page to authorization
        pageCallback('discord.html', 'client/html/auth');
    }
}
