// Handles Client

//connect to server
socket = io.connect();

class Client {
    constructor(scene) {
        Game = scene;
    };

    //tell server that this client just pressed a key
    onKeyPress(key) {

        //change player color
        if (key === 'c'){
            //generate random hex code color
            var tint = Math.random() * 0xffffff;

            //tell server that the player has changed its color
            socket.emit('playerChangedColor', tint);
        }
    };

    //tell server that client is sending a message
    sendMessage(message) {
        socket.emit('playerSendingMessage', message);
    }

    //tell server that this client just joined
    onPlayerJoin() {
        socket.emit('playerLoadedWorld');
    };

    //tell server that the client has clicked at a specific coordinate
    onMove(x, y) {
        socket.emit('playerClickedToMove', {x: x, y: y});
    };

    //tell server the client's current direction 
    updatePlayerDirection(currentDirection, currentX, currentY, newX, newY) {

        //init newDirection as blank
        var newDirection = '';

        //get direction as degrees
        var targetRad = Phaser.Math.Angle.Between(currentX, currentY,newX, newY);
        var targetDegrees = Phaser.Math.RadToDeg(targetRad);

        //turn right
        if (targetDegrees > -90 && targetDegrees < 90 && currentDirection !== 'right') {
            newDirection = 'right';

        //turn left
        } else if ((targetDegrees > 90 || targetDegrees < -90) && currentDirection !== 'left') {
            newDirection = 'left';
        }

        //if direction changed, tell the server to update all clients
        if (newDirection !== '') { socket.emit('playerChangedDirection', newDirection); };
    };

};

//on player join
socket.on('addNewPlayer', function(data) {
    Game.addNewPlayer(data);
});

//update all players
socket.on('getAllPlayers', function(data) {

    //import Utility functions
    const util = new Utility();

    //populate game world with currently connected players
    for(var i = 0; i < data.length; i++){
        console.log(util.timestampString('PLAYER ID: ' + data[i].id + ' - In the Pond'));
        Game.addNewPlayer(data[i]);
    }

    //show players message
    socket.on('showPlayerMessage',function(data){
        console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message));
        Game.displayMessage(data.id, data.message);
    });

    //trigger specified player's look change
    socket.on('updatePlayerLook',function(data){
        console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Look> Tint: ' + data.tint + ' Direction: ' + data.direction));
        Game.updatePlayerLook(data);
    });

    //trigger specified player's movement
    socket.on('movePlayer',function(data){
        console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving to> x:' + data.x + ', y:' + data.y));
        Game.movePlayer(data.id, data.x, data.y);
    });

    //trigger removal of specified player
    socket.on('removePlayer',function(id){
        console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Left the Pond'));
        Game.removePlayer(id);
    });

});