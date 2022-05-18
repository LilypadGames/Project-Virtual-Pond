// Handles Server

//imports
const utility = require(__dirname + '/utility');

//dependency: File Parsing
const fs = require('fs');
const path = require('path');
var util = require('util');

//setup logging
var currentDay = utility.getCurrentDay();
utility.createDirectory(__dirname + '/logs/');
utility.createDirectory(__dirname + '/logs/server/');
utility.createDirectory(__dirname + '/logs/chat/');
utility.createDirectory(__dirname + '/logs/moderation/');
var consoleLog = utility.getLogFile('server');
var chatLog = utility.getLogFile('chat');
var moderationLog = utility.getLogFile('moderation');

//override console.log function to write to the console log file
console.log = function () {

    //if day changed, create new log file
    if (currentDay != utility.getCurrentDay()) {
        currentDay = utility.getCurrentDay();
        consoleLog = utility.getLogFile('server');
    };

    //write to log
    consoleLog.write(util.format.apply(null, arguments) + '\n');
    process.stdout.write(util.format.apply(null, arguments) + '\n');
};
console.error = console.log;

//log chat messages to chat log
function logChatMessage(message) {
    
    //if day changed, create new log file
    if (currentDay != utility.getCurrentDay()) {
        currentDay = utility.getCurrentDay();
        chatLog = utility.getLogFile('chat');
    };

    //write to log
    chatLog.write(message + '\n');
};

function logModerationMessage(message) {
    
    //if day changed, create new log file
    if (currentDay != utility.getCurrentDay()) {
        currentDay = utility.getCurrentDay();
        moderationLog = utility.getLogFile('moderation');
    };

    //write to log
    moderationLog.write(message + '\n');
};

//get config values
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '/config/config.json')));

//dependency: web server
var express = require('express');
var session = require('express-session');

//init web server
var app = express();
var server = require('http').Server(app);
// var SSL = {
//     key: fs.readFileSync('/config/agent2-key.pem'),
//     cert: fs.readFileSync('/config/agent2-cert.cert')
// };
// var server = require('https').createServer(options, app);

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
var chatFilter = require('leo-profanity');


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

//user profile
var userProfile = {};

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

        // //get user info
        // profile.twitchID = profile.data[0].id;
        // profile.twitchName = profile.data[0].display_name;

        // userProfile = {
        //     id: profile.twitchID,
        //     accessToken: profile.accessToken,
        //     refreshToken: profile.refreshToken,
        //     name: profile.twitchName
        // };

        //store user info in firebase
        // database.ref('users').set()
        // User.findOrCreate(..., function(err, user) {
        //  done(err, user);
        // });

        done(null, profile);
    }
));

//set route to start OAuth link, this is where you define scopes to request
app.get('/auth/twitch', passport.authenticate('twitch', { force_verify: true , scope: 'user_read' }));

//set route for OAuth redirect
app.get('/auth/twitch/callback', passport.authenticate('twitch', { successRedirect: '/', failureRedirect: '/' }));

//detect authentication and serve game page
app.get('/', function (req, res) {

    //successfully authenticated
    if (req.session && req.session.passport && req.session.passport.user) {

        //get user data for this authenticated session
        userProfile = {
            id: req.session.passport.user.data[0].id,
            name: req.session.passport.user.data[0].display_name
        };

        //res.send(template(req.session.passport.user));
        res.sendFile('index.html', { root: 'client/html' });
    }

    //request authentication
    else {
        res.sendFile('auth.html', { root: 'client/html' });
    };
});

//////

//init web server
server.listen(process.env.PORT || config.server.port, function () {
    console.log(utility.timestampString('WEB SERVER STARTED> Listening on port ' + server.address().port));
});


////// WEBSOCKETS (Socket.io)

//init ID
server.lastPlayerID = 0;

//on new websocket connection
io.on('connection', async function(socket) {
    const repl = require('repl')

    //triggers on new player loading the world
    socket.on('playerLoadedWorld', async function() {

        //kick other connection instances of this player
        await kickOtherInstance(userProfile.id);

        //set up player data
        socket.player = {

            //get ID
            id: userProfile.id,

            //generate starting location
            x: utility.getRandomInt(0, 24 * 32),
            y: utility.getRandomInt(0, 17 * 32),

            //get name
            name: userProfile.name,

            //get tint
            tint: Math.random() * 0xffffff
        };

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Joined the Pond'));

        //send THIS client it's ID
        socket.emit('getPlayerID', socket.player.id);

        //triggers when player reloads their client
        socket.on('playerReloaded', async function() {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Reloaded the Pond'));

            //send current position of all connected players
            const currentPlayers = await getAllPlayers();
            socket.emit('reloadPlayer', currentPlayers);
        });

        //triggers when player moves
        socket.on('playerMoved',  function(data) {
            if ((socket.player.x != data.x) || (socket.player.y != data.y)) {

                //log
                console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Moving To> x:' + data.x + ', y:' + data.y));

                //store player location
                socket.player.x = data.x;
                socket.player.y = data.y;

                //send the players movement for all clients
                io.emit('movePlayer', socket.player);
            };
        });

        //triggers when player stops moving
        socket.on('playerHalted', function(data) {
            if ((socket.player.x != data.x) || (socket.player.y != data.y)) {

                //log
                console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Stopped Moving At> x:' + data.x + ', y:' + data.y));

                //store player location
                socket.player.x = data.x;
                socket.player.y = data.y;

                //send the halting of this players movement for all clients
                socket.emit('haltPlayer', socket.player);
                socket.broadcast.emit('changePlayerMovement', socket.player);
            };
        });

        //triggers when player sends a message
        socket.on('playerSendingMessage', function(message) {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Sending Message> ' + message));
            logChatMessage(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' > ' + message));

            //kick if larger than allowed max length
            if (message.length > 80) {

                //kick
                kickInstance(socket.player, 'Abusing chat message maximum length.');

                //add flag to user profile in database

                //do not do the rest
                return;
            };

            //sanitize message
            message = typeof(message) === 'string' && message.trim().length > 0 ? message.trim() : '';

            //format and filter message
            // var filteredMessage = chatFilter.clean(message.trim().replace(/\s+/g, " "));
            message = chatFilter.clean(message);

            //send the player message to all clients
            if (message !== '' || null) {
                io.emit('showPlayerMessage', {id: socket.player.id, message: message});
            };
        });

        //triggers when players color has changed
        socket.on('playerChangedColor', function(newTint) {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Changed Tint> ' + newTint));

            //store player tint
            socket.player.tint = newTint;

            //send the new player look for all clients
            io.emit('updatePlayerLook', socket.player);
        });

        //triggers when player disconnects their client
        socket.on('disconnect', function() {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Left the Pond'));

            //send the removal of the player for all clients
            io.emit('removePlayer', socket.player.id);
        });

        //send new player for all OTHER clients
        socket.broadcast.emit('addNewPlayer', socket.player);

        //send all currently connected players to THIS client
        socket.emit('getAllPlayers', await getAllPlayers());

        //get console input
        repl.start({
            prompt: '',
            eval: (input) => {
                socket.emit('consoleMessage', input);
            }
        })
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

//kick client
async function kickInstance(player, reason, kickMessage = 'You have been kicked.') {

    //log
    logLine = utility.timestampString('PLAYER ID: ' + player.id + ' (' + player.name + ')' + ' - KICKED> Reason: ' + reason + ', Message: ' + kickMessage)
    console.log(logLine);
    logModerationMessage(logLine);

    //get connected clients
    const connectedClients = await io.fetchSockets();

    //loop through connected clients
    for (const client of connectedClients) {

        //if this client has player information
        if (client.player) {
            //get player ID
            var playerID = client.player.id

            //kick currently connected clients if they match the ID of the client attempting to connect
            if(playerID == player.id){

                //send kick message
                io.emit('getKickReason', kickMessage);

                //kick client
                client.disconnect();

                //end loop
                break;
            };
        };
    };
}

//////