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

        // //generate game data from global data provided from server
        // await this.generateData();

        //get initial load data from the server
        let loadData = await client.requestLoadData();

        //store emote data globally
        emotes.init(loadData['emotes']);
        // console.log(emotes.getEmoteByName(':tf:'));

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

    // //generate data for the game dependant on server information
    // async generateData() {
    //     //default
    //     await $.getJSON('../../config/roomData.json', (json) => {
    //         roomData = json;
    //     });

    //     //overrides
    //     let roomDataOverrides;
    //     await $.getJSON('../../config/roomDataOverrides.json', (json) => {
    //         roomDataOverrides = json;
    //     });

    //     //event overrides
    //     for (let i = 0; i < globalData.currentEvents.length; i++) {
    //         //check if a current event has room data
    //         if (globalData.currentEvents[i] in roomDataOverrides.events) {
    //             //get room data overrides for this event
    //             let overrideData =
    //                 roomDataOverrides.events[globalData.currentEvents[i]];

    //             //merge each room data for this event into the default data
    //             for (let room of Object.keys(roomData)) {
    //                 //check if event has data for this room
    //                 if (room in overrideData) {
    //                     //merge options
    //                     if ('option' in overrideData[room])
    //                         roomData[room].option = _.merge(
    //                             roomData[room].option,
    //                             overrideData[room].option
    //                         );

    //                     //merge assets
    //                     if ('asset' in overrideData[room]) {
    //                         //merge image assets
    //                         if (overrideData[room].asset.image)
    //                             roomData[room].asset.image = _.merge(
    //                                 roomData[room].asset.image,
    //                                 overrideData[room].asset.image
    //                             );

    //                         //merge audio assets
    //                         if (overrideData[room].asset.audio)
    //                             roomData[room].asset.audio = _.merge(
    //                                 roomData[room].asset.audio,
    //                                 overrideData[room].asset.audio
    //                             );
    //                     }

    //                     //merge layers
    //                     if ('layers' in overrideData[room])
    //                         roomData[room].layers = _.merge(
    //                             roomData[room].layers,
    //                             overrideData[room].layers
    //                         );

    //                     //merge npcs
    //                     if ('npcs' in overrideData[room])
    //                         roomData[room].npcs = _.merge(
    //                             roomData[room].npcs,
    //                             overrideData[room].npcs
    //                         );

    //                     //merge teleports
    //                     if ('teleports' in overrideData[room])
    //                         roomData[room].teleports = _.merge(
    //                             roomData[room].teleports,
    //                             overrideData[room].teleports
    //                         );
    //                 }
    //             }
    //         }
    //     }
    // }
}
