//Lilypad Hopper Minigame Scene

class LilypadHopper extends Phaser.Scene {
    // LOCAL VARIABLES
    //UI
    disableInput = false;

    //audio
    sfxButtonClick;

    // INIT
    constructor() {
        super({ key: 'LilypadHopper' });
    }

    init() {
        //set scene
        currentScene = this;
    }

    // LOGIC
    preload() {
        //sfx
        this.load.audio('button_click', 'assets/audio/sfx/UI/button_click.mp3');
    }

    create() {
        //sfx
        this.sfxButtonClick = this.sound.add('button_click');
    }
}
