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
            if (debugMode) globalUI.newPing(latency);
        });
    }
}, 2000);

// GLOBAL VARIABLES
let kickReason = undefined;

class Client {
    constructor() {
        //register socket.io events
        this.registerEvents();
    }

    //register websocket events
    registerEvents() {
        //CONNECTION
        //on this client connected (also updates when disconnected with the value of socket.connected representing connection status)
        socket.on('connect', function () {
            //log
            if (debugMode && socket.connected) {
                console.log(util.timestampString('Connected to Server'));
            }
        });
        //on this client disconnecting
        socket.on('disconnect', () => {
            this.onDisconnect();
        });
        //recieve kick reason
        socket.on('payloadKickReason', (reason) => {
            this.onKickReasonReceived(reason);
        });

        //GLOBAL DATA
        // //recieve global data
        // socket.on('payloadGlobalData', (data) => {
        //     this.onGlobalDataReceived(data);
        // });
        //recieve global data change
        socket.on('payloadGlobalDataUpdate', (object, value) => {
            this.onGlobalDataUpdate(object, value);
        });

        //SCENES
        //recieve next scene
        socket.on('payloadNewScene', (scene, parameters) => {
            this.onNewSceneReceived(scene, parameters);
        });

        // PLAYERS
        //recieve new player data
        socket.on('payloadNewPlayerData', (data) => {
            this.onNewPlayerDataReceived(data);
        });
        //recieved removal of player
        socket.on('removePlayer', (id) => {
            this.onPlayerRemoved(id);
        });
        //recieved player message
        socket.on('showPlayerMessage', (data) => {
            this.onPlayerMessageUpdate(data);
        });
        //recieved player message
        socket.on('removePlayerMessage', (data) => {
            this.onPlayerMessageRemoved(data);
        });
        //recieved new player character look
        socket.on('updatePlayerCharacter', (data) => {
            this.onPlayerCharacterUpdate(data);
        });
        //recieved player movement
        socket.on('movePlayer', (data) => {
            this.onMovePlayerReceived(data);
        });
        //received updated player direction
        socket.on('updatePlayerDirection', (id, direction) => {
            this.onPlayerDirectionUpdate(id, direction);
        });
        //recieved player movement changed
        socket.on('changePlayerMovement', (data) => {
            this.onPlayerMovementUpdate(data);
        });
        //recieved interactNPC data of player
        socket.on('setPlayerAttemptingObjectInteraction', (data) => {
            this.onplayerInteractingWithObject(data);
        });

        // MISC
        //recieve server message
        socket.on('payloadServerMessage', (message) => {
            this.onServerMessageReceived(message);
        });
        //recieve stream status
        socket.on('payloadStreamStatus', (status) => {
            this.onStreamStatusReceived(status);
        });

        // EVENTS
        //FF22
    }

    /// INCOMING

    //CONNECTION
    //on this client disconnecting
    onDisconnect() {
        //pause scene
        if (currentScene.pause) currentScene.pause();

        //show disconnect dialog
        globalUI.showRefreshDialog(currentScene, kickReason);

        //disconnect player
        socket.disconnect();
    }
    //recieve kick reason
    onKickReasonReceived(reason) {
        kickReason = reason;
    }

    //GENERAL DATA
    //recieve global data change
    onGlobalDataUpdate(object, value) {
        globalData[object] = value;
    }

    //SCENES
    //recieve next scene
    onNewSceneReceived(scene, parameters) {
        currentScene.end();
        currentScene.scene.start(scene, parameters);
    }

    // PLAYERS
    //recieve new player data
    onNewPlayerDataReceived(data) {
        if (currentScene.scene.key == 'Game') currentScene.addNewPlayer(data);
    }
    //recieved removal of player
    onPlayerRemoved(id) {
        if (currentScene.scene.key == 'Game') {
            //log
            if (debugMode) {
                console.log(
                    util.timestampString(
                        'PLAYER ID: ' + id + ' - Left the Pond'
                    )
                );
            }

            currentScene.removePlayer(id);
        }
    }
    //recieved player message
    onPlayerMessageUpdate(data) {
        if (currentScene.scene.key == 'Game') {
            //log
            if (debugMode) {
                console.log(
                    util.timestampString(
                        'PLAYER ID: ' +
                            data.id +
                            ' - Sent Message> ' +
                            data.message
                    )
                );
            }

            //store message
            currentScene.logMessage(data.id, data.messageData.text);

            //show message
            currentScene.showMessage(data.id, data.messageData);
        }
    }
    //recieved player message
    onPlayerMessageRemoved(data) {
        if (currentScene.scene.key == 'Game') {
            currentScene.removeMessage(data.id, data.messageID);
        }
    }
    //recieved new player character look
    onPlayerCharacterUpdate(data) {
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
    }
    //recieved player movement
    onMovePlayerReceived(data) {
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

            if (!document.hidden) {
                //set player direction
                currentScene.setPlayerDirection(data.id, data.direction);

                //move player
                currentScene.movePlayer(data.id, data.x, data.y);
            }
        }
    }
    //received updated player direction
    onPlayerDirectionUpdate(id, direction) {
        //game scene only
        if (currentScene.scene.key !== 'Game') return;

        //log
        if (debugMode) {
            console.log(
                util.timestampString(
                    'PLAYER ID: ' + id + ' - Updated Direction: ' + direction
                )
            );
        }

        if (!document.hidden) {
            //set player direction
            currentScene.setPlayerDirection(id, direction);
        }
    }
    //recieved player movement changed
    onPlayerMovementUpdate(data) {
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
                            data.y +
                            (data.direction
                                ? ' direction: ' + data.direction
                                : '')
                    )
                );
            }

            currentScene.changePlayerMovement(
                data.id,
                data.x,
                data.y,
                data.direction
            );
        }
    }
    //recieved interactNPC data of player
    onplayerInteractingWithObject(data) {
        if (currentScene.scene.key == 'Game') {
            //log
            if (debugMode) {
                console.log(
                    util.timestampString(
                        'PLAYER ID: ' +
                            data.playerID +
                            ' - Trying to Interact With NPC: ' +
                            data.objectID
                    )
                );
            }

            //set data
            utility.getObject(
                currentScene.playerData,
                data.playerID
            ).interactNPC = data.objectID;
        }
    }

    //MISC
    //receive server message
    onServerMessageReceived(message) {
        globalUI.showToast(currentScene, message);
    }

    //receive stream status
    onStreamStatusReceived(status) {
        // globalUI.showToast(currentScene, 'Stream Status: ' + status);
        // console.log('STREAM STATUS RECIEVED: ' + status);
        // //theatre room
        // if (currentScene.room == 'theatre') {
        //     console.log('UPDATE LIVE/MEDIA STREAM');
        // }
    }

    /// OUTGOING

    //CONNECTION
    //tell server player is logging out
    onLogout() {
        //disconnect
        socket.emit('logout');

        //log out
        window.location.href = '/logout';
    }

    //GENERAL DATA
    //get initial load data from server
    async requestLoadData() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Requested Initial Load Data'));
        }

        //request initial load data from server
        return new Promise((resolve) => {
            socket.emit('requestLoadData', (data) => {
                resolve(data);
            });
        });
    }
    //get global data from server
    async requestGlobalData() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Requested Global Data'));
        }

        //request global data from server
        return new Promise((resolve) => {
            let requestAcknowledged = false;
            function attemptRequest(requestAcknowledged) {
                //if request wasn't acknowledged yet, request the data
                if (requestAcknowledged === false) {
                    socket.volatile.emit('requestGlobalData', (data) => {
                        //request acknowleged
                        requestAcknowledged = true;

                        //save global data
                        globalData = data;

                        //log
                        console.log(
                            '%c %c Project Virtual Pond - ' +
                                globalData.gameVersion,
                            'background: #64BEFF;',
                            'background: #000000;'
                        );

                        //callback to initial request
                        resolve();
                    });
                }

                //try again in 1 second
                setTimeout(() => {
                    if (requestAcknowledged === false) {
                        attemptRequest(requestAcknowledged);
                    }
                }, 1000);
            }

            attemptRequest(requestAcknowledged);
        });
    }

    //ROOM
    //attempt to join a room
    requestRoom(requestedRoom) {
        //if requestedRoom is left empty, the server will just send the last room the player was in, or the default room for new players. Otherwise, it determines whether the player is allowed to join the new room.
        socket.emit('requestRoom', requestedRoom, (room) => {
            currentScene.scene.start('Game', room);
        });
    }
    //tell server that this client just joined
    async joinRoom(room) {
        //wait for currently connected player data to return
        return new Promise((resolve) => {
            socket.emit('joinRoom', room, (roomData) => {
                resolve(roomData);
            });
        });
    }
    //tell server that the player left a room (to go to another room or a menu/minigame)
    leaveRoom() {
        socket.emit('leaveRoom');
    }

    //PLAYER DATA
    //get player data from server
    requestClientPlayerData() {
        //log
        if (debugMode) {
            console.log(util.timestampString('Requested Clients Player Data'));
        }

        //wait for client player data to return
        return new Promise((resolve) => {
            socket.emit('requestClientPlayerData', (clientPlayerData) => {
                resolve(clientPlayerData);
            });
        });
    }

    //tell server that the player updated their character data
    saveCharacterData(data) {
        //wait for client player data to return
        return new Promise((resolve) => {
            socket.emit('requestCharacterDataUpdate', data, () => {
                resolve();
            });
        });
    }
    //get all player data from the sockets current room
    requestRoomUpdate() {
        //run wait screen
        loadingScreen.runWaitScreen(currentScene);

        //request data from server
        socket.emit('requestRoomUpdate', (data) => {
            if (currentScene.scene.key == 'Game') {
                //update players in room
                for (var i = 0; i < data.length; i++) {
                    currentScene.updatePlayer(data[i]);
                }

                //end wait screen
                loadingScreen.endWaitScreen(currentScene);
            }
        });

        //log
        if (debugMode) {
            console.log(util.timestampString('Reloaded the Pond'));
        }
    }
    //tell server that the client has clicked at a specific coordinate
    playerMoved(x, y, direction) {
        socket.emit('playerMoved', x, y, direction);
    }
    //tell server that the player has changed directions
    playerChangedDirection(direction, x, y) {
        socket.emit('playerChangedDirection', direction, x, y);
    }
    //tell server that client is sending a message
    playerSendingMessage(message) {
        socket.emit('playerSendingMessage', message);
    }
    //tell server that player is going to interact with an NPC
    playerInteractingWithObject(npcID) {
        socket.emit('playerInteractingWithObject', npcID);
    }
    //tell server that the player is requesting to purchase an item
    requestItemPurchase(itemID) {
        socket.emit('requestItemPurchase', itemID, (action) => {
            //title is not provided
            if (!action.title) action.title = action.status ? 'Success' : 'Oops!';

            //show response from server to requested item purchase
            globalUI.showDialog(
                currentScene,
                action.title,
                action.reason,
                'Continue'
            );
        });
    }

    // EVENTS
    //FF22
    //get ticket count
    FF22getTicketCount() {
        return new Promise((resolve) => {
            socket.emit('FF22requestTicketCount', (ticketCount) => {
                resolve(ticketCount);
            });
        });
    }
    //get daily spin count
    FF22getDailySpinCount() {
        return new Promise((resolve) => {
            socket.emit('FF22requestDailySpinCount', (dailySpinCount) => {
                resolve(dailySpinCount);
            });
        });
    }
    //get status and degree spin amount
    FF22attemptDailySpin() {
        return new Promise((resolve) => {
            socket.emit('FF22requestDailySpin', (data) => {
                resolve(data);
            });
        });
    }
    //get last daily spin time
    FF22getLastDailySpinTime() {
        return new Promise((resolve) => {
            socket.emit('FF22requestLastDailySpinTime', (lastDailySpin) => {
                resolve(lastDailySpin);
            });
        });
    }
    //generate emote cards
    FF22generateEmoteCards() {
        return new Promise((resolve) => {
            socket.emit('FF22generateEmoteCards', (status) => {
                resolve(status);
            });
        });
    }
    //get emote card
    FF22flipCard(index) {
        return new Promise((resolve) => {
            socket.emit('FF22requestCardFlip', index, (status) => {
                resolve(status);
            });
        });
    }
    //get frog order
    FF22generateFrogOrder() {
        return new Promise((resolve) => {
            socket.emit('FF22requestFrogOrder', (data) => {
                resolve(data);
            });
        });
    }
    //get hat switching sequence and target
    FF22requestHatShuffle() {
        return new Promise((resolve) => {
            socket.emit('FF22requestHatShuffle', (data) => {
                resolve(data);
            });
        });
    }
    //send the index of the hat the player chose
    FF22requestHatPick(index) {
        return new Promise((resolve) => {
            socket.emit('FF22requestHatPick', index, (data) => {
                resolve(data);
            });
        });
    }
}
