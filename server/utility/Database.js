// Database Functions

//dependency: file parsing
const path = require('path');

//get config values
const config = require(path.join(__dirname, '../config/config.json'));

//dependency: database
var firebase = require('firebase-admin');

//init database
firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase),
    databaseURL: config.database.databaseURL,
});
const database = firebase.database();

module.exports = {
    //set value in database
    setValue: function (path, value) {
        database.ref(path).set(value);
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

        // //set value if none set and default value provided
        // if (!value && base != undefined) {
        //     this.setValue(path, base);
        //     value = base;
        // };

        //return the found or set value
        return value;
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
