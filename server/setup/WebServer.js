//imports
import express from 'express';
import http from 'http';

//server classes
import Authentication from '../setup/Authentication.js';
import Connections from '../setup/Connections.js';

//modules
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

//config
import config from '../config/config.json' assert { type: 'json' };

//paths
let htmlPath = config.paths.client + '/html';

export default class WebServer {
    constructor() {
        //init web server
        this.app = express();
        this.server = http.Server(this.app);

        //setup web server
        this.setup();
    }

    setup() {
        //proxy setting
        this.app.set('trust proxy', config.server.proxy);

        //serve client files (html/css/js/assets)
        this.app.use('/', express.static(config.paths.client));

        //setup authentication rules
        this.auth = new Authentication(this.app);

        //detect authentication and serve game page
        this.app.get('/', function (req, res) {
            //successfully authenticated
            if (
                (req.session &&
                    req.session.passport &&
                    req.session.passport.user) ||
                config.server.bypassAuth
            ) {
                res.sendFile('game.html', { root: htmlPath });
            }

            //request authentication
            else {
                res.sendFile('auth.html', { root: htmlPath });
            }
        });

        //logout
        this.app.get('/logout', function (req, res) {
            req.logout(function (err) {
                if (err) {
                    return next(err);
                }
                res.redirect('/');
            });
        });

        //setup connections (discord)
        new Connections(this.app);

        //start web server
        this.server.listen(process.env.PORT || config.server.port, () => {
            console.log(
                ConsoleColor.Blue,
                utility.timestampString(
                    'Web Server Initialized> Port: ' +
                        this.server.address().port
                )
            );
        });
    }
}
