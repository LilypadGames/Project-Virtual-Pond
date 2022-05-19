// Database Functions

//dependency: file parsing
const fs = require('fs');
const path = require('path');

//get config values
const config = JSON.parse(fs.readFileSync(path.join(__dirname, '../config/config.json')));

//dependency: database
var firebase = require("firebase-admin");

//init database
firebase.initializeApp({
    credential: firebase.credential.cert(config.firebase),
    databaseURL: config.database.databaseURL
});
const database = firebase.database();

module.exports = {

    setValue: function(path, value){
        database.ref(path).set(value);
    },

    getValue: async function(path) {
        var value;
        await database.ref(path).orderByKey().once('value', async (data) => {
            value = await data.val();
        });
        return value;
    },

    pathExists: async function(path) {
        return await database.ref(path).orderByKey().limitToFirst(1).once('value').then(res => res.exists());
    }
}