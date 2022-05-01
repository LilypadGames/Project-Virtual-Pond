// Utility Functions

class Utility {
    //get a random integer
    getRandomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }

    //return timestamped string
    timestampString(string) {
        return new Date(Date.now()).toLocaleString() + ' | ' + string;
    }
};