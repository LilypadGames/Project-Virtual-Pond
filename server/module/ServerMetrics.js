// Server Metrics

export default {
    playerCount: 0,

    init: function () {},

    playerJoined: function () {
        //increase
        this.playerCount = this.playerCount + 1;
    },

    playerLeft: function () {
        //decrease
        this.playerCount = this.playerCount - 1;
    },

    getPlayerCount: function () {
        return this.playerCount;
    },
};
