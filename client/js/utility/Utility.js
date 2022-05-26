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

    //get local storage array
    getLocalStorage(item) {
        return JSON.parse(localStorage.getItem(item))
    };
    //get local storage index for certain ID
    getLocalStorageArrayIndex(item, id) {
        return JSON.parse(localStorage.getItem(item)).findIndex((key => key.id === id));
    };
    //get local storage object for certain ID
    getLocalStorageObject(item, id) {
        return JSON.parse(localStorage.getItem(item))[this.getLocalStorageArrayIndex(item, id)]
    };
    //store value
    storeLocalStorageArray(item, array) {
        localStorage.setItem(item, JSON.stringify(array));
    };
};