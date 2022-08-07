//dependency: file path
const path = require('path');

//imports
const utility = require(path.join(__dirname, 'Utility.js'));

chatLogs = {};

module.exports = {
    chatLogs: {},

    init: function (io) {
        //on room creation
        io.of('/').adapter.on('create-room', (room) => {
            try {
                //init chat log for room
                if (this.chatLogs[room] === undefined) {
                    this.chatLogs[room] = [];

                    //log
                    console.log(
                        utility.timestampString(
                            'Room Chat Log Initialized: ' + room
                        )
                    );
                }
            } catch {
                console.log(
                    utility.timestampString(
                        'Chat Log Initialization Error: ' + error
                    )
                );
            }
        });
    },

    logMessage: function (roomID, userID, userName, date, message) {
        //create entry
        let entry = {
            userID: userID,
            userName: userName,
            date: date,
            message: message,
        };

        //store entry
        this.chatLogs[roomID].push(entry);

        //delete older entries if over max
        if (this.chatLogs[roomID].length > 30) {
            this.chatLogs[roomID].splice(0, 1);
        }
    },

    getRoomLogs: function (roomID) {
        return this.chatLogs[roomID];
    },
};
