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
    databaseURL: "https://project-virtual-pond-default-rtdb.firebaseio.com"
});
const database = firebase.database();

module.exports ={

    setValue: function(path, value){
        database.ref(path).set(value);
    },

    getValue: function(path, value) {
        
    },

    valueExists: function(path, value) {

        if () {
            return true;
        } else {
            return false;
        };
    }
}