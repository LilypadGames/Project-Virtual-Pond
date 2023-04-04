// Moderation functions

//modules
import log from './Logs.js';

export default {
    kickMessage: function (
        socket,
        reason,
        kickMessage = 'You have been kicked.'
    ) {
        //log
        log.socketAction(
            socket,
            'Has Been Kicked For: ' +
                reason +
                ' > Client Facing Message: ' +
                kickMessage,
            { file: 'moderation' }
        );

        //create kick message
        return reason !== undefined
            ? kickMessage + '\n\n' + 'Reason: ' + reason
            : kickMessage;
    },

    kickSocket: async function (socket, reason, kickMessage) {
        //kick message
        kickMessage = this.kickMessage(socket, reason, kickMessage);

        //send kick message to this client
        socket.emit('payloadKickReason', kickMessage);

        //kick
        socket.disconnect();
    },

    kickClient: async function (io, player, reason, kickMessage) {
        //kick message
        kickMessage = this.kickMessage(player, reason, kickMessage);

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
