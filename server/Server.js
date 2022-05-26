// Handles Server

//dependency: file parsing
const fs = require('fs');
const path = require('path');
var util = require('util');

//imports
const utility = require(path.join(__dirname, '/utility/Utility.js'));
const database = require(path.join(__dirname, '/utility/Database.js'));
const logs = require(path.join(__dirname, '/utility/Logs.js'));

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

//dependency: authentication
var passport       = require('passport');
var OAuth2Strategy = require('passport-oauth').OAuth2Strategy;
var request        = require('request');

//dependency: misc
var chatFilter = require('leo-profanity');
var cookieParse = require('cookie-parser')();

//serve client files (html/css/js/assets)
app.use('/', express.static(__dirname + '/../client'));

////// OVERRIDES

//send console logs to server log file
console.log = function() {

    //format message
    const message = util.format.apply(null, arguments);

    //write to log
    logs.logMessage('server', message);
    process.stdout.write(message + '\n');
};
console.error = console.log;

////// AUTHENTICATION

//init authentication
const sessionAuthentication = session({
    secret: config.twitch.sessionSecret, 
    resave: false, 
    saveUninitialized: false
});
const passportInit = passport.initialize();
const passportSession = passport.session();
app.use(sessionAuthentication);
app.use(passportInit);
app.use(passportSession);

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

passport.use('twitch', new OAuth2Strategy({

    authorizationURL: 'https://id.twitch.tv/oauth2/authorize',
    tokenURL: 'https://id.twitch.tv/oauth2/token',
    clientID: config.twitch.clientID,
    clientSecret: config.twitch.clientSecret,
    callbackURL: config.twitch.callbackURL,
    state: true
    },
    
    async function(accessToken, refreshToken, profile, done) {
        profile.accessToken = accessToken;
        profile.refreshToken = refreshToken;

        //store users name and ID in database
        var path = 'users/' + profile.data[0].id + '/name'
        const pathExists = await database.pathExists(path);
        if (!pathExists) {
            database.setValue(path, profile.data[0].display_name);
        };

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
        res.sendFile('index.html', { root: 'client/html' });
    }

    //request authentication
    else {
        res.sendFile('auth.html', { root: 'client/html' });
    };
});

////// WEB SERVER

//init web server
server.listen(process.env.PORT || config.server.port, function () {
    console.log(utility.timestampString('WEB SERVER STARTED> Listening on port ' + server.address().port));
});

////// WEBSOCKETS (Socket.io/Express)

//dependency: websocket
var io = require('socket.io')(server);

io.use(function(socket, next){
    socket.client.request.originalUrl = socket.client.request.url;
    cookieParse(socket.client.request, socket.client.request.res, next);
});

io.use(function(socket, next){
    socket.client.request.originalUrl = socket.client.request.url;
    sessionAuthentication(socket.client.request, socket.client.request.res, next);
});

io.use(function(socket, next){
    passportInit(socket.client.request, socket.client.request.res, next);
});

io.use(function(socket, next){
    passportSession(socket.client.request, socket.client.request.res, next);
});

//on new websocket connection
io.on('connection', async function(socket) {

    //kick other connection instances of this player
    await kickOtherInstance(socket.request.user.data[0].id);

    //set up player data
    socket.player = await getPlayerData(socket);

    //send client's player data on connection to ONLY THIS client (players start on Menu scene, which requires the player data to see if they should be sent to the game or character creator scene)
    socket.emit('getPlayerData', socket.player);

    //triggers when client wants to leave all rooms
    socket.on('leaveRooms', function() {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Left All Rooms'));

        //leave rooms
        leaveAllRooms(socket);
    });

    //triggers when client requests the players data
    socket.on('requestPlayerData', function() {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Requested Player Data'));

        //send this client's player data to ONLY THIS client
        socket.emit('getPlayerData', socket.player);
    });

    //triggers when client requests the players data
    socket.on('updatePlayerData', function(data) {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Updated Player Data> Color:' + data.character.color + ', Eye Type: ' + data.character.eye_type));

        //update data
        if (!socket.player.character) socket.player.character = {};
        socket.player.character.eye_type = data.character.eye_type;
        socket.player.character.color = data.character.color;

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Changed Scene: ' + data.queueScene));

        //send scene change to ONLY THIS client
        socket.emit('changeScene', data.queueScene);

        // //send the new player look for all clients
        // io.in(socket.roomID).emit('updatePlayerCharacter', socket.player);
    });

    //triggers when player leaves game scene
    socket.on('leaveGameScene', function(scene) {
        //update player data
        updatePlayerData(socket);

        // //send the removal of this player to ALL clients
        // io.in(socket.roomID).emit('removePlayer', socket.player.id);

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Changed Scene: ' + scene));

        //send scene change to ONLY THIS client
        socket.emit('changeScene', scene);
    });

    //triggers on player loading into new room
    socket.on('playerJoinedRoom', async function(room) {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Joined the Pond'));

        //update player data
        updatePlayerData(socket);

        //add player to room
        joinRoom(socket, room);

        //send this client's ID to ONLY THIS client
        socket.emit('getPlayerID', socket.player.id);

        //triggers when player reloads their client
        socket.on('playerReloaded', async function() {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Reloaded the Pond'));

            //send current position of all connected players in this room to ONLY THIS client
            const currentPlayers = await getAllPlayers(socket.roomID);
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

                //send the players movement for ALL clients in this room
                io.in(socket.roomID).emit('movePlayer', socket.player);
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

                //send the halting of this players movement for ALL clients in this room
                io.in(socket.roomID).emit('haltPlayer', socket.player);

                //change player movement for ONLY OTHER clients in this room
                socket.to(socket.roomID).emit('changePlayerMovement', socket.player);
            };
        });

        //triggers when player sends a message
        socket.on('playerSendingMessage', function(message) {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Sending Message> ' + message));
            logs.logMessage('chat', utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' > ' + message))

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

            //filter message
            message = chatFilter.clean(message);

            //send the player message to ALL clients in this room
            if (message !== '' || null) {
                io.in(socket.roomID).emit('showPlayerMessage', {id: socket.player.id, message: message});
            };
        });

        //triggers when client leaves game world
        socket.on('leaveWorld', function() {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Left Game World'));

            //update player data
            // updatePlayerData(socket);

            //send the removal of the player for ALL clients in this room
            io.in(socket.roomID).emit('removePlayer', socket.player.id);

            //leave rooms
            leaveAllRooms(socket);
        });

        //triggers when player disconnects their client
        socket.on('disconnect', function() {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + socket.player.id + ' (' + socket.player.name + ')' + ' - Left the Pond'));

            //update player data
            updatePlayerData(socket);

            //send the removal of the player for ALL clients in this room
            io.in(socket.roomID).emit('removePlayer', socket.player.id);
        });

        //send new player to ONLY OTHER clients in this room
        socket.to(socket.roomID).emit('addNewPlayer', socket.player);

        //send all currently connected players in this room to ONLY THIS client
        socket.emit('getAllPlayers', await getAllPlayers(socket.roomID));
    });

    //set up player data
    socket.player = await getPlayerData(socket);
});

///// FUNCTIONS

//add player to room
function joinRoom(socket, room) {

    //leave previous rooms
    leaveAllRooms(socket);

    //join new room
    socket.join(room);

    //set as current room
    socket.roomID = room;
};

//remove player from all rooms
function leaveAllRooms(socket) {

    //leave room
    socket.leave(socket.roomID);

    //delete players room ID
    delete socket.roomID;
};

//get player data
async function getPlayerData(socket) {

    //set up initial data
    var playerData = {

        //get ID
        id: socket.request.user.data[0].id,

        //generate starting location
        x: utility.getRandomInt(7, 1279),
        y: utility.getRandomInt(560, 796),

        //get name
        name: socket.request.user.data[0].display_name
    };

    //check if character data exists
    const pathExists = await database.pathExists('users/' + socket.request.user.data[0].id + '/character');

    //get character data from database
    if (pathExists) {
        playerData.character = {
            eye_type: await database.getValue('users/' + socket.request.user.data[0].id + '/character/eye_type'),
            color: await database.getValue('users/' + socket.request.user.data[0].id + '/character/color')
        };
    };

    return playerData;
};

//update player data
function updatePlayerData(socket) {
    const path = 'users/' + socket.player.id + '/character'
    database.setValue(path + '/eye_type', socket.player.character.eye_type);
    database.setValue(path + '/color', socket.player.character.color);
};

//get currently connected players as an array
async function getAllPlayers(room) {

    //init connected player list
    var connectedPlayers = [];
    var connectedClients;

    //get connected clients
    if (room) {
        connectedClients = await io.in(room).fetchSockets();
    } else {
        connectedClients = await io.fetchSockets();
    };

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
                //kick
                client.disconnect();
            };
        };
    };
};

//kick client
async function kickInstance(player, reason, kickMessage = 'You have been kicked.') {

    //log
    message = utility.timestampString('PLAYER ID: ' + player.id + ' (' + player.name + ')' + ' - KICKED> Reason: ' + reason + ', Message: ' + kickMessage)
    logs.logMessage('moderation', message);

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
};

//////