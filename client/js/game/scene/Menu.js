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
    }

    create() {
        //create global UI
        globalUI.create(this);

        //wait screen
        loadingScreen.runWaitScreen(this);

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
                //wait for globalData to be received
                else if (!globalData) {
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

        //save client ID
        clientID = playerData.id;

        //set as signal recieved
        this.receivedSignal = true;

        //send to character creator or game
        if (!playerData.character) {
            this.end();
            this.scene.start('CharacterCreator');
        } else {
            this.end();
            client.requestRoom();
        }
    }
}
