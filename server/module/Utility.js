// Utility Functions

//dependency: file parsing
import fs from 'fs';

export default {
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

    //create directory if doesn't exist
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

    hex: {
        toString(hexColor) {
            return '#' + hexColor.toString(16);
        },

        toDecimal(hexColor) {
            return parseInt(hexColor, 16);
        },

        toRGB(hexColor) {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(
                hexColor
            );
            return {
                r: this.hex.toDecimal(result[1]),
                g: this.hex.toDecimal(result[2]),
                b: this.hex.toDecimal(result[3]),
            };
        },
    },

    //sanitize variable
    sanitize: {
        //strings
        string: function (input) {
            return typeof input === 'string' && input.trim().length > 0
                ? input.trim()
                : '';
        },
        //booleans
        boolean: function (input) {
            return typeof input === 'boolean' && input === true ? true : false;
        },
        //arrays
        array: function (input) {
            return typeof input === 'object' && input instanceof Array
                ? input
                : [];
        },
        //numbers
        number: function (input) {
            return typeof input === 'number' && input % 1 === 0 ? input : 0;
        },
        //objects
        object: function (input) {
            return typeof input === 'object' &&
                !(input instanceof Array) &&
                input !== null
                ? input
                : {};
        },
    },

    //sort
    sort: {
        //object
        object: function (object, asc = false) {
            const sortedObject = {};
            Object.keys(object)
                .sort((a, b) => object[asc ? a : b] - object[asc ? b : a])
                .forEach((s) => (sortedObject[s] = object[s]));
            return sortedObject;
        },
    },
};
