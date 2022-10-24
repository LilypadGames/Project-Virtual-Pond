// Fall Faire Event 2022 - Daily Spin

class FF22EmoteMatch extends Phaser.Scene {
    // INIT
    constructor() {
        super({ key: 'FF22EmoteMatch' });
    }

    init() {
        //global variables
        globalUI.init(this);

        //set up game data
        this.gameData = {
            cards: [
                'pokeAYAYA',
                'pokeCOZY',
                'pokeCRY',
                'pokeEZ',
                'pokeFAT',
                'pokeG',
                'pokeHD',
                'pokeL',
                'pokePoggers',
                'pokeSMOKE',
                'pokeSUBS',
                'pokeWICKED',
            ],

            emotePaddingColumn: 39,
            emotePaddingRow: 39,

            columnCount: 8,
            rowCount: 3,

            columnPos: 110,
            rowPos: 190,

            columnSpace: 150,
            rowSpace: 220,

            depthCard: 1,
            depthEmote: 2,
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
            'emotematch_background',
            'assets/event/ff22/minigame/emotematch/layers/Background.png'
        );

        //cards
        for (var i = 0; i < this.gameData.cards.length; i++) {
            this.load.image(
                this.gameData.cards[i],
                'assets/event/ff22/minigame/emotematch/objects/' +
                    this.gameData.cards[i] +
                    '.png'
            );
        }
        this.load.image(
            'card_front',
            'assets/event/ff22/minigame/emotematch/objects/Card_Front.png'
        );
        this.load.image(
            'card_back',
            'assets/event/ff22/minigame/emotematch/objects/Card_Back.png'
        );

        //sfx
        for (var i = 1; i <= 3; i++) {
            this.load.audio(
                'card_flip_' + i,
                'assets/event/ff22/minigame/emotematch/audio/sfx/card_flip_' +
                    i +
                    '.mp3'
            );
        }
        this.load.audio('success', 'assets/audio/sfx/minigame/success.mp3');
        this.load.audio(
            'success_long',
            'assets/audio/sfx/minigame/success_long.mp3'
        );
    }

    async create() {
        //run wait screen
        loadingScreen.runWaitScreen(this);

        //create global UI
        globalUI.create(this);

        //create events data
        await events.create(this);

        //sfx
        let sfxVolume =
            utility.getLocalStorage('gameOptions')[
                utility.getLocalStorageArrayIndex('gameOptions', 'sfx')
            ].volume;
        this.audio_card_flip = [];
        for (var i = 1; i <= 3; i++) {
            this.audio_card_flip[i - 1] = this.sound
                .add('card_flip_' + i)
                .setVolume(sfxVolume);
        }
        this.audio_success = this.sound.add('success').setVolume(sfxVolume);
        this.audio_success_long = this.sound
            .add('success_long')
            .setVolume(sfxVolume);

        //create background
        this.add
            .sprite(game.config.width / 2, game.config.height / 2, 'emotematch_background')
            .setDepth(this.depthBackgroundUI);

        //start game
        await this.startGame();

        //end wait screen
        loadingScreen.endWaitScreen(this);
    }

    end() {
        //end event data
        events.end(this);

        //reset data
        delete this.cardObjects;
        delete this.emoteObjects;
        delete this.flippedCards;
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
                this.audio_card_flip[i - 1].setVolume(value);
            }
            this.audio_success.setVolume(value);
            this.audio_success_long.setVolume(value);
        }
    }

    //restart the game
    async startGame() {
        //init flipped cards
        if (this.flippedCards === undefined) this.flippedCards = [];

        //determine spots for each card
        await client.FF22generateEmoteCards();

        //animate cards going to their spots
        this.animateCardPositions();
    }

    //animate cards going into their positions
    animateCardPositions() {
        this.cardObjects = [];
        this.emoteObjects = [];
        let x = this.gameData.columnPos;
        let y = this.gameData.rowPos;
        let index = 0;

        //rows
        for (var row = 0; row < this.gameData.rowCount; row++) {
            //columns
            for (var column = 0; column < this.gameData.columnCount; column++) {
                //create card at this spot in the grid
                let card = this.add
                    .sprite(x, y, 'card_back')
                    .setInteractive()
                    .on('pointerdown', this.clickedCard.bind(this, index))
                    .setDepth(this.gameData.depthCard)
                    .setOrigin(0.5, 0.5);

                let emote = this.add
                    // .sprite(x, y, this.cardGrid[index])
                    .sprite(x, y, '')
                    .setDepth(this.gameData.depthEmote)
                    .setOrigin(0.5, 0.5)
                    .setVisible(false);

                //make it so hovering gives an outline to the card
                globalUI.setOutlineOnHover(this, card);

                //add card and emote to list
                this.cardObjects.push(card);
                this.emoteObjects.push(emote);

                //next column
                x = x + this.gameData.columnSpace;

                //next card slot
                index++;
            }

            //next row
            x = this.gameData.columnPos;
            y = y + this.gameData.rowSpace;
        }
    }

    //player clicked on a card
    async clickedCard(index) {
        //tell server that the player flipped a card and receive the status of the game
        let status = await client.FF22flipCard(index);

        //invalid action
        if (status['action'] === 'return') {
            return;
        }

        //apply texture to emote portion of the card
        this.emoteObjects[index].setTexture(status['emote']);

        //flip card
        this.cardObjects[index].setTexture('card_front');
        this.audio_card_flip[utility.getRandomInt(0, 2)].play();

        // //calculate row and column from its index
        // let row = Math.floor(index / this.gameData.columnCount) + 1;
        // let column =
        //     index -
        //     row * this.gameData.columnCount +
        //     this.gameData.columnCount +
        //     1;

        //remove interactivity from card
        this.cardObjects[index].disableInteractive();

        //show emote
        this.emoteObjects[index].setVisible(true);

        //take action
        if (status['action'] === 'first_card') {
            //store first cards index
            this.flippedCards[0] = index;
        } else if (status['action'] === 'second_card') {
            //store second cards index
            this.flippedCards[1] = index;

            //cards match (keep them flipped and allow the player to keep flipping)
            if (status['matched']) {
                setTimeout(() => {
                    //make sure player is still in the right scene
                    if (currentScene.scene.key !== 'FF22EmoteMatch') return;
                    
                    //success sound
                    this.audio_success.play();

                    //reset flipped card list
                    this.flippedCards = [];

                    //if all cards have been matched
                    if (status['completed']) {
                        setTimeout(() => {
                            //make sure player is still in the right scene
                            if (currentScene.scene.key !== 'FF22EmoteMatch') return;

                            //format time
                            let formattedTime = new Date(status['time'] * 1000).toISOString().slice(14, 19);

                            //sfx
                            this.audio_success_long.play();

                            //show reward dialog
                            globalUI.showDialog(
                                this,
                                'Time: ' + formattedTime,
                                'You won ' +
                                    status['prizeAmount'] +
                                    ' tickets!',
                                'Play Again?',
                                async () => {
                                    //restart game
                                    this.scene.start('FF22EmoteMatch');
                                }
                            );

                            //update ticket amount
                            ff22.changeTickets(this, status['prizeAmount']);
                        }, 500);
                    }
                }, 500);
            }

            //cards dont match (flip both cards back after a while)
            else {
                setTimeout(() => {
                    //make sure player is still in the right scene
                    if (currentScene.scene.key !== 'FF22EmoteMatch') return;

                    //flip cards
                    this.cardObjects[this.flippedCards[0]].setTexture(
                        'card_back'
                    );
                    this.cardObjects[this.flippedCards[1]].setTexture(
                        'card_back'
                    );

                    //make cards interactive again
                    this.cardObjects[this.flippedCards[0]].setInteractive();
                    this.cardObjects[this.flippedCards[1]].setInteractive();

                    //hide emotes
                    this.emoteObjects[this.flippedCards[0]].setVisible(false);
                    this.emoteObjects[this.flippedCards[1]].setVisible(false);

                    //play flip sounds
                    this.audio_card_flip[utility.getRandomInt(0, 2)].play();
                    this.audio_card_flip[utility.getRandomInt(0, 2)].play();

                    //reset flipped card list
                    this.flippedCards = [];
                }, 1500);
            }
        }
    }
}
