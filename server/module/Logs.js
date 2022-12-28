// Logging Functions

//imports: file parsing
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//get config values
import config from '../config/config.json' assert { type: 'json' };

//modules
import utility from '../module/Utility.js';
import ConsoleColor from '../module/ConsoleColor.js';

//init logging
var currentDay = utility.getCurrentDay();
let logPath = '../../' + config.paths.logs + '/';
utility.createDirectory(path.join(__dirname, logPath));
var logFile = [];

export default {
    //get log file
    getLog: function (logType) {
        //get current day
        const date = utility.getCurrentDay();

        //if its a new day, refresh stored write streams
        if (currentDay !== date) {
            //end every stored write stream
            var index = logFile.length;
            while (index--) {
                //end write stream
                logFile[index - 1].end();
            }

            //reset stored write streams
            logFile = [];

            //store new day
            currentDay = date;
        }

        //create log file write stream if it does not already exist
        if (!logFile[logType]) {
            //get path
            const filePath = path.join(
                __dirname,
                logPath,
                logType,
                '/',
                date + '.txt'
            );

            //make log directory if it doesn't exist
            if (!fs.existsSync(path.join(__dirname, logPath, logType))) {
                utility.createDirectory(path.join(__dirname, logPath, logType));
            }

            //store log file stream
            logFile[logType] = fs.createWriteStream(filePath, { flags: 'a' });

            // DEBUG
            console.log('New Write Stream');
        }

        //return log file
        return logFile[logType];
    },

    message: function (message, options = { file: undefined, color: '' }) {
        //defaults
        if (!options.file) options.file = undefined;
        if (!options.color) options.color = '';

        //apply timestamp
        message = utility.getTimestamp() + ' | ' + message;

        //log message to log files
        if (options.file) {
            //one log file -> array with single file
            if (typeof options.file === 'string') {
                this.logMessage(options.file, message);
                options.file === [options.file];
            }

            //log to files
            var fileIndex = 0;
            while (fileIndex < options.file.length) {
                //write to log
                this.getLog(options.file[fileIndex]).write(message + '\n');

                //next log file
                fileIndex++;
            }
        }

        //log message to console
        else {
            console.log(options.color, message);
        }
    },

    error: function (message, options) {
        //init options
        if (!options) options = { file: undefined, color: ConsoleColor.Red };
        else options.color = ConsoleColor.Red;

        //log error
        this.message(message, options);
    },

    info: function (message, options) {
        //init options
        if (!options) options = { file: undefined, color: ConsoleColor.Cyan };
        else options.color = ConsoleColor.Cyan;

        //log info
        this.message(message, options);
    },

    warn: function (message, options) {
        //init options
        if (!options) options = { file: undefined, color: ConsoleColor.Yellow };
        else options.color = ConsoleColor.Yellow;

        //log warn
        this.message(message, options);
    },

    debug: function (message, options) {
        //init options
        if (!options)
            options = { file: undefined, color: ConsoleColor.Magenta };
        else options.color = ConsoleColor.Magenta;

        //log debug
        this.message(message, options);
    },

    socketAction: function (socket, message, options) {
        //apply socket prefix
        message =
            '(' +
            socket.player.id +
            ') [' +
            socket.player.room +
            '] ' +
            socket.player.name +
            ' - ';
        message;

        //log message
        this.logMessage(message, options);
    },
};
