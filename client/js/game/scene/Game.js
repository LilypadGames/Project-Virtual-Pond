// Game Scene

class Game extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'Game' });
    }

    init(room) {
        //global variables
        globalUI.init(this);

        //set room
        this.room = room;

        //world
        this.walkableLayer = undefined;
        this.unWalkableLayer = [];
        this.teleportList = [];
        this.DOMElements = [];

        //depth
        this.depthForeground = 100000;
        this.depthGround = 1;
        this.depthBackground = 0;

        //audio
        this.defaultMusicSettings = {
            mute: false,
            volume: 0,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        };
        this.defaultAmbienceSettings = {
            mute: false,
            volume: 0,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        };

        //chat log
        this.chatLog = [];
        this.chatLogUI = undefined;
        this.chatLogUIHeight = 250;
        this.chatLogPanel;

        //player variables
        this.playerCharacter = {};
        this.playerData = [];

        //object variables
        this.npcCharacter = [];
        this.npcData = [];
        this.npcList = [];

        //UI
        this.overlayPadding = 8;
        this.nametagFontSize = 14;
        this.nametagClientConfig = {
            fontFamily: 'Burbin',
            color: utility.hexIntegerToString(ColorScheme.White),
            stroke: utility.hexIntegerToString(ColorScheme.Black),
            strokeThickness: 6,
        };
        this.nametagConfig = {
            fontFamily: 'Burbin',
            color: utility.hexIntegerToString(ColorScheme.Black),
        };
        this.messageFontSize = 18;
        this.messageConfig = {
            fontFamily: 'Arial',
            color: utility.hexIntegerToString(ColorScheme.Black),
            lineSpacing: 2,
            align: 'center',
            padding: { left: 8, right: 8, top: 6, bottom: 6 },
            wordWrap: { width: 250 },
        };
        this.messageMaxLength = 80;
        this.disableInput = false;
        this.menuOpen = false;
    }

    // LOGIC
    preload() {
        //loading screen
        loadingScreen.runLoadingScreen(this);

        //preload global UI
        globalUI.preload(this);

        //set to asset path
        this.load.setPath('assets/');

        //character
        this.load.image('frog_body', 'character/player/body/0.5x/Tintable.png');
        this.load.image(
            'frog_belly',
            'character/player/body/0.5x/Non-Tintable.png'
        );
        this.load.image('frog_eyes_0', 'character/player/eyes/0.5x/Eyes_0.png');
        this.load.image('frog_eyes_1', 'character/player/eyes/0.5x/Eyes_1.png');
        this.load.image('frog_eyes_2', 'character/player/eyes/0.5x/Eyes_2.png');
        this.load.image('frog_eyes_3', 'character/player/eyes/0.5x/Eyes_3.png');

        //load room assets
        this.preloadRoomData(this.room);
    }

    create() {
        //create global UI
        globalUI.create(this);

        //wait screen
        loadingScreen.runWaitScreen(this);

        //register sfxs
        if (this.room === 'forest') {
            this.sfxRadioClick = this.sound.add('radio_click', { volume: 0 });
            this.sfxRadioClick.setVolume(
                utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                ].volume
            );
            this.audioLostRecording = this.sound.add('lost_recording', {
                volume: 1,
            });
        }

        //detect when window is re-focused
        this.game.events.on(Phaser.Core.Events.FOCUS, this.onFocus, this);

        //chat box inputs
        this.input.keyboard.on(
            'keydown-' + 'ENTER',
            () => {
                if (!this.chatBox.isFocused) {
                    this.chatBox.setFocus();
                }
            },
            this
        );
        this.input.keyboard.on(
            'keydown-' + 'ESC',
            () => {
                if (this.chatBox.isFocused) this.chatBox.setBlur();
            },
            this
        );

        //player direction inputs
        this.input.keyboard.on(
            'keydown-' + 'D',
            () => {
                if (!this.chatBox.isFocused)
                    this.onDirectionChangeAttempt('right');
            },
            this
        );
        this.input.keyboard.on(
            'keydown-' + 'RIGHT',
            () => {
                if (!this.chatBox.isFocused)
                    this.onDirectionChangeAttempt('right');
            },
            this
        );
        this.input.keyboard.on(
            'keydown-' + 'A',
            () => {
                if (!this.chatBox.isFocused)
                    this.onDirectionChangeAttempt('left');
            },
            this
        );
        this.input.keyboard.on(
            'keydown-' + 'LEFT',
            () => {
                if (!this.chatBox.isFocused)
                    this.onDirectionChangeAttempt('left');
            },
            this
        );

        //add room layers
        this.addRoomLayers(this.room);

        //add room objects
        this.addRoomObjects(this.room);

        //add room ambience
        this.addRoomAmbience(this.room);

        //add room music
        this.addRoomMusic(this.room);

        //add room NPCs
        this.addRoomNPCs(this.room);

        //add room teleports
        this.addRoomTeleports(this.room);

        //tell server that the client has joined this room and recieve information such as currently connected players to this room
        client.joinRoom(this.room);

        //add toolbar
        this.createToolbar();

        //add room DOM elements
        this.addRoomDOMElements(this.room);

        //welcome message
        var options = utility.getLocalStorage('gameValues');
        if (
            options[utility.getLocalStorageArrayIndex('gameValues', 'welcome')]
                .value !== welcomeMessageVersion
        ) {
            this.showWelcomeMessage();
            options[
                utility.getLocalStorageArrayIndex('gameValues', 'welcome')
            ].value = welcomeMessageVersion;
            utility.storeLocalStorageArray('gameValues', options);
        }
    }

    update() {
        //handle collisions between player and npc characters
        for (var i = 0; i < this.npcCharacter.length; i++) {
            Object.keys(this.playerCharacter).forEach((key) => {
                this.physics.world.collide(
                    this.playerCharacter[key],
                    this.npcCharacter[i],
                    () => {
                        //get player interact NPC data
                        let interactNPC = utility.getObject(
                            this.playerData,
                            key
                        ).interactNPC;

                        //if player is trying to interact with this NPC
                        if (interactNPC == i) {
                            //interact with NPC
                            this.interactNPC(key, i);

                            //log
                            if (debugMode)
                                console.log(
                                    utility.timestampString(
                                        'Interacted With NPC: ' + i
                                    )
                                );
                        }
                    }
                );
            });
        }

        //check if player attempts to teleport
        if (this.playerCharacter[clientID]) {
            for (var i = 0; i < this.teleportList.length; i++) {
                this.physics.world.collide(
                    this.playerCharacter[clientID],
                    this.teleportList[i]['teleport'],
                    () => {
                        //start new room scene
                        this.end();
                        client.requestRoom(this.teleportList[i]['room']);
                    }
                );
            }
        }

        //handle player character depth
        Object.keys(this.playerCharacter).forEach((key) => {
            this.playerCharacter[key].setDepth(this.playerCharacter[key].y);
        });
    }

    pause() {
        //remove DOM elements
        this.removeRoomDOMElements();
        this.chatBox.destroy();
    }

    end() {
        //remove DOM elements
        this.chatBox.destroy();

        //delete data
        this.playerCharacter = {};
        this.playerData = [];
        this.npcCharacter = [];
        this.npcData = [];

        //stop music
        if (this.audioMusic) this.audioMusic.stop();

        //stop ambience
        if (this.audioAmbience) this.audioAmbience.stop();

        //reset data
        this.registry.destroy();
        this.game.events.off(Phaser.Core.Events.FOCUS, this.onFocus, this);
        this.scene.stop();

        //leave game world
        client.leaveRoom();
    }

    // WORLD
    //preload room assets
    preloadRoomData(room) {
        //get room options
        let roomOptions = roomData.rooms[room].option;

        //options
        if (roomOptions) {
            if (roomOptions.chatLogUIHeight)
                this.chatLogUIHeight = roomOptions.chatLogUIHeight;
        }

        //get room assets
        let roomAssets = roomData.rooms[room].asset;

        //images
        if (roomAssets.image) {
            for (var i = 0; i < roomAssets.image.length; i++) {
                this.load.image(
                    roomAssets.image[i].name,
                    roomAssets.image[i].path
                );
            }
        }

        //audio
        if (roomAssets.audio) {
            for (var i = 0; i < roomAssets.audio.length; i++) {
                this.load.audio(
                    roomAssets.audio[i].name,
                    roomAssets.audio[i].path
                );
            }
        }
    }

    //add layers
    addRoomLayers(room) {
        //get room layer data
        let roomLayerData = roomData.rooms[room].layers;

        //set up layers
        for (var i = 0; i < roomLayerData.length; i++) {
            //layer image
            let layer = this.add.image(
                this.sys.game.canvas.width / 2,
                this.sys.game.canvas.height / 2,
                roomLayerData[i].name
            );

            //background layer
            if (roomLayerData[i].depth === 'background') {
                //set depth
                layer.setDepth(this.depthBackground);
            }

            //ground layer
            else if (roomLayerData[i].depth === 'ground') {
                //set depth
                layer.setDepth(this.depthGround);

                //set as walkable
                layer.setInteractive().on(
                    'pointerdown',
                    (pointer) => {
                        if (this.navigationCheck(pointer.x, pointer.y)) {
                            this.onMoveAttempt(pointer.x, pointer.y);
                        }
                    },
                    this
                );
                this.walkableLayer = roomLayerData[i].name;
            }

            //foreground layer
            else if (roomLayerData[i].depth === 'foreground') {
                //set depth
                layer.setDepth(this.depthForeground);

                //set as unwalkable
                this.unWalkableLayer.push(roomLayerData[i].name);
            }

            //other layer
            else if (Number.isFinite(roomLayerData[i].depth)) {
                //set depth
                layer.setDepth(roomLayerData[i].depth);

                //set as unwalkable
                this.unWalkableLayer.push(roomLayerData[i].name);
            }
        }
    }

    //add room DOM elements
    addRoomDOMElements() {
        if (this.room == 'theatre') {
            //element variable
            const chatEnabled =
                utility.getLocalStorage('gameValues')[
                    utility.getLocalStorageArrayIndex(
                        'gameValues',
                        'show_stream_chat'
                    )
                ].value;
            let chatTag = chatEnabled ? ' chat' : '';

            //create element
            const twitch_stream = this.add
                .dom(169, 70)
                .createFromHTML(
                    '<twitch-stream channel="pokelawls" height="420px" theme="dark"' +
                        chatTag +
                        '></twitch-stream>'
                );
            this.DOMElements.push(twitch_stream);
        }
    }

    //remove room DOM elements
    removeRoomDOMElements() {
        for (var i = 0; i < this.DOMElements.length; i++) {
            this.DOMElements[i].destroy();
        }
        this.DOMElements = [];
    }

    //add room objects
    addRoomObjects(room) {
        //forest
        if (room == 'forest') {
            //theatre sign
            let theatre_sign = this.add
                .image(148, 600, 'Sign_Theatre')
                .setDepth(600)
                .setOrigin(0.5, 1);

            //radio
            let radio = this.add
                .image(294, 625, 'Radio')
                .setDepth(649)
                .setInteractive();
            this.setInteractObject(radio);
            radio.on(
                'pointerdown',
                () => {
                    //play music
                    if (this.audioMusic.key === 'mask')
                        this.addRoomMusic(this.room);
                    else this.playMusic('mask');

                    //click sfx
                    this.sfxRadioClick.play();
                },
                this
            );

            //lost recording
            let lost_recording = this.add
                .image(1209, 621.2, 'Lost_Recording')
                .setDepth(655)
                .setInteractive();
            this.setInteractObject(lost_recording);
            lost_recording.on(
                'pointerdown',
                () => {
                    //play lost recording
                    this.audioLostRecording.play();

                    //click sfx
                    this.sfxRadioClick.play();
                },
                this
            );

            //find four table
            // let tableFindFour = this.add.image(906, 607, 'Table_FindFour')
            // .setDepth(600)
            // .setOrigin(0.5, 1)
            // .setInteractive();
            // this.setInteractObject(tableFindFour);
            // tableFindFour.on('pointerdown', () => {
            // }, this);

            //theatre
        } else if (room == 'theatre') {
            //forest sign
            let forest_sign = this.add
                .image(1236, 692, 'Sign_Forest')
                .setDepth(700)
                .setOrigin(0.5, 1);

            //free sub sign
            let free_sub_sign = this.add
                .image(204, 580, 'Sign_Free_Sub')
                .setDepth(528)
                .setOrigin(0.5, 1)
                .setInteractive();
            this.setInteractObject(free_sub_sign);
            free_sub_sign.on(
                'pointerdown',
                () => {
                    //stop interactions temporarily
                    free_sub_sign.disableInteractive();

                    //remove DOM objects
                    this.removeRoomDOMElements();

                    //play music
                    this.playMusic('crazyslickd');

                    //show sprite
                    const crazySlickdSprite = this.add
                        .image(630, 20, 'CrazySlickd')
                        .setDepth(this.depthForeground)
                        .setOrigin(0.5, 0)
                        .setScale(2);

                    //wait
                    setTimeout(() => {
                        //stop music
                        this.audioMusic.stop();

                        //remove sprite
                        crazySlickdSprite.destroy();

                        //re-enable DOM objects
                        if (!this.menuOpen) {
                            this.addRoomDOMElements();
                        }

                        //re-enable interactions
                        free_sub_sign.setInteractive();
                    }, 8000);
                },
                this
            );
        }
    }

    //add room teleports
    addRoomTeleports(room) {
        //get teleports data
        let roomTeleportData = roomData.rooms[room].teleports;

        //create teleport
        if (roomTeleportData) {
            for (var i = 0; i < roomTeleportData.length; i++) {
                //create collider
                var teleportCollider = this.add.sprite(
                    roomTeleportData[i].x,
                    roomTeleportData[i].y
                );
                teleportCollider.width = roomTeleportData[i].width;
                teleportCollider.height = roomTeleportData[i].height;
                this.physics.world.enable(teleportCollider);
                teleportCollider.body.setCollideWorldBounds(true);

                //add teleport to list
                const teleportObject = {
                    room: roomTeleportData[i].room,
                    teleport: teleportCollider,
                };
                this.teleportList.push(teleportObject);
            }
        }
    }

    //add room music
    addRoomMusic(room) {
        //get teleports data
        let music = roomData.rooms[room].option.music;

        //play music
        if (music) {
            this.playMusic(roomData.rooms[room].option.music);
        }
    }

    //add room music
    addRoomAmbience(room) {
        //get teleports data
        let ambience = roomData.rooms[room].option.ambience;

        //play ambience
        if (ambience) {
            this.playAmbience(roomData.rooms[room].option.ambience);
        }
    }

    //add room NPCs
    addRoomNPCs(room) {
        //get room NPCs
        let roomNPCs = roomData.rooms[room].npcs;

        if (roomNPCs) {
            //set NPC list
            this.npcList = roomNPCs;

            //add NPCs to game
            for (var i = 0; i < roomNPCs.length; i++) {
                this.addNewNPC(
                    roomNPCs[i].name,
                    roomNPCs[i].x,
                    roomNPCs[i].y,
                    roomNPCs[i].direction
                );
            }
        }
    }

    // UI
    //reload the world when window is re-focused
    onFocus() {
        client.requestAllPlayersInRoom();
    }

    //create outlines on hover
    setInteractObject(sprite) {
        sprite
            .on(
                'pointerover',
                function () {
                    //show outline
                    this.rexOutlineFX.add(sprite, {
                        thickness: 3,
                        outlineColor: ColorScheme.White,
                    });
                },
                this
            )
            .on(
                'pointerout',
                function () {
                    //remove outline
                    this.rexOutlineFX.remove(sprite);
                },
                this
            );
    }

    //show menu
    menuOpened(removeRoomDOMElements = true) {
        //disable input
        this.disableInput = true;
        this.menuOpen = true;

        //stop chatbox input
        this.chatBox.setBlur();

        //remove DOM elements temporarily
        if (removeRoomDOMElements) this.removeRoomDOMElements();
    }

    //close menu
    menuClosed(removeRoomDOMElements = true) {
        //enable input
        this.disableInput = false;
        this.menuOpen = false;

        //place DOM elements back
        if (removeRoomDOMElements) this.addRoomDOMElements();
    }

    //create chat box
    createChatBox() {
        return ui.createInputBox(this, {
            id: 'chat-box',
            x: this.sys.game.canvas.width / 2,
            y: this.sys.game.canvas.height - this.sys.game.canvas.height / 23,
            width: this.sys.game.canvas.width * 0.6,
            height: 30,
            placeholder: 'Say Yo...',
            background: {
                color: ColorScheme.White,
                radius: 15,
            },
            color: utility.hexIntegerToString(ColorScheme.Black),
            maxLength: this.messageMaxLength,
            depth: this.depthUI,
            onFocus: (inputBox) => {
                if (this.menuOpen) inputBox.setBlur();
            },
            onKeydown: (inputBox, event) => {
                if (event.key == 'Enter') {
                    //format message
                    const chatMessage = inputBox.text
                        .substr(0, this.messageMaxLength)
                        .trim()
                        .replace(/\s+/g, ' ');

                    //send the message to the server
                    if (chatMessage !== '' && chatMessage !== null) {
                        client.playerSendingMessage(chatMessage);
                    }

                    //leave chat bar
                    else {
                        inputBox.setBlur();
                    }

                    //clear chat box
                    inputBox.setText('');
                }
            },
        });
    }

    //create toolbar
    createToolbar() {
        //chat log button
        ui.createButtons(this, {
            x: 120,
            y: 765,
            align: 'left',
            fontSize: 18,
            buttons: [
                {
                    text: 'Chat Log',
                    background: { radius: 8 },
                    width: 230,
                    onClick: () => {
                        //chat log not showing
                        if (!this.chatLogUI) {
                            //show chat log
                            this.showChatLog();
                        } else {
                            //close chat log
                            this.chatLogUI.emit('modal.requestClose');
                        }
                    },
                },
            ],
        }).setDepth(this.depthUI);

        //mini buttons
        ui.createButtons(this, {
            x: 1185,
            y: 765,
            fontSize: 22,
            space: {
                item: 10,
            },
            buttons: [
                //news
                {
                    text: '📰',
                    background: { radius: 8 },
                    onClick: () => {
                        //check if menu is open
                        if (!this.menuOpen) {
                            //show news menu
                            this.showNews();
                        }
                    },
                },
                //character creator
                {
                    text: '🎨',
                    background: { radius: 8 },
                    onClick: () => {
                        //start character creator scene
                        this.end();
                        this.scene.start('CharacterCreator', this.room);
                    },
                },
                //options menu
                {
                    text: '⚙️',
                    background: { radius: 8 },
                    onClick: () => {
                        //check if menu is open
                        if (!this.menuOpen) {
                            //show options menu
                            this.showOptions();
                        }
                    },
                },
            ],
        })
            .setDepth(this.depthUI)
            .setOrigin(0, 0.5);

        //chat box
        this.chatBox = this.createChatBox();

        //theatre specific UI
        if (this.room === 'theatre') {
            //mini buttons
            ui.createButtons(this, {
                x: 1245,
                y: 30,
                fontSize: 22,
                space: {
                    item: 10,
                },
                buttons: [
                    //media share queue
                    {
                        text: '🎞️',
                        background: { radius: 8 },
                        onClick: () => {
                            //check if menu is open
                            if (!this.menuOpen) {
                                //show media share menu
                                this.showMediaShareMenu();
                            }
                        },
                    },
                ],
            })
                .setDepth(this.depthUI)
                .setOrigin(0, 0.5);
        }
    }

    //show intro message
    showWelcomeMessage() {
        //create welcome message prompt
        ui.createMenu(
            this,
            {
                title: 'Welcome!',
                content: [
                    {
                        type: 'text',
                        text: 'This game runs smoother with Hardware Acceleration enabled.',
                        fontSize: 20,
                    },
                    {
                        type: 'button',
                        text: 'Turn on Hardware Acceleration',
                        fontSize: 20,
                        onClick: () => {
                            window.open(
                                'https://www.webnots.com/what-is-hardware-acceleration-and-how-to-enable-in-browsers/',
                                '_blank'
                            );
                        },
                    },
                    {
                        type: 'text',
                        text: 'Find a bug or need support?',
                        fontSize: 20,
                    },
                    {
                        type: 'button',
                        text: 'Join the Discord',
                        fontSize: 20,
                        onClick: () => {
                            window.open(
                                'https://discord.gg/2aVq8qmcSr',
                                '_blank'
                            );
                        },
                    },
                    {
                        type: 'text',
                        text: 'This game is free. However, any donations of any amount\n would help a ton with my development and are very much appreciated!',
                        fontSize: 20,
                    },
                    {
                        type: 'button',
                        text: 'Donate',
                        fontSize: 20,
                        onClick: () => {
                            window.open(donationSite, '_blank');
                        },
                    },
                ],
            },
            {
                cover: true,
                onExit: () => {
                    //set menu as closed
                    this.menuClosed();
                },
            }
        );

        //set menu as opened
        this.menuOpened();
    }

    //show options menu
    showOptions() {
        //options content
        let content = [
            //music volume slider
            { type: 'text', text: 'Music Volume', fontSize: 24 },
            {
                type: 'slider',
                id: 'musicVolume',
                value: utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'music')
                ].volume,
                onSliderChange: (value) => {
                    //store locally for the user to persist changes between sessions
                    var options = utility.getLocalStorage('gameOptions');
                    options[
                        utility.getLocalStorageArrayIndex(
                            'gameOptions',
                            'music'
                        )
                    ].volume = value;
                    utility.storeLocalStorageArray('gameOptions', options);

                    //change volume
                    if (this.audioMusic) this.audioMusic.setVolume(value);
                },
            },

            //ambience volume slider
            { type: 'text', text: 'Ambience Volume', fontSize: 24 },
            {
                type: 'slider',
                id: 'ambienceVolume',
                value: utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'ambience')
                ].volume,
                onSliderChange: (value) => {
                    //store locally for the user to persist changes between sessions
                    var options = utility.getLocalStorage('gameOptions');
                    options[
                        utility.getLocalStorageArrayIndex(
                            'gameOptions',
                            'ambience'
                        )
                    ].volume = value;
                    utility.storeLocalStorageArray('gameOptions', options);

                    //change volume
                    if (this.audioAmbience) this.audioAmbience.setVolume(value);
                },
            },

            //sfx volume slider
            { type: 'text', text: 'Sound Effects Volume', fontSize: 24 },
            {
                type: 'slider',
                id: 'sfxVolume',
                value: utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                ].volume,
                onSliderChange: (value) => {
                    //store locally for the user to persist changes between sessions
                    var options = utility.getLocalStorage('gameOptions');
                    options[
                        utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                    ].volume = value;
                    utility.storeLocalStorageArray('gameOptions', options);

                    //change volume
                    if (this.sfxButtonClick)
                        this.sfxButtonClick.setVolume(value);
                    if (this.sfxRadioClick) this.sfxRadioClick.setVolume(value);
                },
            },
        ];

        //additional options per room
        if (this.room === 'theatre') {
            //get local game options
            var options = utility.getLocalStorage('gameValues');

            //stream chat toggle
            content.push(
                { type: 'text', text: 'Enable Stream Chat', fontSize: 24 },
                {
                    type: 'checkbox',
                    initialValue:
                        options[
                            utility.getLocalStorageArrayIndex(
                                'gameValues',
                                'show_stream_chat'
                            )
                        ].value,
                    onClick: (state) => {
                        //store new value
                        options[
                            utility.getLocalStorageArrayIndex(
                                'gameValues',
                                'show_stream_chat'
                            )
                        ].value = state;
                        utility.storeLocalStorageArray('gameValues', options);
                    },
                }
            );
        }

        //logout button
        content.push({
            type: 'button',
            text: 'Log Out',
            align: 'center',
            fontSize: 20,
            colorOnHover: ColorScheme.Red,
            onClick: () => {
                client.onLogout();
            },
        });

        //create options menu
        ui.createMenu(
            this,
            {
                title: 'Options',
                content: content,
            },
            {
                cover: true,
                onExit: () => {
                    //set menu as closed
                    this.menuClosed();
                },
            }
        );

        //set menu as opened
        this.menuOpened();
    }

    //show news menu
    showNews() {
        //combine news lines into one string separated by new lines
        const passage = news.join('\n__________________________\n\n');

        //create news menu
        ui.createMenu(
            this,
            {
                title: 'News',
                content: [
                    {
                        type: 'scrollable',
                        text: passage,
                        track: { color: ColorScheme.Blue },
                        thumb: { color: ColorScheme.LightBlue },
                    },
                ],
            },
            {
                height: 500,
                cover: true,
                onExit: () => {
                    //set menu as closed
                    this.menuClosed();
                },
            }
        );

        //set menu as opened
        this.menuOpened();
    }

    //show media share menu
    showMediaShareMenu() {
        //create news menu
        ui.createMenu(
            this,
            {
                title: 'Media Share',
                content: [
                    {
                        type: 'text',
                        text: 'Submit Media',
                        fontSize: 22,
                    },
                    {
                        type: 'inputBox',
                        id: 'media-share-box',
                        width: 400,
                        height: 30,
                        placeholder: 'URL...',
                        background: {
                            color: ColorScheme.White,
                            radius: 15,
                        },
                        color: '#000000',
                        maxLength: this.messageMaxLength,
                        depth: this.depthUI,
                        // onFocus: (inputBox) => {
                        //     if (this.menuOpen) inputBox.setBlur();
                        // },
                        onKeydown: (inputBox, event) => {
                            if (event.key == 'Enter') {
                                //format media submission
                                const mediaSubmission = inputBox.text
                                    .substr(0, this.messageMaxLength)
                                    .trim()
                                    .replace(/\s+/g, ' ');

                                // //send the message to the server
                                // if (mediaSubmission !== '' && mediaSubmission !== null) {
                                //     client.playerSendingMessage(mediaSubmission);
                                // }

                                // //leave chat bar
                                // else {
                                //     inputBox.setBlur();
                                // }

                                //clear chat box
                                inputBox.setText('');
                            }
                        },
                    },
                    {
                        type: 'buttons',
                        align: 'center',
                        fontSize: 20,
                        buttons: [
                            {
                                text: 'Vote Skip',
                                align: 'left',
                                onClick: () => {
                                    console.log('skip');
                                },
                            },
                            {
                                text: 'View Queue',
                                align: 'left',
                                onClick: () => {
                                    console.log('view queue');
                                },
                            },
                        ],
                    },
                    // {
                    //     type: 'text',
                    //     text: 'Dim the Lights',
                    //     fontSize: 22,
                    // },
                    // {
                    //     type: 'checkbox',
                    //     initialValue: false,
                    //     onClick: (state) => {
                    //         console.log(state);
                    //     },
                    // }
                ],
            },
            {
                y: 635,
                draggable: false,
                onExit: () => {
                    //set menu as closed (do not add DOM elements)
                    this.menuClosed(false);
                },
            }
        );

        //set menu as opened (do not remove DOM elements)
        this.menuOpened(false);
    }

    //set room chat log from server
    setChatLog(log) {
        //format chat log
        for (const key in log) {
            var line = log[key].userName + ': ' + log[key].message;
            this.chatLog.push(line);
        }

        this.updateChatLog();
    }

    //update chat log
    updateChatLog() {
        //if chat log currently showing
        if (this.chatLogUI) {
            //get current scroll position
            const scrollPosition = this.chatLogPanel.t;

            //delete old chat log
            this.chatLogUI.destroy();

            //show updated chat log
            this.showChatLog(0, scrollPosition);
        }
    }

    //show chat log
    showChatLog(animationIn = 200, scrollPosition = 1) {
        //combine chat log into one string seperated by new line
        const log = this.chatLog.join('\n');

        //show chat log
        var chatLogSizer = ui.createSizer(
            this,
            {
                content: [
                    {
                        type: 'scrollable',
                        width: 550,
                        height: this.chatLogUIHeight,
                        text: log,
                        position: 0,
                        track: { color: ColorScheme.Blue },
                        thumb: { color: ColorScheme.LightBlue },
                        space: {
                            top: 0,
                            bottom: 0,
                            left: 0,
                            right: 0,
                            item: 0,
                            line: 0,
                        },
                    },
                    // {
                    //     type: 'buttons',
                    //     align: 'center',
                    //     fontSize: 14,
                    //     buttons: [
                    //         {
                    //             text: 'Global',
                    //             align: 'left',
                    //             onClick: () => {
                    //                 console.log('global');
                    //             },
                    //         },
                    //         {
                    //             text: 'Local',
                    //             align: 'left',
                    //             onClick: () => {
                    //                 console.log('local');
                    //             },
                    //         },
                    //     ],
                    // },
                ],
            },
            {
                x: 5,
                y: 740,
                background: { transparency: 0.5 },
                space: { top: 0, bottom: 0, left: 0, right: 0, item: 0 },
            }
        );
        this.chatLogUI = chatLogSizer[0];
        this.chatLogPanel = chatLogSizer[1];

        //arrange UI
        this.chatLogUI.setOrigin(0, 1);
        this.chatLogUI.layout();

        //set scroll position
        this.chatLogPanel.setT(scrollPosition);

        //close promise + animation
        this.rexUI.modalPromise(
            //assign chat log to promise
            this.chatLogUI,

            //options
            {
                cover: false,
                duration: {
                    in: animationIn,
                    out: 200,
                },
            }
        );

        //on close
        this.chatLogUI.on(
            'modal.close',
            function () {
                //clear chatLogUI
                this.chatLogUI = undefined;
                this.chatLogPanel = undefined;
            },
            this
        );
    }

    // INPUT
    //on mouse down
    onMoveAttempt(x, y) {
        //if clicking is disabled, cancel
        if (this.disableInput) return;

        // un-focus chatbox
        if (this.chatBox.isFocused) this.chatBox.setBlur();

        //move client player
        this.movePlayer(clientID, x, y);

        //tell the server that this player is moving
        client.playerMoved(x, y, this.getPlayerDirection(clientID));
    }

    //on mouse down
    onDirectionChangeAttempt(direction) {
        //if clicking is disabled, cancel
        if (this.disableInput) return;

        //if direction didnt change, cancel
        if (direction === this.getPlayerDirection(clientID)) return;

        //if client player is moving, halt player
        try {
            if (utility.getObject(this.playerData, clientID).movement)
                this.haltPlayer(clientID);
        } catch (error) {
            console.log(
                '\x1b[31m%s\x1b[0m',
                'Game.js onDirectionChangeAttempt - ' + error
            );
            return;
        }

        //change client player direction
        this.setPlayerDirection(clientID, direction);

        //tell the server that this player is changing direction
        client.playerChangedDirection(
            direction,
            this.playerCharacter[clientID].x,
            this.playerCharacter[clientID].y
        );
    }

    //check if click location is allowed by navigational map (returns true if click location is allowed by navigation map and false otherwise)
    navigationCheck(x, y, layer) {
        //if clicking is not disabled
        if (!this.disableInput) {
            //if layer is specified, ignore everything else and only check for this layers navigational map
            if (layer) {
                if (this.textures.getPixelAlpha(x, y, layer) == 255) {
                    return true;
                }
            }

            //check if click is on an unwalkable layer
            else {
                for (let i = 0; i < this.unWalkableLayer.length; i++) {
                    if (
                        this.textures.getPixelAlpha(
                            x,
                            y,
                            this.unWalkableLayer[i]
                        ) == 255
                    ) {
                        return false;
                    }
                }
            }

            //if layer wasn't specified and click wasnt on an unwalkable layer, then check the walkable layer
            if (
                layer !== this.walkableLayer &&
                this.textures.getPixelAlpha(x, y, this.walkableLayer) == 255
            ) {
                return true;
            }

            return false;
        }

        return false;
    }

    // AUDIO
    //play music
    playMusic(song) {
        //stop currently playing music
        if (this.audioMusic)
            if (this.audioMusic.isPlaying) this.audioMusic.stop();

        //set
        this.audioMusic = this.sound.add(song, this.defaultMusicSettings);

        //start music and set volume from localStorage settings
        this.audioMusic.setVolume(
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'music')
            ].volume
        );
        this.audioMusic.play();
        this.sound.pauseOnBlur = false;
    }

    //play ambience
    playAmbience(song) {
        //stop currently playing ambience
        if (this.audioAmbience)
            if (this.audioAmbience.isPlaying) this.audioAmbience.stop();

        //set
        this.audioAmbience = this.sound.add(song, this.defaultAmbienceSettings);

        //start ambience and set volume from localStorage settings
        this.audioAmbience.setVolume(
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'ambience')
            ].volume
        );
        this.audioAmbience.play();
        this.sound.pauseOnBlur = false;
    }

    // PLAYER/NPC
    //add player character to game at specific coordinates
    addNewPlayer(data) {
        //save player data
        utility.getObject(this.playerData, data.id).name = data.name;

        //player character
        var playerBody = this.add.sprite(0, 0, 'frog_body').setOrigin(0.5, 1);
        var playerBelly = this.add.sprite(0, 0, 'frog_belly').setOrigin(0.5, 1);
        var playerEyes = this.add
            .sprite(0, 0, 'frog_eyes_' + data.character.eye_type)
            .setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width,
            height: playerBody.height,
        };

        //player name
        var nametagConfig;
        if (data.id == clientID) {
            nametagConfig = this.nametagClientConfig;
        } else {
            nametagConfig = this.nametagConfig;
        }
        var playerName = this.add
            .text(0, spriteContainer.height, data.name, nametagConfig)
            .setFontSize(this.nametagFontSize)
            .setOrigin(0.5, 1);

        //create player container
        this.playerCharacter[data.id] = this.add
            .container(data.x, data.y)
            .setSize(spriteContainer.width, spriteContainer.height);

        //create player sprite container
        this.playerCharacter[data.id].add(
            this.add
                .container(0, 0)
                .setSize(spriteContainer.width, spriteContainer.height)
        );

        //add player sprites to player sprite container
        this.playerCharacter[data.id].list[0].add([
            playerBody,
            playerBelly,
            playerEyes,
        ]);

        //create player overlay container
        this.playerCharacter[data.id].add(
            this.add
                .container(0, (spriteContainer.height / 2) * -1)
                .setSize(spriteContainer.width, spriteContainer.height)
        );

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
    }

    //move player character to specific coordinates
    movePlayer(id, x, y) {
        //update player direction
        this.updatePlayerDirection(id, x, y);

        //get player's character
        var player = this.playerCharacter[id];

        //cancel if player not found
        if (!player) {
            return;
        }

        //move player (and store it for alteration later)
        try {
            //stop current movement
            if (utility.getObject(this.playerData, id).movement)
                utility.getObject(this.playerData, id).movement.stop();

            //new movement
            utility.getObject(this.playerData, id).movement = this.add.tween({
                targets: player,
                x: x,
                y: y,
                duration:
                    Phaser.Math.Distance.Between(player.x, player.y, x, y) * 4,
            });
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', 'Game.js movePlayer - ' + error);
        }
    }

    //stop a player's movement
    haltPlayer(
        id,
        newX = this.playerCharacter[id].x,
        newY = this.playerCharacter[id].y
    ) {
        //stop movement
        try {
            if (utility.getObject(this.playerData, id).movement)
                utility.getObject(this.playerData, id).movement.stop();
        } catch (error) {
            console.log('\x1b[31m%s\x1b[0m', 'Game.js haltPlayer - ' + error);
            return;
        }

        //sync check
        if (
            newX != this.playerCharacter[id].x ||
            newY != this.playerCharacter[id].y
        ) {
            this.updatePlayer({ id: id, x: newX, y: newY });
        }
    }

    //change a players movement location
    changePlayerMovement(id, newX, newY, newDirection) {
        //get player's character
        var player = this.playerCharacter[id];

        //cancel if player not found
        if (!player) {
            return;
        }

        //get duration of movement
        var newDuration =
            Phaser.Math.Distance.Between(player.x, player.y, newX, newY) * 5;

        //change x
        utility
            .getObject(this.playerData, id)
            .movement.updateTo('x', newX, true);

        //change y
        utility
            .getObject(this.playerData, id)
            .movement.updateTo('y', newY, true);

        //change duration
        utility
            .getObject(this.playerData, id)
            .movement.updateTo('duration', newDuration, true);

        //change direction
        if (newDirection) {
            this.setPlayerDirection(id, newDirection);
        }
    }

    //place a player at a specific coordinate
    updatePlayer(data) {
        //get player container
        var player = this.playerCharacter[data.id];

        //place x
        if (data.x) {
            player.x = data.x;
        }

        //place y
        if (data.y) {
            player.y = data.y;
        }

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
            }

            //eye type
            if (data.character.eye_type) {
                //get player eyes sprite
                var playerEyes = this.playerCharacter[data.id].list[0].list[2];

                //update eye type
                playerEyes.setTexture('frog_eyes_' + data.character.eye_type);
            }
        }

        //message
        if (data.message) {
            //show message
            this.showMessage(data.id, data.message);
        } else if (utility.getObject(this.playerData, data.id).message) {
            //remove message
            this.removeMessage(
                data.id,
                utility.getObject(this.playerData, data.id).message.id
            );
        }
    }

    //get players current direction
    getPlayerDirection(id) {
        //get player sprite container
        var playerSprites = this.playerCharacter[id].list[0];

        //player character is facing right
        if (playerSprites.scaleX > 0) {
            return 'right';
        }

        //player character is facing left
        else if (playerSprites.scaleX < 0) {
            return 'left';
        }
    }

    //update a players look direction
    updatePlayerDirection(id, newX, newY) {
        //get player container
        var player = this.playerCharacter[id];

        //cancel if player not found
        if (!player) {
            return;
        }

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
        var targetRad = Phaser.Math.Angle.Between(
            currentX,
            currentY,
            newX,
            newY
        );
        var targetDegrees = Phaser.Math.RadToDeg(targetRad);

        //moving right
        if (targetDegrees > -90 && targetDegrees < 90) {
            newDirection = 'right';
        }

        //moving left
        else if (targetDegrees > 90 || targetDegrees < -90) {
            newDirection = 'left';
        }

        //look direction changed
        if (
            (newDirection === 'right' && currentDirection === 'left') ||
            (newDirection === 'left' && currentDirection === 'right')
        ) {
            playerSprites.scaleX *= -1;
        }
    }

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
        }
    }

    //adds NPC character to the game
    addNewNPC(name, x, y, direction = 'right') {
        //get ID
        let id = 0 + this.npcCharacter.length;

        //set npc sprite
        var npcSprite = this.add.sprite(0, 0, name).setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: npcSprite.width,
            height: npcSprite.height,
        };

        //offset sprite
        npcSprite.setY(spriteContainer.height / 2);

        //npc name
        var npcName = this.add
            .text(0, spriteContainer.height, name, this.nametagConfig)
            .setFontSize(this.nametagFontSize)
            .setOrigin(0.5, 1);

        //create npc container
        this.npcCharacter[id] = this.add
            .container(x, y)
            .setSize(spriteContainer.width, spriteContainer.height);

        //create npc sprite container
        this.npcCharacter[id].add(
            this.add
                .container(0, 0)
                .setSize(spriteContainer.width, spriteContainer.height)
        );

        //add npc sprites to npc sprite container
        this.npcCharacter[id].list[0].add([npcSprite]);

        //detect clicks
        this.npcCharacter[id].list[0].setInteractive().on(
            'pointerup',
            (pointer) => {
                if (this.navigationCheck(pointer.x, pointer.y)) {
                    //set player as interacting with this NPC
                    utility.getObject(this.playerData, clientID).interactNPC =
                        id;

                    //tell server that the player is interacting with an NPC
                    client.playerInteractingWithNPC(id);

                    //player moving
                    this.onMoveAttempt(
                        // this.input.mousePointer.worldX,
                        // this.input.mousePointer.worldY
                        pointer.x,
                        pointer.y
                    );
                }
            },
            this
        );

        //add hover outline to npc sprite
        this.setInteractObject(this.npcCharacter[id].list[0]);

        //create npc overlay container
        this.npcCharacter[id].add(
            this.add
                .container(0, 0)
                .setSize(spriteContainer.width, spriteContainer.height)
        );

        //add npc name to npc overlay container
        this.npcCharacter[id].list[1].add([npcName]);

        //set direction of NPC
        if (direction === 'left') {
            this.npcCharacter[id].list[0].list[0].scaleX *= -1;
        }

        //enable physics on npc character
        this.physics.world.enable(this.npcCharacter[id]);
        this.npcCharacter[id].body.setCollideWorldBounds(true);

        //set depth
        this.npcCharacter[id].setDepth(y);
    }

    //player interacts/collides with NPC
    interactNPC(playerID, npcID) {
        //reset interactNPC player data
        delete utility.getObject(this.playerData, playerID).interactNPC;

        //stop player when colliding with npc
        this.haltPlayer(
            playerID,
            this.playerCharacter[playerID].x,
            this.playerCharacter[playerID].y
        );

        //show message if client interacted with NPC
        if (playerID == clientID)
            this.showMessage(
                npcID,
                {
                    id: Date.now(),
                    text: utility.randomFromArray(this.npcList[npcID].lines),
                    endTime: Date.now() + 5000,
                },
                'npc'
            );
    }

    //remove player character from game
    removePlayer(id) {
        //remove player character
        if (this.playerCharacter[id]) {
            this.playerCharacter[id].destroy();
            delete this.playerCharacter[id];
        }

        //remove player data
        this.playerData = utility.removeObject(this.playerData, id);
    }

    // MESSAGES
    //store message in chat log
    logMessage(id, message) {
        //store message in chat log
        this.chatLog.push(
            utility.getObject(this.playerData, id).name + ': ' + message
        );

        //delete older entries if over max
        if (this.chatLog.length > 30) {
            this.chatLog.splice(0, 1);
        }

        //update chat log
        this.updateChatLog();
    }

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
        }

        //format message
        var messageFormatted = this.add
            .text(0, 0, messageData.text, this.messageConfig)
            .setFontSize(this.messageFontSize)
            .setOrigin(0.5, 0);

        //remove older messages
        if (overlayContainer.list[1]) {
            overlayContainer.list[1].setVisible(false);
        }
        if (overlayContainer.list[2]) {
            overlayContainer.list[2].destroy();
        }

        //calculate size of message
        var messageWidth = (messageFormatted.width / 2) * -1;
        var messageHeight =
            messageFormatted.height * -1 -
            (spriteContainer.height / 2 + this.overlayPadding);

        //reposition text
        messageFormatted.setY(messageHeight);

        //create background for message
        var backgroundFormatted = this.add
            .graphics()
            .fillStyle(ColorScheme.White, 0.8)
            .fillRoundedRect(
                messageWidth,
                messageHeight,
                messageFormatted.width,
                messageFormatted.height,
                8
            )
            .lineStyle(1, ColorScheme.LightGray, 1)
            .strokeRoundedRect(
                messageWidth,
                messageHeight,
                messageFormatted.width,
                messageFormatted.height,
                8
            );

        //add message to player overlay container
        overlayContainer.addAt([backgroundFormatted], 1);
        overlayContainer.addAt([messageFormatted], 2);

        //make sure message is visible
        overlayContainer.list[1].setVisible(true);

        //schedule NPCs messages for removal
        if (characterType === 'npc') {
            this.time.delayedCall(
                5000,
                this.removeMessage,
                [id, messageData.id, characterType],
                this
            );
        }
    }

    //remove player message
    removeMessage(id, queuedID, characterType = 'player') {
        //init message ID
        var currentID;

        //player message
        if (characterType === 'player') {
            //check if player is still connected to the current scene
            if (!this.playerCharacter[id]) return;

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
            currentID = utility.getObject(this.npcData, id).message.id;
        }

        //check if the message queued for removal is the same as the characters current message shown
        if (queuedID === currentID) {
            //reset chat data
            if (characterType === 'player') {
                delete utility.getObject(this.playerData, id).message;
            } else if (characterType === 'npc') {
                delete utility.getObject(this.npcData, id).message;
            }

            //remove message from player character
            overlayContainer.list[1].setVisible(false);
            overlayContainer.list[2].destroy();
        } else {
            return;
        }
    }
}
