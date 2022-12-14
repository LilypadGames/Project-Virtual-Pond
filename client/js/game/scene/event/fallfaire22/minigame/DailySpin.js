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

        //reset data
        delete this.spinInfoTitle;
        delete this.spinInfoDesc;
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
            'dailyspin_background',
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

        //sfx
        this.load.audio(
            'wheel_spin',
            'assets/event/ff22/minigame/dailyspin/audio/sfx/wheel_spin.ogg'
        );
        this.load.audio('success', 'assets/audio/sfx/minigame/success.ogg');
        this.load.audio(
            'success_long',
            'assets/audio/sfx/minigame/success_long.ogg'
        );
        this.load.audio('failure', 'assets/audio/sfx/minigame/failure.ogg');
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //get daily spins count
        this.dailySpinCount = await client.FF22getDailySpinCount();

        //create background
        this.add
            .sprite(
                game.config.width / 2,
                game.config.height / 2,
                'dailyspin_background'
            )
            .setDepth(this.depthBackgroundUI);

        //create background for spin info
        this.add.rexRoundRectangle({
            x: game.config.width / 2 + 330,
            y: game.config.height / 2,
            width: 300,
            height: 150,
            radius: 30,
            color: ColorScheme.Blue,

            strokeColor: ColorScheme.DarkBlue,
            strokeWidth: 3,
        });

        //update spin info
        await this.updateSpinInfo();

        //create wheel
        this.createWheel();

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
            this.audio_wheel_spin.setVolume(value);
            this.audio_success.setVolume(value);
            this.audio_success_long.setVolume(value);
            this.audio_failure.setVolume(value);
        }
    }

    //update spin info
    async updateSpinInfo() {
        //init
        if (!this.spinInfoTitle) {
            this.spinInfoTitle = this.add
                .text(
                    game.config.width / 2 + 330,
                    game.config.height / 2 - 25,
                    '',
                    {
                        fontFamily: 'Burbin',
                        fontSize: '26px',
                        align: 'center',
                        color: utility.hexIntegerToString(ColorScheme.White),
                    }
                )
                .setOrigin(0.5, 0.5);
        }
        if (!this.spinInfoDesc) {
            this.spinInfoDesc = this.add
                .text(
                    game.config.width / 2 + 330,
                    game.config.height / 2 + 25,
                    '',
                    {
                        fontFamily: 'Burbin',
                        fontSize: '32px',
                        align: 'center',
                        color: utility.hexIntegerToString(ColorScheme.White),
                    }
                )
                .setOrigin(0.5, 0.5);
        }

        //still have daily spins left
        if (this.dailySpinCount >= 1) {
            //info desc
            this.spinInfoDesc.setText(this.dailySpinCount);

            //title
            this.spinInfoTitle.setText('Spins Left:');
        }
        //no more daily spins, get time until next spins
        else {
            //get last spin time
            this.lastDailySpinTime = await client.FF22getLastDailySpinTime();

            //update next spin time
            this.updateNextSpinTime();

            //title
            this.spinInfoTitle.setText('Time Until Next Spin:');
        }
    }

    //update spin time
    updateNextSpinTime() {
        //get time left
        let timeLeft = 43200000 + this.lastDailySpinTime - Date.now();

        //format
        var seconds = parseInt((timeLeft / 1000) % 60),
            minutes = parseInt((timeLeft / (1000 * 60)) % 60),
            hours = parseInt((timeLeft / (1000 * 60 * 60)) % 24);
        hours = hours < 10 ? '0' + hours : hours;
        minutes = minutes < 10 ? '0' + minutes : minutes;
        seconds = seconds < 10 ? '0' + seconds : seconds;
        let timeFormatted = hours + ':' + minutes + ':' + seconds;

        //info desc
        this.spinInfoDesc.setText(timeFormatted);

        //refresh scene
        if (timeLeft <= 0) {
            // this.end();
            this.scene.start('FF22DailySpin');
        }

        //update again in 1 second
        else {
            setTimeout(() => {
                if (currentScene.scene.key == 'FF22DailySpin')
                    this.updateNextSpinTime();
            }, 1000);
        }
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
        this.wheelText = this.add
            .text(
                game.config.width / 2 - 200,
                game.config.height - 40,
                this.dailySpinCount >= 1
                    ? 'Spin The Wheel!'
                    : 'Check Back Later!',
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
        let sfxVolume = store.get('gameOptions.sfx.volume');
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
            this.wheelText.setText('');

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
                    this.wheelText.setText(
                        this.dailySpinCount >= 1
                            ? 'Spin The Wheel!'
                            : 'Check Back Later!'
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

                    //update spin info
                    this.updateSpinInfo();
                },
            });

            //play wheel spin sound
            this.audio_wheel_spin
                .setVolume(store.get('gameOptions.sfx.volume'))
                .play();

            //fade out wheel spin sound
            this.time.delayedCall(
                this.gameOptions.rotationTime - 1000,
                this.rexSoundFade.fadeOut,
                [this, this.audio_wheel_spin, 500, false]
            );
        }
    }
}
