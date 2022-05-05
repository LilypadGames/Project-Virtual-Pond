// Utility Functions

class Utility {
    
    //get a random integer
    getRandomInt(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    };

    //get timestamped string
    timestampString(string) {
        return new Date(Date.now()).toLocaleString() + ' | ' + string;
    };

    //get random from array
    randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    };
};