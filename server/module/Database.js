// Database Functions

//get config values
import config from '../config/config.json' assert { type: 'json' };

//dependency: database
import firebase from 'firebase-admin';

//init database
firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase),
    databaseURL: config.database.databaseURL,
});
const database = firebase.database();

export default {
    //set value in database
    setValue: function (path, value) {
        database.ref(path).set(value);
    },

    //update value in database (merges instead of overwriting object for example)
    updateValue: function (path, value) {
        database.ref(path).update(value);
    },

    //get value in database
    getValue: async function (path) {
        //init value
        var value;

        //get value in database
        await database
            .ref(path)
            .orderByKey()
            .once('value', async (data) => {
                value = await data.val();
            });

        //return the found or set value
        return value;
    },

    removeValue: async function (path) {
        //get value in database
        await database.ref(path).remove();
    },

    //check to see if a path in the database exists
    pathExists: async function (path) {
        return await database
            .ref(path)
            .orderByKey()
            .limitToFirst(1)
            .once('value')
            .then((res) => res.exists());
    },
};
