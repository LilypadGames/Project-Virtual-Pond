//dependency: file parsing
const path = require('path');
const jsonPath = require('jsonpath');

//imports
const utility = require(path.join(__dirname, '../utility/Utility.js'));
const ConsoleColor = require(path.join(
    __dirname,
    '../utility/ConsoleColor.js'
));
const roomConfig = require(path.join(__dirname, '../config/room.json'));

chatLogs = {};

module.exports = {
    init: function (io) {
        //on room creation
        io.of('/').adapter.on('create-room', (room) => {
            try {
                //check if room exists
                if (jsonPath.query(roomConfig, '$..' + room)[0]) {
                    //init chat log for room
                    if (chatLogs[room] === undefined) {
                        chatLogs[room] = [];

                        //log
                        console.log(
                            ConsoleColor.Cyan,
                            utility.timestampString(
                                'Room Chat Log Initialized: ' + room
                            )
                        );
                    }
                }
            } catch (error) {
                console.log(
                    ConsoleColor.Red,
                    utility.timestampString('Chat Log Init - ' + error)
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
        chatLogs[roomID].push(entry);

        //delete older entries if over max
        if (chatLogs[roomID].length > 30) {
            chatLogs[roomID].splice(0, 1);
        }
    },

    getRoomLogs: function (roomID) {
        return chatLogs[roomID];
    },
};
