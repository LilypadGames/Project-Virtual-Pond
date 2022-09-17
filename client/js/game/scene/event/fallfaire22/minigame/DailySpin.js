// Fall Faire Event 2022 - Daily Spin

class FF22DailySpin extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'FF22DailySpin' });
    }

    init() {
        //global variables
        globalUI.init(this);

        //options
        this.gameOptions = {
            // slices (prizes) placed in the wheel
            slices: 8,

            // prize names, starting from 12 o'clock going clockwise
            prizesText: [
                'You won 50 Tickets.',
                'You won 5 Tickets.',
                'You won 25 Tickets.',
                'No Win.',
                'You won 50 Tickets.',
                'You won 5 Tickets.',
                'You won 25 Tickets.',
                'No Win.',
            ],

            prizeAmounts: [50, 5, 25, 0, 50, 5, 25, 0],

            // wheel rotation duration, in milliseconds
            rotationTime: 3000,
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

        //layers
        this.load.image(
            'background',
            'assets/event/ff22/minigame/dailyspin/layers/Background.png'
        );

        //objects
        this.load.image(
            'wheel',
            'assets/event/ff22/minigame/dailyspin/objects/wheel.png'
        );
        this.load.image(
            'wheel_shadow',
            'assets/event/ff22/minigame/dailyspin/objects/wheel_shadow.png'
        );
        this.load.image(
            'pin',
            'assets/event/ff22/minigame/dailyspin/objects/pin.png'
        );

        //music

        //sfx
        this.load.audio(
            'wheel_spin',
            'assets/event/ff22/minigame/dailyspin/audio/sfx/wheel_spin.mp3'
        );
        this.load.audio('success', 'assets/audio/sfx/minigame/success.mp3');
        this.load.audio(
            'success_long',
            'assets/audio/sfx/minigame/success_long.mp3'
        );
        this.load.audio('failure', 'assets/audio/sfx/minigame/failure.mp3');
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //create background
        this.add.sprite(
            game.config.width / 2,
            game.config.height / 2,
            'background'
        );

        //get daily spins count
        this.dailySpinCount = await client.FF22getDailySpinCount();

        //create wheel
        this.createWheel();

        //create toolbar
        this.createToolbar();

        //end wait screen
        loadingScreen.endWaitScreen(this);
    }

    end() {
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

    //create toolbar
    createToolbar() {
        //options menu
        ui.createButtons(this, {
            x: 1215,
            y: 765,
            fontSize: 22,
            space: {
                item: 10,
            },
            buttons: [
                //go back arrow
                {
                    text: '⬅️',
                    background: { radius: 8 },
                    onClick: () => {
                        this.quit();
                    },
                },
                //options menu
                {
                    text: '⚙️',
                    background: { radius: 8 },
                    onClick: () => {
                        //check if menu is open
                        if (!this.menuOpen) {
                            //show options menu
                            this.showOptions();
                        }
                    },
                },
            ],
        })
            .setDepth(this.depthUI)
            .setOrigin(0, 0.5);
    }

    //create the wheel
    createWheel() {
        //adding the wheel's shadow in the middle of the canvas
        this.wheel_shadow = this.add
            .sprite(
                game.config.width / 2 - 200,
                game.config.height / 2,
                'wheel_shadow'
            )
            .setScale(1.33)
            .setInteractive()
            .on(
                'pointerdown',
                () => {
                    if (!this.menuOpen) this.spinWheel();
                },
                this
            );

        //adding the wheel in the middle of the canvas
        this.wheel = this.add
            .sprite(
                game.config.width / 2 - 200,
                game.config.height / 2,
                'wheel'
            )
            .setScale(1.33)
            .setInteractive()
            .on(
                'pointerdown',
                () => {
                    if (!this.menuOpen) this.spinWheel();
                },
                this
            );

        //adding the pin in the middle of the canvas
        this.pin = this.add
            .sprite(game.config.width / 2 - 200, game.config.height / 2, 'pin')
            .setScale(1.33)
            .setInteractive()
            .on(
                'pointerdown',
                () => {
                    if (!this.menuOpen) this.spinWheel();
                },
                this
            );

        //adding the text field
        this.prizeText = this.add
            .text(
                game.config.width / 2 - 200,
                game.config.height - 40,
                this.dailySpinCount >= 1
                    ? 'Spin The Wheel!'
                    : 'Come Back Tomorrow!',
                {
                    fontFamily: 'Burbin',
                    fontSize: '40px',
                    align: 'center',
                    color: utility.hexIntegerToString(ColorScheme.White),
                }
            )
            .setOrigin(0.5);

        //check if player has daily spins left
        if (this.dailySpinCount >= 1) this.canSpin = true;

        //sound
        let sfxVolume =
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume;
        this.audio_wheel_spin = this.sound.add('wheel_spin', {
            mute: false,
            volume: sfxVolume,
            rate: 1,
            detune: 0,
            seek: 0,
            loop: true,
            delay: 0,
        });
        this.audio_success = this.sound.add('success').setVolume(sfxVolume);
        this.audio_success_long = this.sound
            .add('success_long')
            .setVolume(sfxVolume);
        this.audio_failure = this.sound.add('failure').setVolume(sfxVolume);
    }

    //spin the wheel
    async spinWheel() {
        //can we spin the wheel?
        if (this.canSpin) {
            //get confirmation and status from server
            let spinData = await client.FF22attemptDailySpin();

            //no more spins
            if (!spinData['status']) return;

            //reduce spins
            this.dailySpinCount--;

            //resetting text field
            this.prizeText.setText('');

            //the wheel will spin between these amount of times. This is just visual.
            var rounds = Phaser.Math.Between(3, 5);

            //before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prize =
                this.gameOptions.slices -
                1 -
                Math.floor(
                    spinData['degrees'] / (360 / this.gameOptions.slices)
                );

            //now the wheel cannot spin because it's already spinning
            this.canSpin = false;

            //animation tweeen for the spin: duration 3s, will rotate by (360 * rounds + degrees) degrees
            //the quadratic easing will simulate friction
            this.tweens.add({
                //adding the wheel to tween targets
                targets: [this.wheel],

                //angle destination
                angle: 360 * rounds + spinData['degrees'],

                //tween duration
                duration: this.gameOptions.rotationTime,

                //tween easing
                ease: 'Cubic.easeOut',

                //callback scope
                callbackScope: this,

                //function to be executed once the tween has been completed
                onComplete: function (tween) {
                    //redisplay prize text
                    this.prizeText.setText(
                        this.dailySpinCount >= 1
                            ? 'Spin The Wheel!'
                            : 'Come Back Tomorrow!'
                    );

                    //lost
                    if (prize === 3 || prize === 7) {
                        this.audio_failure.play();

                        globalUI.showDialog(
                            this,
                            'Maybe Next Time!',
                            this.gameOptions.prizesText[prize],
                            'Continue'
                        );
                    }
                    //best win
                    else if (prize === 0 || prize === 4) {
                        this.audio_success_long.play();

                        globalUI.showDialog(
                            this,
                            'Big Win!',
                            this.gameOptions.prizesText[prize],
                            'Continue'
                        );
                    }
                    //won
                    else {
                        this.audio_success.play();

                        globalUI.showDialog(
                            this,
                            'Congrats!',
                            this.gameOptions.prizesText[prize],
                            'Continue'
                        );
                    }

                    //update ticket amount
                    ff22.changeTickets(
                        this,
                        this.gameOptions.prizeAmounts[prize]
                    );

                    //if player can still spin
                    if (this.dailySpinCount >= 1) this.canSpin = true;
                },
            });

            //play wheel spin sound
            this.audio_wheel_spin
                .setVolume(
                    utility.getLocalStorage('gameOptions')[
                        utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                    ].volume
                )
                .play();

            //fade out wheel spin sound
            this.time.delayedCall(
                this.gameOptions.rotationTime - 1000,
                this.rexSoundFade.fadeOut,
                [this, this.audio_wheel_spin, 500, false]
            );
        }
    }

    //show options menu
    showOptions() {
        //options content
        let content = [
            //music volume slider
            { type: 'text', text: 'Music Volume', fontSize: 24 },
            {
                type: 'slider',
                id: 'musicVolume',
                value: utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'music')
                ].volume,
                onSliderChange: (value) => {
                    //store locally for the user to persist changes between sessions
                    var options = utility.getLocalStorage('gameOptions');
                    options[
                        utility.getLocalStorageArrayIndex(
                            'gameOptions',
                            'music'
                        )
                    ].volume = value;
                    utility.storeLocalStorageArray('gameOptions', options);

                    //change volume
                    if (this.audioMusic) this.audioMusic.setVolume(value);
                },
            },

            //sfx volume slider
            { type: 'text', text: 'Sound Effects Volume', fontSize: 24 },
            {
                type: 'slider',
                id: 'sfxVolume',
                value: utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                ].volume,
                onSliderChange: (value) => {
                    //store locally for the user to persist changes between sessions
                    var options = utility.getLocalStorage('gameOptions');
                    options[
                        utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
                    ].volume = value;
                    utility.storeLocalStorageArray('gameOptions', options);

                    //change volume
                    this.sfxButtonClick.setVolume(value);
                    this.audio_wheel_spin.setVolume(value);
                    this.audio_success.setVolume(value);
                    this.audio_success_long.setVolume(value);
                    this.audio_failure.setVolume(value);
                },
            },
        ];

        //logout button
        content.push({
            type: 'button',
            text: 'Log Out',
            align: 'center',
            fontSize: 20,
            colorOnHover: ColorScheme.Red,
            onClick: () => {
                client.onLogout();
            },
        });

        //create options menu
        ui.createMenu(
            this,
            {
                title: 'Options',
                content: content,
            },
            {
                cover: true,
                onExit: () => {
                    //set menu as closed
                    this.menuClosed();
                },
            }
        );

        //set menu as opened
        this.menuOpened();
    }

    //show menu
    menuOpened() {
        //disable input
        this.disableInput = true;
        this.menuOpen = true;
    }

    //close menu
    menuClosed() {
        //enable input
        this.disableInput = false;
        this.menuOpen = false;
    }
}
