// Game Scene

//navigational map
// var collidableLayer;

//import
const ui = new UI();
const utility = new Utility();

//init settings
var gameOptions = JSON.parse(localStorage.getItem('gameOptions'));
const defaultOptions = [
    { id: 'music', volume: 1 }
];
if (gameOptions === null || gameOptions.length <= 0) {
    localStorage.setItem('gameOptions', JSON.stringify(defaultOptions));
    gameOptions = defaultOptions;
};

//init world
var walkableLayer;
var unWalkableLayer = [];
const depthUI = 100002;
const depthOverlay = 100001;
const depthForeground = 100000;
const depthGround = 1;
const depthBackground = 0;

//init audio
var music;

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
    ['*cough* i\'m sick', 'yo', 'i\'ll be on lacari later', 'one sec gunna take a water break', 'u ever have a hemorrhoid?'],
    ['*thinking of something HUH to say*', 'people call me a very accurate gamer', ''],
    ['you invest in a hangry hippos nft yet?', 'fuck all the bitches I know I don\'t give a fuck about flow', 'a ha ha...', 'i could be playing among us rn'],
    ['IDGAF']
];

//init ui
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
var menuOpen = false;

//init debug variables
var debugMode = false;
var debugCursor;

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

        //room layers
        this.load.image('Forest_Background', 'assets/room/forest/Background.png');
        this.load.image('Forest_Ground', 'assets/room/forest/Ground.png');
        this.load.image('Forest_Tree_3', 'assets/room/forest/Tree_3.png');
        this.load.image('Forest_Tree_2', 'assets/room/forest/Tree_2.png');
        this.load.image('Forest_Tree_1', 'assets/room/forest/Tree_1.png');
        this.load.image('Forest_Foreground', 'assets/room/forest/Foreground.png');

        //room audio
        this.load.audio('frog_caves_chill', "assets/room/forest/audio/music/frog_caves_chill.mp3");
        this.load.audio('forest_ambience', "assets/room/forest/audio/music/forest_ambience.mp3");

        //character
        this.load.image('frog_body', 'assets/character/player/Tintable.png');
        this.load.image('frog_belly', 'assets/character/player/Non-Tintable.png');
        this.load.image('frog_eyes', 'assets/character/player/Eyes.png');

        //npc
        this.load.image('Poke', 'assets/character/npc/Poke.png');
        this.load.image('Gigi', 'assets/character/npc/Gigi.png');
        this.load.image('Jesse', 'assets/character/npc/Jesse.png');
        this.load.image('Snic', 'assets/character/npc/Snic.png');

        //plugins
        this.load.scenePlugin({key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI'});
        this.load.plugin('rexinputtextplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexinputtextplugin.min.js', true);
        this.load.plugin('rexcoverplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcoverplugin.min.js', true);

        //debug
        this.load.image('target', 'assets/debug/target.png');
    };

    create() {

        //register canvas width/height
        this.canvas = this.sys.game.canvas;

        //room
        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Background').setDepth(depthBackground);
        
        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Ground').setDepth(depthGround)
        .setInteractive().on('pointerdown', () => {
            if(this.navigationCheck('Forest_Ground')) {
                this.onClick();
            };
        });
        walkableLayer = 'Forest_Ground';

        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_3').setDepth(600);
        unWalkableLayer.push('Forest_Tree_3');
        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_2').setDepth(620);
        unWalkableLayer.push('Forest_Tree_2');
        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_1').setDepth(665);
        unWalkableLayer.push('Forest_Tree_1');

        this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Foreground').setDepth(depthForeground);
        unWalkableLayer.push('Forest_Foreground');

        //music
        music = this.sound.add('frog_caves_chill', {
            mute: false,
            volume: 0,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0
        });
        music.setVolume(utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume);
        music.play();
        this.sound.pauseOnBlur = false;

        //register keyboard inputs
        this.input.keyboard.on('keyup', (event) => this.onKeyUp(event));

        //detect when window is re-focused
        this.game.events.addListener(Phaser.Core.Events.FOCUS, this.onFocus, this)

        //add NPCs
        this.addNewNPC('Poke', 363, 629);
        this.addNewNPC('Gigi', 188, 621);
        this.addNewNPC('Jesse', 1032, 666, 'left');
        this.addNewNPC('Snic', 1238, 554, 'left');

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

        //handle collisions
        if (playerCharacter[clientPlayerID]) {

            //NPCs
            for(var i = 0; i < objectNextID; i++) {
                this.physics.world.collide(playerCharacter[clientPlayerID], npcCharacter[i], () => this.interactNPC(clientPlayerID, i));
            };
        };

        //handle depth
        Object.keys(playerCharacter).forEach((key) => {
            playerCharacter[key].setDepth(playerCharacter[key].y);
        });
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
        ui.createButtons(this, { x: 1090, y: 765, buttonTextSize: 22, buttons: [{ text: '⚙️', backgroundRadius: 8 }] })
        .on('button.click', () => this.showOptions())
        .setDepth(depthUI);

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
            maxLength: messageLength,
            depth: depthUI
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

        //fade background
        this.add.rexCover({ alpha: 0.8 }).setDepth(depthUI);

        //create dialog with refresh button
        const dialog = ui.createDialog(this, content)
        .on('button.click', function () {
            window.location.reload();
            disableInput = false;
        }, this);

        //dark background
        this.rexUI.modalPromise(
            dialog.setDepth(depthUI),

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

    //show options menu
    showOptions() {

        if (!menuOpen) {
            //create dialog
            const dialog = ui.createDialog(this, {titleText: 'Options', draggable: true, width: 400, height: 200, captionText: 'Music Volume', descriptionType: 'slider', sliderID: 'volume', sliderValue: utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume, toolbar: [{text: 'X'}], space: {titleLeft: 40, description: 60} });

            //close dialog when X is pressed
            dialog.on('button.click', function (button, groupName, index, pointer, event) {
                dialog.emit('modal.requestClose', { index: index, text: button.text });
                disableInput = false;
                menuOpen = false;
            }),

            //close dialog when X is pressed
            this.rexUI.modalPromise(

                //create dialog
                dialog.setDepth(depthUI),

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
            menuOpen = true;
        };
    };

    //on slider change
    onSliderChange(value, sliderID) {
        if (sliderID == 'volume') {

            //store locally for the user to persist changes between sessions
            var options = utility.getLocalStorage('gameOptions');
            options[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume = value;
            utility.storeLocalStorageArray('gameOptions', options);

            //change volume
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
    onClick() {

        //if clicking is not disabled
        if (!disableInput) {

            // un-focus chatbox
            if (chatBox.isFocused) { 
                chatBox.setBlur();
            };

            //tell the server that the player is moving
            Client.onMove(this.input.mousePointer.worldX, this.input.mousePointer.worldY);
        };
    };

    //check if click location is allowed by navigational map (returns true if click location is allowed by navigation map and false otherwise)
    navigationCheck(layer) {

        //if clicking is not disabled
        if (!disableInput) {

            //check if click is on an unwalkable layer
            for (let i = 0; i < unWalkableLayer.length; i++) {
                if (this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, unWalkableLayer[i]) == 255) {
                    return false;
                };
            };

            //check if the clicked pixel is not transparent
            if(this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, layer) == 255) {

                //if the clicked layer is the walkable layer (usually the ground layer)
                if (layer == walkableLayer) {
                    return true;

                //if the clicked layer is not the walkable layer, check if the walkable layer at the same position is not transparent to allow movement
                } else if (!unWalkableLayer.includes(layer) && this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, walkableLayer) == 255){
                    return true;
                };

            //if the pixel on this layer is not transparent, check if it is on the walkable layer
            } else if ((layer !== walkableLayer) && (this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, walkableLayer) == 255)) {
                return true;
            }

            return false;
        };

        return false;
    };

    // FUNCTIONS
    //get client's ID from the server
    initPlayer(id) {
        
        //store clients player ID
        clientPlayerID = id;

        // //add collision
        // for(var i = 0; i < collidableLayers.length; i++) {
        //     this.physics.add.collider(playerCharacter[clientPlayerID], collidableLayers[i]);
        // };
    };

    //reload the world when window is re-focused
    onFocus() {
        Client.onReload();
    };

    //add player character to game at specific coordinates
    addNewPlayer(data) {

        //player character
        var playerBody = this.physics.add.sprite(0, 0, 'frog_body').setOrigin(0.5, 1);
        var playerBelly = this.add.sprite(0, 0,'frog_belly').setOrigin(0.5, 1);
        var playerEyes = this.add.sprite(0, 0,'frog_eyes').setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width,
            height: playerBody.height
        };

        //player name
        var playerName = this.add.text(0, spriteContainer.height, data.name, nametagConfig).setFontSize(nametagFontSize).setOrigin(0.5, 1);

        //create player container
        playerCharacter[data.id] = this.add.container(data.x, data.y).setSize(spriteContainer.width, spriteContainer.height);

        //create player sprite container
        playerCharacter[data.id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));   

        //add player sprites to player sprite container
        playerCharacter[data.id].list[0].add([playerBody, playerBelly, playerEyes]);

        //offset sprites to match hitbox
        // playerSpriteContainer.list[0].setY(spriteContainer.height / 2);
        // playerSpriteContainer.list[1].setY(spriteContainer.height / 2);
        // playerSpriteContainer.list[2].setY(spriteContainer.height / 2);

        //create player overlay container
        playerCharacter[data.id].add(this.add.container(0, (spriteContainer.height / 2) * -1).setSize(spriteContainer.width, spriteContainer.height));

        //add player name to player overlay container
        playerCharacter[data.id].list[1].add([playerName]);

        //enable physics on player character
        this.physics.world.enable(playerCharacter[data.id]);
        playerCharacter[data.id].body.setCollideWorldBounds(true);

        //set depth
        playerCharacter[data.id].setDepth(data.y);

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

        //get player body layer (inside player sprite container)
        var playerBody = playerCharacter[data.id].list[0].list[0];

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
        npcSprite = this.physics.add.sprite(0, 0, name).setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: npcSprite.width,
            height: npcSprite.height
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
        npcCharacter[id].setInteractive().on('pointerup', () => {
            if(this.navigationCheck()) {
                playerInteracting = id;
                this.onClick();
            };
        }
        , this);

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

        //set depth
        npcCharacter[id].setDepth(y);
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