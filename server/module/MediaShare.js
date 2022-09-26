// Media Share

//media share data
var mediaShare = {};

module.exports = {
    init: async function (io) {
        //save socket.io instance
        this.io = io;
    },

    //add media to the queue
    addMediaToQueue: function (url) {
        //sanitize

        //check if url is valid

        //queue

        //update clients

        //successful
        return true;

        //failed
    },

    //get current media queue
    getMediaQueue: function () {
        return mediaShare;
    },

    //reset current media queue
    resetMediaQueue: function () {
        mediaShare = {};
    },
};
