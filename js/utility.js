// Utility Functions

module.exports ={
    //get a random integer
    getRandomInt: function(low, high) {
        return Math.floor(Math.random() * (high - low) + low);
    }
}