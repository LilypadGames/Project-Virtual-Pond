// Server Metrics

export default {
    playerCount: 0,
    playerList: {},

    playerJoined: function (playerID, playerName) {
        //increase
        this.playerCount = this.playerCount + 1;

        //add player ID and name to online player list
        if (playerID && playerName) {
            this.playerList[playerID] = playerName;
        }
    },

    playerLeft: function (playerID) {
        //decrease
        this.playerCount = this.playerCount - 1;

        //remove player from online player list
        if (playerID) {
            delete this.playerList[playerID];
        }
    },

    getPlayerCount: function () {
        return this.playerCount;
    },

    getPlayers: function () {
        return this.playerList;
    }
};
