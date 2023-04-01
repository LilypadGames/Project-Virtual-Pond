// Room Events

//config
import config from '../../config.json' assert { type: 'json' };

// //imports
// import natural from 'natural';
// // const { Metaphone } = natural;

//modules
import utility from '../module/Utility.js';
import log from '../module/Logs.js';
import chatLogs from '../module/ChatLogs.js';
import moderation from '../module/Moderation.js';
import commands from '../module/Commands.js';
import wordFilter from '../module/WordFilter.js';
// import emotes from '../module/Emotes.js';

//event handlers
import roomTheatre from './room/Theatre.js';

class Room {
    constructor(io, socket, playerData, room) {
        this.socket = socket;
        this.io = io;
        this.room = room;

        //save PlayerData instance
        this.PlayerData = playerData;
    }

    async init() {
        //register events
        this.register();

        //register room specific events
        this.registerRoomEvents();
    }

    async register() {
        //triggers when player reloads their client and requests current player data
        this.socket.on('requestRoomUpdate', async (cb) => {
            cb(await this.PlayerData.requestRoomUpdate());
        });

        //triggers when player moves
        this.socket.on('playerMoved', (x, y, direction) =>
            this.playerMoved(
                utility.sanitize.number(x),
                utility.sanitize.number(y),
                utility.sanitize.string(direction)
            )
        );

        // //triggers when player changes direction
        // this.socket.on('playerChangedDirection', (direction, x, y) =>
        //     this.playerChangedDirection(
        //         utility.sanitize.string(direction),
        //         utility.sanitize.number(x),
        //         utility.sanitize.number(y)
        //     )
        // );

        //triggers when player sends a message
        this.socket.on(
            'playerSendingMessage',
            async (message) =>
                await this.playerSendingMessage(
                    utility.sanitize.string(message)
                )
        );

        //triggers when player is attempting to interact with an interactive object
        this.socket.on('playerInteractingWithObject', (objectID) =>
            this.playerInteractingWithObject(utility.sanitize.number(objectID))
        );
    }

    //triggers when player moves
    playerMoved(x, y, direction) {
        if (this.socket.player.x != x || this.socket.player.y != y) {
            //log
            log.socketAction(this.socket, 'Moving To> x:' + x + ', y:' + y, {
                debug: true,
                console: false,
            });

            //store player location and direction
            this.socket.player.x = x;
            this.socket.player.y = y;
            this.socket.player.direction = direction;

            //send the players movement to ONLY OTHER players
            this.socket
                .to(this.socket.player.room)
                .emit('movePlayer', this.socket.player);
        }
    }

    // playerChangedDirection(direction, x, y) {
    //     //if player direction is not new
    //     if (direction === this.socket.player.direction) return;

    //     //log
    //     let logMessage = utility.timestampString(
    //         'PLAYER ID: ' +
    //             this.socket.player.id +
    //             ' (' +
    //             this.socket.player.name +
    //             ')' +
    //             ' - Changed Direction: ' +
    //             direction
    //     );
    //     log.message('debug', logMessage);

    //     //player was moving
    //     if (this.socket.player.x !== x || this.socket.player.y !== y) {
    //         //store player direction and location
    //         this.socket.player.direction = direction;
    //         this.socket.player.x = x;
    //         this.socket.player.y = y;

    //         //send the players location and direction to ONLY OTHER players
    //         this.socket
    //             .to(this.socket.player.room)
    //             .emit('changePlayerMovement', {
    //                 id: this.socket.player.id,
    //                 x: this.socket.player.x,
    //                 y: this.socket.player.y,
    //                 direction: this.socket.player.direction,
    //             });

    //         //player standing still
    //     } else {
    //         //store player direction
    //         this.socket.player.direction = direction;

    //         //send the players direction to ONLY OTHER players
    //         this.socket
    //             .to(this.socket.player.room)
    //             .emit(
    //                 'updatePlayerDirection',
    //                 this.socket.player.id,
    //                 direction
    //             );
    //     }
    // }

    //triggers when player sends a message
    async playerSendingMessage(message) {
        //init last message logging
        if (!this.socket.lastMessage) this.socket.lastMessage = {};

        //message is a command
        if (message.startsWith('/')) {
            //player is an admin/mod OR no auth mode is on
            if (
                this.socket.player.isAdmin ||
                this.socket.player.isMod ||
                config.server.bypassAuth
            ) {
                //parse command
                let command = message.replace('/', '');
                command = command.split(' ');

                //attempt to run command
                let commandRunStatus = commands.runCommand(
                    this.socket,
                    command
                );

                //log command
                log.socketAction(
                    this.socket,
                    (commandRunStatus
                        ? 'Used Command'
                        : 'Tried to use Command') +
                        '> ' +
                        message
                );
            }

            //player is not an admin/mod
            else {
                //log command
                log.socketAction(
                    this.socket,
                    'Tried to Use Command Without Permission> ' + message,
                    { file: 'moderation' }
                );

                //server message
                this.socket.emit(
                    'payloadServerMessage',
                    'You Cannot Use Commands'
                );
            }
            return;
        }

        //rate limit
        if (this.socket.lastMessage['time']) {
            //check if last message was sent recently
            if (Math.abs(this.socket.lastMessage['time'] - Date.now()) < 800) {
                //log command
                log.socketAction(
                    this.socket,
                    'Tried To Send Message Too Fast: ' + message,
                    { file: 'moderation' }
                );

                //server message
                this.socket.emit(
                    'payloadServerMessage',
                    "You're Sending Messages Too Quickly :/"
                );

                //cancel message
                return;
            }
        }

        //spam limit
        if (this.socket.lastMessage['message']) {
            //check if last message is similar to current message
            if (this.socket.lastMessage['message'] == message) {
                //log command
                log.socketAction(
                    this.socket,
                    'Tried To Send The Same Message Twice: ' + message,
                    { file: 'moderation' }
                );

                //server message
                this.socket.emit(
                    'payloadServerMessage',
                    "Please Don't Spam :)"
                );

                //cancel message
                return;
            }
        }

        //save last message time
        this.socket.lastMessage['message'] = message;
        this.socket.lastMessage['time'] = Date.now();

        //make sure message contains text
        if (message === '' || message === null) return;

        // //message is one word
        // if (/^[a-zA-Z]+$/.test(message)) {
        //     //check if word is emote and get its cached file path
        //     let emotePath = await emotes.getEmote(message);

        //     //emote exists
        //     if (emotePath !== false) {
        //         //
        //     }
        // }

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

        //check message against slur filter
        let noSlur = wordFilter.checkMessage(message);

        //deny messages containing slurs
        if (!noSlur) {
            //get phonetic version of message
            let messagePhonetics = wordFilter.convertMessage(message, false);

            //log command
            log.socketAction(
                this.socket,
                'Slur Detected > ' +
                    message +
                    ' | Phonetic Version > ' +
                    messagePhonetics,
                { file: 'moderation' }
            );

            // //kick
            // moderation.kickClient(
            //     this.io,
            //     this.socket.player,
            //     'Please no swear :)'
            // );

            //tell player that the message was denied
            let denyMessages = [
                'My dumb robot brain detected a slur in your message, so I denied it.',
                'Did you just freaking slur? Frick you.',
                "Plz don't curse thx.",
                'R u serious right nyow?',
                '💀 NAHHHHHH',
            ];
            this.socket.emit(
                'payloadServerMessage',
                denyMessages[utility.getRandomInt(0, denyMessages.length - 1)]
            );

            //cancel
            return;
        }

        //log
        log.socketAction(this.socket, 'Sending Message> ' + message, {
            file: 'chat',
            console: true,
        });

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
            this.socket.player.room,
            this.socket.player.id,
            this.socket.player.name,
            Date.now(),
            message
        );

        //send the player message to ALL clients in this room
        this.io.in(this.socket.player.room).emit('showPlayerMessage', {
            id: this.socket.player.id,
            messageData: messageData,
        });

        //queue message for removal
        setTimeout(() => {
            //remove message for all clients
            this.io.in(this.socket.player.room).emit('removePlayerMessage', {
                id: this.socket.player.id,
                messageID: messageData.id,
            });

            //remove from server-side player data
            this.PlayerData.resetMessageData(messageData.id);
        }, 5000);
    }

    //triggers when player interacts with NPC
    playerInteractingWithObject(objectID) {
        //log
        log.socketAction(
            this.socket,
            'Interacting With Interactive Object: ' + objectID,
            { debug: true, console: false }
        );

        //merge player ID and npc ID
        let data = {
            playerID: this.socket.player.id,
            objectID: objectID,
        };

        //send interacting NPCs ID to ONLY OTHER clients
        this.socket
            .to(this.socket.player.room)
            .emit('setPlayerAttemptingObjectInteraction', data);
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

export default Room;
