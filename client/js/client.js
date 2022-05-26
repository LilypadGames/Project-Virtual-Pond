// Handles Client

//connect to server
socket = io.connect();

// GLOBAL VARIABLES
var kickReason = '';

class Client {

    //tell server that this client just joined
    onRoomJoin(room) {
        socket.emit('playerJoinedRoom', room);
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

    //get player data from server
    getPlayerData() {
        socket.emit('requestPlayerData');
    };

    //tell server that the player updated their character data
    updatePlayerData(data) {
        socket.emit('updatePlayerData', data);
    };

    //tell server that the player left game scene and tell it what scene they want to go to
    leaveGameScene(scene) {
        socket.emit('leaveGameScene', scene);
    };

    //tell server that the player wants to leave from all connected rooms
    leaveRooms() {
        socket.emit('leaveRooms');
    };

    //tell server that the player is no longer in the game world (minigame/character creator)
    leaveWorld() {
        console.log('left world')
        socket.emit('leaveWorld');
    }
};

//recieve this client's player ID
socket.on('getPlayerID', function(id) {
    currentScene.initPlayer(id);
});

//recieve this client's player data
socket.on('getPlayerData', function(data) {
    currentScene.parsePlayerData(data);
});

//on player join
socket.on('addNewPlayer', function(data) {
    if (currentScene.scene.key == 'Game') currentScene.addNewPlayer(data);
});

//recieve kick reason
socket.on('getKickReason', function(reason) {
    kickReason = reason;
});

//recieve console message
socket.on('consoleMessage', function(message) {
    if (currentScene.scene.key == 'Game') currentScene.showToast(message);
});

//recieve next scene
socket.on('changeScene', function(scene) {
    // scene.registry.destroy(); // destroy registry
    // scene.events.off(); // disable all active events
    currentScene.scene.start(scene);
});

//on this client disconnecting
socket.on('disconnect', function(){

    //reason default
    if (kickReason == '' | null) {
        kickReason = 'Please refresh to log back in.';
    };

    //show disconnect dialog
    currentScene.showRefreshDialog({titleText: 'Disconnected', captionText: kickReason, actions: [{text: 'Refresh'}] });

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
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data[i].id + ' - In the Pond')); };

            currentScene.addNewPlayer(data[i]);
        };
    };

    //recieved reload of all currently connected players
    socket.on('reloadPlayer',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Reloaded the Pond')); };

            for(var i = 0; i < data.length; i++){
                currentScene.placePlayer(data[i].id, data[i].x, data[i].y);
            };
        };
    });

    //recieved player movement
    socket.on('movePlayer',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving To> x:' + data.x + ', y:' + data.y)); };
            
            currentScene.movePlayer(data.id, data.x, data.y);
        };
    });

    //recieved player halting
    socket.on('haltPlayer',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Stopped Moving At> x:' + data.x + ', y:' + data.y)); };

            currentScene.haltPlayer(data.id, data.x, data.y);
        }
    });

    //recieved player movement changed
    socket.on('changePlayerMovement',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Changed Movement Location To> x:' + data.x + ', y:' + data.y)); };

            currentScene.changePlayerMovement(data.id, data.x, data.y);
        };
    });

    //recieved player message
    socket.on('showPlayerMessage',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message)); };

            currentScene.displayMessage(data.id, data.message);
        };
    });

    //recieved new player character look
    socket.on('updatePlayerCharacter',function(data){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Character> Color: ' + data.character.color + ' Eye Type: ' + data.character.eye_type)); };
            
            currentScene.updatePlayerCharacter(data);
        };
    });

    //recieved removal of player
    socket.on('removePlayer',function(id){
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Left the Pond')); };

            currentScene.removePlayer(id);
        };
    });

});