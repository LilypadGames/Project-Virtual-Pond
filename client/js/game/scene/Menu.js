// Menu Scene

class Menu extends Phaser.Scene {
    // LOCAL VARIABLE
    //UI
    disableInput = false;

    //audio
    sfxButtonClick;

    //depth
    depthUI = 100002;

    //server
    receivedSignal;

    // INIT
    constructor() {
        super({ key: 'Menu' });
    }

    init() {
        //set scene
        currentScene = this;
    }

    // LOGIC
    preload() {
        //register canvas
        this.canvas = this.sys.game.canvas;

        //sfx
        this.load.audio('button_click', 'assets/audio/sfx/UI/button_click.mp3');

        //ui
        this.load.spritesheet('loadingIcon', 'assets/ui/loading.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
        //sfx
        this.sfxButtonClick = this.sound.add('button_click');

        //create loading icon animation
        this.anims.create({
            key: 'loadingIconAnim',
            frames: this.anims.generateFrameNumbers('loadingIcon', { end: 7 }),
            frameRate: 18,
            repeat: -1,
        });

        //create loading icon
        let loadingIcon = this.add.sprite(
            this.canvas.width / 2,
            this.canvas.height / 2,
            'loadingIcon'
        );
        loadingIcon.play('loadingIconAnim');

        //attempt player data request from server
        this.attemptRequest();
    }

    end() {
        //reset data
        this.registry.destroy();
        // this.events.removeAllListeners();
        this.game.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
        this.scene.stop();
    }

    // FUNCTIONS
    //attempt player data request
    attemptRequest() {
        //signal not received yet
        if (!this.receivedSignal) {
            //get player data
            client.requestLoadData();

            //attempt again
            setTimeout(() => {
                //request again if still not received
                if (!this.receivedSignal) {
                    //attempt request again
                    this.attemptRequest();
                }
            }, 1000);
        }
    }

    //get character information
    parseLoadData(data) {
        //emote data
        let emoteData = data['emotes'];

        //player data
        let playerData = data['player'];

        //save client ID
        clientID = playerData.id;

        //set as signal recieved
        this.receivedSignal = true;

        //send to character creator or game
        if (!playerData.character) {
            this.scene.start('CharacterCreator', 'forest');
        } else {
            this.scene.start('Game', 'forest');
        }
    }
}
