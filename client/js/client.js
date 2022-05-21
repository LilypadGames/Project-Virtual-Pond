// Handles Client

//connect to server
socket = io.connect();

//variables
var kickReason = '';

class Client {
    constructor(scene) {
        Game = scene;
    };

    //tell server that this client just joined
    onJoin() {
        socket.emit('playerLoadedWorld');
    };

    //tell server that player just re-focused on window
    onReload() {
        socket.emit('playerReloaded');
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
        var color = Math.random() * 0xffffff;
        socket.emit('playerChangedColor', color);
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

//recieve kick reason
socket.on('getKickReason', function(reason) {
    kickReason = reason;
});

//recieve console message
socket.on('consoleMessage', function(message) {
    Game.showToast(message);
});

//on this client disconnecting
socket.on('disconnect', function(){

    //reason default
    if (kickReason == '' | null) {
        kickReason = 'Please refresh to log back in.';
    };

    //show disconnect dialog
    // Game.showDialog(['Disconnected', kickReason, 'Refresh']);
    Game.showDialog({titleText: 'Disconnected', contentText: kickReason, actions: [{text: 'Refresh'}] });

    //reset kick reason
    kickReason = '';

    //disconnect player
    socket.disconnect();
});

//update all players
socket.on('getAllPlayers', function(data) {

    //import Utility functions
    const util = new Utility();

    //populate game world with currently connected players
    for(var i = 0; i < data.length; i++){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data[i].id + ' - In the Pond')); };
        Game.addNewPlayer(data[i]);
    };

    //recieved reload of all currently connected players
    socket.on('reloadPlayer',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Reloaded the Pond')); };
        for(var i = 0; i < data.length; i++){
            Game.placePlayer(data[i].id, data[i].x, data[i].y);
        };
    });

    //recieved player movement
    socket.on('movePlayer',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving To> x:' + data.x + ', y:' + data.y)); };
        Game.movePlayer(data.id, data.x, data.y);
    });

    //recieved player halting
    socket.on('haltPlayer',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Stopped Moving At> x:' + data.x + ', y:' + data.y)); };
        Game.haltPlayer(data.id, data.x, data.y);
    });

    //recieved player movement changed
    socket.on('changePlayerMovement',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Changed Movement Location To> x:' + data.x + ', y:' + data.y)); };
        Game.changePlayerMovement(data.id, data.x, data.y);
    });

    //recieved player message
    socket.on('showPlayerMessage',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message)); };
        Game.displayMessage(data.id, data.message);
    });

    //recieved update on players look
    socket.on('updatePlayerLook',function(data){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Look> Color: ' + data.color)); };
        Game.updatePlayerLook(data);
    });

    //recieved removal of player
    socket.on('removePlayer',function(id){
        if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Left the Pond')); };
        Game.removePlayer(id);
    });

});