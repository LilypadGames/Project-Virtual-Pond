// Handles Server

//frameworks
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//imports
var util = require(__dirname + '/../client/js/utility');
var config = require(__dirname + '/config/config');

//send client files (html/css/js/assets)
app.use('/',express.static(__dirname + '/../client'));

//send main HTML file to client
app.get('/',function(req,res){
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
            x: util.getRandomInt(100,400),
            y: util.getRandomInt(100,400),

            //set direction
            direction: 'right',

            //set tint
            tint: Math.random() * 0xffffff
        };

        console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Joined the Pond'));

        //triggers when player clicks on the game world
        socket.on('click',function(data){
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Moving to> x:' + data.x + ', y:' + data.y));
            socket.player.x = data.x;
            socket.player.y = data.y;
            //send the players movement for all players
            io.emit('movePlayer', socket.player);
        });

        //triggers when players direction has changed
        socket.on('changePlayerDirection',function(newDirection){
            console.log(util.timestampString('PLAYER ID: ' + socket.player.id + ' - Changed Direction> ' + newDirection));
            socket.player.direction = newDirection;
            //send the new player look for all clients
            io.emit('updatePlayerLook', socket.player);
        });

        //triggers when players color has changed
        socket.on('changePlayerColor',function(newTint){
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
        
        //send all currently connected players for all clients
        socket.emit('getAllPlayers', await getAllPlayers());

        //send new player for all OTHER clients
        socket.broadcast.emit('addNewPlayer', socket.player);

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