// Handles Server

//imports
const util = require(__dirname + '/utility');

//dependency: File Parsing
const fs = require('fs');
const path = require('path');

//get config values
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '/config/config.json')));

//dependency: web server
var express        = require('express');
var session        = require('express-session');

//init web server
var app = express();
var server = require('http').Server(app);

//dependency: websocket
var io = require('socket.io')(server);

//dependency: database
var firebase = require("firebase-admin");

//init database
firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase),
    databaseURL: "https://project-virtual-pond-default-rtdb.firebaseio.com"
});
var database = firebase.database();

//dependency: authentication
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');

//init authentication
app.use(session({secret: config.twitch.sessionSecret, resave: false, saveUninitialized: false}));
app.use(passport.initialize());
app.use(passport.session());

//serve client files (html/css/js/assets)
app.use('/', express.static(__dirname + '/../client'));

//dependency: misc
var Filter = require('bad-words'),
chatFilter = new Filter();


////// AUTHENTICATION

//override passport profile function to get user profile from Twitch API
OAuth2Strategy.prototype.userProfile = function(accessToken, done) {

    var options = {
        url: 'https://api.twitch.tv/helix/users',
        method: 'GET',
        headers: {
            'Client-ID': config.twitch.clientID,
            'Accept': 'application/vnd.twitchtv.v5+json',
            'Authorization': 'Bearer ' + accessToken
        }
    };

    request(options, function (error, response, body) {
        if (response && response.statusCode == 200) {
            done(null, JSON.parse(body));
        }
        else {
            done(JSON.parse(body));
        };
    });
};

passport.serializeUser(function(user, done) {
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    done(null, user);
});

//get user info
var twitchName;
var twitchID;
var twitchImage;

passport.use('twitch', new OAuth2Strategy({

    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: config.twitch.clientID,
    clientSecret: config.twitch.clientSecret,
    callbackURL: config.twitch.callbackURL,
    state: true
    },

    function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        //get user info
        twitchName = profile.data[0].display_name;
        twitchID = profile.data[0].id;
        twitchImage = profile.data[0].profile_image_url;

        //store user info in firebase
        // database.ref('users').set()
        // User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        // });

        done(null, profile);
    }
));

//set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { scope: 'user_read' }));

//set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

//detect authentication and serve game page
app.get('/', function (req, res) {

    //successfully authenticated
    if (req.session && req.session.passport && req.session.passport.user) {
        // res.send(template(req.session.passport.user));
        res.sendFile('index.html', { root: 'client/html' });
    }

    //request authentication
    else {
        res.sendFile('auth.html', { root: 'client/html' });
    }
});

//////

//init web server
server.listen(process.env.PORT || config.server.port, function () {
    console.log(util.timestampString('Listening on port ' + server.address().port));
});


////// WEBSOCKETS (Socket.io)

//init ID
server.lastPlayerID = 0;

//on new websocket connection
io.on('connection', async function(socket) {

    //kick other connection instances of this player
    kickOtherInstance(twitchID);

    //triggers on new player loading the world
    socket.on('playerLoadedWorld', async function() {

        //set up player data
        socket.player = {

            //get ID
            id: twitchID,

            //generate starting location
            x: util.getRandomInt(0, 24 * 32),
            y: util.getRandomInt(0, 17 * 32),

            //get name
            name: twitchName,

            //get tint
            tint: Math.random() * 0xffffff
        };

        //LOG player joined
        console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Joined the Pond'));

        //send THIS client it's ID
        socket.emit('getPlayerID', socket.player.id);

        //triggers when player reloads their client
        socket.on('playerReloaded', async function() {
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Reloaded the Pond'));
            //send current position of all connected players
            const currentPlayers = await getAllPlayers();
            socket.emit('reloadPlayer', currentPlayers);
        });

        //triggers when player moves
        socket.on('playerMoved',  function(data) {
            if ((socket.player.x != data.x) || (socket.player.y != data.y)) {
                console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Moving To> x:' + data.x + ', y:' + data.y));
                socket.player.x = data.x;
                socket.player.y = data.y;
                //send the players movement for all clients
                io.emit('movePlayer', socket.player);
            };
        });

        //triggers when player stops moving
        socket.on('playerHalted', function(data) {
            if ((socket.player.x != data.x) || (socket.player.y != data.y)) {
                console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Stopped Moving At> x:' + data.x + ', y:' + data.y));
                socket.player.x = data.x;
                socket.player.y = data.y;
                //send the halting of this players movement for all clients
                socket.emit('haltPlayer', socket.player);
                socket.broadcast.emit('changePlayerMovement', socket.player);
            };
        });

        //triggers when player sends a message
        socket.on('playerSendingMessage', function(message) {
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Sending Message> ' + message));
            //send the new player look for all clients
            io.emit('showPlayerMessage', {id: socket.player.id, message: chatFilter.clean(message.trim().replace(/\s+/g, " ")) });
        });

        //triggers when players color has changed
        socket.on('playerChangedColor', function(newTint) {
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Changed Tint> ' + newTint));
            socket.player.tint = newTint;
            //send the new player look for all clients
            io.emit('updatePlayerLook', socket.player);
        });

        //triggers when player disconnects their client
        socket.on('disconnect', function() {
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Left the Pond'));
            //send the removal of the player for all clients
            io.emit('removePlayer', socket.player.id);
        });

        //send new player for all OTHER clients
        socket.broadcast.emit('addNewPlayer', socket.player);

        //send all currently connected players to THIS client
        socket.emit('getAllPlayers', await getAllPlayers());
    });
});

//get currently connected players as an array
async function getAllPlayers(){

    //init connected player list
    var connectedPlayers = [];

    //get connected clients
    const connectedClients = await io.fetchSockets();

    //loop through connected clients
    for (const client of connectedClients) {

        //get player information from this client
        var player = client.player

        //if there is player information, add them to the connected player list
        if(player){
            connectedPlayers.push(player);
        };
    };

    //return list of connected players
    return connectedPlayers;
};

//disconnect clients with the same ID
async function kickOtherInstance(id) {
    //get connected clients
    const connectedClients = await io.fetchSockets();

    //loop through connected clients
    for (const client of connectedClients) {

        //if this client has player information
        if (client.player) {
            //get player ID
            var playerID = client.player.id

            //kick currently connected clients if they match the ID of the client attempting to connect
            if(playerID == id){
                client.disconnect();
            };
        };
    };
};

//////