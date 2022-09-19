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

            emotePaddingColumn: 40,
            emotePaddingRow: 40,

            columnCount: 8,
            rowCount: 3,

            columnPos: 110,
            rowPos: 190,

            columnSpace: 150,
            rowSpace: 220,

            depthCard: 1,
            depthEmote: 2,
        };

        //reset data
        // delete this.cardGrid;
        delete this.cardObjects;
        delete this.emoteObjects;
        delete this.flippedCards;
        delete this.flippedEmotes;
        delete this.matchedCards;
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
        // this.load.image(
        //     'background',
        //     'assets/event/ff22/minigame/dailyspin/layers/Background.png'
        // );

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

        //determine spots for each card
        await client.FF22generateEmoteCards();
        // this.determineCardPositions();

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

        //animate cards going to their spots
        this.animateCardPositions();

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
            for (var i = 1; i <= 3; i++) {
                this.audio_card_flip[i - 1].setVolume(value);
            }
            this.audio_success.setVolume(value);
            this.audio_success_long.setVolume(value);
        }
    }

    // //determine where the cards go on the grid
    // determineCardPositions() {
    //     //make list of all the cards
    //     let cards = [];
    //     for (var i = 0; i < this.gameData.cards.length; i++) {
    //         //push the card to the list twice
    //         cards.push(this.gameData.cards[i]);
    //         cards.push(this.gameData.cards[i]);
    //     }

    //     //tie each spot to a random card on the list
    //     this.cardGrid = [];
    //     for (var i = 0; i < 24; i++) {
    //         //choose random card in list
    //         let index = utility.getRandomInt(0, cards.length - 1);
    //         let card = cards[index];

    //         //remove card from list
    //         cards.splice(index, 1);

    //         //push card to card grid in correct order
    //         this.cardGrid.push(card);
    //     }
    // }

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
        //init matched cards
        if (this.matchedCards === undefined) {
            this.matchedCards = [];
            for (
                var i = 0;
                i < this.gameData.columnCount * this.gameData.rowCount;
                i++
            ) {
                this.matchedCards[i] = false;
            }
        }

        //init flipped cards
        if (this.flippedCards === undefined) this.flippedCards = [];

        //init flipped emotes
        if (this.flippedEmotes === undefined) this.flippedEmotes = [];

        //init variable that stores the action to take
        let action;

        //card already matched/flipped
        if (
            this.matchedCards[index] ||
            index === this.flippedCards[0] ||
            index === this.flippedCards[1]
        ) {
            return;
        }

        //first card flipped
        else if (this.flippedCards[0] === undefined) {
            action = 'first_card';
        }

        //second card flipped
        else if (
            this.flippedCards[0] !== undefined &&
            this.flippedCards[1] === undefined
        ) {
            action = 'second_card';
        }

        //not a valid action
        else {
            return;
        }

        //get emote from server
        let emote = await client.FF22getEmoteCard(index);

        //store emote
        this.flippedEmotes[index] = emote;

        //apply texture to emote portion of the card
        this.emoteObjects[index].setTexture(emote);

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
        if (action === 'first_card') {
            //store first cards index
            this.flippedCards[0] = index;
        } else if (action === 'second_card') {
            //store second cards index
            this.flippedCards[1] = index;

            //cards match (keep them flipped and allow the player to keep flipping)
            if (
                this.flippedEmotes[this.flippedCards[0]] ===
                this.flippedEmotes[this.flippedCards[1]]
            ) {
                setTimeout(() => {
                    //success sound
                    this.audio_success.play();

                    //add cards to flipped list
                    this.matchedCards[this.flippedCards[0]] = true;
                    this.matchedCards[this.flippedCards[1]] = true;

                    //reset flipped card list
                    this.flippedCards = [];

                    //if all cards have been matched
                    if (
                        this.matchedCards.every((element) => {
                            return element === true;
                        })
                    ) {
                        setTimeout(() => {
                            //sfx
                            this.audio_success_long.play();
                        }, 500);
                    }
                }, 500);
            }

            //cards dont match (flip both cards back after a while)
            else {
                setTimeout(() => {
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
