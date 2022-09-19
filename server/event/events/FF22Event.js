// FF22Event Events

//dependency: file path
const path = require('path');

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

        //init spins
        this.dailySpinCheck();
    }

    async register() {
        //triggers when client requests the players ticket count
        this.socket.on('FF22requestTicketCount', async (cb) => {
            cb(await this.getTicketCount());
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
        this.socket.on('FF22generateEmoteCards', async (cb) => {
            cb(this.generateEmoteCards());
        });

        //triggers when client requests the emote for a card using its index on the grid
        this.socket.on('FF22requestEmoteCard', (index, cb) => {
            cb(this.getEmoteCard(index));
        });
    }

    //triggers when client requests the players ticket count
    async getTicketCount() {
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
            await this.PlayerData.changeSpecificClientPlayerData(
                '/event/ff22/tickets',
                prizeAmount
            );

            return { status: true, degrees: degrees };
        } else {
            //no spins left
            return { status: false };
        }
    }

    //determine where the cards go on the grid
    generateEmoteCards() {
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

        return true;
    }

    getEmoteCard(index) {
        return this.cardGrid[index];
    }
}

module.exports = FF22Event;
