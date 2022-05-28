//Lilypad Hopper Minigame Scene

class LilypadHopper extends Phaser.Scene {

    // LOCAL VARIABLES
    //UI
    disableInput = false;

    //audio
    sfx_button_click;

    // INIT
    constructor() {

        super({ key: 'LilypadHopper' });
    };

    init() {

        //set scene
        currentScene = this;
    };

    // LOGIC
    preload() {

        //sfx
        this.load.audio('button_click', "assets/audio/sfx/UI/button_click.mp3");
    };

    create() {

        //sfx
        this.sfx_button_click = this.sound.add('button_click');
    };

    // UTILITY

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

}