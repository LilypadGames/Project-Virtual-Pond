// FF22Event Events

//dependency: file path
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../../config/config.json'));

//imports
const utility = require(path.join(__dirname, '../../utility/Utility.js'));

//DailySpinData
let DailySpinData = {
    // slices (prizes) placed in the wheel
    slices: 8,

    // prize amounts, starting from 12 o'clock going clockwise
    prizeAmounts: [50, 5, 25, 0, 50, 5, 25, 0],
};

//set up game data
let EmoteMatchData = {
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

    columnCount: 8,
    rowCount: 3,

    prizeAmount: 30,
};

class FF22Event {
    constructor(io, socket, playerData) {
        //save socket and socket.io instance
        this.socket = socket;
        this.io = io;

        //save PlayerData instance
        this.PlayerData = playerData;
    }

    async init() {
        //register events
        this.register();

        //get players ticket count
        this.ticketCount = await this.retreiveTicketCount();

        //init spins
        this.dailySpinCheck();
    }

    async register() {
        //triggers when client requests the players ticket count
        this.socket.on('FF22requestTicketCount', (cb) => {
            cb(this.getTicketCount());
        });

        //triggers when client requests the players daily spin count
        this.socket.on('FF22requestDailySpinCount', async (cb) => {
            cb(await this.getDailySpinCount());
        });

        //triggers when client requests the players daily spin count
        this.socket.on('FF22requestDailySpin', async (cb) => {
            cb(await this.attemptDailySpin());
        });

        //triggers when client requests the players last daily spin time
        this.socket.on('FF22requestLastDailySpinTime', async (cb) => {
            cb(await this.getLastDailySpinTime());
        });

        //triggers when client begins to play the emote match minigame and needs the emote card slots to be generated
        this.socket.on('FF22generateEmoteCards', (cb) => {
            cb(this.generateEmoteCards());
        });

        //triggers when client requests the emote for a card using its index on the grid
        this.socket.on('FF22requestCardFlip', async (index, cb) => {
            cb(await this.flippedCard(index));
        });
    }

    async onDisconnect() {
        //check if bypass auth mode is on
        if (!config.server.bypassAuth) {
            //save players ticket count
            await this.PlayerData.changeSpecificClientPlayerData(
                '/event/ff22/tickets',
                this.ticketCount
            );
        }
    }

    //triggers when the players ticket count should be retreived
    async retreiveTicketCount() {
        //get ticket count
        let ticketCount = await this.PlayerData.getSpecificClientPlayerData(
            '/event/ff22/tickets'
        );

        //init if unset
        if (ticketCount === undefined || ticketCount === null) {
            ticketCount = 0;
            this.PlayerData.setSpecificClientPlayerData(
                '/event/ff22/tickets',
                ticketCount
            );
        }

        //return ticket count
        return ticketCount;
    }

    //triggers when client requests the players ticket count
    getTicketCount() {
        return this.ticketCount;
    }

    //triggers when client requests the daily spin count
    async getDailySpinCount() {
        //init
        await this.dailySpinCheck();

        //get daily spin count
        let dailySpinCount = await this.PlayerData.getSpecificClientPlayerData(
            '/event/ff22/dailySpins'
        );
        dailySpinCount = dailySpinCount === undefined ? 0 : dailySpinCount;

        //return daily spin count
        return dailySpinCount;
    }

    //triggers when client requests the daily spin count
    async getLastDailySpinTime() {
        //init
        await this.dailySpinCheck();

        //get last daily spin
        let lastDailySpin = await this.PlayerData.getSpecificClientPlayerData(
            '/event/ff22/lastDailySpin'
        );

        //return last daily spin
        return lastDailySpin;
    }

    //check for daily spins
    async dailySpinCheck() {
        //init last daily spin
        if (
            (await this.PlayerData.getSpecificClientPlayerData(
                '/event/ff22/lastDailySpin'
            )) === undefined
        ) {
            //last daily spin
            this.PlayerData.setSpecificClientPlayerData(
                '/event/ff22/lastDailySpin',
                Date.now()
            );

            //daily spins
            this.PlayerData.setSpecificClientPlayerData(
                '/event/ff22/dailySpins',
                3
            );
        }

        //reset last daily spin
        else {
            //get last spin time
            let lastDailySpin =
                await this.PlayerData.getSpecificClientPlayerData(
                    '/event/ff22/lastDailySpin'
                );

            //get difference between now and the last spin
            let hourDifference =
                Math.abs(Date.now() - lastDailySpin) / (60 * 60 * 1000);

            //check if theres been 12 hours since last spin
            if (hourDifference >= 12) {
                //reset last daily spin
                this.PlayerData.setSpecificClientPlayerData(
                    '/event/ff22/lastDailySpin',
                    Date.now()
                );

                //daily spins
                this.PlayerData.setSpecificClientPlayerData(
                    '/event/ff22/dailySpins',
                    3
                );
            }
        }
    }

    //triggers when player attempts to spin the wheel
    async attemptDailySpin() {
        //check if player has daily spins left
        let dailySpinCount = await this.PlayerData.getSpecificClientPlayerData(
            '/event/ff22/dailySpins'
        );

        //if daily spins left
        if (dailySpinCount >= 1) {
            //remove 1 from daily spin count
            await this.PlayerData.setSpecificClientPlayerData(
                '/event/ff22/dailySpins',
                dailySpinCount - 1
            );

            //then will rotate by a random number from 0 to 360 degrees. This is the actual spin.
            var degrees = utility.getRandomInt(0, 360);

            //before the wheel ends spinning, we already know the prize according to "degrees" rotation and the number of slices
            var prizeAmount =
                DailySpinData.prizeAmounts[
                    DailySpinData.slices -
                        1 -
                        Math.floor(degrees / (360 / DailySpinData.slices))
                ];

            //award the players win
            this.ticketCount = this.ticketCount + prizeAmount;

            return { status: true, degrees: degrees };
        } else {
            //no spins left
            return { status: false };
        }
    }

    //determine where the cards go on the grid
    generateEmoteCards() {
        //reset
        delete this.cardGrid;
        delete this.flippedCards;
        delete this.matchedCards;

        //make list of all the cards
        let cards = [];
        for (var i = 0; i < EmoteMatchData.cards.length; i++) {
            //push the card to the list twice
            cards.push(EmoteMatchData.cards[i]);
            cards.push(EmoteMatchData.cards[i]);
        }

        //tie each spot to a random card on the list
        this.cardGrid = [];
        for (var i = 0; i < 24; i++) {
            //choose random card in list
            let index = utility.getRandomInt(0, cards.length - 1);
            let card = cards[index];

            //remove card from list
            cards.splice(index, 1);

            //push card to card grid in correct order
            this.cardGrid.push(card);
        }

        //init matched cards
        if (this.matchedCards === undefined) {
            this.matchedCards = [];
            for (
                var i = 0;
                i < EmoteMatchData.columnCount * EmoteMatchData.rowCount;
                i++
            ) {
                this.matchedCards[i] = false;
            }
        }

        //init flipped cards
        if (this.flippedCards === undefined) this.flippedCards = [];

        return true;
    }

    async flippedCard(index) {
        //init game status
        let status = {};

        //card already matched/flipped
        if (
            this.matchedCards[index] ||
            index === this.flippedCards[0] ||
            index === this.flippedCards[1] ||
            this.flippedCards[1] !== undefined
        ) {
            //set action
            status['action'] = 'return';
        }

        //first card flipped
        else if (this.flippedCards[0] === undefined) {
            //set action
            status['action'] = 'first_card';

            //store first cards index
            this.flippedCards[0] = index;
        }

        //second card flipped
        else if (
            this.flippedCards[0] !== undefined &&
            this.flippedCards[1] === undefined
        ) {
            //set action
            status['action'] = 'second_card';

            //store second cards index
            this.flippedCards[1] = index;

            //cards match (keep them flipped and allow the player to keep flipping)
            if (
                this.cardGrid[this.flippedCards[0]] ===
                this.cardGrid[this.flippedCards[1]]
            ) {
                //set status to matched
                status['matched'] = true;

                //add cards to flipped list
                this.matchedCards[this.flippedCards[0]] = true;
                this.matchedCards[this.flippedCards[1]] = true;

                setTimeout(() => {
                    //reset flipped card list
                    this.flippedCards = [];
                }, 500);

                //if all cards have been matched
                if (
                    this.matchedCards.every((element) => {
                        return element === true;
                    })
                ) {
                    //set status to matched
                    status['completed'] = true;

                    //set prize amount
                    status['prize_amount'] = EmoteMatchData.prizeAmount;

                    //give tickets
                    this.ticketCount = this.ticketCount + EmoteMatchData.prizeAmount;
                }
            }

            //cards dont match (flip both cards back after a while)
            else {
                //set status to matched
                status['matched'] = false;

                setTimeout(() => {
                    //reset flipped card list
                    this.flippedCards = [];
                }, 1500);
            }
        }

        //not a valid action
        else {
            //set action
            status['action'] = 'return';
        }

        //get emote
        if (status['action'] !== 'return')
            status['emote'] = this.cardGrid[index];

        //return status of the game
        return status;
    }
}

module.exports = FF22Event;
