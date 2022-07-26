//Bong Buckets Minigame Scene

class BongBuckets extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'BongBuckets' });
    }

    init(previousRoom) {
        //set scene
        currentScene = this;

        //set previous room
        this.previousRoom = previousRoom;
    }

    // LOGIC
    preload() {
        //get canvas
        this.canvas = this.sys.game.canvas;

        //loading screen
        loadingScreen.run(this);

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
    }

    end() {
        //reset data
        this.registry.destroy();
        this.events.removeAllListeners('updatedClientPlayerData');
        this.scene.stop();
    }
}
