// Utility Functions

const fs = require('fs');

module.exports ={

    //get a random integer
    getRandomInt: function(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    },

    //return timestamped string
    timestampString: function(string) {
        var timestamp = new Date(Date.now()).toLocaleString()
        return timestamp + ' | ' + string
    },

    //get todays date
    getCurrentDay: function() {
        const today = new Date();
        return today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    },

    //get log file
    getLogFile: function(type) {
        return fs.createWriteStream(__dirname + '/logs/' + type + '/' + this.getCurrentDay() + '.txt', { flags: 'a' });
    },

    //create directory if doesnt exist
    createDirectory: function(dir) {
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        };
    }
}