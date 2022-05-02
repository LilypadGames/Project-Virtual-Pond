// Handles Client

//connect to server
socket = io.connect();

class Client {
    constructor(scene) {
        Game = scene;
    };

    //tell server that this client just joined
    onJoin() {
        socket.emit('playerLoadedWorld');
    };

    //tell server that the client has clicked at a specific coordinate
    onMove(x, y) {
        socket.emit('playerMoved', {x: x, y: y});
    };

    //tell server that client is stopping its movement
    onHalt(x, y) {
        socket.emit('playerHalted', {x: x, y: y});
    };

    //tell server that client is sending a message
    sendMessage(message) {
        socket.emit('playerSendingMessage', message);
    };

    //tell server that the player has changed its color
    changeLook() {
        var tint = Math.random() * 0xffffff;
        socket.emit('playerChangedColor', tint);
    };
};

//recieve this client's player ID
socket.on('getPlayerID', function(id) {
    Game.setPlayerID(id);
});

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

    //recieved player movement
    socket.on('movePlayer',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving To> x:' + data.x + ', y:' + data.y)); };
        Game.movePlayer(data.id, data.x, data.y);
    });

    //recieved player halting
    socket.on('haltPlayer',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Stopped Moving At> x:' + data.x + ', y:' + data.y)); };
        Game.haltPlayer(data.id);
    });

    //recieved player message
    socket.on('showPlayerMessage',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message)); };
        Game.displayMessage(data.id, data.message);
    });

    //recieved update on players look
    socket.on('updatePlayerLook',function(data){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Look> Tint: ' + data.tint)); };
        Game.updatePlayerLook(data);
    });

    //recieved removal of player
    socket.on('removePlayer',function(id){
        if (consoleLogging) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Left the Pond')); };
        Game.removePlayer(id);
    });

});