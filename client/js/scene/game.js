// Game Scene

//navigational map
// var collidableLayer;

//init player variables
var clientPlayerID;
var playerCharacter = {};
var playerData = {};
var playerCollider;
var playerInteracting;

//init object variables
var objectNextID = 0;
var npcCharacter = {};
var npcData = {};
var npcCollider = {};
var npcLines = [
    ['*cough* i\'m sick', 'yo', 'i\'ll go live later on lacari', 'time for a water break', 'ACTually trolling...'],
    ['*thinking of something HUH to say*', 'people call me a very accurate gamer'],
    ['theres this new NFT drop i\'m really excited about', 'ever heard of hangry hippos?', 'fuck all the bitches I know I don\'t give a fuck about flow', 'a ha ha...']
];

//init debug variables
var consoleLogging = false;

//constants
const worldScale = 1.5;
const characterScale = 2;
const overlayPadding = 5;

// DEBUG
//toggle console logging
function toggleConsoleLog() {

    //import Utility functions
    const util = new Utility();

    //off
    if (consoleLogging) { 
        console.log(util.timestampString('[CONSOLE LOGGING: OFF]'));
        consoleLogging = false 
    }

    //on
    else if (!consoleLogging) {
        console.log(util.timestampString('[CONSOLE LOGGING: ON]'));
        consoleLogging = true 
    };
};

class Game extends Phaser.Scene {
    // INIT
    constructor() {
        super('Game');
    };

    init() {
        Client = new Client(this);
    };

    // LOGIC
    preload() {

        //init canvas
        this.canvas = this.sys.game.canvas;
        
        //tilemaps
        this.load.image("tileset", "assets/room/house_on_the_river/tilesheet.png");
        this.load.tilemapTiledJSON('map', 'assets/room/house_on_the_river/example_map.json');

        //character
        this.load.image('frog_body','assets/character/frog_body.png');
        this.load.image('frog_belly','assets/character/frog_belly.png');
        this.load.image('frog_eyes','assets/character/frog_eyes.png');

        //npc
        this.load.image('Poke','assets/npc/poke.png');
        this.load.image('Gigi','assets/npc/gigi.png');
        this.load.image('Jesse','assets/npc/jesse.png');

        //plugins
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
    };

    create() {

        //shaders

        //set up tilemap/tileset
        var map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tilesheet', 'tileset'); //'tilesheet' is the key of the tileset in map's JSON file

        //set collision tile as collidable (ID: 23)
        // map.setCollisionBetween(23,24);

        //set up tilemap layers
        var layer;
        for(var i = 0; i < map.layers.length; i++) {
            layer = map.createLayer(i, tileset).setScale(worldScale);

            // //find collidable layer
            // if (layer.layer.name === 'obstacle layer') {
            //     collidableLayer = layer;
            // };
        };

        //chat box
        var chatBox = this.add.rexInputText(this.canvas.width/2, this.canvas.height - (this.canvas.height/23), this.canvas.width*0.8, 30, {
            type: 'text',
            text: '',
            placeholder: 'Say Yo...',
            fontSize: '16px',
            color: '#000000',
            backgroundColor: '#ffffff',
            border: '4px solid',
            borderColor: '#64BEFF',
            spellCheck: false,
            autoComplete: false,
            maxLength: 80
        })
        .on('keydown', function (chatBox, event) {
            if (event.key == 'Enter') {

                //send the message to the server
                Client.sendMessage(chatBox.text.trim().replace(/\s+/g, " "));

                //clear chat box
                chatBox.setText('');
            };
        })

        //register left click input
        this.input.on('pointerdown', () => {

            //if they are using the chat box, remove the cursor from it
            if (chatBox.isFocused) { 
                chatBox.setBlur();
            };
            
            //tell the server that the player is moving
            Client.onMove(this.input.mousePointer.worldX, this.input.mousePointer.worldY);
        });

        //register keyboard inputs
        this.input.keyboard.on('keyup', function(event){

            //ignore keyboard presses when chat box is focused
            if (!chatBox.isFocused) {

                //focus the chat box when Enter key is pressed
                if (event.key === 'Enter') { chatBox.setFocus() };

                //tell server that this client changed its color
                if (event.key === 'c') { Client.changeLook(); };

                //tell server that this client stopped its movement
                if (event.key === 's') { Client.onHalt(playerCharacter[clientPlayerID].x, playerCharacter[clientPlayerID].y) };

                //toggle console logging
                if (event.key === 'Shift') { toggleConsoleLog(); };
            };

            //[DEBUG]
            // console.log(event.key);
        });

        //add NPCs
        this.addNewNPC('Poke', 192, 415);
        this.addNewNPC('Gigi', 133, 480);
        this.addNewNPC('Jesse', 810, 704, 'left');

        //add player's character to world
        Client.onJoin();
    };

    update() {

        //detect collisions between NPCs and the client's player character
        if (playerCharacter[clientPlayerID]) {
            for(var i = 0; i < objectNextID; i++) {
                this.physics.world.collide(playerCharacter[clientPlayerID].list[0], npcCharacter[i].list[0], () => this.interactNPC(clientPlayerID, i));
            };
        };

        // //detect collisions between players and the collision layer
        // if (collidableLayer) {
        //     for(var i = 0; i < playerCharacter.length; i++) {
        //         this.physics.world.collide(playerCharacter[i].list[0], collidableLayer, () => this.haltPlayer(i, playerCharacter[i].list[0].x, playerCharacter[i].list[0].y));
        //     };
        // };
    };

    // UTILITY
    setPlayerID(id) {
        clientPlayerID = id;
    };

    //get players current direction
    getPlayerDirection(id) {

        //get player sprite container
        var playerSprites = playerCharacter[id].list[0];

        //player character is facing right
        if (playerSprites.scaleX > 0) { return 'right' }
        
        //player character is facing left
        else if (playerSprites.scaleX < 0) { return 'left' };
    };

    // FUNCTIONS
    //add player character to game at specific coordinates
    addNewPlayer(data) {

        //player character
        var playerBody = this.physics.add.sprite(0, 0, 'frog_body').setOrigin(0.5, 1).setScale(characterScale);
        var playerBelly = this.add.sprite(0, 0,'frog_belly').setOrigin(0.5, 1).setScale(characterScale);
        var playerEyes = this.add.sprite(0, 0,'frog_eyes').setOrigin(0.5, 1).setScale(characterScale);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width * characterScale,
            height: playerBody.height * characterScale
        }

        //player name
        var playerName = this.add.text(0, spriteContainer.height - overlayPadding, data.name, {
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setFontSize(12).setOrigin(0.5, 1);

        //create player container
        playerCharacter[data.id] = this.add.container(data.x, data.y).setSize(spriteContainer.width, spriteContainer.height);

        //create player sprite container
        playerCharacter[data.id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));   

        //add player sprites to player sprite container
        playerCharacter[data.id].list[0].add([playerBody, playerBelly, playerEyes]);
        
        //offset sprite
        playerCharacter[data.id].list[0].list[0].setY((spriteContainer.height/2));
        playerCharacter[data.id].list[0].list[1].setY((spriteContainer.height/2));
        playerCharacter[data.id].list[0].list[2].setY((spriteContainer.height/2));

        //create player overlay container
        playerCharacter[data.id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));

        //add player name to player overlay container
        playerCharacter[data.id].list[1].add([playerName]);

        //enable physics on player character
        this.physics.world.enable(playerCharacter[data.id].list[0]);
        playerCharacter[data.id].list[0].body.setCollideWorldBounds(true);
        this.physics.world.enable(playerCharacter[data.id].list[1]);
        playerCharacter[data.id].list[1].body.setCollideWorldBounds(true);
        // if (!playerCollider) {
        //     playerCollider = playerCharacter[data.id].list[0];
        // };

        // [IMPORTANT] - playerCharacter is an array of nested Phaser3 containers
        //
        // playerCharacter[<Player ID>] = Player Container
        //
        // playerCharacter[<Player ID>].list[0] = Player Sprite Container
        // playerCharacter[<Player ID>].list[0].list[0] = frog_body Sprite
        // playerCharacter[<Player ID>].list[0].list[1] = frog_belly Sprite
        // playerCharacter[<Player ID>].list[0].list[2] = frog_eyes Sprite
        //
        // playerCharacter[<Player ID>].list[1] = Player Overlay Container
        // playerCharacter[<Player ID>].list[1].list[0] = playerName Text
        //
        // This was done so that everything in the Player Sprite Container can be altered/transformed without altering stuff 
        // that should remain untouched like the Player Overlay Container's player name. However, they all stay together when
        // the entire Player Container needs to be moved.

        //update the look of the character from the provided server data
        this.updatePlayerLook(data);
    };

    //move player character to specific coordinates
    movePlayer(id, x, y) {

        //update player direction
        this.updatePlayerDirection(id, x, y)

        //get player's character
        var player = playerCharacter[id];

        //move player
        playerData[id] = {
            movement: this.add.tween({
                targets: player, 
                x: x,
                y: y,
                duration: Phaser.Math.Distance.Between(player.x, player.y, x, y) * 3.5,
                onComplete: function() { playerInteracting = false; }
            })
        };
    };

    //stop a player's movement
    haltPlayer(id, newX, newY) {

        //stop movement
        playerData[id].movement.stop();

        //sync check
        if (newX != playerCharacter[id].x || newY != playerCharacter[id].y) {
            this.placePlayer(id, newX, newY);
        };
    };

    //change a players movement location
    changePlayerMovement(id, newX, newY) {

        //get player's character
        var player = playerCharacter[id];

        //get duration of movement
        var newDuration = Phaser.Math.Distance.Between(player.x, player.y, newX, newY) * 5;
        
        //change x
        playerData[id].movement.updateTo('x', newX, true);

        //change y
        playerData[id].movement.updateTo('y', newY, true);

        //change duration
        playerData[id].movement.updateTo('duration', newDuration, true);
    };

    //place a player at a specific coordinate
    placePlayer(id, x, y) {

        //get player container
        var player = playerCharacter[id];

        //place x
        player.x = x;

        //place y
        player.y = y;
    };

    //update a players look direction
    updatePlayerDirection(id, newX, newY) {

        //get player container
        var player = playerCharacter[id];

        //get player sprite container
        var playerSprites = player.list[0];

        //get players current direction
        var currentDirection = this.getPlayerDirection(id);

        //get players current location
        var currentX = player.x;
        var currentY = player.y;

        //init newDirection
        var newDirection;

        //get direction as degrees
        var targetRad = Phaser.Math.Angle.Between(currentX, currentY,newX, newY);
        var targetDegrees = Phaser.Math.RadToDeg(targetRad);

        //moving right
        if (targetDegrees > -90 && targetDegrees < 90) { newDirection = 'right'; }

        //moving left
        else if ((targetDegrees > 90 || targetDegrees < -90)) { newDirection = 'left'; };

        //look direction changed
        if ((newDirection === 'right' && currentDirection === 'left') || (newDirection === 'left' && currentDirection === 'right')) { playerSprites.scaleX *= -1; };
    };

    //update player characters
    updatePlayerLook(data) {

        //get player container
        var player = playerCharacter[data.id];

        //get player sprite container
        var playerSprites = player.list[0];

        //get player body layer (inside sprite container)
        var playerBody = playerSprites.list[0];

        //update players color
        playerBody.tint = data.tint;
    };

    //adds NPC character to the game
    addNewNPC(name, x, y, direction = 'right') {

        //init npc sprite
        var npcSprite;

        //get ID
        var id = objectNextID;
        objectNextID = objectNextID+1;

        //set npc sprite
        npcSprite = this.physics.add.sprite(0, 0, name).setOrigin(0.5, 1).setScale(characterScale);

        //get sprite container size
        var spriteContainer = {
            width: npcSprite.width * characterScale,
            height: npcSprite.height * characterScale
        };

        //offset sprite
        npcSprite.setY((spriteContainer.height/2));

        //npc name
        var npcName = this.add.text(0, spriteContainer.height - overlayPadding, name, {
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setFontSize(12).setOrigin(0.5, 1);

        //create npc container
        npcCharacter[id] = this.add.container(x, y).setSize(spriteContainer.width, spriteContainer.height);
        
        //create npc sprite container
        npcCharacter[id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));

        //add npc sprites to npc sprite container
        npcCharacter[id].list[0].add([npcSprite]);

        //detect clicks
        npcCharacter[id].setInteractive().on('pointerup', () => playerInteracting = id, this);

        //create npc overlay container
        npcCharacter[id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));

        //add npc name to npc overlay container
        npcCharacter[id].list[1].add([npcName]);

        //set direction of NPC
        if (direction === 'left') {
            npcCharacter[id].list[0].list[0].scaleX *= -1;
        };

        //enable physics on npc character
        this.physics.world.enable(npcCharacter[id].list[0]);
        npcCharacter[id].list[0].body.setCollideWorldBounds(true);
        this.physics.world.enable(npcCharacter[id].list[1]);
        npcCharacter[id].list[1].body.setCollideWorldBounds(true);
    };

    //player interacts with NPC
    interactNPC(playerID, npcID) {

        //import Utility functions
        const util = new Utility();

        //interact only once per movement
        if (playerInteracting === npcID) {
            // //stop player
            // this.haltPlayer(playerID, playerCharacter[playerID].x, playerCharacter[playerID].y);

            //tell server that this player halted
            Client.onHalt(playerCharacter[playerID].x, playerCharacter[playerID].y)

            //npc message
            this.displayMessage(npcID, util.randomFromArray(npcLines[npcID]), 'npc');

            //reset interacting check
            playerInteracting = false;
        };
    };

    //display player message
    displayMessage(id, message, characterType = 'player') {

        //create message data
        var messageData = {
            message: message,
            messageID: this.time.now,
            messageDuration: 5000
        };

        //player message
        if (characterType === 'player') {

            //get player overlay container
            var overlayContainer = playerCharacter[id].list[1];

            //get player sprite container
            var spriteContainer = playerCharacter[id].list[0];

            //store message data
            playerData[id] = {
                message: messageData.message,
                messageID: messageData.messageID,
                messageDuration: messageData.messageDuration
            };
        }

        //npc message
        else if (characterType === 'npc') {

            //get npc overlay container
            var overlayContainer = npcCharacter[id].list[1];

            //get player sprite container
            var spriteContainer = npcCharacter[id].list[0];

            //store message data
            npcData[id] = {
                message: messageData.message,
                messageID: messageData.messageID,
                messageDuration: messageData.messageDuration
            };
        };

        //format message
        var messageFormatted = this.add.text(0, 0, message, {
            fontFamily: 'Arial',
            color: '#000000',
            lineSpacing: 2,
            align: 'center',
            padding: { left: 8, right: 8, top: 6, bottom: 6 },
            wordWrap: { width: 130 }
        }).setFontSize(12).setOrigin(0.5, 0);

        //remove older messages
        if (overlayContainer.list[1]) { overlayContainer.list[1].setVisible(false); }
        if (overlayContainer.list[2]) { overlayContainer.list[2].destroy(); }

        //calculate size of message
        var messageWidth = (messageFormatted.width/2) * -1
        var messageHeight = (messageFormatted.height * -1) - ((spriteContainer.height/2) + overlayPadding);

        //reposition text
        messageFormatted.setY(messageHeight);

        //create background for message
        var backgroundFormatted = this.add.graphics()
        .fillStyle(0xffffff, 0.80)
        .fillRoundedRect(messageWidth, messageHeight, messageFormatted.width, messageFormatted.height, 8)
        .lineStyle(1, 0xb8b8b8, 1)
        .strokeRoundedRect(messageWidth, messageHeight, messageFormatted.width, messageFormatted.height, 8);

        //add message to player overlay container
        overlayContainer.addAt([backgroundFormatted], 1);
        overlayContainer.addAt([messageFormatted], 2);

        //make sure message is visible
        overlayContainer.list[1].setVisible(true);

        //schedule message for removal
        this.time.delayedCall(messageData.messageDuration, this.removeMessage, [id, this.time.now, characterType], this);
    };

    //remove player message
    removeMessage(id, messageID, characterType = 'player') {

        //player message
        if (characterType === 'player') {

            //get player overlay container
            var overlayContainer = playerCharacter[id].list[1];

            //get message data
            var messageData = {
                message: playerData[id].message,
                messageID: playerData[id].messageID,
                messageDuration: playerData[id].messageDuration
            };
        }

        //npc message
        else if (characterType === 'npc') {

            //get npc overlay container
            var overlayContainer = npcCharacter[id].list[1];

            //get message data
            var messageData = {
                message: npcData[id].message,
                messageID: npcData[id].messageID,
                messageDuration: npcData[id].messageDuration
            };
        };

        //check if the message scheduled for removal is the same as the players current message shown
        if (messageData.messageID === messageID) {

            //reset chat data
            if (characterType === 'player') {

                //get message data
                playerData[id] = {
                    message: '',
                    messageID: 0,
                    messageDuration: 0
                };
            }
            else if (characterType === 'npc') {

                //get message data
                npcData[id] = {
                    message: '',
                    messageID: 0,
                    messageDuration: 0
                };
            };

            //remove message from player character
            overlayContainer.list[1].setVisible(false);
            overlayContainer.list[2].destroy();

        } else {
            return;
        }
    };

    //remove player character from game
    removePlayer(id) {
        playerCharacter[id].destroy();
        delete playerCharacter[id];
    };
};