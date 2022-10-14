// Game Rooms Chat Logs

//imports: file parsing
import jsonPath from 'jsonpath';

//config
import roomData from '../data/roomData.json' assert { type: 'json' };

//imports
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

export default {
    chatLogs: {},

    init: function (io) {
        //on room creation
        io.of('/').adapter.on('create-room', (room) => {
            try {
                //check if room exists
                if (jsonPath.query(roomData, '$..' + room)[0]) {
                    //init chat log for room
                    if (this.chatLogs[room] === undefined) {
                        this.chatLogs[room] = [];

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
                //ignore certain errors
                if (
                    error
                        .toString()
                        .includes('Error: Parse error on line 1:') ||
                    error
                        .toString()
                        .includes(
                            'Error: Lexical error on line 1. Unrecognized text.'
                        )
                )
                    return;
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
