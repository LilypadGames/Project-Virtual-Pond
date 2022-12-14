// Theatre room events

//imports: file parsing
import path from 'path';
import * as url from 'url';
const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

//modules
import twitch from '../../module/Twitch.js';
import mediaShare from '../../module/MediaShare.js';
import globalData from '../../module/GlobalData.js';

//get twitch events
const twitchEvent = twitch.getListener();

class Theatre {
    constructor(socket) {
        //save socket
        this.socket = socket;
    }

    //initialize
    async init() {
        //register events
        this.registerEvents();

        //update stream status on client
        this.streamStatusUpdate(await globalData.getPath('streamLive'));

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

export default Theatre;
