// Character Creator Scene

class CharacterCreator extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'CharacterCreator' });
    }

    init(previousRoom) {
        //client file needs the game instance
        currentScene = this;

        //save previous room
        this.previousRoom = previousRoom;

        // LOCAL VARIABLES
        //character
        this.characterData = {};
        this.character = {};
        this.characterCreated = false;

        //UI
        this.nametag = undefined;
        this.nametagFontSize = 60;
        this.nametagConfig = {
            fontFamily: 'Burbin',
            color: utility.hexIntegerToString(ColorScheme.White),
            stroke: utility.hexIntegerToString(ColorScheme.Black),
            strokeThickness: 6,
        };
        this.disableInput = false;

        //audio
        this.sfxButtonClick = undefined;

        //depth
        this.depthUI = 100002;
        this.depthCharacterUI = 100001;
        this.depthBackgroundUI = 1;
    }

    // LOGIC
    preload() {
        //get canvas
        this.canvas = this.sys.game.canvas;

        //loading screen
        loadingScreen.run(this);

        //character
        this.load.image(
            'CC_frog_body',
            'assets/character/player/body/2.5x/Tintable.png'
        );
        this.load.image(
            'CC_frog_belly',
            'assets/character/player/body/2.5x/Non-Tintable.png'
        );
        this.load.image(
            'CC_frog_eyes_0',
            'assets/character/player/eyes/2.5x/Eyes_0.png'
        );
        this.load.image(
            'CC_frog_eyes_1',
            'assets/character/player/eyes/2.5x/Eyes_1.png'
        );
        this.load.image(
            'CC_frog_eyes_2',
            'assets/character/player/eyes/2.5x/Eyes_2.png'
        );
        this.load.image(
            'CC_frog_eyes_3',
            'assets/character/player/eyes/2.5x/Eyes_3.png'
        );

        //UI
        this.load.image(
            'UI_frog_eyes_0',
            'assets/character/player/eyes/UI/Eyes_0.png'
        );
        this.load.image(
            'UI_frog_eyes_1',
            'assets/character/player/eyes/UI/Eyes_1.png'
        );
        this.load.image(
            'UI_frog_eyes_2',
            'assets/character/player/eyes/UI/Eyes_2.png'
        );
        this.load.image(
            'UI_frog_eyes_3',
            'assets/character/player/eyes/UI/Eyes_3.png'
        );

        //sfx
        this.load.audio('button_click', 'assets/audio/sfx/UI/button_click.mp3');
    }

    create() {
        //register sfx
        this.sfxButtonClick = this.sound.add('button_click', { volume: 0 });
        this.sfxButtonClick.setVolume(
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume
        );

        //get player data
        client.requestClientPlayerData();
    }

    end() {
        //reset data
        this.registry.destroy();
        this.events.removeAllListeners('updatedClientPlayerData');
        this.scene.stop();

        //reset variables
        this.characterData = {};
        this.character = {};
        this.characterCreated = false;
    }

    quit() {
        //end scene
        this.end();

        //join game world
        this.scene.start('Game', this.previousRoom);
    }

    // UI
    //create menu
    createCharacterCreatorMenu() {
        //defaults
        let labelIndent = 565;
        let interactableIndent = 575;

        //set background color
        this.cameras.main.setBackgroundColor(ColorScheme.DarkBlue);

        //backgrounds
        this.rexUI.add
            .roundRectangle(300, 400, 500, 600, 15, ColorScheme.Blue)
            .setDepth(this.depthBackgroundUI);

        //eye type label
        this.rexUI.add
            .sizer({ x: labelIndent, y: 140, width: 0, height: 0 })
            .add(
                ui.createLabel(this, {
                    text: 'Eyes',
                    fontSize: 45,
                    align: 'center',
                    backgroundColor: ColorScheme.Blue,
                    space: { left: 10, right: 10, top: 0, bottom: 0 },
                })
            )
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //eye types
        let eye_buttons = ui
            .createButtons(this, {
                x: interactableIndent,
                y: 230,
                buttons: [
                    {
                        icon: 'UI_frog_eyes_0',
                        backgroundRadius: 8,
                    },
                    {
                        icon: 'UI_frog_eyes_1',
                        backgroundRadius: 8,
                    },
                    {
                        icon: 'UI_frog_eyes_2',
                        backgroundRadius: 8,
                    },
                    {
                        icon: 'UI_frog_eyes_3',
                        backgroundRadius: 8,
                    },
                ],
                onClick: (index) => {
                    //highlight selected button on click
                    eye_buttons.forEachButtton((button, thisIndex) => {
                        if (thisIndex == index) {
                            button
                                .getElement('background')
                                .setStrokeStyle(3, ColorScheme.White);
                        } else {
                            button.getElement('background').setStrokeStyle(0);
                        }
                    }, this);

                    //set eye type
                    this.characterData.eye_type = index;

                    //update character display
                    this.updateCharacter();
                },
            })
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //highlight initial button
        eye_buttons.forEachButtton((button, thisIndex) => {
            if (thisIndex == this.characterData.eye_type) {
                button
                    .getElement('background')
                    .setStrokeStyle(3, ColorScheme.White);
            } else {
                button.getElement('background').setStrokeStyle(0);
            }
        }, this);

        //color label
        this.rexUI.add
            .sizer({ x: labelIndent, y: 400, width: 0, height: 0 })
            .add(
                ui.createLabel(this, {
                    text: 'Color',
                    fontSize: 45,
                    align: 'center',
                    backgroundColor: ColorScheme.Blue,
                    space: { left: 10, right: 10, top: 0, bottom: 0 },
                })
            )
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //color wheel
        ui.createColorPicker(this, {
            x: interactableIndent,
            y: 485,
            width: 400,
            height: 30,
            sliderID: 'color',
            onSliderChange: (value) => {
                //update color
                this.characterData.color = value;

                //update character display
                this.updateCharacter();
            },
        })
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //save & play button
        ui.createButtons(this, {
            x: 1275,
            y: 790,
            fontSize: 50,
            buttons: [
                {
                    text: 'Save & Play',
                    backgroundRadius: 16,
                    onClick: () => {
                        //parse player data
                        const data = {
                            name: this.characterData.name,
                            character: {
                                color: this.characterData.color,
                                eye_type: this.characterData.eye_type,
                            },
                        };

                        //save character data to server
                        client.updateClientPlayerData(data);

                        //set character as created
                        this.characterCreated = false;
                    },
                },
            ],
        })
            .setDepth(this.depthCharacterUI)
            .setOrigin(1, 1)
            .layout();

        //when the server updates the players character data, quit this scene and return to previous scene
        this.events.on('updatedClientPlayerData', this.quit, this);
    }

    // FUNCTIONS
    //get character information
    parsePlayerData(data) {
        //set character data
        if (data.character) {
            this.characterData = data.character;
        } else {
            this.characterData = {
                color: Math.random() * ColorScheme.White,
                eye_type: 0,
            };
        }

        //set character name
        this.characterData.name = data.name;

        //set up character creator menu
        this.createCharacterCreatorMenu();

        //create character
        this.createCharacter(this.characterData);
    }

    //create character representation
    createCharacter(data) {
        //player name
        this.nametag = this.add
            .text(300, 500, data.name, this.nametagConfig)
            .setFontSize(this.nametagFontSize)
            .setOrigin(0.5, 0)
            .setDepth(this.depthCharacterUI);

        //enforce fixed width
        let fontSize = this.nametagFontSize;
        while (this.nametag.width > 480) {
            fontSize = Math.floor(fontSize * 0.9);
            this.nametag.setFontSize(fontSize);
            this.nametag.setStroke(ColorScheme.Black, fontSize / 4);
        }

        //player character
        var playerBody = this.add
            .sprite(0, 0, 'CC_frog_body')
            .setOrigin(0.5, 1);
        var playerBelly = this.add
            .sprite(0, 0, 'CC_frog_belly')
            .setOrigin(0.5, 1);
        var playerEyes = this.add
            .sprite(0, 0, 'CC_frog_eyes_' + data.eye_type)
            .setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width,
            height: playerBody.height,
        };

        //create player container
        this.character = this.add
            .container(300, 500)
            .setSize(spriteContainer.width, spriteContainer.height)
            .setDepth(this.depthCharacterUI);

        //add player sprites to player sprite container
        this.character.add([playerBody, playerBelly, playerEyes]);

        //update players color
        this.character.list[0].tint = data.color;

        //set character as created
        this.characterCreated = true;
    }

    //update character representation
    updateCharacter() {
        if (this.characterCreated) {
            //update players eye type
            this.character.list[2].setTexture(
                'CC_frog_eyes_' + this.characterData.eye_type
            );

            //update players color
            this.character.list[0].tint = this.characterData.color;
        }
    }
}
