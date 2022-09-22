// theatre room

//file parsing
const path = require('path');

//modules
const twitch = require(path.join(__dirname, '../../utility/Twitch.js'));
const mediaShare = require(path.join(__dirname, '../../utility/MediaShare.js'));
const globalData = require(path.join(__dirname, '../../utility/GlobalData.js'));

//get twitch events
const twitchEvent = twitch.getListener();

class Theatre {
    constructor(socket) {
        //save socket
        this.socket = socket;
    }

    //initialize
    init() {
        //register events
        this.registerEvents();

        //update stream status on client
        this.streamStatusUpdate(globalData.getObject('streamLive'));

        //detect when stream goes live or offline
        twitchEvent.on('streamLive', this.streamStatusUpdate);
    }

    //end
    end() {
        //unregister events
        this.unregisterEvents();
    }

    //register events
    registerEvents() {
        //attempted vote skip on current media
        this.socket.on('mediaShareVoteSkip', (cb) => {
            cb(this.mediaShareVoteSkip());
        });

        //requested current queue
        this.socket.on('mediaShareRequestQueue', (cb) => {
            cb(this.mediaShareRequestQueue());
        });

        //submitted media
        this.socket.on('mediaShareSubmitMedia', (mediaURL, cb) => {
            cb(this.mediaShareSubmitMedia(mediaURL));
        });
    }

    //unregister events
    unregisterEvents() {
        this.socket.removeAllListeners('mediaShareVoteSkip');
        this.socket.removeAllListeners('mediaShareRequestQueue');
        this.socket.removeAllListeners('mediaShareSubmitMedia');
        twitchEvent.removeListener('streamLive', this.streamStatusUpdate);
    }

    //attempt vote skip
    mediaShareVoteSkip() {
        return;
    }

    //request media queue
    mediaShareRequestQueue() {
        return;
    }

    //submit media
    mediaShareSubmitMedia(mediaURL) {
        return mediaShare.addMediaToQueue(mediaURL);
    }

    //stream status changed
    streamStatusUpdate(status) {
        //send stream status
        this.socket.emit('payloadStreamStatus', status);

        //went offline
        if (!status) {
            //send current media share queue
            this.socket.emit(
                'payloadMediaShareQueue',
                mediaShare.getMediaQueue()
            );
        }
    }
}

module.exports = Theatre;
