// imports
import firebase, { ServiceAccount } from "firebase-admin";

// modules
import log from "./Logs.ts";

// config
import config from "../../config.json" assert { type: "json" };

// init database connection
firebase.initializeApp({
	credential: firebase.credential.cert(config.firebase as ServiceAccount),
	databaseURL: config.database.databaseURL,
});
const database = firebase.database();

export default {
	// set value in database
	setValue: function (path: string, value: string) {
		try {
			database.ref(path).set(value);
		} catch (error) {
			// log
			log.error("Database Set Value -> " + error);
		}
	},

	// update (merge instead of overwrite) value in database. returns success status.
	updateValue: function (path: string, value: string) {
		try {
			database.ref(path).update(value);
			return true;
		} catch (error) {
			// log
			log.error("Database Update Value -> " + error);
			return false;
		}
	},

	// get value in database
	getValue: async function (path: string) {
		// init value
		var value;

		// get value in database
		try {
			await database
				.ref(path)
				.orderByKey()
				.once("value", async (data) => {
					value = await data.val();
				});
		} catch (error) {
			// log
			log.error("Database Get Value -> " + error);
		}

		// return the found or set value
		return value;
	},

	// remove value in database. returns success status.
	removeValue: async function (path: string) {
		try {
			await database.ref(path).remove();
			return true;
		} catch (error) {
			// log
			log.error("Database Remove Value -> " + error);
			return false;
		}
	},

	// check to see if a path in the database exists
	pathExists: async function (path: string) {
		try {
			return await database
				.ref(path)
				.orderByKey()
				.limitToFirst(1)
				.once("value")
				.then((res) => res.exists());
		} catch (error) {
			// log
			log.error("Database Path Exists -> " + error);
			return false;
		}
	},
};
