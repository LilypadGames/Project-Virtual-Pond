//Bong Buckets Minigame Scene

class BongBuckets extends Phaser.Scene {

    // INIT
    constructor() {
        super({ key: 'BongBuckets' });
    };

    init(previousRoom) {

        //set scene
        currentScene = this;

        //set previous room
        this.previousRoom = previousRoom;
    };

    // LOGIC
    preload() {

        //get canvas
        this.canvas = this.sys.game.canvas;

        //loading screen
        loadingScreen.run(this);

        //sfx
        this.load.audio('button_click', "assets/audio/sfx/UI/button_click.mp3");
    };

    create() {

        //register sfx
        this.sfxButtonClick = this.sound.add('button_click', { volume: 0 });
        this.sfxButtonClick.setVolume(utility.getLocalStorage('gameOptions')[utility.getLocalStorageArrayIndex('gameOptions', 'sfx')].volume);
    };

    end() {

        //reset data
        this.registry.destroy();
        this.events.removeAllListeners('updatedClientPlayerData');
        this.scene.stop();
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
            this.sfxButtonClick.play();

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