// Character Creator Scene

class CharacterCreator extends Phaser.Scene {

    // LOCAL VARIABLES
    //character
    characterData;
    character;
    characterCreated;

    //UI
    nametag;
    nametagFontSize = 60;
    nametagConfig = {
            fontFamily: 'Arial',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 6,
    };
    disableInput = false;

    //audio
    sfx_button_click;

    //depth
    depthUI = 100002;
    depthCharacterUI = 100001;
    depthBackgroundUI = 1;

    // INIT
    constructor() {

        super({ key: 'CharacterCreator' });
    };

    init() {

        //set scene
        currentScene = this;

        //reset variables
        this.characterData = {};
        this.character = {};
        this.characterCreated = false;
    };

    // LOGIC
    preload() {

        //character
        this.load.image('CC_frog_body', 'assets/character/player/5x/Tintable.png');
        this.load.image('CC_frog_belly', 'assets/character/player/5x/Non-Tintable.png');
        this.load.image('CC_frog_eyes_0', 'assets/character/player/5x/eyes/Eyes_0.png');
        this.load.image('CC_frog_eyes_1', 'assets/character/player/5x/eyes/Eyes_1.png');

        //UI
        this.load.image('UI_frog_eyes_0', 'assets/character/player/2x/UI/eyes/Eyes_0.png');
        this.load.image('UI_frog_eyes_1', 'assets/character/player/2x/UI/eyes/Eyes_1.png');

        //sfx
        this.load.audio('button_click', "assets/audio/sfx/UI/button_click.mp3");

        //plugins
        this.load.scenePlugin({key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI'});
        this.load.plugin('rexcoverplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcoverplugin.min.js', true);
    };

    create() {

        //get canvas
        this.canvas = this.sys.game.canvas;

        //sfx
        this.sfx_button_click = this.sound.add('button_click');

        //set background color
        this.cameras.main.setBackgroundColor(ColorScheme.DarkBlue);

        //backgrounds
        this.rexUI.add.roundRectangle(300, 400, 500, 600, 15, ColorScheme.Blue).setDepth(this.depthBackgroundUI);

        //get character info
        client.getPlayerData();

        //eye type label
        this.rexUI.add.sizer({ x: 685, y: 140, width: 250, height: 50 })
        .add(ui.createLabel(this, { text: 'Eye Type', textSize: 45, align: 'center', backgroundColor: ColorScheme.Blue, space: {left: 10, right: 10, top: 0, bottom: 0} }))
        .layout()
        .setDepth(this.depthCharacterUI);
        
        //eye types
        ui.createButtons(this, { x: 650, y: 220, buttons: [{ icon: 'UI_frog_eyes_0', backgroundRadius: 8 }, { icon: 'UI_frog_eyes_1', backgroundRadius: 8 }]})
        .on('button.click', function (button, index, pointer, event) {

            //sfx
            this.sfx_button_click.play();

            //set eye type
            this.characterData.eye_type = index;

            //update character display
            this.updateCharacter();
        }, this)
        .setDepth(this.depthCharacterUI);

        //color label
        this.rexUI.add.sizer({ x: 638, y: 400, width: 150, height: 50 })
        .add(ui.createLabel(this, { text: 'Color', textSize: 45, align: 'center', backgroundColor: ColorScheme.Blue, space: {left: 10, right: 10, top: 0, bottom: 0} }))
        .layout()
        .setDepth(this.depthCharacterUI);

        //color wheel
        ui.createColorPicker(this, {x: 770, y: 500, width: 400, height: 60, sliderID: 'color',})
        .setDepth(this.depthCharacterUI);

        //save & play button
        ui.createButtons(this, { x: 800, y: 700, buttonTextSize: 50, buttons: [{ text: 'Save & Play', backgroundRadius: 16 }]})
        .on('button.click', function (button, index, pointer, event) {

            //sfx
            this.sfx_button_click.play();

            //parse player data
            const data = {
                name: this.characterData.name,
                character: {
                    color: this.characterData.color,
                    eye_type: this.characterData.eye_type
                },
                queueScene: 'Game'
            };

            //save character data
            client.updatePlayerData(data);

            //set character as created
            this.characterCreated = false;
            
        }, this)
        .setDepth(this.depthCharacterUI);
    };

    // UI
    //show refresh dialog
    showRefreshDialog(content) {

        //fade background
        this.add.rexCover({ alpha: 0.8 }).setDepth(this.depthUI);

        //create dialog with refresh button
        const dialog = ui.createDialog(this, content)
        .on('button.click', function () {

            //sfx
            this.sfx_button_click.play();

            //reload window
            window.location.reload();

            //enable input
            this.disableInput = false;
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

        this.disableInput = true;
    };

    //on slider change
    onSliderChange(value, sliderID) {
        if (sliderID == 'color') {

            //update color
            this.characterData.color = value;

            //update character display
            this.updateCharacter();
        };
    };

    // FUNCTIONS
    //get character information
    parsePlayerData(data) {

        //set character data
        if (data.character) {
            this.characterData = data.character;
        } else {
            this.characterData = {
                color: Math.random() * 0xffffff,
                eye_type: 0
            }
        };

        //set character name
        this.characterData.name = data.name;

        //create character
        this.createCharacter(this.characterData);
    };

    //create character representation
    createCharacter(data) {

        //player name
        this.nametag = this.add.text(300, 500, data.name, this.nametagConfig).setFontSize(this.nametagFontSize).setOrigin(0.5, 0).setDepth(this.depthCharacterUI);

        //enforce fixed width
        let fontSize = this.nametagFontSize;
        while(this.nametag.width > 480) {
            fontSize = Math.floor(fontSize * .9);
            this.nametag.setFontSize(fontSize);
            this.nametag.setStroke(ColorScheme.Black, fontSize / 4);
        };

        //player character
        var playerBody = this.add.sprite(0, 0, 'CC_frog_body').setOrigin(0.5, 1);
        var playerBelly = this.add.sprite(0, 0, 'CC_frog_belly').setOrigin(0.5, 1);
        var playerEyes = this.add.sprite(0, 0, 'CC_frog_eyes_' + data.eye_type).setOrigin(0.5, 1);

        //get sprite container size
        var spriteContainer = {
            width: playerBody.width,
            height: playerBody.height
        };

        //create player container
        this.character = this.add.container(300, 500).setSize(spriteContainer.width, spriteContainer.height).setDepth(this.depthCharacterUI);

        //add player sprites to player sprite container
        this.character.add([playerBody, playerBelly, playerEyes]);

        //update players color
        this.character.list[0].tint = data.color;

        //set character as created
        this.characterCreated = true;
    };

    //update character representation
    updateCharacter() {
        if (this.characterCreated) {
            //update players eye type
            this.character.list[2].setTexture('CC_frog_eyes_' + this.characterData.eye_type);

            //update players color
            this.character.list[0].tint = this.characterData.color;
        };
    };

}