// Handles Server

//frameworks
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

//imports
var util = require('./client/js/utility');
var config = require('./config/config');

//send client files (html/css/js/assets)
app.use('/',express.static(__dirname + '/client'));

//send main HTML file to client
app.get('/',function(req,res){
    res.sendFile('index.html', { root: 'client/html' });
});

//init ID
server.lastPlayerID = 0;

//init server
server.listen(process.env.PORT || config.server.port,function(){
    console.log('Listening on Port: '+server.address().port);
});

//sustain player connection
io.on('connection',function(socket){

    //handle player
    socket.on('newPlayerJoined',function(){

        //set up player data
        socket.player = {
            //generate ID
            id: server.lastPlayerID++,
            
            //generate starting location
            x: util.getRandomInt(100,400),
            y: util.getRandomInt(100,400),

            //set direction
            direction: 'right',

            //set tint
            tint: Math.random() * 0xffffff
        };

        //update player location + trigger player move
        socket.on('click',function(data){
            console.log('PLAYER ID: ' + socket.player.id + ' - Moving to> x:' + data.x + ', y:' + data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('movePlayer', socket.player);
        });

        //update player direction
        socket.on('changePlayerDirection',function(newDirection){
            console.log('PLAYER ID: ' + socket.player.id + ' - Changed Direction: ' + newDirection);
            socket.player.direction = newDirection;
            io.emit('updatePlayerLook', socket.player);
        });

        //update player tint + trigger change player look
        socket.on('changePlayerColor',function(newTint){
            console.log('PLAYER ID: ' + socket.player.id + ' - Changed Tint: ' + newTint);
            socket.player.tint = newTint;
            io.emit('updatePlayerLook', socket.player);
        });

        //trigger player disconnect/removed
        socket.on('disconnect',function(){
            io.emit('removePlayer', socket.player.id);
        });

        //update players for all clients
        socket.emit('getAllPlayers',getAllPlayers());

        //trigger new player for all other clients
        socket.broadcast.emit('addNewPlayer', socket.player);

    });
});

//get currently connected players as an array
function getAllPlayers(){

    //init empty array
    var players = [];

    //fill array with currently connected players
    Object.keys(io.sockets.connected).forEach(function(socketID){
        var player = io.sockets.connected[socketID].player;
        if(player) players.push(player);
    });

    //return all curently connected players
    return players;
}