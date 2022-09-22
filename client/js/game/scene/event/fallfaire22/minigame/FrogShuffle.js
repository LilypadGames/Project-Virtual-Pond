// Fall Faire Event 2022 - Daily Spin

class FF22FrogShuffle extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'FF22FrogShuffle' });
    }

    init() {
        //global variables
        globalUI.init(this);
    }

    // LOGIC
    preload() {
        //loading screen
        loadingScreen.runLoadingScreen(this);

        //preload global UI
        globalUI.preload(this);

        //preload events data
        events.preload(this);

        //layers
        // this.load.image(
        //     'background',
        //     'assets/event/ff22/minigame/dailyspin/layers/Background.png'
        // );

        //objects
        // this.load.image(
        //     'wheel',
        //     'assets/event/ff22/minigame/dailyspin/objects/wheel.png'
        // );
        // this.load.image(
        //     'wheel_shadow',
        //     'assets/event/ff22/minigame/dailyspin/objects/wheel_shadow.png'
        // );
        // this.load.image(
        //     'pin',
        //     'assets/event/ff22/minigame/dailyspin/objects/pin.png'
        // );

        //music

        //sfx
        // this.load.audio(
        //     'wheel_spin',
        //     'assets/event/ff22/minigame/dailyspin/audio/sfx/wheel_spin.mp3'
        // );
        // this.load.audio('success', 'assets/audio/sfx/minigame/success.mp3');
        // this.load.audio(
        //     'success_long',
        //     'assets/audio/sfx/minigame/success_long.mp3'
        // );
        // this.load.audio('failure', 'assets/audio/sfx/minigame/failure.mp3');
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //end wait screen
        loadingScreen.endWaitScreen(this);
    }

    end() {
        //end event data
        events.end(this);
        
        //reset data
        this.registry.destroy();
        this.scene.stop();
    }

    quit() {
        //end scene
        this.end();

        //join game world
        client.requestRoom();
    }
}
