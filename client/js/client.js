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
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data[i].id + ' - In the Pond')); };
        Game.addNewPlayer(data[i]);
    }

    //show players message
    socket.on('showPlayerMessage',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message)); };
        Game.displayMessage(data.id, data.message);
    });

    //trigger specified player's look change
    socket.on('updatePlayerLook',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Look> Tint: ' + data.tint)); };
        Game.updatePlayerLook(data);
    });

    //trigger specified player's movement
    socket.on('movePlayer',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving to> x:' + data.x + ', y:' + data.y)); };
        Game.movePlayer(data.id, data.x, data.y);
    });

    //trigger removal of specified player
    socket.on('removePlayer',function(id){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Left the Pond')); };
        Game.removePlayer(id);
    });

});