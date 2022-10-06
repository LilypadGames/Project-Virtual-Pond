// Fall Faire Event 2022 - Daily Spin

class FF22FrogShuffle extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'FF22FrogShuffle' });
    }

    init() {
        //global variables
        globalUI.init(this);

        //set up game data
        this.gameData = {
            hatHeight: game.config.height / 2 - 170,
            frogHeight: game.config.height / 2 + 70,
            leftPosition: game.config.width / 2 - 320,
            middlePosition: game.config.width / 2,
            rightPosition: game.config.width / 2 + 320,

            swapSpeedMin: 100,
            swapSpeedMax: 600,

            swapDelayMin: 100,
            swapDelayMax: 400,
        };
    }

    // LOGIC
    preload() {
        //loading screen
        loadingScreen.runLoadingScreen(this);

        //preload global UI
        globalUI.preload(this);

        //preload events data
        events.preload(this);

        //preload game data
        this.preloadGame();
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //get frog order
        this.frogOrder = await client.FF22generateFrogOrder();

        //create game scene
        this.createGame();

        // console.log(await client.FF22generateHatShuffle());

        // console.log(await client.FF22requestHatPick(1));

        //end wait screen
        loadingScreen.endWaitScreen(this);
    }

    end() {
        //end event data
        events.end(this);

        //reset data
        delete this.frogOrder;
        delete this.frogs;
        delete this.hats;
        delete this.startButton;
        delete this.shuffleRound;
        delete this.roundNumber;
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

    //preload the scenes data
    preloadGame() {
        //layers
        this.load.image(
            'frogshuffle_background',
            'assets/event/ff22/minigame/frogshuffle/layers/Background.png'
        );

        //objects
        this.load.image(
            'hat',
            'assets/event/ff22/minigame/frogshuffle/objects/Hat.png'
        );

        //frogs
        this.load.image(
            'Poke_FrogShuffle',
            'assets/event/ff22/minigame/frogshuffle/objects/Poke.png'
        );
        this.load.image(
            'Jesse_FrogShuffle',
            'assets/event/ff22/minigame/frogshuffle/objects/Jesse.png'
        );
        this.load.image(
            'Gigi_FrogShuffle',
            'assets/event/ff22/minigame/frogshuffle/objects/Gigi.png'
        );
    }

    //set up the scene
    createGame() {
        //background
        this.add
            .sprite(
                game.config.width / 2,
                game.config.height / 2,
                'frogshuffle_background'
            )
            .setDepth(this.depthBackgroundUI);

        //frogs
        this.frogs = [];
        this.frogs[0] = this.add.sprite(
            this.gameData.leftPosition,
            this.gameData.frogHeight,
            this.frogOrder.frogOrder[0] + '_FrogShuffle'
        );
        this.frogs[1] = this.add.sprite(
            this.gameData.middlePosition,
            this.gameData.frogHeight,
            this.frogOrder.frogOrder[1] + '_FrogShuffle'
        );
        this.frogs[2] = this.add.sprite(
            this.gameData.rightPosition,
            this.gameData.frogHeight,
            this.frogOrder.frogOrder[2] + '_FrogShuffle'
        );

        //hats
        this.hats = [];
        this.hats[0] = this.add.sprite(
            this.gameData.leftPosition,
            this.gameData.hatHeight,
            'hat'
        );
        this.hats[1] = this.add.sprite(
            this.gameData.middlePosition,
            this.gameData.hatHeight,
            'hat'
        );
        this.hats[2] = this.add.sprite(
            this.gameData.rightPosition,
            this.gameData.hatHeight,
            'hat'
        );

        //let hats have an outline on hover (when set as interactive)
        this.hats.forEach((hat, index) => {
            globalUI.setOutlineOnHover(this, hat);
        });

        //start button
        this.startButton = ui
            .createButtons(this, {
                x: game.config.width / 2,
                y: game.config.height / 2 + 320,
                fontSize: 50,
                buttons: [
                    {
                        text: 'Start Game',
                        background: { radius: 8 },
                        onClick: () => {
                            //start game
                            this.startGame();

                            //remove/hide button
                            this.startButton.destroy();
                        },
                    },
                ],
            })
            .setOrigin(0.5, 0.5)
            .layout();

        //init variables
        this.roundNumber = 0;
    }

    //start the game scene
    async startGame() {
        //accumulate round number
        this.roundNumber++;

        //wait
        await utility.wait(200);

        //drop hats
        this.hats.forEach((hat) => {
            this.tweens.add({
                targets: hat,
                y: this.gameData.frogHeight,
                duration: 700,
                ease: 'Cubic.easeIn',
            });
        });

        //wait for hats to fall
        await utility.wait(700);

        //remove frogs
        this.frogs.forEach((frog) => {
            frog.destroy();
        });

        //get shuffling sequence
        this.shuffleRound = await client.FF22requestHatShuffle();

        //start shuffling
        let queueTime = 0;
        this.shuffleRound.sequence.forEach((sequence, index) => {
            //accumulate queue time
            if (index > 0)
                queueTime =
                    queueTime +
                    (this.gameData.swapSpeedMax + this.gameData.swapDelayMax);

            //queue each swap with a delay that gets bigger with each iteration so that it accounts for the time required for the previous swap in the queue
            setTimeout(
                () => {
                    //swap hat positions
                    this.tweens.add({
                        targets: this.hats[sequence[0] - 1],
                        x: this.hats[sequence[1] - 1].x,
                        duration: this.gameData.swapSpeedMax,
                        ease: 'Cubic.easeIn',
                    });
                    this.tweens.add({
                        targets: this.hats[sequence[1] - 1],
                        x: this.hats[sequence[0] - 1].x,
                        duration: this.gameData.swapSpeedMax,
                        ease: 'Cubic.easeIn',
                    });

                    //switch hats in list (to keep them in order from left to right)
                    [this.hats[sequence[0] - 1], this.hats[sequence[1] - 1]] = [
                        this.hats[sequence[1] - 1],
                        this.hats[sequence[0] - 1],
                    ];
                },

                //delay
                queueTime
            );
        });

        //wait for swapping to finish
        await utility.wait(queueTime + 200);

        //make hats interactable
        this.hats.forEach((hat, index) => {
            hat.setInteractive();

            //give click listener if this is the first round
            if (this.roundNumber === 1)
                hat.on('pointerdown', this.hatSelected.bind(this, index));
        });

        //ask player to choose a hat matching the target
    }

    //hat selected
    hatSelected(index) {
        //remove interactability from hats
        this.hats.forEach((hat) => {
            hat.disableInteractive();
        });

        console.log(index);
        //check with server
        //place frogs
        //raise hats
        //if success
        //wait
        //start game again
        //if failure
    }
}
