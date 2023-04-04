// Database Functions

//imports
import firebase from 'firebase-admin';

//modules
import log from './Logs.js';

//config
import config from '../../config.json' assert { type: 'json' };

//init database
firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase),
    databaseURL: config.database.databaseURL,
});
const database = firebase.database();

export default {
    //set value in database
    setValue: function (path, value) {
        try {
            database.ref(path).set(value);
        } catch (error) {
            //log
            log.error('Database Set Value -> ' + error);
        }
    },

    //update value in database (merges instead of overwriting object for example)
    updateValue: function (path, value) {
        try {
            database.ref(path).update(value);
        } catch (error) {
            //log
            log.error('Database Update Value -> ' + error);
        }
    },

    //get value in database
    getValue: async function (path) {
        //init value
        var value;

        //get value in database
        try {
            await database
                .ref(path)
                .orderByKey()
                .once('value', async (data) => {
                    value = await data.val();
                });
        } catch (error) {
            //log
            log.error('Database Get Value -> ' + error);
        }

        //return the found or set value
        return value;
    },

    removeValue: async function (path) {
        //get value in database
        try {
            await database.ref(path).remove();
        } catch (error) {
            //log
            log.error('Database Remove Value -> ' + error);
        }
    },

    //check to see if a path in the database exists
    pathExists: async function (path) {
        try {
            return await database
                .ref(path)
                .orderByKey()
                .limitToFirst(1)
                .once('value')
                .then((res) => res.exists());
        } catch (error) {
            //log
            log.error('Database Path Exists -> ' + error);
        }
    },
};
