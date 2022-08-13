// Handles Client

//imports
const util = new Utility();

//connect to server
socket = io.connect();

//calculate latency
setInterval(() => {
    if (debugMode) {
        const start = Date.now();
        socket.volatile.emit('ping', () => {
            const latency = Date.now() - start;
            if (currentScene.scene.key == 'Game') currentScene.newPing(latency);
        });
    }
}, 2000);

// GLOBAL VARIABLES
let kickReason = undefined;

class Client {
    //get initial load data from server
    requestLoadData() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Requested Initial Load Data'));
        }

        //request data from server
        socket.emit('requestLoadData', (data) => {
            currentScene.parseLoadData(data);
        });
    }

    //get player data from server
    requestClientPlayerData() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Requested Clients Player Data'));
        }

        //request data from server
        socket.emit('requestClientPlayerData', (data) => {
            currentScene.parsePlayerData(data);
        });
    }

    //tell server that the player updated their character data
    updateClientPlayerData(data) {
        socket.emit('updateClientPlayerData', data, () => {
            currentScene.events.emit('updatedClientPlayerData');
        });
    }

    //get all player data from the sockets current room
    onReload() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Reloaded the Pond'));
        }

        //request data from server
        socket.emit('requestAllPlayersInRoom', (data) => {
            if (currentScene.scene.key == 'Game') {
                //update players in room
                for (var i = 0; i < data.length; i++) {
                    currentScene.updatePlayer(data[i]);
                }
            }
        });
    }

    //tell server that the player left a room (to go to another room or a menu/minigame)
    leaveRoom() {
        socket.emit('leaveRoom');
    }

    //tell server that this client just joined
    joinRoom(room) {
        socket.emit('joinRoom', room, (data) => {
            //get players in this room
            for (var i = 0; i < data['players'].length; i++) {
                if (currentScene.scene.key == 'Game') {
                    //log
                    if (debugMode) {
                        console.log(
                            util.timestampString(
                                'PLAYER ID: ' +
                                    data['players'][i].id +
                                    ' - In the Pond'
                            )
                        );
                    }

                    //add players
                    currentScene.addNewPlayer(data['players'][i]);
                }
            }

            //set chat log of this room
            currentScene.setChatLog(data['chatLog']);
        });
    }

    //tell server that the client has clicked at a specific coordinate
    onMove(x, y, direction) {
        socket.emit('playerMoved', x, y, direction);
    }

    //tell server that client is sending a message
    sendMessage(message) {
        socket.emit('playerSendingMessage', message);
    }

    //tell server that player is going to interact with an NPC
    onInteractNPC(npcID) {
        socket.emit('playerInteractingWithNPC', npcID);
    }
}

//recieve global data
socket.on('payloadGlobalData', function (data) {
    globalData = data;
    console.log(
        '%c %c Project Virtual Pond - ' + globalData.gameVersion,
        'background: #64BEFF;',
        'background: #000000;'
    );
});

//recieve global data change
socket.on('payloadGlobalDataChange', function (object, value) {
    globalData[object] = value;
});

//recieve next scene
socket.on('payloadNewScene', function (scene, parameters) {
    currentScene.end();
    currentScene.scene.start(scene, parameters);
});

//recieve kick reason
socket.on('payloadKickReason', function (reason) {
    kickReason = reason;
});

//recieve new player data
socket.on('payloadNewPlayerData', function (data) {
    if (currentScene.scene.key == 'Game') currentScene.addNewPlayer(data);
});

//on this client disconnecting
socket.on('disconnect', function () {
    //pause scene
    if (currentScene.pause) currentScene.pause();

    //show disconnect dialog
    globalUI.showRefreshDialog(currentScene, kickReason);

    //disconnect player
    socket.disconnect();
});

//recieved player movement
socket.on('movePlayer', function (data) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' +
                        data.id +
                        ' - Moving To> x:' +
                        data.x +
                        ', y:' +
                        data.y
                )
            );
        }

        //set player direction
        if (!document.hidden)
            currentScene.setPlayerDirection(data.id, data.direction);

        //move player
        if (!document.hidden) currentScene.movePlayer(data.id, data.x, data.y);
    }
});

//recieved player movement changed
socket.on('changePlayerMovement', function (data) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' +
                        data.id +
                        ' - Changed Movement Location To> x:' +
                        data.x +
                        ', y:' +
                        data.y
                )
            );
        }

        currentScene.changePlayerMovement(data.id, data.x, data.y);
    }
});

//recieved player message
socket.on('showPlayerMessage', function (data) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' + data.id + ' - Sent Message> ' + data.message
                )
            );
        }

        //store message
        currentScene.logMessage(data.id, data.messageData.text);

        //show message
        currentScene.showMessage(data.id, data.messageData);
    }
});

//recieved player message
socket.on('removePlayerMessage', function (data) {
    if (currentScene.scene.key == 'Game') {
        currentScene.removeMessage(data.id, data.messageID);
    }
});

//recieved new player character look
socket.on('updatePlayerCharacter', function (data) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' +
                        data.id +
                        ' - Updating Player Character> Color: ' +
                        data.character.color +
                        ' Eye Type: ' +
                        data.character.eye_type
                )
            );
        }

        currentScene.updatePlayer(data);
    }
});

//recieved removal of player
socket.on('removePlayer', function (id) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString('PLAYER ID: ' + id + ' - Left the Pond')
            );
        }

        currentScene.removePlayer(id);
    }
});

//recieved interactNPC data of player
socket.on('setPlayerInteractNPC', function (playerInteractNPC) {
    if (currentScene.scene.key == 'Game') {
        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' +
                        playerInteractNPC.playerID +
                        ' - Trying to Interact With NPC: ' +
                        playerInteractNPC.npcID
                )
            );
        }

        //set data
        utility.getObject(
            currentScene.playerData,
            playerInteractNPC.playerID
        ).interactNPC = playerInteractNPC.npcID;
    }
});
