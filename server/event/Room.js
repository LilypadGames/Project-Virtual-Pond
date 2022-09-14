// Room Events

//dependency: file path
const fs = require('fs');
const path = require('path');

//config
const config = require(path.join(__dirname, '../config/config.json'));
const badWords = require(path.join(__dirname, '../config/bad_words.js'));

//dependencies
var chatFilter = require('leo-profanity');
chatFilter.add(badWords.badWords);

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const logs = require(path.join(__dirname, '../utility/Logs.js'));
const chatLogs = require(path.join(__dirname, '../utility/ChatLogs.js'));
const moderation = require(path.join(__dirname, '../utility/Moderation.js'));
const commands = require(path.join(__dirname, '../utility/Commands.js'));

//import events
const PlayerData = require(path.join(__dirname, 'PlayerData.js'));

//import room events
const roomTheatre = require(path.join(__dirname, '../event/room/Theatre.js'));

class Room {
    constructor(io, socket, room) {
        this.socket = socket;
        this.io = io;
        this.room = room;

        //init PlayerData instance
        this.PlayerData = new PlayerData(io, socket);
    }

    async init() {
        //register events
        this.register();

        //register room specific events
        this.registerRoomEvents();
    }

    async register() {
        //triggers when player reloads their client and requests current player data
        this.socket.on('requestAllPlayersInRoom', async (cb) => {
            cb(await this.PlayerData.requestAllPlayersInRoom());
        });

        //triggers when player moves
        this.socket.on('playerMoved', (x, y, direction) =>
            this.playerMoved(x, y, direction)
        );

        //triggers when player changes direction
        this.socket.on('playerChangedDirection', (direction, x, y) =>
            this.playerChangedDirection(direction, x, y)
        );

        //triggers when player sends a message
        this.socket.on('playerSendingMessage', (message) =>
            this.playerSendingMessage(message)
        );

        //triggers when player interacts with NPC
        this.socket.on('playerInteractingWithNPC', (npcID) =>
            this.playerInteractingWithNPC(npcID)
        );
    }

    //triggers when player moves
    playerMoved(x, y, direction) {
        if (this.socket.player.x != x || this.socket.player.y != y) {
            //log
            let logMessage = utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Moving To> x:' +
                    x +
                    ', y:' +
                    y
            );
            logs.logMessage('debug', logMessage);

            //store player location and direction
            this.socket.player.x = x;
            this.socket.player.y = y;
            this.socket.player.direction = direction;

            //send the players movement to ONLY OTHER players
            this.socket
                .to(this.socket.roomID)
                .emit('movePlayer', this.socket.player);
        }
    }

    playerChangedDirection(direction, x, y) {
        //if player direction is not new
        if (direction === this.socket.player.direction) return;

        //log
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' - Changed Direction: ' +
                direction
        );
        logs.logMessage('debug', logMessage);

        //player was moving
        if (this.socket.player.x !== x || this.socket.player.y !== y) {
            //store player direction and location
            this.socket.player.direction = direction;
            this.socket.player.x = x;
            this.socket.player.y = y;

            //send the players location and direction to ONLY OTHER players
            this.socket.to(this.socket.roomID).emit('changePlayerMovement', {
                id: this.socket.player.id,
                x: this.socket.player.x,
                y: this.socket.player.y,
                direction: this.socket.player.direction,
            });

            //player standing still
        } else {
            //store player direction
            this.socket.player.direction = direction;

            //send the players direction to ONLY OTHER players
            this.socket
                .to(this.socket.roomID)
                .emit(
                    'updatePlayerDirection',
                    this.socket.player.id,
                    direction
                );
        }
    }

    //triggers when player sends a message
    playerSendingMessage(message) {
        //sanitize message
        message =
            typeof message === 'string' && message.trim().length > 0
                ? message.trim()
                : '';

        //check if message is actually a command
        if (message.startsWith('/')) {
            //check if player is an admin/mod OR no auth mode is on
            if (
                this.socket.player.isAdmin ||
                this.socket.player.isMod ||
                config.server.bypassAuth
            ) {
                //parse command
                let command = message.replace('/', '');
                command = command.split(' ');

                //attempt to run command
                let logMessage = commands.runCommand(this.socket, command)
                    ? 'Used Command'
                    : 'Tried to use Command';

                //log command
                console.log(
                    utility.timestampString(
                        'PLAYER ID: ' +
                            this.socket.player.id +
                            ' (' +
                            this.socket.player.name +
                            ')' +
                            ' - ' +
                            logMessage +
                            '> ' +
                            message
                    )
                );
            } else {
                //log command
                let logMessage = utility.timestampString(
                    'PLAYER ID: ' +
                        this.socket.player.id +
                        ' (' +
                        this.socket.player.name +
                        ')' +
                        ' - ' +
                        'Tried to Use Command Without Permission> ' +
                        message
                );
                logs.logMessage('moderation', logMessage);

                //server message
                this.socket.emit(
                    'payloadServerMessage',
                    'You Cannot Use Commands'
                );
            }
            return;
        }

        //kick if larger than allowed max length
        if (message.length > 80) {
            //kick
            moderation.kickClient(
                this.io,
                this.socket.player,
                'Abusing chat message maximum length.'
            );

            //add strike to user profile in database

            //do not do the rest
            return;
        }

        //make sure message contains text
        if (message === '' || null) {
            return;
        }

        //check if message contains blacklisted words
        if (chatFilter.check(message.toLowerCase())) {
            //log in moderation file
            logs.logMessage('moderation', logMessage);

            // //kick
            // moderation.kickClient(
            //     this.io,
            //     this.socket.player,
            //     'Please no swear :)'
            // );

            // return;

            //filter message
            message = chatFilter.clean(message);
        }

        //log
        console.log(
            utility.timestampString(
                'PLAYER ID: ' +
                    this.socket.player.id +
                    ' (' +
                    this.socket.player.name +
                    ')' +
                    ' - Sending Message> ' +
                    message
            )
        );
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' > ' +
                message
        );
        logs.logMessage('chat', logMessage);

        //create message data
        let messageData = {
            id: Date.now(),
            text: message,
            endTime: Date.now() + 5000,
        };

        //store message data in player data
        this.socket.player.message = messageData;

        //add message to room's chat log object array
        chatLogs.logMessage(
            this.socket.roomID,
            this.socket.player.id,
            this.socket.player.name,
            Date.now(),
            message
        );

        //send the player message to ALL clients in this room
        this.io.in(this.socket.roomID).emit('showPlayerMessage', {
            id: this.socket.player.id,
            messageData: messageData,
        });

        //queue message for removal
        setTimeout(() => {
            //remove message for all clients
            this.io.in(this.socket.roomID).emit('removePlayerMessage', {
                id: this.socket.player.id,
                messageID: messageData.id,
            });

            //remove from server-side player data
            this.PlayerData.resetMessageData(messageData.id);
        }, 5000);
    }

    //triggers when player interacts with NPC
    playerInteractingWithNPC(npcID) {
        //log
        let logMessage = utility.timestampString(
            'PLAYER ID: ' +
                this.socket.player.id +
                ' (' +
                this.socket.player.name +
                ')' +
                ' - Interacting With NPC: ' +
                npcID
        );
        logs.logMessage('debug', logMessage);

        //merge player ID and npc ID
        let playerInteractNPC = {
            playerID: this.socket.player.id,
            npcID: npcID,
        };

        //send interacting NPCs ID to ONLY OTHER clients
        this.socket
            .to(this.socket.roomID)
            .emit('setPlayerInteractNPC', playerInteractNPC);
    }

    //change room
    changeRoom(newRoom) {
        //unregister old events for the old room
        this.unregisterRoomEvents();

        //reset message data
        delete this.socket.player.message;

        //store new room
        this.room = newRoom;

        //register new events for new room
        this.registerRoomEvents();
    }

    //register room specific events
    registerRoomEvents() {
        if (this.room === 'theatre') {
            this.roomEvents = new roomTheatre(this.socket);
            this.roomEvents.init();
        }
    }

    //unregister room specific events
    unregisterRoomEvents() {
        if (this.roomEvents) {
            this.roomEvents.end();
            delete this.roomEvents;
        }
    }
}

module.exports = Room;
