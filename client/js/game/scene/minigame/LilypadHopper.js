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
    }

    create() {
    }
}
