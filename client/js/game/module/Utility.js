// Utility Functions

class Utility {
    // TIME
    //get timestamped string
    timestampString(string) {
        return new Date(Date.now()).toLocaleString() + ' | ' + string;
    }

    // RANDOM
    //get a random integer
    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }
    //get random from array
    randomFromArray(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    // OBJECT ARRAYS
    //get object from object array
    getObject(objectArray, objectID) {
        //if doesnt exist, create it
        if (!objectArray.find(({ id }) => id == objectID)) {
            objectArray.push({ id: objectID });
        }

        //return it
        return objectArray.find(({ id }) => id == objectID);
    }

    //remove object from object array
    removeObject(objectArray, objectID) {
        objectArray = objectArray.filter((object) => object.id !== objectID);
        return objectArray;
    }

    // COLORS
    //hex integer to hex string
    hexIntegerToString(hex) {
        return '#' + hex.toString(16);
    }
    //hex string to hex integer
    hexStringToInteger(hex) {
        return parseInt(hex.substring(2), 16);
    }

    // PROMISES
    async wait(duration) {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, duration);
        });
    }
}
