// Game Scene

class Game extends Phaser.Scene {

    // LOCAL VARIABLES
    //world
    walkableLayer;
    unWalkableLayer = [];

    //shaders
    rexOutlineFX;

    //depth
    depthUI = 100002;
    depthOverlay = 100001;
    depthForeground = 100000;
    depthGround = 1;
    depthBackground = 0;

    //audio
    music;
    sfx_button_click;

    //player variables
    playerCharacter = {};
    playerData = [];

    //object variables
    npcCharacter = {};
    npcData = [];
    npcList = [
        { id: 0, name: 'Poke', x: 363, y: 629, direction: 'right'},
        { id: 1, name: 'Gigi', x: 250, y: 540, direction: 'right'},
        { id: 2, name: 'Jesse', x: 1032, y: 666, direction: 'left'},
        { id: 3, name: 'Snic', x: 1238, y: 554, direction: 'left'}
    ];
    npcLines = [
        ['*cough* i\'m sick', 'yo', 'i\'ll be on lacari later', 'one sec gunna take a water break', 'u ever have a hemorrhoid?'],
        ['*thinking of something HUH to say*', 'people call me a very accurate gamer', 'GEORGIEEEEEE!'],
        ['have you heard about the hangry hippos NFT?', 'fuck all the bitches I know I don\'t give a fuck about flow', 'a ha ha...', 'i could be playing among us rn'],
        ['IDGAF']
    ];

    //UI
    overlayPadding = 8;
    nametagFontSize = 14;
    nametagClientConfig = {
        fontFamily: 'Burbin',
        color: utility.hexIntegerToString(ColorScheme.White),
        stroke: utility.hexIntegerToString(ColorScheme.Black),
        strokeThickness: 6,
    };
    nametagConfig = {
        fontFamily: 'Burbin',
        color: utility.hexIntegerToString(ColorScheme.Black),
    };
    messageFontSize = 18;
    messageConfig = {
        fontFamily: 'Arial',
        color: utility.hexIntegerToString(ColorScheme.Black),
        lineSpacing: 2,
        align: 'center',
        padding: { left: 8, right: 8, top: 6, bottom: 6 },
        wordWrap: { width: 250 }
    };
    messageLength = 80;
    chatBox;
    disableInput = false;
    menuOpen = false;

    //debug
    debugCursor;
    debugPing;

    // INIT
    constructor() {
        super({ key: 'Game' });
    };

    init(room) {

        //set scene
        currentScene = this;

        //set room
        this.room = room;
    };

    // LOGIC
    preload() {

        //register canvas
        this.canvas = this.sys.game.canvas;

        //loading screen
        loadingScreen.run(this);

        //asset path
        this.load.setPath('assets/');

        //room layers
        this.load.image('Forest_Background', 'room/forest/layers/Background.png');
        this.load.image('Forest_Ground', 'room/forest/layers/Ground.png');
        this.load.image('Forest_Tree_3', 'room/forest/layers/Tree_3.png');
        this.load.image('Forest_Tree_2', 'room/forest/layers/Tree_2.png');
        this.load.image('Forest_Rock_1', 'room/forest/layers/Rock_1.png');
        this.load.image('Forest_Tree_1', 'room/forest/layers/Tree_1.png');
        this.load.image('Forest_Foreground', 'room/forest/layers/Foreground.png');

        //room objects
        this.load.image('Sign_News', 'room/forest/objects/Sign_News.png');
        this.load.image('Table_FindFour', 'room/forest/objects/Table_FindFour.png');

        //room audio
        this.load.audio('frog_caves_chill', "room/forest/audio/music/frog_caves_chill.mp3");
        this.load.audio('forest_ambience', "room/forest/audio/sfx/ambience/forest_ambience.mp3");

        //sfx
        this.load.audio('button_click', "audio/sfx/UI/button_click.mp3");

        //character
        this.load.image('frog_body', 'character/player/Tintable.png');
        this.load.image('frog_belly', 'character/player/Non-Tintable.png');
        this.load.image('frog_eyes_0', 'character/player/eyes/Eyes_0.png');
        this.load.image('frog_eyes_1', 'character/player/eyes/Eyes_1.png');

        //npc
        this.load.image('Poke', 'character/npc/Poke.png');
        this.load.image('Gigi', 'character/npc/Gigi.png');
        this.load.image('Jesse', 'character/npc/Jesse.png');
        this.load.image('Snic', 'character/npc/Snic.png');

        //debug
        this.load.image('target', 'debug/target.png');
    };

    create() {

        //register sfxs
        this.sfx_button_click = this.sound.add('button_click', { volume: 0 });
        this.sfx_button_click.setVolume(utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'sfx')].volume);

        //detect when window is re-focused
        this.game.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);

        //register keyboard inputs
        this.input.keyboard.on('keydown-' + 'C', function () { this.end(); this.scene.start('CharacterCreator'); }, this);
        this.input.keyboard.on('keydown-' + 'ENTER', () => { if (!this.chatBox.isFocused) { this.chatBox.setFocus(); } else if (this.chatBox.isFocused) { this.chatBox.setBlur(); } }, this);
        this.input.keyboard.on('keydown-' + 'ESC', () => { if (this.chatBox.isFocused) this.chatBox.setBlur(); }, this);
        this.input.keyboard.on('keydown-' + 'SHIFT', this.toggleDebugMode, this);

        //add debug info
        this.createDebug();

        //add room layers
        this.addRoomLayers(this.room);

        //add room objects
        this.addRoomObjects(this.room);

        //add room music
        this.addRoomMusic(this.room);

        //add room NPCs
        this.addRoomNPCs(this.room);

        //join room and get currently connected players in this room
        client.joinRoom(this.room);

        //add toolbar
        this.createToolbar();
    };

    update() {

        //handle collisions between player and npc characters
        for(var i = 0; i < this.npcList.length; i++) {
            Object.keys(this.playerCharacter).forEach((key) => {
                this.physics.world.collide(this.playerCharacter[key], this.npcCharacter[i], () => {

                    //get player interact NPC data
                    let interactNPC = utility.getObject(this.playerData, key).interactNPC

                    //if player is trying to interact with this NPC
                    if (interactNPC == i) {

                        //interact with NPC
                        this.interactNPC(key, i);

                        //log
                        if (debugMode) console.log(utility.timestampString('Interacted With NPC: ' + i));
                    };
                });
            });
        };

        //handle player character depth
        Object.keys(this.playerCharacter).forEach((key) => {
            this.playerCharacter[key].setDepth(this.playerCharacter[key].y);
        });
    };

    end() {

        //remove DOM elements
        this.chatBox.destroy();

        //delete data
        this.playerCharacter = {};
        this.playerData = [];
        this.npcCharacter = {};
        this.npcData = [];

        //stop music
        this.music.stop();

        //reset data
        this.registry.destroy();
        this.game.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.scene.stop();

        //leave game world
        client.leaveRoom();
    };

    // WORLD
    //add layers
    addRoomLayers(room) {

        //forest
        if (room == 'forest') {
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Background').setDepth(this.depthBackground);
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Ground').setDepth(this.depthGround)
            .setInteractive().on('pointerdown', () => {
                if(this.navigationCheck('Forest_Ground')) {
                    this.onClick(this.input.mousePointer.worldX, this.input.mousePointer.worldY);
                };
            }, this);
            this.walkableLayer = 'Forest_Ground';
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_3').setDepth(610);
            this.unWalkableLayer.push('Forest_Tree_3');
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_2').setDepth(628);
            this.unWalkableLayer.push('Forest_Tree_2');
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Rock_1').setDepth(629);
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Tree_1').setDepth(665);
            this.unWalkableLayer.push('Forest_Tree_1');
            this.add.image(this.canvas.width/2, this.canvas.height/2, 'Forest_Foreground').setDepth(this.depthForeground);
            this.unWalkableLayer.push('Forest_Foreground');
        }
    };

    //add room objects
    addRoomObjects(room) {

        //forest
        if (room == 'forest') {
            //news sign
            let signNews = this.add.image(187, 630, 'Sign_News')
            .setDepth(628)
            .setOrigin(0.5, 1)
            .setInteractive();
            this.setInteractObject(signNews);
            signNews.on('pointerdown', () => {

                //open news menu
                this.openNews();
            }, this);

            //find four table
            // let tableFindFour = this.add.image(906, 607, 'Table_FindFour')
            // .setDepth(600)
            // .setOrigin(0.5, 1)
            // .setInteractive();
            // this.setInteractObject(tableFindFour);
            // tableFindFour.on('pointerdown', () => {
            // }, this);
        }
    };

    //add room music
    addRoomMusic(room) {

        //forest
        if (room == 'forest') {
            //music
            this.music = this.sound.add('frog_caves_chill', {
                mute: false,
                volume: 0,
                rate: 1,
                detune: 0,
                seek: 0,
                loop: true,
                delay: 0
            });
            this.music.setVolume(utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume);
            this.music.play();
            this.sound.pauseOnBlur = false;
        }
    };

    //add room NPCs
    addRoomNPCs(room) {

        //forest
        if (room == 'forest') {
            for(var i = 0; i < this.npcList.length; i++) {
                this.addNewNPC(this.npcList[i].id, this.npcList[i].name, this.npcList[i].x, this.npcList[i].y, this.npcList[i].direction);
            };
        }
    };

    // UI
    //reload the world when window is re-focused
    onFocus() {
        client.onReload();
    };

    //create outlines on hover
    setInteractObject(sprite) {
        sprite.on('pointerover', function () {

            //show outline
            this.rexOutlineFX.add(sprite, {
                thickness: 3,
                outlineColor: ColorScheme.White
            });
        }, this)
        .on('pointerout', function () {

            //remove outline
            this.rexOutlineFX.remove(sprite);
        }, this)
    };

    //open menu
    menuOpened() {

        //disable input
        this.disableInput = true;
        this.menuOpen = true;

        //stop chatbox input
        this.chatBox.setBlur();
    };

    //close menu
    menuClosed() {

        //enable input
        this.disableInput = false;
        this.menuOpen = false;
    };

    //create chat box
    createChatBox() {
        return ui.createInputBox(this, {
            id: 'chat-box',
            x: this.canvas.width / 2,
            y: this.canvas.height - (this.canvas.height / 23),
            width: this.canvas.width * 0.6,
            height: 30,
            placeholder: 'Say Yo...',
            backgroundColor: ColorScheme.White,
            backgroundRadius: 15,
            maxLength: this.messageLength,
            depth: this.depthUI
        })
        .on('focus', function(inputBox, event){
            if (this.menuOpen) inputBox.setBlur();
        }
        , this)
        .on('keydown', function (inputBox, event) {
            if (event.key == 'Enter') {

                //format message
                const chatMessage = inputBox.text.substr(0, this.messageLength).trim().replace(/\s+/g, " ");

                //send the message to the server
                if (chatMessage !== '' || null) {
                    client.sendMessage(chatMessage);
                };

                //clear chat box
                inputBox.setText('');
            };
        }, this);
    };

    //create toolbar
    createToolbar() {

        //options menu button
        ui.createButtons(this, { x: 1090, y: 765, buttonTextSize: 22, buttons: [{ text: '⚙️', backgroundRadius: 8 }] })
        .on('button.click', () => {

            //open options menu
            this.showOptions();

            //sfx
            this.sfx_button_click.play();
        } ,this)
        .setDepth(this.depthUI);

        //chat box
        this.chatBox = this.createChatBox();
    };

    //show refresh dialog
    showRefreshDialog(content, options) {

        //fade background
        this.add.rexCover({ alpha: 0.8 }).setDepth(this.depthUI);

        //create dialog with refresh button
        const dialog = ui.createDialog(this, content, options)
        .on('button.click', function () {

            //sfx
            this.sfx_button_click.play();

            //reload window
            window.location.reload();

            this.menuClosed();
        }, this);

        //dark background
        this.rexUI.modalPromise(
            dialog.setDepth(this.depthUI),

            //config
            {
                cover: false,
                duration: {
                    in: 200,
                    out: 200
                }
            }
        );

        this.menuOpened();
    };

    //show options menu
    showOptions() {
        if (!this.menuOpen) {

            //show options menu
            ui.createMenu(this, { title: 'Options', content: [
                { type: 'text', text: 'Music Volume', fontSize: 24 }, 
                { type: 'slider', id: 'musicVolume', value: utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume },
                { type: 'text', text: 'Sound Effects Volume', fontSize: 24 }, 
                { type: 'slider', id: 'sfxVolume', value: utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'sfx')].volume }
            ]});

            this.menuOpened();
        };
    };

    //show news menu
    openNews() {
        if (!this.menuOpen) {

            //parse and format news text
            const passage = news.join('\n__________________________\n\n');

            //show news menu
            ui.createMenu(this, 
                { title: 'News', content: [ { type: 'scrollable', text: passage, track: {color: ColorScheme.Blue}, thumb: {color: ColorScheme.LightBlue}} ]}, 
                { height: 500 }
            );

            this.menuOpened();
        };
    };

    // INPUT
    //on mouse down
    onClick(x, y) {

        //if clicking is not disabled
        if (!this.disableInput) {

            // un-focus chatbox
            if (this.chatBox.isFocused) this.chatBox.setBlur();

            //move client player
            this.movePlayer(clientID, x, y);

            //tell the server that this player is moving
            client.onMove(x, y, this.getPlayerDirection(clientID));
        };
    };

    //on slider change
    onSliderChange(value, sliderID) {

        //music
        if (sliderID == 'musicVolume') {

            //store locally for the user to persist changes between sessions
            var options = utility.getLocalStorage('gameOptions');
            options[utility.getLocalStorageArrayIndex('gameOptions', 'music')].volume = value;
            utility.storeLocalStorageArray('gameOptions', options);

            //change volume
            this.music.setVolume(value);
        }

        //sfx
        else if (sliderID == 'sfxVolume') {

            //store locally for the user to persist changes between sessions
            var options = utility.getLocalStorage('gameOptions');
            options[utility.getLocalStorageArrayIndex('gameOptions', 'sfx')].volume = value;
            utility.storeLocalStorageArray('gameOptions', options);

            //change volume
            this.sfx_button_click.setVolume(value);
        };
    };

    //check if click location is allowed by navigational map (returns true if click location is allowed by navigation map and false otherwise)
    navigationCheck(layer) {

        //if clicking is not disabled
        if (!this.disableInput) {

            //if layer is specified, ignore everything else and only check for this layers navigational map
            if (layer) {
                if(this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, layer) == 255) {
                    return true;
                };
            }

            //check if click is on an unwalkable layer
            else {
                for (let i = 0; i < this.unWalkableLayer.length; i++) {
                    if (this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, this.unWalkableLayer[i]) == 255) {
                        return false;
                    };
                };
            };

            //if layer wasn't specified and click wasnt on an unwalkable layer, then check the walkable layer
            if ((layer !== this.walkableLayer) && (this.textures.getPixelAlpha(this.input.mousePointer.worldX, this.input.mousePointer.worldY, this.walkableLayer) == 255)) {
                return true;
            };

            return false;
        };

        return false;
    };

    // FUNCTIONS
    //add player character to game at specific coordinates
    addNewPlayer(data) {

        //player character
        var playerBody = this.add.sprite(0, 0, 'frog_body').setOrigin(0.5, 1);
        var playerBelly = this.add.sprite(0, 0,'frog_belly').setOrigin(0.5, 1);
        var playerEyes = this.add.sprite(0, 0,'frog_eyes_' + data.character.eye_type).setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width,
            height: playerBody.height
        };

        //player name
        var nametagConfig;
        if (data.id == clientID) {
            nametagConfig = this.nametagClientConfig;
        } else {
            nametagConfig = this.nametagConfig
        }
        var playerName = this.add.text(0, spriteContainer.height, data.name, nametagConfig).setFontSize(this.nametagFontSize).setOrigin(0.5, 1);

        //create player container
        this.playerCharacter[data.id] = this.add.container(data.x, data.y).setSize(spriteContainer.width, spriteContainer.height);

        //create player sprite container
        this.playerCharacter[data.id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));   

        //add player sprites to player sprite container
        this.playerCharacter[data.id].list[0].add([playerBody, playerBelly, playerEyes]);

        //create player overlay container
        this.playerCharacter[data.id].add(this.add.container(0, (spriteContainer.height / 2) * -1).setSize(spriteContainer.width, spriteContainer.height));

        //add player name to player overlay container
        this.playerCharacter[data.id].list[1].add([playerName]);

        //enable physics on player character
        this.physics.world.enable(this.playerCharacter[data.id]);
        this.playerCharacter[data.id].body.setCollideWorldBounds(true);

        //set depth
        this.playerCharacter[data.id].setDepth(data.y);
        
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
        this.updatePlayer(data);
    };

    //move player character to specific coordinates
    movePlayer(id, x, y) {

        //update player direction
        this.updatePlayerDirection(id, x, y);

        //get player's character
        var player = this.playerCharacter[id];

        //move player (and store it for alteration later)
        let playerMovement = utility.getObject(this.playerData, id).movement;
        if (playerMovement) utility.getObject(this.playerData, id).movement.stop();
        utility.getObject(this.playerData, id).movement = this.add.tween({
            targets: player,
            x: x,
            y: y,
            duration: Phaser.Math.Distance.Between(player.x, player.y, x, y) * 4
        });
    };

    //stop a player's movement
    haltPlayer(id, newX, newY) {

        //stop movement
        let playerMovement = utility.getObject(this.playerData, id).movement;
        if (playerMovement) utility.getObject(this.playerData, id).movement.stop();
        utility.getObject(this.playerData, id).movement.stop();

        //sync check
        if (newX != this.playerCharacter[id].x || newY != this.playerCharacter[id].y) {
            this.updatePlayer({ id: id, x: newX, y: newY });
        };
    };

    //change a players movement location
    changePlayerMovement(id, newX, newY) {

        //get player's character
        var player = this.playerCharacter[id];

        //get duration of movement
        var newDuration = Phaser.Math.Distance.Between(player.x, player.y, newX, newY) * 5;
        
        //change x
        utility.getObject(this.playerData, id).movement.updateTo('x', newX, true);

        //change y
        utility.getObject(this.playerData, id).movement.updateTo('y', newY, true);

        //change duration
        utility.getObject(this.playerData, id).movement.updateTo('duration', newDuration, true);
    };

    //place a player at a specific coordinate
    updatePlayer(data) {

        //get player container
        var player = this.playerCharacter[data.id];

        //place x
        if (data.x) {
            player.x = data.x;
        };

        //place y
        if (data.y) {
            player.y = data.y;
        };

        //direction
        if (data.direction) this.setPlayerDirection(data.id, data.direction);

        //character
        if (data.character) {
            //color
            if (data.character.color) {

                //get player body sprite
                var playerBody = this.playerCharacter[data.id].list[0].list[0];

                //update color
                playerBody.tint = data.character.color;
            };

            //eye type
            if (data.character.eye_type) {

                //get player eyes sprite
                var playerEyes = this.playerCharacter[data.id].list[0].list[2];

                //update eye type
                playerEyes.setTexture('frog_eyes_' + data.character.eye_type);
            };
        };

        //message
        if (data.message) {

            //show message
            this.showMessage(data.id, data.message);
        }
        else if (utility.getObject(this.playerData, data.id).message) {
            
            //remove message
            this.removeMessage(data.id, utility.getObject(this.playerData, id).message.id)
        };
    };

    //get players current direction
    getPlayerDirection(id) {

        //get player sprite container
        var playerSprites = this.playerCharacter[id].list[0];

        //player character is facing right
        if (playerSprites.scaleX > 0) { return 'right' }

        //player character is facing left
        else if (playerSprites.scaleX < 0) { return 'left' };
    };

    //update a players look direction
    updatePlayerDirection(id, newX, newY) {

        //get player container
        var player = this.playerCharacter[id];

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

    //set a players look direction
    setPlayerDirection(id, direction) {

        //get player sprite container
        var playerSprites = this.playerCharacter[id].list[0];

        //left
        if (direction == 'left' && playerSprites.scaleX > 0) {
            playerSprites.scaleX *= -1;
        }

        //right
        else if (direction == 'right' && playerSprites.scaleX < 0) {
            playerSprites.scaleX *= -1;
        };
    };

    //adds NPC character to the game
    addNewNPC(id, name, x, y, direction = 'right') {
        
        //set npc sprite
        var npcSprite = this.add.sprite(0, 0, name).setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: npcSprite.width,
            height: npcSprite.height
        };

        //offset sprite
        npcSprite.setY(spriteContainer.height / 2);

        //npc name
        var npcName = this.add.text(0, spriteContainer.height, name, this.nametagConfig).setFontSize(this.nametagFontSize).setOrigin(0.5, 1);

        //create npc container
        this.npcCharacter[id] = this.add.container(x, y).setSize(spriteContainer.width, spriteContainer.height);

        //create npc sprite container
        this.npcCharacter[id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));

        //add npc sprites to npc sprite container
        this.npcCharacter[id].list[0].add([npcSprite]);

        //detect clicks
        this.npcCharacter[id].list[0].setInteractive().on('pointerup', () => {
            if(this.navigationCheck()) {
                
                //set player as interacting with this NPC
                utility.getObject(this.playerData, clientID).interactNPC = id;
                
                //tell server that the player is interacting with an NPC
                client.onInteractNPC(id);

                this.onClick(this.input.mousePointer.worldX, this.input.mousePointer.worldY);
            };
        }, this);

        //add hover outline to npc sprite
        this.setInteractObject(this.npcCharacter[id].list[0]);

        //create npc overlay container
        this.npcCharacter[id].add(this.add.container(0, 0).setSize(spriteContainer.width, spriteContainer.height));

        //add npc name to npc overlay container
        this.npcCharacter[id].list[1].add([npcName]);

        //set direction of NPC
        if (direction === 'left') {
            this.npcCharacter[id].list[0].list[0].scaleX *= -1;
        };

        //enable physics on npc character
        this.physics.world.enable(this.npcCharacter[id]);
        this.npcCharacter[id].body.setCollideWorldBounds(true);

        //set depth
        this.npcCharacter[id].setDepth(y);
    };

    //player interacts/collides with NPC
    interactNPC(playerID, npcID) {

        //reset interactNPC player data
        delete utility.getObject(this.playerData, playerID).interactNPC;

        //stop player when colliding with npc
        this.haltPlayer(playerID, this.playerCharacter[playerID].x, this.playerCharacter[playerID].y);

        //show message if client interacted with NPC
        if (playerID == clientID) this.showMessage(npcID, { id: Date.now(), text: utility.randomFromArray(this.npcLines[npcID]), endTime: Date.now() + 5000 }, 'npc');
    };

    //display player message
    showMessage(id, messageData, characterType = 'player') {

        //player message
        if (characterType === 'player') {

            //get player overlay container
            var overlayContainer = this.playerCharacter[id].list[1];

            //get player sprite container
            var spriteContainer = this.playerCharacter[id].list[0];

            //store message data
            utility.getObject(this.playerData, id).message = messageData;
        }

        //npc message
        else if (characterType === 'npc') {

            //get npc overlay container
            var overlayContainer = this.npcCharacter[id].list[1];

            //get player sprite container
            var spriteContainer = this.npcCharacter[id].list[0];

            //store message data
            utility.getObject(this.npcData, id).message = messageData;
        };

        //format message
        var messageFormatted = this.add.text(0, 0, messageData.text, this.messageConfig).setFontSize(this.messageFontSize).setOrigin(0.5, 0);

        //remove older messages
        if (overlayContainer.list[1]) { overlayContainer.list[1].setVisible(false); }
        if (overlayContainer.list[2]) { overlayContainer.list[2].destroy(); }

        //calculate size of message
        var messageWidth = (messageFormatted.width/2) * -1
        var messageHeight = (messageFormatted.height * -1) - ((spriteContainer.height/2) + this.overlayPadding);

        //reposition text
        messageFormatted.setY(messageHeight);

        //create background for message
        var backgroundFormatted = this.add.graphics()
        .fillStyle(ColorScheme.White, 0.80)
        .fillRoundedRect(messageWidth, messageHeight, messageFormatted.width, messageFormatted.height, 8)
        .lineStyle(1, ColorScheme.LightGray, 1)
        .strokeRoundedRect(messageWidth, messageHeight, messageFormatted.width, messageFormatted.height, 8);

        //add message to player overlay container
        overlayContainer.addAt([backgroundFormatted], 1);
        overlayContainer.addAt([messageFormatted], 2);

        //make sure message is visible
        overlayContainer.list[1].setVisible(true);

        //schedule NPCs messages for removal
        if (characterType === 'npc') {
            this.time.delayedCall(5000, this.removeMessage, [id, messageData.id, characterType], this);
        };
    };

    //remove player message
    removeMessage(id, queuedID, characterType = 'player') {

        //init message ID
        var currentID;

        //player message
        if (characterType === 'player') {

            //get player overlay container
            var overlayContainer = this.playerCharacter[id].list[1];

            //check if the message still exists
            if (!utility.getObject(this.playerData, id).message) return;

            //get message id
            currentID = utility.getObject(this.playerData, id).message.id;
        }

        //npc message
        else if (characterType === 'npc') {

            //get npc overlay container
            var overlayContainer = this.npcCharacter[id].list[1];

            //get message id
            currentID = utility.getObject(this.npcData, id).message.id
        };

        //check if the message queued for removal is the same as the characters current message shown
        if (queuedID === currentID) {

            //reset chat data
            if (characterType === 'player') {
                delete utility.getObject(this.playerData, id).message;
            }
            else if (characterType === 'npc') {
                delete utility.getObject(this.npcData, id).message;
            };

            //remove message from player character
            overlayContainer.list[1].setVisible(false);
            overlayContainer.list[2].destroy();

        } else {
            return;
        };
    };

    //remove player character from game
    removePlayer(id) {
        if (this.playerCharacter[id]) this.playerCharacter[id].destroy();
        delete this.playerCharacter[id];
    };

    // DEBUG
    //create debug visuals
    createDebug() {
        //cursor
        this.debugCursor = this.add.image(8, 8, "target").setDepth(depthDebug);
        this.input.on("pointermove", function (pointer) {
            if (debugMode) {
                this.debugCursor.copyPosition(pointer);
            };
        }, this);

        //ping info
        this.debugPing = this.add.text(0, 0, 'Ping: Waiting...').setDepth(depthDebug);

        //if debug mode is off, change visibility of debug info
        if (!debugMode) {
            this.debugCursor.setVisible(false);
            this.debugPing.setVisible(false);
        };
    };

    //toggle console logging
    toggleDebugMode() {

        //off
        if (debugMode) { 
            console.log(utility.timestampString('[DEBUG MODE: OFF]'));
            debugMode = false;

            this.debugCursor.setVisible(false);
            this.debugPing.setVisible(false);
        }

        //on
        else if (!debugMode) {
            console.log(utility.timestampString('[DEBUG MODE: ON]'));
            debugMode = true;

            this.debugCursor.setVisible(true);
            this.debugPing.setVisible(true);
        };
    };

    //update ping text
    newPing(latency) {
        if (debugMode) {
            this.debugPing.text = 'Ping: ' + latency + 'ms';
            console.log(utility.timestampString('Ping: ' + latency + 'ms'));
        };
    };
};