// Handles Server

//imports
var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io').listen(server);
var util = require('./js/utility.js');

//get styles
app.use('/css',express.static(__dirname + '/css'));

//get javascript
app.use('/js',express.static(__dirname + '/js'));

//get game assets
app.use('/assets',express.static(__dirname + '/assets'));

//get site HTML
app.get('/',function(req,res){
    res.sendFile(__dirname+'/index.html');
});

//init ID
server.lastPlayerID = 0;

//init server
server.listen(process.env.PORT || 5500,function(){
    console.log('Listening on '+server.address().port);
});

//sustain player connection
io.on('connection',function(socket){

    //handle player
    socket.on('addNewPlayer',function(){
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
            console.log('PLAYER ID: '+socket.player.id+' - Moving to> x:'+data.x+', y:'+data.y);
            socket.player.x = data.x;
            socket.player.y = data.y;
            io.emit('movePlayer',socket.player);
        });

        //update player direction
        socket.on('changePlayerDirection',function(newDirection){
            console.log('PLAYER ID: '+socket.player.id+' - Changed Direction: '+newDirection);
            socket.player.direction = newDirection;
            io.emit('updatePlayerLook',socket.player);
        });

        //update player tint + trigger change player look
        socket.on('changePlayerColor',function(newTint){
            console.log('PLAYER ID: '+socket.player.id+' - Changed Tint: '+newTint);
            socket.player.tint = newTint;
            io.emit('updatePlayerLook',socket.player);
        });

        //trigger player disconnect/removed
        socket.on('disconnect',function(){
            io.emit('removePlayer',socket.player.id);
        });

        //update players for all clients
        socket.emit('getAllPlayers',getAllPlayers());

        //trigger new player for all other clients
        socket.broadcast.emit('addNewPlayer',socket.player);
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