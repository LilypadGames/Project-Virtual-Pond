//modules
import serverMetrics from '../module/ServerMetrics.js';
import database from '../module/Database.js';

export default class API {
    constructor(app, io) {
        //store web server
        this.app = app;

        //store websockets
        this.io = io;

        //setup API
        this.setup();
    }

    setup() {
        //online player count
        this.app.get('/api/v1/players/online/count', (req, res) => {
            //response
            let response = {
                value: serverMetrics.getPlayerCount(),
            };

            //send
            res.send(response);
        });

        //online players
        this.app.get('/api/v1/players/online', (req, res) => {
            //response
            let response = serverMetrics.getPlayers();

            //send
            res.send(response);
        });

        //player information
        this.app.get('/api/v1/player/:id', async (req, res) => {
            //parameters
            let playerID = req.params.id;

            //init response
            let response = {};

            //init player data
            let playerData;

            //player is online
            if (serverMetrics.getSocketID(playerID)) {
                //get player data
                playerData = this.io.sockets.sockets.get(
                    serverMetrics.getSocketID(playerID)
                ).player;

                //populate
                response['online'] = true;
                response['id'] = playerData.id;
                response['isVIP'] = playerData.isVIP;
                response['isSponsor'] = playerData.isSponsor;
            }

            //player is offline
            else if (await database.pathExists('users/' + playerID)) {
                //get player data
                playerData = await database.getValue('users/' + playerID);

                //populate response
                response['online'] = false;
                response['id'] = playerID;
                response['isVIP'] = (await database.getValue(
                    'permissions/vip/' + playerID
                ))
                    ? 1
                    : 0;
                if (
                    (await database.getValue(
                        'permissions/admin/' + playerID
                    )) ||
                    (await database.getValue('permissions/mod/' + playerID)) ||
                    (await database.getValue('permissions/vip/' + playerID))
                ) {
                    response['isSponsor'] = 1;
                } else {
                    response['isSponsor'] = (await database.getValue(
                        'donations/' +
                            this.socket.request.user.data[0].id +
                            '/donatorPerks'
                    ))
                        ? 1
                        : 0;
                }
            }

            //player does not exist
            else {
                res.status(404).send({
                    MESSAGE: 'Provided Player ID Does Not Exist.',
                });
                return;
            }

            //populate response
            response['name'] = playerData.name;
            response['room'] = playerData.room;
            response['character'] = playerData.character;
            response['stat'] = playerData.stat;
            response['inventory'] = playerData.inventory;

            //send
            res.send(response);
        });
    }
}
