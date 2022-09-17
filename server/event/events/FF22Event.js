// FF22Event Events

//dependency: file path
const path = require('path');

//imports
const utility = require(path.join(__dirname, '../../utility/Utility.js'));

//DailySpinOptions
let DailySpinOptions = {
    // slices (prizes) placed in the wheel
    slices: 8,

    // prize amounts, starting from 12 o'clock going clockwise
    prizeAmounts: [50, 5, 25, 0, 50, 5, 25, 0],
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
                DailySpinOptions.prizeAmounts[
                    DailySpinOptions.slices -
                        1 -
                        Math.floor(degrees / (360 / DailySpinOptions.slices))
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
}

module.exports = FF22Event;
