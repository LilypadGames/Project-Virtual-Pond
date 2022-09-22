//Bong Buckets Minigame Scene

class BongBuckets extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'BongBuckets' });
    }

    init() {
        //set scene
        currentScene = this;
    }

    // LOGIC
    preload() {
        //get canvas
        this.canvas = this.sys.game.canvas;

        //loading screen
        loadingScreen.runLoadingScreen(this);
    }

    create() {
    }

    end() {
        //reset data
        this.registry.destroy();
        this.events.removeAllListeners('updatedClientPlayerData');
        this.scene.stop();
    }
}
