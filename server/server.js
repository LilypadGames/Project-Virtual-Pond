// Handles Server

//frameworks
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//imports
const util = require(__dirname + '/utility');
const config = require(__dirname + '/config/config');

//send client files (html/css/js/assets)
app.use('/',express.static(__dirname + '/../client'));

//send main HTML file to client
app.get('/',function(req, res){
    res.sendFile('index.html', { root: 'client/html' });
});

//init ID
server.lastPlayerID = 0;

//init server
server.listen(process.env.PORT || config.server.port,function(){
    console.log(util.timestampString('Listening on Port: '+server.address().port));
});

//on new connection
io.on('connection', async function(socket){

    //triggers on new player loading the world
    socket.on('playerLoadedWorld', async function(){

        //set up player data
        socket.player = {

            //generate ID
            id: server.lastPlayerID++,

            name: 'DanMizu',

            //generate starting location
            x: util.getRandomInt(0, 36 * 32),
            y: util.getRandomInt(0, 25.5 * 32),

            // //set direction
            // direction: 'right',

            //set tint
            tint: Math.random() * 0xffffff
        };

        //LOG player joined
        console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Joined the Pond'));

        //send THIS client it's ID
        socket.emit('getPlayerID', socket.player.id);

        //triggers when player reloads their client
        socket.on('playerReloaded', async function(){
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Reloaded the Pond'));
            //send current position of all connected players
            const currentPlayers = await getAllPlayers();
            socket.emit('reloadPlayer', currentPlayers);
        });

        //triggers when player moves
        socket.on('playerMoved',function(data){
            if ((socket.player.x != data.x) || (socket.player.y != data.y)) {
                console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Moving To> x:' + data.x + ', y:' + data.y));
                socket.player.x = data.x;
                socket.player.y = data.y;
                //send the players movement for all clients
                io.emit('movePlayer', socket.player);
            };
        });

        //triggers when player stops moving
        socket.on('playerHalted',function(data){
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
        socket.on('playerSendingMessage',function(message){
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Sending Message> ' + message));
            //send the new player look for all clients
            io.emit('showPlayerMessage', {id: socket.player.id, message: message.trim().replace(/\s+/g, " ") });
        });

        //triggers when players color has changed
        socket.on('playerChangedColor',function(newTint){
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Changed Tint> ' + newTint));
            socket.player.tint = newTint;
            //send the new player look for all clients
            io.emit('updatePlayerLook', socket.player);
        });

        //triggers when player disconnects their client
        socket.on('disconnect',function(){
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
        }
    }

    //return list of connected players
    return connectedPlayers;
}