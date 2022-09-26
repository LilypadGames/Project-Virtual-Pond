// Utility Functions

//dependency: file parsing
const fs = require('fs');

module.exports = {
    //get a random integer
    getRandomInt: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    //get random from array
    randomFromArray: function (array) {
        return array[Math.floor(Math.random() * array.length)];
    },

    //return timestamped string
    timestampString: function (string) {
        var timestamp = new Date(Date.now()).toLocaleString();
        return timestamp + ' | ' + string;
    },

    //get todays date
    getCurrentDay: function () {
        const today = new Date();
        return this.getDate(today);
    },

    //get formatted date from unix timestamp
    getDate: function (day) {
        return (
            day.getFullYear() + '-' + (day.getMonth() + 1) + '-' + day.getDate()
        );
    },

    //create directory if doesnt exist
    createDirectory: function (dir) {
        if (!fs.existsSync(dir)) {
            fs.mkdirSync(dir);
        }
    },

    //merge two objects, overwriting first one with second one
    mergeObjects: function (a, b) {
        var c = {};
        for (var idx in a) {
            c[idx] = a[idx];
        }
        for (var idx in b) {
            c[idx] = b[idx];
        }
        return c;
    },
};
