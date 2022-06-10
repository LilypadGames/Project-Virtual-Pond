// Menu Scene

class Menu extends Phaser.Scene {

    // LOCAL VARIABLE
    //UI
    disableInput = false;

    //audio
    sfx_button_click;

    //depth
    depthUI = 100002;

    //server
    receivedSignal;

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

        //plugins
        this.load.scenePlugin({key: 'rexuiplugin', url: 'js/plugin/rexuiplugin.min.js', sceneKey: 'rexUI'});

        //register canvas
        this.canvas = this.sys.game.canvas;

        //sfx
        this.load.audio('button_click', "assets/audio/sfx/UI/button_click.mp3");

        //ui
        this.load.spritesheet('loadingIcon', 'assets/ui/loading.png', { frameWidth: 64, frameHeight: 64 });
    };

    create() {

        //sfx
        this.sfx_button_click = this.sound.add('button_click');

        //create loading icon animation
        this.anims.create({
            key: 'loadingIconAnim',
            frames: this.anims.generateFrameNumbers('loadingIcon', { end: 7 }),
            frameRate: 18,
            repeat: -1
        });

        //create loading icon
        let loadingIcon = this.add.sprite(this.canvas.width/2, this.canvas.height/2, 'loadingIcon');
        loadingIcon.play('loadingIconAnim');

        //attempt player data request from server
        this.attemptRequest();
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
    //attempt player data request
    attemptRequest() {

        //signal not received yet
        if (!this.receivedSignal) {
            //get player data
            client.requestClientPlayerData();

            //attempt again
            setTimeout(() => {

                //attempt request again
                this.attemptRequest();
            }, 1000);
        };
    };

    //get character information
    parsePlayerData(data) {

        //save client ID
        clientID = data.id;

        //set as signal recieved
        this.receivedSignal = true;
        
        //send to character creator or game
        if (!data.character) {
            this.scene.start('CharacterCreator');
        } else {
            this.scene.start('Game');
        };
    };
}