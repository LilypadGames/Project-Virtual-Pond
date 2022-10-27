// Game Commands

//imports: file parsing
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));
import jsonPath from 'jsonpath';

//imports
import sceneData from '../data/sceneData.json' assert { type: 'json' };

export default {
    runCommand: function (socket, command) {
        //start scene command
        if (command[0] === 'startscene') {
            //invalid parameters (no first para)
            if (
                !command[1] ||
                command[2] ||
                !jsonPath.query(sceneData, '$..' + command[1])[0]
            ) {
                //server message
                socket.emit('payloadServerMessage', 'Invalid Parameters');
                return false;
            }

            //successful command
            else {
                //run command
                this.startScene(socket, command[1]);
            }
        } else if (command[0] === 'yo') {
            socket.emit('payloadServerMessage', 'yo');
        }

        //not a command
        else {
            //server message
            socket.emit('payloadServerMessage', 'Invalid Command');
            return false;
        }

        return true;
    },

    startScene: function (socket, scene) {
        //server message
        socket.emit('payloadNewScene', scene);
    },
};
