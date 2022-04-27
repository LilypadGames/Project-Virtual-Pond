// Handles Client

var Client = {};
Client.socket = io.connect();

//tell server that this client just pressed a key
Client.onKeyPress = function(key){
    if (key = 'enter'){
        tint = Math.random() * 0xffffff;
        //tell server that the player has changed its color
        Client.socket.emit('changePlayerColor', tint);
    }
};

//tell server that this client just joined
Client.onPlayerJoin = function(){
    Client.socket.emit('addNewPlayer');
};

//tell server that the client has clicked at a specific coordinate
Client.sendClick = function(x, y){
  Client.socket.emit('click',{x:x, y:y});
};

//tell server the client's current direction
Client.updatePlayerDirection = function(currentDirection, currentX, currentY, newX, newY){
    //get direction as degrees
    var targetRad = Phaser.Math.angleBetween(currentX, currentY,newX, newY);
    var targetDegrees = Phaser.Math.radToDeg(targetRad);

    //turn right
    if (targetDegrees > -90 && targetDegrees < 90 && currentDirection !== 'right') {
        Client.socket.emit('changePlayerDirection', 'right');

    //turn left
    } else if ((targetDegrees > 90 || targetDegrees < -90) && currentDirection !== 'left') {
        Client.socket.emit('changePlayerDirection', 'left');
    }
};

//on player join
Client.socket.on('addNewPlayer',function(data){
    Game.addNewPlayer(data);
});

//update all players
Client.socket.on('getAllPlayers',function(data){
    //add new players
    for(var i = 0; i < data.length; i++){
        Game.addNewPlayer(data[i]);
    }

    //update player look
    Client.socket.on('updatePlayerLook',function(data){
        console.log('PLAYER ID: '+data.id+' - Updating Player Look> Tint: '+data.tint+' Direction: '+data.direction);
        Game.updatePlayerLook(data);
    });

    //move players
    Client.socket.on('movePlayer',function(data){
        console.log('PLAYER ID: '+data.id+' - Moving to> x:'+data.x+', y:'+data.y);
        Game.movePlayer(data.id,data.x,data.y);
    });

    //remove players
    Client.socket.on('removePlayer',function(id){
        Game.removePlayer(id);
    });
});