// Get Twitch Emotes

class Emotes {
    emotes = [];
    emoteLengthIndex = [];

    init(emoteList) {
        //set emote list
        this.emotes = emoteList;

        //init current emote length
        let currentEmoteLength;

        //make a list of each index that shows where a new character length of emotes starts
        this.emotes.forEach((element, index) => {
            //check if this emote's name is shorter than the last one
            if (index === 0 || element.name.length < currentEmoteLength) {
                //store current emote length
                currentEmoteLength = element.name.length;

                //store index of this emote in the emote length index array
                this.emoteLengthIndex[currentEmoteLength] = index;
            }
        });
    }

    isEmote(input, getIndex = false) {
        //get length of text
        let inputLength = input.length;

        //is there an emote with this length?
        if (!this.emoteLengthIndex[inputLength]) return false;

        //get max and min of the emote array that this emote could possibly be found in
        let min = this.emoteLengthIndex[inputLength];
        let max = this.emoteLengthIndex[inputLength - 1]
            ? this.emoteLengthIndex[inputLength - 1]
            : this.emoteLengthIndex[inputLength];

        //search between min and max for a matching string
        for (let index = min; index < max; index++) {
            //match found
            if (this.emotes[index].name === input) {
                if (getIndex) {
                    return index;
                } else {
                    return true;
                }
            }
        }

        //not found
        return false;
    }

    getEmotes() {
        return this.emotes;
    }

    getEmote(index) {
        return this.emotes[index];
    }

    getEmoteByName(input) {
        let index = this.isEmote(input, true);
        if (index !== false) {
            return this.emotes[index];
        } else {
            return false;
        }
    }

    getEmoteFileType(index) {
        //get emote
        let emote = this.getEmote(index);

        //check type
        var xhr = new XMLHttpRequest();
        xhr.open('GET', emote.img, true);
        xhr.responseType = 'blob';

        xhr.onload = function (e) {
            //Here's the type
            console.log(xhr.response.type);
        };

        xhr.send();
    }

    getEmoteFileTypeByName(input) {
        //get emote
        let emote = this.getEmoteByName(input);

        //emote does not exist
        if (!emote) return false;

        //check type
        // var xhr = new XMLHttpRequest();
        // xhr.open('GET', emote.img, true);
        // xhr.responseType = 'blob';

        // xhr.onload = function(e) {
        //     //Here's the type
        //     console.log(xhr.response.type);
        // };

        // xhr.send();

        // function imageReceived() {
        //     const canvas = document.createElement('canvas');
        //     const context = canvas.getContext('2d');

        //     canvas.width = downloadedImg.width;
        //     canvas.height = downloadedImg.height;

        //     context.drawImage(downloadedImg, 0, 0);
        //     imageBox.appendChild(canvas);

        //     try {
        //         localStorage.setItem(
        //             'saved-image-example',
        //             canvas.toDataURL('image/png')
        //         );
        //     } catch (err) {
        //         console.error(`Error: ${err}`);
        //     }
        // }

        // let downloadedImg = new Image();
        // downloadedImg.crossOrigin = 'Anonymous';
        // downloadedImg.addEventListener('load', imageReceived, false);
        // downloadedImg.src = emote.img;

        // $.ajax({
        //     url: emote.img,
        //     headers: {
        //         'Content-Type': 'application/x-www-form-urlencoded'
        //     },
        //     type: "GET", /* or type:"GET" or type:"PUT" */
        //     dataType: "json",
        //     data: {
        //     },
        //     success: function (result) {
        //         console.log(result);
        //     },
        //     error: function () {
        //         console.log("error");
        //     }
        // });
    }
}
