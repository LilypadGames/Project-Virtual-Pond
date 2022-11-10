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
        this.depthBackground = 0;
        this.depthGround = 1;
        this.depthForeground = 100000;
        this.depthShader = 100001;

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

        //player variables
        this.playerCharacter = {};
        this.playerData = [];

        //object variables
        this.interactableObjects = [];
        this.interactableObjectFunction = [];
        this.npcData = [];
        this.npcList = {};

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

        //preload events data
        events.preload(this);

        //set to asset path
        this.load.setPath('assets/');

        //load character body
        this.load.image('frog_body', 'character/player/body/0.5x/Tintable.png');
        this.load.image(
            'frog_belly',
            'character/player/body/0.5x/Non-Tintable.png'
        );

        //load character eyes
        let eyesData = itemData.eyes;
        for (var i = 0; i < eyesData.length; i++) {
            this.load.image(
                'frog_eyes_' + eyesData[i].id,
                'character/player/eyes/0.5x/' + eyesData[i].id + '.png'
            );
        }

        //load character accessories
        let accessoryData = itemData.accessories;
        for (var i = 0; i < accessoryData.length; i++) {
            this.load.image(
                'accessories_' + accessoryData[i].id,
                'character/player/accessories/0.5x/' +
                    accessoryData[i].id +
                    '.png'
            );
        }

        //load room assets
        this.preloadRoom(this.room);
    }

    async create() {
        //wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //register sfxs
        if (this.room === 'forest') {
            this.sfxRadioClick = this.sound.add('radio_click', { volume: 0 });
            this.sfxRadioClick.setVolume(
                utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                ].volume
            );
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

        //build the room
        this.buildRoom(this.room);

        //add toolbar
        this.createToolbar();

        //welcome message
        var options = utility.getLocalStorage('gameValues');
        if (
            options[utility.getLocalStorageArrayIndex('gameValues', 'welcome')]
                .value !== GameConfig.welcomeMessageVersion
        ) {
            this.showWelcomeMessage();
            options[
                utility.getLocalStorageArrayIndex('gameValues', 'welcome')
            ].value = GameConfig.welcomeMessageVersion;
            utility.storeLocalStorageArray('gameValues', options);
        }

        //tell server that the client has joined this room and receive information such as currently connected players to this room
        let roomData = await client.joinRoom(this.room);

        //add connected players into room
        for (var i = 0; i < roomData['players'].length; i++) {
            currentScene.addNewPlayer(roomData['players'][i]);
        }

        //set chat log of this room
        currentScene.setChatLog(roomData['chatLog']);

        //end wait screen
        loadingScreen.endWaitScreen(currentScene);

        //add room DOM elements
        this.addRoomDOMElements(this.room);
    }

    update() {
        //handle all players
        Object.keys(this.playerCharacter).forEach((playerID) => {
            //handle collisions between this player and all interactable objects
            for (
                var objectID = 0;
                objectID < this.interactableObjects.length;
                objectID++
            ) {
                //check this interactable object and the player for a collision
                this.physics.world.collide(
                    this.playerCharacter[playerID],
                    this.interactableObjects[objectID],
                    () => {
                        //get object player last clicked
                        let attemptedObjectInteract = utility.getObject(
                            this.playerData,
                            playerID
                        ).attemptedObjectInteract;

                        //if player is trying to interact with this object
                        if (attemptedObjectInteract === objectID) {
                            //reset attemptedObjectInteract player data
                            delete utility.getObject(this.playerData, playerID)
                                .attemptedObjectInteract;

                            //stop player when colliding with interactable object
                            this.haltPlayer(
                                playerID,
                                this.playerCharacter[playerID].x,
                                this.playerCharacter[playerID].y
                            );

                            //run interactable objects function
                            if (this.interactableObjectFunction[objectID])
                                this.interactableObjectFunction[objectID](
                                    objectID,
                                    playerID
                                );

                            //log
                            if (debugMode)
                                console.log(
                                    utility.timestampString(
                                        'Interacted With Object: ' + objectID
                                    )
                                );
                        }
                    }
                );
            }

            //existence check
            if (!this.playerCharacter[playerID]) return;

            //handle player character depth
            this.playerCharacter[playerID].setDepth(
                this.playerCharacter[playerID].y
            );

            //existence check
            if (!this.playerCharacter[playerID]) return;

            //handle client player only
            if (playerID === clientID) {
                //handle collision between this client player and all teleporters in room
                for (
                    var teleporterID = 0;
                    teleporterID < this.teleportList.length;
                    teleporterID++
                ) {
                    //check for collision between the teleporter and the client player
                    this.physics.world.collide(
                        this.playerCharacter[playerID],
                        this.teleportList[teleporterID]['teleport'],
                        () => {
                            //start new room scene
                            this.end();
                            client.requestRoom(
                                this.teleportList[teleporterID]['room']
                            );
                        }
                    );
                }
            }
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
        this.interactableObjects = [];
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
    preloadRoom(room) {
        GameConfig.preloadRoom(this, room, {
            texture: {
                name: '',
                path: '',
                add: function (name, path) {
                    this.name = name;
                    this.path = path;
                    return this;
                },
                in: function (instance) {
                    instance.load.image(this.name, this.path);
                },
            },
            audio: {
                name: '',
                path: '',
                add: function (name, path) {
                    this.name = name;
                    this.path = path;
                    return this;
                },
                in: function (instance) {
                    instance.load.audio(this.name, this.path);
                },
            },
        });
    }

    //build room
    buildRoom(room) {
        GameConfig.buildRoom(this, room, {
            option: {
                chatLogSize: {
                    value: 250,
                    set: function (size) {
                        this.value = size;
                        return this;
                    },
                    in: function (instance) {
                        instance.chatLogUIHeight = this.value;
                    },
                },
                music: {
                    value: '',
                    set: function (music) {
                        this.value = music;
                        return this;
                    },
                    in: function (instance) {
                        instance.playMusic(this.value);
                    },
                },
                ambience: {
                    value: '',
                    set: function (ambience) {
                        this.value = ambience;
                        return this;
                    },
                    in: function (instance) {
                        instance.playAmbience(this.value);
                    },
                },
            },
            layer: {
                name: '',
                depth: undefined,
                add: function (name, depth) {
                    this.name = name;
                    this.depth = depth;
                    return this;
                },
                in: function (instance) {
                    //create layer
                    let layerObject = instance.add.image(
                        instance.sys.game.canvas.width / 2,
                        instance.sys.game.canvas.height / 2,
                        this.name
                    );

                    //background layer
                    if (this.depth === 'background') {
                        //set depth
                        layerObject.setDepth(instance.depthBackground);
                    }
                    //ground layer
                    else if (this.depth === 'ground') {
                        //set depth
                        layerObject.setDepth(instance.depthGround);

                        //set as walkable
                        instance.walkableLayer = this.name;

                        //walkable functionality
                        layerObject.setInteractive().on(
                            'pointerdown',
                            (pointer) => {
                                if (
                                    instance.navigationCheck(
                                        pointer.x,
                                        pointer.y
                                    )
                                ) {
                                    instance.onMoveAttempt(
                                        pointer.x,
                                        pointer.y
                                    );
                                }
                            },
                            instance
                        );
                    }
                    //foreground layer
                    else if (this.depth === 'foreground') {
                        //set depth
                        layerObject.setDepth(instance.depthForeground);

                        //set as unwalkable
                        instance.unWalkableLayer.push(this.name);
                    }
                    //shader layer
                    else if (this.depth === 'shader') {
                        //set depth
                        layerObject.setDepth(instance.depthShader);
                    }
                    //other layer
                    else if (Number.isFinite(this.depth)) {
                        //set depth
                        layerObject.setDepth(this.depth);

                        //set as unwalkable
                        instance.unWalkableLayer.push(this.name);
                    }
                },
            },
            teleport: {
                roomName: '',
                x: undefined,
                y: undefined,
                width: undefined,
                height: undefined,
                room: function (name) {
                    this.roomName = name;
                    return this;
                },
                location: function (x, y) {
                    this.x = x;
                    this.y = y;
                    return this;
                },
                size: function (width, height) {
                    this.width = width;
                    this.height = height;
                    return this;
                },
                in: function (instance) {
                    //create collider at position
                    let collider = instance.add.sprite(this.x, this.y);

                    //set collider size
                    collider.width = this.width;
                    collider.height = this.height;

                    //enable collisions
                    instance.physics.world.enable(collider);
                    collider.body.setCollideWorldBounds(true);

                    //add to list of teleporters
                    instance.teleportList.push({
                        room: this.roomName,
                        teleport: collider,
                    });
                },
            },
            object: {
                interactable: {
                    objectName: undefined,
                    x: undefined,
                    y: undefined,
                    depthValue: undefined,
                    interactionCallback: undefined,
                    name: function (name) {
                        this.objectName = name;
                        return this;
                    },
                    location: function (x, y) {
                        this.x = x;
                        this.y = y;
                        return this;
                    },
                    depth: function (depth) {
                        this.depthValue = depth;
                        return this;
                    },
                    onInteraction: function (callback) {
                        this.interactionCallback = callback;
                        return this;
                    },
                    in: function (instance) {
                        instance.addNewInteractableObject(
                            //set up object
                            (id) => {
                                //create sprite
                                instance.interactableObjects[id] = instance.add
                                    .image(this.x, this.y, this.objectName)
                                    .setDepth(this.depthValue);
                            },

                            //set physics object
                            (id) => {
                                return instance.interactableObjects[id];
                            },

                            //set interactable sprite
                            (id) => {
                                return instance.interactableObjects[id];
                            },

                            //final interaction callback
                            this.interactionCallback
                        );
                    },
                },
            },
        });
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

    //add room NPCs
    addRoomNPCs(room) {
        // //get room NPCs
        // let roomNPCs = roomData[room].npcs;
        // if (roomNPCs) {
        //     //set NPC list
        //     this.npcList = roomNPCs;
        //     //add NPCs to game
        //     for (let name of Object.keys(roomNPCs)) {
        //         //disabled?
        //         if (roomNPCs[name].disabled) continue;
        //         this.addNewNPC(
        //             name,
        //             roomNPCs[name].x,
        //             roomNPCs[name].y,
        //             roomNPCs[name].direction
        //         );
        //     }
        // }
    }

    // UI
    //reload the world when window is re-focused
    onFocus() {
        //update room if still connected to server
        if (socket.connected) client.requestRoomUpdate();
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
                stroke: {
                    color: ColorScheme.LightGray,
                },
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
                        this.scene.start('CharacterCreator');
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
            // //mini buttons
            // ui.createButtons(this, {
            //     x: 1245,
            //     y: 30,
            //     fontSize: 22,
            //     space: {
            //         item: 10,
            //     },
            //     buttons: [
            //         //media share queue
            //         {
            //             text: '🎞️',
            //             background: { radius: 8 },
            //             onClick: () => {
            //                 //check if menu is open
            //                 if (!this.menuOpen) {
            //                     //show media share menu
            //                     this.showMediaShareMenu();
            //                 }
            //             },
            //         },
            //     ],
            // })
            //     .setDepth(this.depthUI)
            //     .setOrigin(0, 0.5);
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
                        text: 'Want To Keep Up With Development Or Need Help?',
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
                        text: 'Consider Donating To Support Development!',
                        fontSize: 20,
                    },
                    {
                        type: 'button',
                        text: 'Donate',
                        fontSize: 20,
                        onClick: () => {
                            window.open(GameConfig.donationSite, '_blank');
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
        const passage = GameConfig.news.join(
            '\n__________________________\n\n'
        );

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

    // //show media share menu
    // showMediaShareMenu() {
    //     //create news menu
    //     ui.createMenu(
    //         this,
    //         {
    //             title: 'Media Share',
    //             content: [
    //                 {
    //                     type: 'text',
    //                     text: 'Submit Media',
    //                     fontSize: 22,
    //                 },
    //                 {
    //                     type: 'inputBox',
    //                     id: 'media-share-box',
    //                     width: 400,
    //                     height: 30,
    //                     placeholder: 'URL...',
    //                     background: {
    //                         color: ColorScheme.White,
    //                         radius: 15,
    //                     },
    //                     color: '#000000',
    //                     maxLength: this.messageMaxLength,
    //                     depth: this.depthUI,
    //                     // onFocus: (inputBox) => {
    //                     //     if (this.menuOpen) inputBox.setBlur();
    //                     // },
    //                     onKeydown: (inputBox, event) => {
    //                         if (event.key == 'Enter') {
    //                             //format media submission
    //                             const mediaSubmission = inputBox.text
    //                                 .substr(0, this.messageMaxLength)
    //                                 .trim()
    //                                 .replace(/\s+/g, ' ');

    //                             // //send the message to the server
    //                             // if (mediaSubmission !== '' && mediaSubmission !== null) {
    //                             //     client.playerSendingMessage(mediaSubmission);
    //                             // }

    //                             // //leave chat bar
    //                             // else {
    //                             //     inputBox.setBlur();
    //                             // }

    //                             //clear chat box
    //                             inputBox.setText('');
    //                         }
    //                     },
    //                 },
    //                 {
    //                     type: 'buttons',
    //                     align: 'center',
    //                     fontSize: 20,
    //                     buttons: [
    //                         {
    //                             text: 'Vote Skip',
    //                             align: 'left',
    //                             onClick: () => {
    //                                 console.log('skip');
    //                             },
    //                         },
    //                         {
    //                             text: 'View Queue',
    //                             align: 'left',
    //                             onClick: () => {
    //                                 console.log('view queue');
    //                             },
    //                         },
    //                     ],
    //                 },
    //                 // {
    //                 //     type: 'text',
    //                 //     text: 'Dim the Lights',
    //                 //     fontSize: 22,
    //                 // },
    //                 // {
    //                 //     type: 'checkbox',
    //                 //     initialValue: false,
    //                 //     onClick: (state) => {
    //                 //         console.log(state);
    //                 //     },
    //                 // }
    //             ],
    //         },
    //         {
    //             y: 635,
    //             draggable: false,
    //             onExit: () => {
    //                 //set menu as closed (do not add DOM elements)
    //                 this.menuClosed(false);
    //             },
    //         }
    //     );

    //     //set menu as opened (do not remove DOM elements)
    //     this.menuOpened(false);
    // }

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
            const scrollPosition = this.chatLogUI.getElement('items')[0].t;

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
        this.chatLogUI = ui
            .createSizer(
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
                    background: {
                        transparency: 0.5,
                        stroke: { transparency: 0.5 },
                    },
                    space: { top: 0, bottom: 0, left: 0, right: 0, item: 0 },
                }
            )
            .layout();

        //arrange UI
        this.chatLogUI.setOrigin(0, 1);
        this.chatLogUI.layout();

        //set scroll position
        this.chatLogUI.getElement('items')[0].setT(scrollPosition);

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

    //direction changed
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
        //create accessory layer if it exists
        if (data.character.accessory) {
            var playerAccessory = this.add
                .sprite(0, 0, 'accessories_' + data.character.accessory)
                .setOrigin(0.5, 1);
        }

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

        //add accessory to player container
        if (data.character.accessory)
            this.playerCharacter[data.id].list[0].add(playerAccessory);

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
                playerBody.setTexture(this.getTintedFrogSprite('frog_body', utility.hexIntegerToString(data.character.color)));
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

    //create a tinted version of the frog
    getTintedFrogSprite(sprite, tint) {
        //if texture not created yet
        if (!this.textures.exists(sprite + '_' + tint)) {
            //get base tintable texture
            let baseTexture = this.textures.get(sprite).getSourceImage();

            //init new tinted texture
            var tintedTexture = this.textures.createCanvas(
                sprite + '_' + tint,
                baseTexture.width,
                baseTexture.height
            );

            //get tinted texture data
            var ctx = tintedTexture.context;

            //apply tint
            ctx.fillStyle = tint;
            ctx.fillRect(0, 0, baseTexture.width, baseTexture.height);
            ctx.globalCompositeOperation = 'multiply';
            ctx.drawImage(baseTexture, 0, 0);
            ctx.globalCompositeOperation = 'destination-atop';
            ctx.drawImage(baseTexture, 0, 0);
        }

        //return tinted sprite
        return sprite + '_' + tint;
    }

    //get players current direction
    getPlayerDirection(id) {
        //get player sprite container
        if (!this.playerCharacter[id]) return;
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

    //adds new interactable object that must be moved to and reach to interact with
    addNewInteractableObject(
        objectSetup,
        physicsObject,
        interactableSprite,
        finalInteractionCallback,
        firstInteractionCallback
    ) {
        //get ID
        let id = 0 + this.interactableObjects.length;

        //set up object
        objectSetup(id);

        //add physics to object
        let object = physicsObject(id);
        this.physics.world.enable(object);
        object.body.setCollideWorldBounds(true);

        //set up hover outline effect
        globalUI.setOutlineOnHover(this, interactableSprite(id));

        //set up interaction
        let sprite = interactableSprite(id);
        sprite.setInteractive().on(
            'pointerup',
            (pointer) => {
                // //check if player can move to object
                // if (this.navigationCheck(pointer.x, pointer.y)) {
                // }

                //set player as attempting to interact with this object
                utility.getObject(
                    this.playerData,
                    clientID
                ).attemptedObjectInteract = id;

                //tell server that the player is attempting to interact with an object
                client.playerInteractingWithObject(id);

                //attempt to move player
                this.onMoveAttempt(pointer.x, pointer.y);

                //first interaction callback
                if (firstInteractionCallback) firstInteractionCallback(id);
            },
            this
        );

        //set final interaction callback
        this.interactableObjectFunction[id] = finalInteractionCallback;
    }

    //adds NPC character to the game
    addNewNPC(name, x, y, direction = 'right') {
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

        //set up interactable object
        this.addNewInteractableObject(
            //object set up
            (id) => {
                //create npc container
                this.interactableObjects[id] = this.add
                    .container(x, y)
                    .setSize(spriteContainer.width, spriteContainer.height);

                //create npc sprite container
                this.interactableObjects[id].add(
                    this.add
                        .container(0, 0)
                        .setSize(spriteContainer.width, spriteContainer.height)
                );

                //add npc sprites to npc sprite container
                this.interactableObjects[id].list[0].add([npcSprite]);

                //create npc overlay container
                this.interactableObjects[id].add(
                    this.add
                        .container(0, 0)
                        .setSize(spriteContainer.width, spriteContainer.height)
                );

                //add npc name to npc overlay container
                this.interactableObjects[id].list[1].add([npcName]);

                //set direction of NPC
                if (direction === 'left') {
                    this.interactableObjects[id].list[0].list[0].scaleX *= -1;
                }

                //set depth
                this.interactableObjects[id].setDepth(y);

                //store object ID of NPC
                this.npcList[name].objectID = id;
            },

            //set physics object
            (id) => {
                return this.interactableObjects[id];
            },

            //set interactable sprite
            (id) => {
                return this.interactableObjects[id].list[0];
            },

            //final interaction callback
            (objectID, playerID) => {
                //show message if client interacted with NPC
                if (playerID === clientID)
                    this.showMessage(
                        name,
                        {
                            id: Date.now(),
                            text: utility.randomFromArray(
                                this.npcList[name].lines
                            ),
                            endTime: Date.now() + 5000,
                        },
                        'npc'
                    );
            }
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
            var overlayContainer = this.interactableObjects[id].list[1];

            //get player sprite container
            var spriteContainer = this.interactableObjects[id].list[0];

            //store message data
            utility.getObject(this.npcData, id).message = messageData;
        }

        //check if message contains an emote
        // if (emoteData.inclu)

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
            var overlayContainer = this.interactableObjects[id].list[1];

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
