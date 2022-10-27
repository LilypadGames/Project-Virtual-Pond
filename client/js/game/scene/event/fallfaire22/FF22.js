// Fall Faire 2022 Event Handler

class FF22 {
    init() {
        //reset UI
        delete this.ticketIcon;
        delete this.ticketText;
    }

    preload(scene) {
        //init
        this.init();

        //UI
        scene.load.image('ticket_icon', 'assets/event/ff22/ui/ticket_icon.png');

        //minigame scenes
        if (scene.scene.key.includes('FF22')) {
            //music
            scene.load.audio(
                'frog_caves_fair',
                'assets/event/ff22/audio/music/frog_caves_fair.ogg'
            );
        }
    }

    async create(scene) {
        //get current ticket count
        scene.ticketCount = await client.FF22getTicketCount();

        //ticket icon
        this.ticketIcon = scene.add
            .sprite(1220, 40, 'ticket_icon')
            .setDepth(scene.depthUI)
            .setOrigin(0.5, 0.5)
            .setInteractive();
        globalUI.setOutlineOnHover(scene, this.ticketIcon);

        //ticket amount
        this.ticketText = scene.add
            .text(1220, 40, '', {
                fontFamily: 'Burbin',
                fontSize: '16px',
                align: 'center',
                color: utility.hexIntegerToString(ColorScheme.Black),
            })
            .setDepth(scene.depthUI)
            .setOrigin(0.5, 0.5)
            .setFixedSize(60, 20);

        //update ticket display
        this.updateTicketDisplay(scene);

        //minigame scenes
        if (scene.scene.key.includes('FF22')) {
            //create toolbar
            this.createToolbar(scene);

            //set up functions
            scene.menuOpened = this.menuOpened;
            scene.menuClosed = this.menuClosed;
            scene.showOptions = this.showOptions;

            //play music
            scene.audioMusic = scene.sound.add('frog_caves_fair', {
                mute: false,
                volume: 0,
                rate: 1,
                detune: 0,
                seek: 0,
                loop: true,
                delay: 0,
            });

            //start music and set volume from localStorage settings
            scene.audioMusic.setVolume(
                utility.getLocalStorage('gameOptions')[
                    utility.getLocalStorageArrayIndex('gameOptions', 'music')
                ].volume
            );
            scene.audioMusic.play();
        }
    }

    end(scene) {
        //minigame scenes
        if (scene.scene.key.includes('FF22')) {
            //stop music
            if (scene.audioMusic) scene.audioMusic.stop();
        }
    }

    changeTickets(scene, delta) {
        //update amount
        scene.ticketCount = scene.ticketCount + delta;

        //update ticket display
        this.updateTicketDisplay(scene);
    }

    async updateTickets(scene) {
        //get current ticket count
        scene.ticketCount = await client.FF22getTicketCount();

        //update ticket display
        this.updateTicketDisplay(scene);
    }

    updateTicketDisplay(scene) {
        this.ticketText.setText(scene.ticketCount);
    }

    //create toolbar for minigame scenes
    createToolbar(scene) {
        //options menu
        ui.createButtons(scene, {
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
                        scene.quit();
                    },
                },
                //options menu
                {
                    text: '⚙️',
                    background: { radius: 8 },
                    onClick: () => {
                        //check if menu is open
                        if (!scene.menuOpen) {
                            //show options menu
                            scene.showOptions(scene);
                        }
                    },
                },
            ],
        })
            .setDepth(scene.depthUI)
            .setOrigin(0, 0.5);
    }

    //show options menu
    showOptions(scene) {
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
                    scene.audioMusic.setVolume(value);
                    // scene.changeVolume('music', value);
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
                    scene.sfxButtonClick.setVolume(value);
                    scene.changeVolume('sfx', value);
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
            scene,
            {
                title: 'Options',
                content: content,
            },
            {
                cover: true,
                onExit: () => {
                    //set menu as closed
                    scene.menuClosed();
                },
            }
        );

        //set menu as opened
        scene.menuOpened();
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
