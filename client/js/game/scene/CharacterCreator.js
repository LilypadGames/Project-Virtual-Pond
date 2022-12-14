// Character Creator Scene

class CharacterCreator extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'CharacterCreator' });
    }

    init() {
        //global variables
        globalUI.init(this);

        //init data
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

        //depth
        this.depthCharacterUI = 100001;
        this.depthBackgroundUI = 1;
    }

    // LOGIC
    preload() {
        //loading screen
        loadingScreen.runLoadingScreen(this);

        //preload global UI
        globalUI.preload(this);

        //load character body
        this.load.image(
            'CC_frog_body',
            'assets/character/player/body/2.5x/Tintable.png'
        );
        this.load.image(
            'CC_frog_belly',
            'assets/character/player/body/2.5x/Non-Tintable.png'
        );

        //path
        let path = 'assets/character/player/';

        //load character eyes
        let eyesData = itemData.eyes;
        for (var i = 0; i < eyesData.length; i++) {
            this.load.image(
                'CC_frog_eyes_' + eyesData[i].id,
                path + 'eyes/2.5x/' + eyesData[i].id + '.png'
            );
            this.load.image(
                'UI_frog_eyes_' + eyesData[i].id,
                path + 'eyes/UI/' + eyesData[i].id + '.png'
            );
        }

        //load character accessories
        let accessoryData = itemData.accessories;
        for (var i = 0; i < accessoryData.length; i++) {
            this.load.image(
                'CC_accessories_' + accessoryData[i].id,
                path + 'accessories/2.5x/' + accessoryData[i].id + '.png'
            );
            this.load.image(
                'UI_accessories_' + accessoryData[i].id,
                path + 'accessories/UI/' + accessoryData[i].id + '.png'
            );
        }
    }

    async create() {
        //create global UI
        globalUI.create(this);

        //get player data
        this.parseClientPlayerData(await client.requestClientPlayerData());
    }

    end() {
        //reset data
        delete this.inventoryData;
        delete this.characterData;
        delete this.character;
        delete this.characterCreated;

        //reset data
        this.registry.destroy();
        this.events.removeAllListeners('updatedClientPlayerData');
        this.scene.stop();
    }

    async quit() {
        //parse player data
        let data = {
            color: this.characterData.color,
            eye_type: this.characterData.eye_type,
        };
        if (this.characterData.accessory)
            data.accessory = this.characterData.accessory;

        //save character data to server
        await client.saveCharacterData(data);

        //set character as created
        this.characterCreated = false;

        //end scene
        this.end();

        //join game world
        client.requestRoom();
    }

    // UI
    //create menu
    async createCharacterCreatorMenu() {
        //defaults
        let labelIndent = 565;
        let interactableIndent = 575;

        //background
        this.cameras.main.setBackgroundColor(ColorScheme.DarkerBlue);

        //character background
        this.rexUI.add
            .roundRectangle(300, 400, 500, 600, 15, ColorScheme.Blue)
            .setDepth(this.depthBackgroundUI);

        //label: Color
        this.rexUI.add
            .sizer({ x: labelIndent, y: 140, width: 0, height: 0 })
            .add(
                ui.createLabel(this, {
                    text: 'Color',
                    fontSize: 45,
                    align: 'center',
                    background: { color: ColorScheme.Blue },
                    space: { left: 10, right: 10, top: 0, bottom: 0 },
                })
            )
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //selector: Color
        ui.createColorPicker(this, {
            x: interactableIndent,
            y: 230,
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

        //label: Eye Type
        this.rexUI.add
            .sizer({ x: labelIndent, y: 320, width: 0, height: 0 })
            .add(
                ui.createLabel(this, {
                    text: 'Eyes',
                    fontSize: 45,
                    align: 'center',
                    background: { color: ColorScheme.Blue },
                    space: { left: 10, right: 10, top: 0, bottom: 0 },
                })
            )
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //selector: Eye Type
        let eyeTypes = [];
        let eyesData = itemData.eyes;
        for (var i = 0; i < eyesData.length; i++) {
            let id = eyesData[i].id;
            eyeTypes.push({
                icon: 'UI_frog_eyes_' + id,
                background: { radius: 8 },
                onClick: () => {
                    //set eye type
                    this.characterData.eye_type = id;

                    //update character display
                    this.updateCharacter();
                },
            });
        }
        let eye_buttons = ui
            .createButtons(this, {
                x: interactableIndent,
                y: 410,
                buttons: eyeTypes,
                onClick: (index) => {
                    //highlight selected button on click
                    eye_buttons.forEachButtton((button, thisIndex) => {
                        if (thisIndex === index) {
                            button
                                .getElement('background')
                                .setStrokeStyle(3, ColorScheme.White);
                        } else {
                            button
                                .getElement('background')
                                .setStrokeStyle(3, ColorScheme.DarkBlue);
                        }
                    }, this);
                },
            })
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        eye_buttons.forEachButtton((button, thisIndex) => {
            if (this.characterData.eye_type === eyesData[thisIndex].id) {
                button
                    .getElement('background')
                    .setStrokeStyle(3, ColorScheme.White);
            } else {
                button
                    .getElement('background')
                    .setStrokeStyle(3, ColorScheme.DarkBlue);
            }
        }, this);

        //label: Accessories
        this.rexUI.add
            .sizer({ x: labelIndent, y: 500, width: 0, height: 0 })
            .add(
                ui.createLabel(this, {
                    text: 'Accessories',
                    fontSize: 45,
                    align: 'center',
                    background: { color: ColorScheme.Blue },
                    space: { left: 10, right: 10, top: 0, bottom: 0 },
                })
            )
            .setDepth(this.depthCharacterUI)
            .setOrigin(0, 0.5)
            .layout();

        //selector: Accessories
        //player has accessories?
        if (this.inventoryData) {
            let accessoryTypes = [];
            let accessoryData = itemData.accessories;
            for (var i = 0; i < accessoryData.length; i++) {
                //get accessory id
                let id = accessoryData[i].id;

                //player does not own accessory
                if (!(id in this.inventoryData.accessory)) continue;

                //add accessory to list
                accessoryTypes.push({
                    icon: 'UI_accessories_' + id,
                    background: { radius: 8 },
                    onClick: () => {
                        //already set
                        if (this.characterData.accessory === id) {
                            delete this.characterData.accessory;
                        }
                        //set accessory
                        else {
                            this.characterData.accessory = id;
                        }

                        //update character display
                        this.updateCharacter();
                    },
                });
            }

            //accessories owned?
            if (accessoryTypes.length > 0) {
                let accessory_buttons = ui
                    .createButtons(this, {
                        x: interactableIndent,
                        y: 590,
                        buttons: accessoryTypes,
                        onClick: (index) => {
                            //highlight selected button on click if not already selected
                            accessory_buttons.forEachButtton(
                                (button, thisIndex) => {
                                    if (
                                        thisIndex === index &&
                                        button.getElement('background')
                                            .strokeColor !== ColorScheme.White
                                    ) {
                                        button
                                            .getElement('background')
                                            .setStrokeStyle(
                                                3,
                                                ColorScheme.White
                                            );
                                    } else {
                                        button
                                            .getElement('background')
                                            .setStrokeStyle(
                                                3,
                                                ColorScheme.DarkBlue
                                            );
                                    }
                                },
                                this
                            );
                        },
                    })
                    .setDepth(this.depthCharacterUI)
                    .setOrigin(0, 0.5)
                    .layout();
                // accessory_buttons.forEachButtton((button, thisIndex) => {
                //     console.log(button)
                //     if (
                //         accessoryData[thisIndex].id === this.characterData.accessory
                //     ) {
                //         button
                //             .getElement('background')
                //             .setStrokeStyle(3, ColorScheme.White);
                //     } else {
                //         button.getElement('background').setStrokeStyle(3, ColorScheme.DarkBlue);
                //     }
                // }, this);
            }
        }

        //save & play button
        ui.createButtons(this, {
            x: 1275,
            y: 790,
            fontSize: 50,
            buttons: [
                {
                    text: 'Save & Play',
                    background: { radius: 8 },
                    onClick: async () => {
                        //quit character creator
                        await this.quit();
                    },
                },
            ],
        })
            .setDepth(this.depthCharacterUI)
            .setOrigin(1, 1)
            .layout();
    }

    // FUNCTIONS
    //get character information
    parseClientPlayerData(data) {
        //set inventory
        if (data.inventory) {
            this.inventoryData = data.inventory;
        }

        //set character data
        if (data.character) {
            this.characterData = data.character;
        } else {
            this.characterData = {
                color: Math.random() * ColorScheme.White,
                eye_type: 'normal',
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

        //player character (with player tint and accessories)
        var playerBody = this.add
            .sprite(0, 0, this.getTintedFrogSprite('CC_frog_body', utility.hexIntegerToString(data.color)))
            .setOrigin(0.5, 1);
        var playerBelly = this.add
            .sprite(0, 0, 'CC_frog_belly')
            .setOrigin(0.5, 1);
        var playerEyes = this.add
            .sprite(0, 0, 'CC_frog_eyes_' + data.eye_type)
            .setOrigin(0.5, 1);
        var playerAccessory = this.add
            .sprite(
                0,
                0,
                data.accessory ? 'CC_accessories_' + data.accessory : ''
            )
            .setOrigin(0.5, 1);
        if (!data.accessory) playerAccessory.setVisible(false);

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
        this.character.add([
            playerBody,
            playerBelly,
            playerEyes,
            playerAccessory,
        ]);

        //set character as created
        this.characterCreated = true;
    }

    //update character representation
    updateCharacter() {
        if (this.characterCreated) {
            //update players color
            this.character.list[0].setTexture(this.getTintedFrogSprite('CC_frog_body', utility.hexIntegerToString(this.characterData.color)));

            //update players eye type
            this.character.list[2].setTexture(
                'CC_frog_eyes_' + this.characterData.eye_type
            );

            //update players accessory
            if (this.characterData.accessory) {
                this.character.list[3].setTexture(
                    'CC_accessories_' + this.characterData.accessory
                );
                this.character.list[3].setVisible(true);
            } else {
                this.character.list[3].setTexture('');
                this.character.list[3].setVisible(false);
            }
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
}
