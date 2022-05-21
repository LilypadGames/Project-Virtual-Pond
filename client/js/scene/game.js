// Game Scene

//navigational map
// var collidableLayer;

//import
const ui = new UI();
const utility = new Utility();

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
    ['theres this new NFT drop i\'m really excited about', 'ever heard of hangry hippos?', 'fuck all the bitches I know I don\'t give a fuck about flow', 'a ha ha...'],
    ['IDGAF']
];

//init audio
var music;

//init debug variables
var debugMode = false;
var debugCursor;

//UI
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
const messageLength = 80;
var chatBox;
var disableInput = false;
// var toast;
// const toastFontSize = 18;

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
        this.load.image('Snic', 'assets/npc/snic.png');

        //plugins
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        this.load.scenePlugin({key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI'});

        //debug
        this.load.image('target', 'assets/debug/target.png');
    };

    create() {

        //register canvas width/height
        this.canvas = this.sys.game.canvas;

        //tilemap
        var map = this.make.tilemap({ key: 'map' });
        const tileset = map.addTilesetImage('tilesheet', 'tileset'); //the first value is the key of the tileset in map's JSON file
        for(var i = 0; i < map.layers.length; i++) {
            const layer = map.createLayer(i, tileset).setScale(worldScale);
        };

        //music
        music = this.sound.add('chill_pond', {
            mute: false,
            volume: 1,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.play();
        this.sound.pauseOnBlur = false;

        // //format toasts
        // toast = this.rexUI.add.toast({
        //     x: this.canvas.width/2,
        //     y: 30,
        //     height: toastFontSize,
        
        //     background: this.rexUI.add.roundRectangle(0, 0, 2, 2, 20, 0x5e92f3),
        //     text: this.add.text(0, 0, '', {
        //         fontSize: toastFontSize
        //     }),
        //     space: {
        //         left: 20,
        //         right: 20,
        //         top: 20,
        //         bottom: 20,
        //     },
        // });

        //register left click input
        this.input.on('pointerdown', (event) => this.onClick(event));

        //register keyboard inputs
        this.input.keyboard.on('keyup', (event) => this.onKeyUp(event));

        //detect when window is re-focused
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this)

        //add NPCs
        this.addNewNPC('Poke', 197, 450);
        this.addNewNPC('Gigi', 133, 566);
        this.addNewNPC('Jesse', 1096, 241, 'left');
        this.addNewNPC('Snic', 899, 670, 'left');

        //add player's character to world
        Client.onJoin();

        //add toolbar
        this.createToolbar();

        //debug
        debugCursor = this.add.image(8, 8, "target").setVisible(false);
        this.input.on("pointermove", function (pointer) {
            if (debugMode) {
                debugCursor.copyPosition(pointer);
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
    //get players current direction
    getPlayerDirection(id) {

        //get player sprite container
        var playerSprites = playerCharacter[id].list[0];

        //player character is facing right
        if (playerSprites.scaleX > 0) { return 'right' }

        //player character is facing left
        else if (playerSprites.scaleX < 0) { return 'left' };
    };

    // UI
    //create toolbar
    createToolbar() {

        //options menu button
        ui.createButtons(this, { x: 1090, y: 765, buttons: [{ text: '⚙️', backgroundRadius: 8 }] })
        .on('button.click', () => this.showOptions());

        //chat box
        chatBox = ui.createInputBox(this, {
            id: 'chat-box',
            x: this.canvas.width / 2,
            y: this.canvas.height - (this.canvas.height / 23),
            width: this.canvas.width * 0.6,
            height: 30,
            placeholder: 'Say Yo...',
            backgroundColor: ui.colorWhite,
            backgroundRadius: 15,
            maxLength: messageLength
        })
        .on('keydown', function (chatBox, event) {
            if (event.key == 'Enter') {

                //format message
                const chatMessage = chatBox.text.substr(0, messageLength).trim().replace(/\s+/g, " ");

                //send the message to the server
                if (chatMessage !== '' || null) {
                    Client.sendMessage(chatMessage);
                };

                //clear chat box
                chatBox.setText('');
            };
        });
    };

    //show refresh dialog
    showRefreshDialog(content) {

        //create dialog with refresh button
        const dialog = ui.createDialog(this, content)
        .on('button.click', function () {
            window.location.reload();
            disableInput = false;
        }, this);

        //dark background
        this.rexUI.modalPromise(
            dialog,

            //config
            {
                duration: {
                    in: 200,
                    out: 200
                }
            }
        );

        disableInput = true;
    };

    //show options menu
    showOptions() {

        //create dialog
        const dialog = ui.createDialog(this, {titleText: 'Options', draggable: true, width: 400, height: 200, captionText: 'Music Volume', descriptionType: 'slider', sliderID: 'volume', sliderValue: music.volume, toolbar: [{text: 'X'}], space: {titleLeft: 40, description: 60} })
        
        //close dialog when X is pressed
        dialog.on('button.click', function (button, groupName, index, pointer, event) {
            dialog.emit('modal.requestClose', { index: index, text: button.text });
            disableInput = false;
        }),

        //close dialog when X is pressed
        this.rexUI.modalPromise(

            //create dialog
            dialog,

            //config
            {
                cover: false,
                duration: {
                    in: 200,
                    out: 200
                }
            }
        );

        disableInput = true;
    };

    //on slider change
    onSliderChange(value, sliderID) {
        if (sliderID == 'volume') {
            music.setVolume(value);
        };
    };

    // INPUT
    //on keypres
    onKeyUp(event) {
        // ignore keyboard presses when chat box is focused
        if (!chatBox.isFocused) {

            //focus the chat box when Enter key is pressed
            if (event.key === 'Enter') { chatBox.setFocus() };

            //tell server that this client changed its color
            if (event.key === 'c') { Client.changeLook(); };

            //tell server that this client stopped its movement
            if (event.key === 's') { Client.onHalt(playerCharacter[clientPlayerID].x, playerCharacter[clientPlayerID].y) };

            //toggle options
            if (event.key === 'o') { this.showOptions(); };

            //toggle console logging
            if (event.key === 'Shift') { this.toggleDebugMode(); };
        };
    };

    //on mouse down
    onClick(event) {
        console.log(event)
        if (!disableInput) {
            // un-focus chatbox
            if (chatBox.isFocused) { 
                chatBox.setBlur();
            };

            //tell the server that the player is moving
            Client.onMove(this.input.mousePointer.worldX, this.input.mousePointer.worldY);
        };
    };

    // FUNCTIONS
    //get client's ID from the server
    setPlayerID(id) {
        clientPlayerID = id;
    };

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
        };

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
        playerBody.tint = data.color;
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

        //interact only once per movement
        if (playerInteracting === npcID) {

            //tell server that this player halted
            Client.onHalt(playerCharacter[playerID].x, playerCharacter[playerID].y)

            //npc message
            this.displayMessage(npcID, utility.randomFromArray(npcLines[npcID]), 'npc');

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
        // setTimeout(() => {
        //     this.removeMessage(id, this.time.now, characterType);
        // }, messageData.messageDuration);
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

        //off
        if (debugMode) { 
            console.log(utility.timestampString('[DEBUG MODE: OFF]'));
            debugMode = false;

            debugCursor.setVisible(false);
        }

        //on
        else if (!debugMode) {
            console.log(utility.timestampString('[DEBUG MODE: ON]'));
            debugMode = true;

            debugCursor.setVisible(true);
        };
    };
};