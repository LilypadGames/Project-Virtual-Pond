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
const npcLines = [
    ['*cough* i\'m sick', 'yo', 'i\'ll go live later on lacari', 'time for a water break', 'ACTually trolling...'],
    ['*thinking of something HUH to say*', 'people call me a very accurate gamer'],
    ['theres this new NFT drop i\'m really excited about', 'ever heard of hangry hippos?', 'fuck all the bitches I know I don\'t give a fuck about flow', 'a ha ha...']
];

//init debug variables
var debugMode = false;

//constants
const worldScale = 1.67;
const characterScale = 2;
const overlayPadding = 8;
const nametagFontSize = 14;
const nametagConfig = {
    fontFamily: 'Arial',
    color: '#ffffff',
    stroke: '#000000',
    strokeThickness: 6,
};
const messageFontSize = 18;
const messageConfig = {
    fontFamily: 'Arial',
    color: '#000000',
    lineSpacing: 2,
    align: 'center',
    padding: { left: 8, right: 8, top: 6, bottom: 6 },
    wordWrap: { width: 250 }
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

        //get canvas
        this.canvas = this.sys.game.canvas;

        //room maps
        this.load.image("tileset", "assets/room/house_on_the_river/tilesheet.png");
        this.load.tilemapTiledJSON('map', 'assets/room/house_on_the_river/example_map.json');

        //room music
        this.load.audio('chill_pond', "assets/room/pond/music/frog_caves_chill.mp3");

        //character
        this.load.image('frog_body', 'assets/character/frog_body.png');
        this.load.image('frog_belly', 'assets/character/frog_belly.png');
        this.load.image('frog_eyes', 'assets/character/frog_eyes.png');

        //npc
        this.load.image('Poke', 'assets/npc/poke.png');
        this.load.image('Gigi', 'assets/npc/gigi.png');
        this.load.image('Jesse', 'assets/npc/jesse.png');

        //plugins
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        this.load.scenePlugin({key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI'});

        //debug
        this.load.image('target', 'assets/debug/target.png');
    };

    create() {

        //register width/height
        this.canvas = this.sys.game.canvas;

        //set up tilemap/tileset
        var map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tilesheet', 'tileset'); //'tilesheet' is the key of the tileset in map's JSON file

        //set up tilemap layers
        var layer;
        for(var i = 0; i < map.layers.length; i++) {
            layer = map.createLayer(i, tileset).setScale(worldScale);
        };

        //chat box
        var chatBox = this.add.rexInputText(this.canvas.width/2, this.canvas.height - (this.canvas.height/23), this.canvas.width*0.6, 40, {
            id: 'chat-box',
            type: 'text',
            text: '',
            placeholder: 'Say Yo...',
            fontSize: '24px',
            color: '#000000',
            backgroundColor: '#ffffff',
            border: '6px solid',
            borderColor: '#64BEFF',
            spellCheck: false,
            autoComplete: false,
            maxLength: 80
        })
        .on('keydown', function (chatBox, event) {
            if (event.key == 'Enter') {

                //format message
                const chatMessage = chatBox.text.trim().replace(/\s+/g, " ");

                //send the message to the server
                if (chatMessage !== '' || null) {
                    Client.sendMessage(chatMessage);
                };

                //clear chat box
                chatBox.setText('');
            };
        });

        //register left click input
        this.input.on('pointerdown', () => {

            //un-focus chatbox
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

                // //toggle console logging
                // if (event.key === 'Shift') { this.toggleDebugMode(); };
            };
        });

        //detect when window is re-focused
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this)

        //add NPCs
        this.addNewNPC('Poke', 197, 450);
        this.addNewNPC('Gigi', 133, 566);
        this.addNewNPC('Jesse', 1096, 241, 'left');

        //add player's character to world
        Client.onJoin();

        //play music
        this.sound.play('chill_pond', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        
        //stop music from pausing when player looks at another program/tab
        this.sound.pauseOnBlur = false;

        //debug
        var debugCursor = this.add.image(8, 8, "target").setVisible(false);
        this.input.on("pointermove", function (pointer) {
            if (debugMode) {
                debugCursor.copyPosition(pointer).setScale(characterScale).setVisible(true);
            };
        });
    };

    update() {

        //detect collisions between NPCs and the client's player character
        if (playerCharacter[clientPlayerID]) {
            for(var i = 0; i < objectNextID; i++) {
                this.physics.world.collide(playerCharacter[clientPlayerID], npcCharacter[i], () => this.interactNPC(clientPlayerID, i));
            };
        };
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

    //create text with background
    createLabel(text, align = 'left', backgroundColor = 0x5e92f3) {
        return this.rexUI.add.label({
            width: 80, // Minimum width of round-rectangle
            height: 80, // Minimum height of round-rectangle
          
            background: this.rexUI.add.roundRectangle(0, 0, 100, 40, 20, backgroundColor),
    
            text: this.add.text(0, 0, text, {
                fontSize: '48px'
            }),

            align: align,
    
            space: {
                left: 10,
                right: 10,
                top: 10,
                bottom: 10
            }
        });
    };

    //show dialog box on screen
    showDialog(content) {

        //get content
        const title = content[0];
        const message = content[1];
        const option = content[2];

        //create dialog
        var dialog = this.rexUI.add.dialog({
            x: this.canvas.width/2,
            y: this.canvas.height/2,
            width: 1000,

            background: this.rexUI.add.roundRectangle(0, 0, 100, 100, 20, 0x1565c0),

            title: this.createLabel(title, 'center', 0x1565c0),

            content: this.createLabel(message, 'center', 0x1565c0),

            actions: [
                this.createLabel(option, 'center')
            ],

            space: {
                left: 20,
                right: 20,
                top: -20,
                bottom: -20,

                title: 25,
                titleLeft: 30,
                content: 25,
                description: 25,
                descriptionLeft: 20,
                descriptionRight: 20,
                choices: 25,

                toolbarItem: 5,
                choice: 15,
                action: 15,
            },

            expand: {
                title: false
            },

            align: {
                title: 'center',
                content: 'center',
                actions: 'center'
            },

            click: {
                mode: 'release'
            }
        })
        .layout()
        .popUp(1000)

        //set up interactions with dialog
        .on('button.click', function (button, groupName, index, pointer, event) {
            // this.print.text += groupName + '-' + index + ': ' + button.text + '\n';
            window.location.reload();
        }, this)
        .on('button.over', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle(1, 0xffffff);
        })
        .on('button.out', function (button, groupName, index, pointer, event) {
            button.getElement('background').setStrokeStyle();
        });

        //dialog pop-up animation
        this.tweens.add({
            targets: dialog,
            scaleX: 1,
            scaleY: 1,
            ease: 'Bounce', // 'Cubic', 'Elastic', 'Bounce', 'Back'
            duration: 100,
            repeat: 0, // -1: infinity
            yoyo: false
        });
    };

    // FUNCTIONS
    //reload the world when window is re-focused
    onFocus() {
        Client.onReload();
    };

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
        var playerName = this.add.text(0, spriteContainer.height, data.name, nametagConfig).setFontSize(nametagFontSize).setOrigin(0.5, 1);

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
        this.physics.world.enable(playerCharacter[data.id]);
        playerCharacter[data.id].body.setCollideWorldBounds(true);

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
                duration: Phaser.Math.Distance.Between(player.x, player.y, x, y) * 4,
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
        var npcName = this.add.text(0, spriteContainer.height, name, nametagConfig).setFontSize(nametagFontSize).setOrigin(0.5, 1);

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
        this.physics.world.enable(npcCharacter[id]);
        npcCharacter[id].body.setCollideWorldBounds(true);
    };

    //player interacts with NPC
    interactNPC(playerID, npcID) {

        //import Utility functions
        const util = new Utility();

        //interact only once per movement
        if (playerInteracting === npcID) {

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
        var messageFormatted = this.add.text(0, 0, message, messageConfig).setFontSize(messageFontSize).setOrigin(0.5, 0);

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

    // DEBUG
    //toggle console logging
    toggleDebugMode() {

        //import Utility functions
        const util = new Utility();

        //off
        if (debugMode) { 
            console.log(util.timestampString('[DEBUG MODE: OFF]'));
            debugMode = false;
        }

        //on
        else if (!debugMode) {
            console.log(util.timestampString('[DEBUG MODE: ON]'));
            debugMode = true;
        };
    };
};