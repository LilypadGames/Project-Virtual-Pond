// Room Events

//dependencies
const path = require('path');
var chatFilter = require('leo-profanity');
const { Server } = require('http');
// const emoteParser = require("tmi-emote-parse");

// //get twitch emotes
// emoteParser.loadAssets("pokelawls");
// var emotes;
// emoteParser.events.on("emotes", (event) => {
//     // get all Twitch, BTTV, FFZ, and 7tv emotes
//     emotes = emoteParser.getAllEmotes(event.channel);
// });

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const logs = require(path.join(__dirname, '../utility/Logs.js'));
const chatLogs = require(path.join(__dirname, '../utility/ChatLogs.js'));

//import events
const PlayerData = require(path.join(__dirname, 'PlayerData.js'));

class Room {

    constructor(io, socket, room) {
        this.socket = socket;
        this.io = io;
        this.room = room;

        //init PlayerData instance
        this.playerData = new PlayerData(io, socket);
    };

    async init() {

        //register events
        this.register();
    };

    async register() {

        //send player the recent chat log for this room
        this.socket.emit('payloadRoomChatLog', chatLogs.getRoomLogs(this.room));

        //triggers when player reloads their client and requests current player data
        this.socket.on('requestAllPlayersInRoom', async (cb) => { cb(await this.playerData.requestAllPlayersInRoom()); });

        //triggers when player moves
        this.socket.on('playerMoved', (x, y, direction) => this.playerMoved(x, y, direction));

        //triggers when player sends a message
        this.socket.on('playerSendingMessage', (message) => this.playerSendingMessage(message));

        //triggers when player interacts with NPC
        this.socket.on('playerInteractingWithNPC', (npcID) => this.playerInteractingWithNPC(npcID));
    };

    //triggers when player moves
    playerMoved(x, y, direction) {
        if ((this.socket.player.x != x) || (this.socket.player.y != y)) {

            //log
            console.log(utility.timestampString('PLAYER ID: ' + this.socket.player.id + ' (' + this.socket.player.name + ')' + ' - Moving To> x:' + x + ', y:' + y));

            //store player location and direction
            this.socket.player.x = x;
            this.socket.player.y = y;
            this.socket.player.direction = direction;

            //send the players movement to ONLY OTHER players
            this.socket.to(this.socket.roomID).emit('movePlayer', this.socket.player);
        };
    };

    //triggers when player sends a message
    playerSendingMessage(message) {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + this.socket.player.id + ' (' + this.socket.player.name + ')' + ' - Sending Message> ' + message));
        let logMessage = utility.timestampString('PLAYER ID: ' + this.socket.player.id + ' (' + this.socket.player.name + ')' + ' > ' + message)
        logs.logMessage('chat', logMessage)

        //kick if larger than allowed max length
        if (message.length > 80) {

            //kick
            this.kickClient(this.socket.player, 'Abusing chat message maximum length.');

            //add flag to user profile in database

            //do not do the rest
            return;
        };

        //sanitize message
        message = typeof(message) === 'string' && message.trim().length > 0 ? message.trim() : '';

        //check if message contains blacklisted words
        if(chatFilter.check(message)) {
            //log in moderation file
            logs.logMessage('moderation', logMessage);

            //filter message
            message = chatFilter.clean(message);
        }

        //create message data
        let messageData = {
            id: Date.now(),
            text: message,
            endTime: Date.now() + 5000
        };

        //store message data in player data
        this.socket.player.message = messageData;

        //add message to room's chat log object array
        chatLogs.logMessage(this.socket.roomID, this.socket.player.id, Date.now(), message);

        //send the player message to ALL clients in this room
        if (message !== '' || null) {
            this.io.in(this.socket.roomID).emit('showPlayerMessage', {id: this.socket.player.id, messageData: messageData});
        };

        //queue message for removal
        setTimeout(() => {

            //remove message for all clients
            this.io.in(this.socket.roomID).emit('removePlayerMessage', {id: this.socket.player.id, messageID: messageData.id});

            //remove from server-side player data
            this.playerData.resetMessageData(messageData.id);
        }, 5000);
    };

    //triggers when player interacts with NPC
    playerInteractingWithNPC(npcID) {

        //log
        console.log(utility.timestampString('PLAYER ID: ' + this.socket.player.id + ' (' + this.socket.player.name + ')' + ' - Interacting With NPC: ' + npcID));

        //merge player ID and npc ID
        let playerInteractNPC = { playerID: this.socket.player.id, npcID: npcID };

        //send interacting NPCs ID to ONLY OTHER clients
        this.socket.to(this.socket.roomID).emit('setPlayerInteractNPC', playerInteractNPC);
    };
}

module.exports = Room;