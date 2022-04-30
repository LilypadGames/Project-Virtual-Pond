// Utility Functions

//get a random integer
export function getRandomInt(low, high) {
    return Math.floor(Math.random() * (high - low) + low);
}

//return timestamped string
export function timestampString(string) {
    var timestamp = new Date(Date.now()).toLocaleString()
    return timestamp + ' | ' + string
}