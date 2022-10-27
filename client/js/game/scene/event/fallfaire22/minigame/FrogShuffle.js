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

            startButtonX: game.config.width / 2,
            startButtonY: game.config.height / 2 + 320,

            targetDisplayX: game.config.width / 2,
            targetDisplayY: game.config.height / 2 - 380,

            scoreDisplayX: game.config.width / 2,
            scoreDisplayY: game.config.height / 2 + 320,

            swapSpeedMin: 100,
            swapSpeedMax: 600,
            swapSpeedMultiplier: 10,

            swapDelayMin: 100,
            swapDelayMax: 400,
            swapDelayMultiplier: 20,

            depthHat: 100,
            depthFrog: 99,

            payoutPerRound: 5,
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

        //create game scene
        await this.createGame();

        //end wait screen
        loadingScreen.endWaitScreen(this);
    }

    end() {
        //end event data
        events.end(this);

        //reset data
        delete this.audio_slide;
        delete this.audio_success;
        delete this.audio_failure;
        delete this.frogs;
        delete this.hats;
        delete this.startButton;
        delete this.shuffleRound;
        delete this.roundNumber;
        delete this.targetDisplay;
        delete this.scoreDisplay;
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
            for (var i = 1; i <= 3; i++) {
                this.audio_slide_[i - 1].setVolume(value);
            }
            this.audio_success.setVolume(value);
            this.audio_failure.setVolume(value);
        }
    }

    //preload the scenes data
    preloadGame() {
        //sfx
        for (var i = 1; i <= 3; i++) {
            this.load.audio(
                'Slide_' + i + '_FrogShuffle',
                'assets/event/ff22/minigame/frogshuffle/audio/sfx/slide_' +
                    i +
                    '.ogg'
            );
        }
        this.load.audio('success', 'assets/audio/sfx/minigame/success.ogg');
        this.load.audio('failure', 'assets/audio/sfx/minigame/failure.ogg');

        //layers
        this.load.image(
            'Background_FrogShuffle',
            'assets/event/ff22/minigame/frogshuffle/layers/Background.png'
        );

        //objects
        this.load.image(
            'Hat_FrogShuffle',
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

        //frogs UI
        this.load.image(
            'Poke_FrogShuffle_UI',
            'assets/event/ff22/minigame/frogshuffle/UI/Poke.png'
        );
        this.load.image(
            'Jesse_FrogShuffle_UI',
            'assets/event/ff22/minigame/frogshuffle/UI/Jesse.png'
        );
        this.load.image(
            'Gigi_FrogShuffle_UI',
            'assets/event/ff22/minigame/frogshuffle/UI/Gigi.png'
        );
    }

    //set up the scene
    async createGame() {
        //sfx
        let sfxVolume =
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume;
        this.audio_slide = [];
        for (var i = 1; i <= 3; i++) {
            this.audio_slide[i - 1] = this.sound
                .add('Slide_' + i + '_FrogShuffle')
                .setVolume(sfxVolume);
        }
        this.audio_success = this.sound.add('success').setVolume(sfxVolume);
        this.audio_failure = this.sound.add('failure').setVolume(sfxVolume);

        //background
        this.add
            .sprite(
                game.config.width / 2,
                game.config.height / 2,
                'Background_FrogShuffle'
            )
            .setDepth(this.depthBackgroundUI);

        //get frog order
        let generatedFrogOrder = await client.FF22generateFrogOrder();

        //quit scene if failed
        if (generatedFrogOrder.status === false) this.quit();

        //frogs
        this.placeFrogs(generatedFrogOrder.frogOrder);

        //hats
        this.hats = [];
        this.hats[0] = this.add
            .sprite(
                this.gameData.leftPosition,
                this.gameData.hatHeight,
                'Hat_FrogShuffle'
            )
            .setDepth(this.gameData.depthHat);
        this.hats[1] = this.add
            .sprite(
                this.gameData.middlePosition,
                this.gameData.hatHeight,
                'Hat_FrogShuffle'
            )
            .setDepth(this.gameData.depthHat);
        this.hats[2] = this.add
            .sprite(
                this.gameData.rightPosition,
                this.gameData.hatHeight,
                'Hat_FrogShuffle'
            )
            .setDepth(this.gameData.depthHat);

        //let hats have an outline on hover (when set as interactive)
        this.hats.forEach((hat) => {
            globalUI.setOutlineOnHover(this, hat);
        });

        //start button
        this.startButton = ui
            .createButtons(this, {
                x: this.gameData.startButtonX,
                y: this.gameData.startButtonY,
                fontSize: 50,
                buttons: [
                    {
                        text: 'Start Game',
                        background: { radius: 8 },
                        onClick: () => {
                            //start game
                            this.initGame();

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

    //place frogs in correct order
    placeFrogs(frogOrder) {
        this.frogs = [];
        this.frogs[0] = this.add
            .sprite(
                this.gameData.leftPosition,
                this.gameData.frogHeight,
                frogOrder[0] + '_FrogShuffle'
            )
            .setDepth(this.gameData.depthFrog);
        this.frogs[1] = this.add
            .sprite(
                this.gameData.middlePosition,
                this.gameData.frogHeight,
                frogOrder[1] + '_FrogShuffle'
            )
            .setDepth(this.gameData.depthFrog);
        this.frogs[2] = this.add
            .sprite(
                this.gameData.rightPosition,
                this.gameData.frogHeight,
                frogOrder[2] + '_FrogShuffle'
            )
            .setDepth(this.gameData.depthFrog);
    }

    //add game info before starting game
    initGame() {
        //create score display
        this.scoreDisplay = ui
            .createSizer(
                this,
                {
                    content: [
                        {
                            type: 'text',
                            text: 'Score: 0',
                            fontSize: 32,
                        },
                    ],
                },
                {
                    x: this.gameData.scoreDisplayX,
                    y: this.gameData.scoreDisplayY,
                    background: {},
                }
            )
            .setOrigin(0.5, 0.5)
            .layout();

        //start game
        this.startGame();
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

        //quit scene if failed
        if (this.shuffleRound.status === false) this.quit();

        //determine swap speed
        let swapSpeed = this.gameData.swapSpeedMax - (this.gameData.swapSpeedMultiplier * this.roundNumber) < this.gameData.swapSpeedMin ? this.gameData.swapSpeedMin : this.gameData.swapSpeedMax - (this.gameData.swapSpeedMultiplier * this.roundNumber);

        //determine swap delay
        let swapDelay = this.gameData.swapDelayMax - (this.gameData.swapDelayMultiplier * this.roundNumber) < this.gameData.swapDelayMin ? this.gameData.swapDelayMin : this.gameData.swapDelayMax - (this.gameData.swapDelayMultiplier * this.roundNumber);

        //start shuffling
        let queueTime = 0;
        this.shuffleRound.sequence.forEach((sequence, index) => {
            //accumulate queue time
            if (index > 0)
                queueTime =
                    queueTime +
                    (swapSpeed + swapDelay);

            //queue each swap with a delay that gets bigger with each iteration so that it accounts for the time required for the previous swap in the queue
            setTimeout(
                () => {
                    //swap hat positions
                    this.tweens.add({
                        targets: this.hats[sequence[0] - 1],
                        x: this.hats[sequence[1] - 1].x,
                        duration: swapSpeed,
                        ease: 'Cubic.easeIn',
                    });
                    this.tweens.add({
                        targets: this.hats[sequence[1] - 1],
                        x: this.hats[sequence[0] - 1].x,
                        duration: swapSpeed,
                        ease: 'Cubic.easeIn',
                    });

                    //switch hats in list (to keep them in order from left to right)
                    [this.hats[sequence[0] - 1], this.hats[sequence[1] - 1]] = [
                        this.hats[sequence[1] - 1],
                        this.hats[sequence[0] - 1],
                    ];

                    //play sound
                    this.audio_slide[utility.getRandomInt(0, 2)].play();
                },

                //delay
                queueTime
            );
        });

        //wait for swapping to finish
        await utility.wait(queueTime + 1000);

        //make hats interactable
        this.hats.forEach((hat, index) => {
            hat.setInteractive();

            //remove old listener
            hat.removeListener('pointerdown');

            //give click listener
            hat.on('pointerdown', this.hatSelected.bind(this, index));
        });

        //ask player to choose a hat matching the target
        this.targetDisplay = ui
            .createSizer(
                this,
                {
                    content: [
                        {
                            type: 'text',
                            text: 'Find ' + this.shuffleRound.target,
                            fontSize: 48,
                        },
                        {
                            type: 'custom',
                            custom: () => {
                                return this.add.sprite(
                                    0,
                                    0,
                                    this.shuffleRound.target + '_FrogShuffle_UI'
                                );
                            },
                        },
                    ],
                },
                {
                    x: this.gameData.targetDisplayX,
                    y: this.gameData.targetDisplayY,
                    background: {},
                }
            )
            .setOrigin(0.5, 0)
            .layout();
    }

    //hat selected
    async hatSelected(index) {
        //remove interactability from hats
        this.hats.forEach((hat) => {
            hat.disableInteractive();
        });

        //check with server
        let hatPick = await client.FF22requestHatPick(index);

        //game is broken lole
        if (hatPick.status === undefined || hatPick.status === null)
            this.quit();

        //remove target display
        this.targetDisplay.destroy();

        //place frogs
        this.placeFrogs(hatPick.frogOrder);

        //raise hats
        this.hats.forEach((hat) => {
            this.tweens.add({
                targets: hat,
                y: this.gameData.hatHeight,
                duration: 700,
                ease: 'Cubic.easeIn',
            });
        });

        //wait for hats to raise
        await utility.wait(700);

        //if success
        if (hatPick.status) {
            //update score display
            this.scoreDisplay
                .getElement('items')[0]
                .setText(
                    'Score: ' + this.gameData.payoutPerRound * this.roundNumber
                );
            this.scoreDisplay.layout();

            //success sound
            this.audio_success.play();

            //wait
            await utility.wait(2000);

            //start next round
            this.startGame();
        }

        //if failure
        else {
            //failure sound
            this.audio_failure.play();

            //show reward
            globalUI.showDialog(
                this,
                'You Picked The Wrong Hat!',
                'You won ' + hatPick['prizeAmount'] + ' tickets.',
                'Play Again?',
                async () => {
                    //restart game
                    this.end();
                    this.scene.start('FF22FrogShuffle');
                }
            );

            //update ticket amount
            ff22.changeTickets(this, hatPick['prizeAmount']);
        }
    }
}
