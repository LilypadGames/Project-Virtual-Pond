// Menu Scene

class Menu extends Phaser.Scene {
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

    async create() {
        //create global UI
        globalUI.create(this);

        //wait screen
        loadingScreen.runWaitScreen(this);

        //wait until connected to the server
        while (!socket.connected) {}

        //get global data
        await client.requestGlobalData();

        //get initial load data from the server
        let loadData = await client.requestLoadData();

        //emote data
        // let emoteData = data['emotes'];

        //player data
        let playerData = loadData['player'];

        //save client ID
        clientID = playerData.id;

        //send to character creator
        if (playerData.external && playerData.external.newfrog) {
            this.end();
            this.scene.start('CharacterCreator');
        }
        //send to game
        else {
            this.end();
            client.requestRoom();
        }
    }

    end() {
        //reset data
        this.registry.destroy();
        this.game.events.removeAllListeners();
        this.input.keyboard.removeAllListeners();
        this.scene.stop();
    }
}
