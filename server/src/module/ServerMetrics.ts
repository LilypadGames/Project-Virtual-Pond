// Server Metrics

export default {
    playerCount: 0,
    playerList: {},
    socketList: {},

    playerJoined: function (socket) {
        //increase
        this.playerCount = this.playerCount + 1;

        //add player ID to socket ID list
        this.socketList[socket.player.id] = socket.id;

        //add player ID to online player list
        this.playerList[socket.player.id] = socket.player.name;
    },

    playerLeft: function (socket) {
        //decrease
        this.playerCount = this.playerCount - 1;

        //remove player ID from socket ID list
        delete this.socketList[socket.player.id];

        //remove player ID from online player list
        delete this.playerList[socket.player.id];
    },

    getPlayerCount: function () {
        return this.playerCount;
    },

    getPlayers: function () {
        return this.playerList;
    },

    getSocketID: function (playerID) {
        return this.socketList[playerID];
    },
};
