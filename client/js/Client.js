// Handles Client

//connect to server
socket = io.connect();

//network time protocol
ntp.init(socket);
setInterval(function () {
    // console.log(ntp.offset());
}, 1000);

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
    onMove(x, y, direction) {
        socket.emit('playerMoved', { x: x, y: y, direction: direction });
    };

    //tell server that client is sending a message
    sendMessage(message) {
        socket.emit('playerSendingMessage', message);
    };

    //get player data from server
    requestPlayerData() {
        socket.emit('requestPlayerData');
    };

    //tell server that the player updated their character data
    updatePlayerData(data) {
        socket.emit('updatePlayerData', data);
    };

    //tell server that the player wants to leave from all connected rooms
    leaveRooms() {
        socket.emit('leaveRooms');
    };

    //tell server that the player is no longer in the game world (minigame/character creator)
    leaveWorld() {
        socket.emit('leaveWorld');
    };

    //tell server that player is going to interact with an NPC
    onInteractNPC(npcID) {
        socket.emit('playerInteractingWithNPC', npcID);
    };
};

//calculate latency
setInterval(() => {
    if (debugMode) {
        const start = Date.now();
        socket.volatile.emit("ping", () => {
            const latency = Date.now() - start;
            if (currentScene.scene.key == 'Game') currentScene.newPing(latency);
        });
    };
}, 2000);

//recieve this client's player data
socket.on('playerData', function(data) {
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
    currentScene.scene.start(scene);
});

//on this client disconnecting
socket.on('disconnect', function(){

    //reason default
    if (kickReason == '' | null) {
        kickReason = 'Please refresh to log back in.';
    };

    //show disconnect dialog
    currentScene.showRefreshDialog({ title: 'Disconnected', description: kickReason, button: 'Refresh' });

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
    socket.on('reloadPlayer', function(data) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Reloaded the Pond')); };

            for(var i = 0; i < data.length; i++){
                currentScene.updatePlayer(data[i]);
            };
        };
    });

    //recieved player movement
    socket.on('movePlayer', function(data) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Moving To> x:' + data.x + ', y:' + data.y)); };
            
            //set player direction
            if (!document.hidden) currentScene.setPlayerDirection(data.id, data.direction);

            //move player
            if (!document.hidden) currentScene.movePlayer(data.id, data.x, data.y);
        };
    });

    //recieved player movement changed
    socket.on('changePlayerMovement', function(data) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Changed Movement Location To> x:' + data.x + ', y:' + data.y)); };

            currentScene.changePlayerMovement(data.id, data.x, data.y);
        };
    });

    //recieved player message
    socket.on('showPlayerMessage', function(data) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message)); };

            currentScene.showMessage(data.id, data.messageData);
        };
    });

    //recieved player message
    socket.on('removePlayerMessage', function(data) {
        if (currentScene.scene.key == 'Game') {
            currentScene.removeMessage(data.id, data.messageID);
        };
    });

    //recieved new player character look
    socket.on('updatePlayerCharacter', function(data) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + data.id + ' - Updating Player Character> Color: ' + data.character.color + ' Eye Type: ' + data.character.eye_type)); };
            
            currentScene.updatePlayer(data);
        };
    });

    //recieved removal of player
    socket.on('removePlayer', function(id) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + id + ' - Left the Pond')); };

            currentScene.removePlayer(id);
        };
    });

    //recieved interactNPC data of player
    socket.on('setPlayerInteractNPC', function(playerInteractNPC) {
        if (currentScene.scene.key == 'Game') {

            //log
            if (debugMode) { console.log(util.timestampString('PLAYER ID: ' + playerInteractNPC.playerID + ' - Trying to Interact With NPC: ' + playerInteractNPC.npcID)) };

            //set data
            utility.getObject(currentScene.playerData, playerInteractNPC.playerID).interactNPC = playerInteractNPC.npcID;
        };
    });
});