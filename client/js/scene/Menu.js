// Menu Scene

class Menu extends Phaser.Scene {

    // LOCAL VARIABLE
    //UI
    disableInput = false;

    //audio
    sfx_button_click;

    //depth
    depthUI = 100002;

    // INIT
    constructor() {
        super({ key: 'Menu' });
    };

    init() {
        //set scene
        currentScene = this;
    };

    // LOGIC
    preload() {

        //sfx
        this.load.audio('button_click', "assets/audio/sfx/UI/button_click.mp3");

        //plugins
        this.load.scenePlugin({key: 'rexuiplugin', url: 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexuiplugin.min.js', sceneKey: 'rexUI'});
        this.load.plugin('rexcoverplugin', 'https://raw.githubusercontent.com/rexrainbow/phaser3-rex-notes/master/dist/rexcoverplugin.min.js', true);
    };

    create() {

        //sfx
        this.sfx_button_click = this.sound.add('button_click');

        //get player data
        client.requestPlayerData();
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

    // FUNCTIONS
    //get character information
    parsePlayerData(data) {

        //save client ID
        clientID = data.id;
        
        //send to character creator or game
        if (!data.character) {
            this.scene.start('CharacterCreator');
        } else {
            this.scene.start('Game');
        };
    };
}