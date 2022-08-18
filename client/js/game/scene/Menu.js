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
        //global variables
        globalUI.init(this);
    }

    // LOGIC
    preload() {
        //preload global UI
        globalUI.preload(this);

        //ui
        this.load.spritesheet('loadingIcon', 'assets/ui/loading.png', {
            frameWidth: 64,
            frameHeight: 64,
        });
    }

    create() {
        //create global UI
        globalUI.create(this);

        //create loading icon animation
        this.anims.create({
            key: 'loadingIconAnim',
            frames: this.anims.generateFrameNumbers('loadingIcon', { end: 7 }),
            frameRate: 18,
            repeat: -1,
        });

        //create loading icon
        let loadingIcon = this.add.sprite(
            this.sys.game.canvas.width / 2,
            this.sys.game.canvas.height / 2,
            'loadingIcon'
        );
        loadingIcon.play('loadingIconAnim');

        //attempt player data request from server
        this.attemptRequest();
    }

    end() {
        //reset data
        this.registry.destroy();
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
        // let emoteData = data['emotes'];

        //player data
        let playerData = data['player'];

        //determine room to put player in
        let room = 'forest';
        if (playerData.stat && playerData.stat.lastRoom) {
            room = playerData.stat.lastRoom;
        }

        //save client ID
        clientID = playerData.id;

        //set as signal recieved
        this.receivedSignal = true;

        //send to character creator or game
        if (!playerData.character) {
            this.scene.start('CharacterCreator', room);
        } else {
            this.scene.start('Game', room);
        }
    }
}
