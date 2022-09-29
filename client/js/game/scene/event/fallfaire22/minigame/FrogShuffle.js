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
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        console.log(await client.FF22generateFrogOrder());

        console.log(await client.FF22generateHatShuffle());

        console.log(await client.FF22requestHatPick(1));

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

    changeVolume(type, value) {
        if (type === 'sfx') {
            // for (var i = 1; i <= 3; i++) {
            //     this.audio_card_flip[i - 1].setVolume(value);
            // }
            // this.audio_success.setVolume(value);
            // this.audio_success_long.setVolume(value);
        }
    }


}
