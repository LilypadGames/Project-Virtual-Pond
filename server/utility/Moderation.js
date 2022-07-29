// Moderation functions

//dependency: file path
const path = require('path');

//imports
const logs = require(path.join(__dirname, 'Logs.js'));
const utility = require(path.join(__dirname, 'Utility.js'));

module.exports = {
    kickClient: async function (
        io,
        player,
        reason,
        kickMessage = 'You have been kicked.'
    ) {
        //log
        message = utility.timestampString(
            'PLAYER ID: ' +
                player.id +
                ' (' +
                player.name +
                ')' +
                ' - KICKED> Reason: ' +
                reason +
                ', Message: ' +
                kickMessage
        );
        logs.logMessage('moderation', message);

        //create kick message
        kickMessage =
            reason !== undefined
                ? kickMessage + '\n\n' + 'Reason: ' + reason
                : kickMessage;

        //get connected clients
        const connectedClients = await io.fetchSockets();

        //loop through connected clients
        for (const client of connectedClients) {
            //if this client has player information
            if (client.player) {
                //get player ID
                var playerID = client.player.id;

                //kick currently connected clients if they match the ID of the client attempting to connect
                if (playerID == player.id) {
                    //send kick message to this client
                    client.emit('payloadKickReason', kickMessage);

                    //kick this client
                    client.disconnect();

                    //end loop
                    break;
                }
            }
        }
    },

    //disconnect clients with the same ID
    kickClientsWithID: async function (io, id) {
        //get connected clients
        const connectedClients = await io.fetchSockets();

        //loop through connected clients
        for (const client of connectedClients) {
            //if this client has player information
            if (client.player) {
                //get player ID
                var playerID = client.player.id;

                //kick currently connected clients if they match the ID of the client attempting to connect
                if (playerID == id) {
                    //kick this client
                    client.disconnect();
                }
            }
        }
    },
};
