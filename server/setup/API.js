//modules
import serverMetrics from '../module/ServerMetrics.js';

export default class API {
    constructor(app) {
        //store web server
        this.app = app;
        
        //setup API
        this.setup();
    }

    setup() {
        //online player count
        this.app.get('/api/v1/players/online/count', (req, res) => {
            //response
            let response = {
                "value": serverMetrics.getPlayerCount()
            }

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
    }
}