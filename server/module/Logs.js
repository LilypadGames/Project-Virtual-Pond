// Logging Functions

//imports: file parsing
import fs from 'fs';
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//get config values
import config from '../config/config.json' assert { type: 'json' };;

//imports
import utility from '../module/Utility.js';

//init logging
var currentDay = utility.getCurrentDay();
utility.createDirectory(path.join(__dirname, config.logPath + '/'));
var logFile = [];

export default {
    //get log file
    getLog: function (logType) {
        //get current day
        const date = utility.getCurrentDay();

        //init log file index
        var logFileIndex;

        //add log file if it doesnt exist
        if (!logFile.some((log) => log.logName === logType)) {
            //get path
            const filePath = path.join(
                __dirname,
                config.logPath + '/',
                logType,
                '/',
                date + '.txt'
            );

            //add log file to local storage
            logFile.push({
                logName: logType,
                logStream: fs.createWriteStream(filePath, { flags: 'a' }),
            });

            logFileIndex = logFile.findIndex((log) => log.logName === logType);

            //if day changed and log already exists, create new log file for this day
        } else if (currentDay != date) {
            //store new day
            currentDay = date;

            //get logFile object array index
            logFileIndex = logFile.findIndex((log) => log.logName === logType);

            //get path
            const filePath = path.join(
                __dirname,
                config.logPath + '/',
                logType,
                '/',
                date + '.txt'
            );

            //create new log file
            logFile[logFileIndex].logStream = fs.createWriteStream(filePath, {
                flags: 'a',
            });
        }

        //get log file index
        if (logFileIndex == undefined)
            logFileIndex = logFile.findIndex((log) => log.logName === logType);

        //return log file
        return logFile[logFileIndex].logStream;
    },

    logMessage: function (logType, message) {
        //make log type directory if it doesn't exist
        if (
            !fs.existsSync(path.join(__dirname, config.logPath + '/', logType))
        ) {
            utility.createDirectory(
                path.join(__dirname, config.logPath + '/', logType)
            );
        }

        //get log file
        const log = this.getLog(logType);

        //write to log
        log.write(message + '\n');
    },
};
