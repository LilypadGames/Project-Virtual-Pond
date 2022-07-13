chatLogs = {};

module.exports = {
    chatLogs,

    init: function(io) {
        //on room creation
        io.of("/").adapter.on("create-room", (room) => {
            console.log(room + ' created')
            //init chat log for room
            chatLogs[room] = {};
        });

        //purge older messages
    },

    logMessage: function(roomID, userID, date, message) {
        //get new ID
        let id = Object.keys(chatLogs[roomID]).length + 1;

        //create entry
        let entry = {
            userID: userID,
            date: date,
            message: message,
        }

        //store entry
        chatLogs[roomID][id] = entry;
    },

    getRoomLogs: function(roomID) {
        return chatLogs[roomID];
    }
}