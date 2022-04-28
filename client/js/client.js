// Handles Client

var Client = {};
Client.socket = io.connect();

//tell server that this client just pressed a key
Client.onKeyPress = function(key){
    if (key = 'enter'){
        
        //generate random hex code color
        tint = Math.random() * 0xffffff;

        //tell server that the player has changed its color
        Client.socket.emit('changePlayerColor', tint);
    }
};

//tell server that this client just joined
Client.onPlayerJoin = function(){
    Client.socket.emit('playerLoadedWorld');
};

//tell server that the client has clicked at a specific coordinate
Client.sendClick = function(x, y){
    Client.socket.emit('click', {x:x, y:y});
};

//tell server the client's current direction 
Client.updatePlayerDirection = function(currentDirection, currentX, currentY, newX, newY){
    //init newDirection as blank
    newDirection = '';

    //get direction as degrees
    var targetRad = Phaser.Math.angleBetween(currentX, currentY,newX, newY);
    var targetDegrees = Phaser.Math.radToDeg(targetRad);

    //turn right
    if (targetDegrees > -90 && targetDegrees < 90 && currentDirection !== 'right') {
        newDirection = 'right';

    //turn left
    } else if ((targetDegrees > 90 || targetDegrees < -90) && currentDirection !== 'left') {
        newDirection = 'left';
    }

    //if direction changed, tell the server to update all clients
    if (newDirection != '') Client.socket.emit('changePlayerDirection', newDirection);

};

//on player join
Client.socket.on('addNewPlayer',function(data){
    Game.addNewPlayer(data);
});

//update all players
Client.socket.on('getAllPlayers',function(data){

    //populate game world with currently connected players
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i]);
    }

    //trigger specified player's look change
    Client.socket.on('updatePlayerLook',function(data){
        console.log('PLAYER ID: ' + data.id + ' - Updating Player Look> Tint: ' + data.tint + ' Direction: ' + data.direction);
        Game.updatePlayerLook(data);
    });

    //trigger specified player's movement
    Client.socket.on('movePlayer',function(data){
        console.log('PLAYER ID: ' + data.id + ' - Moving to> x:' + data.x + ', y:' + data.y);
        Game.movePlayer(data.id, data.x, data.y);
    });

    //trigger removal of specified player
    Client.socket.on('removePlayer',function(id){
        Game.removePlayer(id);
    });

});