// Utility Functions

module.exports ={
    //get a random integer
    getRandomInt: function(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    },

    //return timestamped string
    timestampString: function(string) {
        var timestamp = new Date(Date.now()).toLocaleString()
        return timestamp + ' | ' + string
    }
}