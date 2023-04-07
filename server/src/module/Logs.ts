// imports
import util from "util";
import fs, { WriteStream } from "fs";
import path from "path";
import * as url from "url";
const __dirname = url.fileURLToPath(new URL(".", import.meta.url));

// modules
import utility from "./Utility.ts";
import ConsoleColor from "./ConsoleColor.ts";

// config
import config from "../../config.json" assert { type: "json" };

// types
type logMessage = string | Function;
interface logOptions {
	file?: string | string[] | null;
	console?: boolean;
	color?: string;
}
interface debugLogOptions extends logOptions {
	debug?: boolean;
}

export default {
	currentDay: utility.time.currentDate(),
	logPath: "../../../" + config.paths.logs + "/",
	logFile: {} as { [key: string]: WriteStream },

	// initialize logging
	initLogs: function () {
		// init log directory
		utility.createDirectory(path.join(__dirname, this.logPath));

		// override default console logging
		// let formatArgs = function (args: any) {
		// 	return util.format.apply(
		// 		util.format,
		// 		Array.prototype.slice.call(args)
		// 	);
		// };
		// console.log = () => {
		// 	let message = formatArgs(arguments);
		// 	this.message(message);
		// };
		// console.info = () => {
		// 	let message = formatArgs(arguments);
		// 	this.info(message);
		// };
		// console.warn = () => {
		// 	let message = formatArgs(arguments);
		// 	this.warn(message);
		// };
		// console.error = () => {
		// 	let message = formatArgs(arguments);
		// 	this.error(message);
		// };
		// DEBUG
		process.on("warning", (error) => this.warn(error.stack as string));
	},

	// get log file
	getLog: function (logType: string) {
		// get current day
		const date = utility.time.currentDate();

		// if its a new day, refresh stored write streams
		if (this.currentDay !== date) {
			// end every stored write stream
			for (const key in this.logFile) {
				this.logFile[key as keyof WriteStream].end();
			}

			// reset stored write streams
			this.logFile = {};

			// store new day
			this.currentDay = date;
		}

		// create log file write stream if it does not already exist
		if (!this.logFile[logType]) {
			// get path
			const filePath = path.join(
				__dirname,
				this.logPath,
				logType,
				"/",
				date + ".txt"
			);

			// make log directory if it doesn't exist
			if (!fs.existsSync(path.join(__dirname, this.logPath, logType))) {
				utility.createDirectory(
					path.join(__dirname, this.logPath, logType)
				);
			}

			// store log file stream
			this.logFile[logType as keyof WriteStream] = fs.createWriteStream(
				filePath,
				{
					flags: "a",
				}
			);

			// log debug
			this.debug("New Write Stream: " + logType);
		}

		// return log file
		return this.logFile[logType];
	},

	// main message function
	message: function (
		message: logMessage,
		options: logOptions | undefined = {
			file: null,
			console: true,
			color: ConsoleColor.White,
		}
	) {
		// if file is specified but console is not, prevent logging to console
		if (options.file !== undefined && options.console === undefined)
			options.console = false;

		// if file is not specified, prevent logging to file
		if (options.file === undefined) options.file = null;

		// if color is not specified, default to white
		if (options.color === undefined) options.color = ConsoleColor.White;

		// custom message
		if (typeof message === "function") {
			message = message();
			if (typeof message !== "string") {
				throw new TypeError(
					'Invalid return value of function parameter "message" | Must return a String'
				);
			}
		}
		// apply prefix
		else if (typeof message === "string") {
			message = utility.time.currentTimestamp() + " | " + message;
		}
		// non accepted variable
		else {
			throw new TypeError(
				'Invalid assignment to parameter "message" | Must be a Function or String'
			);
		}

		// log message to log files
		if (options.file) {
			//one log file -> array with single file
			if (typeof options.file === "string") {
				const file = options.file;
				options.file = [];
				options.file.push(file);
			}

			// log to files
			var fileIndex = 0;
			while (fileIndex < options.file.length) {
				//write to log
				this.getLog(options.file[fileIndex]).write(message + "\n");

				//next log file
				fileIndex++;
			}
		}

		// log message to console and server/debug log file
		if (options.console) {
			// log to console
			process.stdout.write(
				util.format.apply(null, [options.color, message]) + "\n"
			);

			// determine files to send to
			var files = [];
			// files were already accessed
			if (options.file) {
				if (!options.file.includes("server")) files.push("server");
				if (!options.file.includes("debug")) files.push("debug");
			}
			// files were not already accessed
			else files = ["server", "debug"];

			// log to server/debug file
			this.message(
				() => {
					return message;
				},
				{ file: files, console: undefined, color: undefined }
			);
		}
	},

	// error message
	error: function (message: logMessage, options?: logOptions) {
		// init options
		if (!options)
			options = { file: null, console: true, color: ConsoleColor.Red };
		else options.color = ConsoleColor.Red;

		// log error
		this.message(message, options);
	},

	// info message
	info: function (message: logMessage, options?: logOptions) {
		// init options
		if (!options)
			options = { file: null, console: true, color: ConsoleColor.Cyan };
		else options.color = ConsoleColor.Cyan;

		// log info
		this.message(message, options);
	},

	// warn message
	warn: function (message: logMessage, options?: logOptions) {
		// init options
		if (!options)
			options = { file: null, console: true, color: ConsoleColor.Yellow };
		else options.color = ConsoleColor.Yellow;

		// log warn
		this.message(message, options);
	},

	// debug message
	debug: function (message: logMessage, options?: logOptions) {
		// init options
		if (options === undefined) options = {};

		// log to debug file
		if (options.file === undefined) options.file = "debug";

		// if debug in server config is true (and console option is not set), log to console as well
		if (config.debug === true && options.console === undefined)
			options.console = true;

		// set to debug color
		if (options.color === undefined) options.color = ConsoleColor.Magenta;

		// log debug
		this.message(message, options);
	},

	// default user log message
	socketAction: function (
		socket: any,
		message: string,
		options: debugLogOptions | undefined = { debug: false }
	) {
		// apply socket prefix
		message =
			"(" +
			socket.player.id +
			") [" +
			socket.player.room +
			"] " +
			socket.player.name +
			" - " +
			message;

		// log message
		if (!options.debug) this.message(message, options);
		// debug message
		else {
			this.debug(message, options);
		}
	},
};
