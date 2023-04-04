// Global Data

//config
import wordDataSource from '../../data/wordData.json' assert { type: 'json' };

//imports
import natural from 'natural';
const { Metaphone } = natural;

export default {
    wordData: [],

    init: function () {
        //get word blacklist
        this.wordData.blacklist = wordDataSource.blacklist;

        //convert to phonetic symbols
        this.wordData.blacklist.forEach((word, index, array) => {
            array[index] = Metaphone.process(word);
        });

        //add phonetic blacklist
        this.wordData.blacklist = this.wordData.blacklist.concat(
            wordDataSource.blacklistPhonetic
        );
    },

    get: function (listType) {
        return this.wordData[listType];
    },

    convertMessage: function (message, split = true) {
        //remove and convert non-alphabetical characters
        const messageFormatted = message
            .replace('@', 'a')
            .replace('0', 'o')
            .replace('1', 'i')
            .replace('5', 's')
            .replace(/[^0-9a-z ]/gi, '');

        //convert each word
        let messagePhonetics;
        if (split) {
            //split by spaces
            let messageSplit = messageFormatted.split(' ');

            //convert words
            messagePhonetics = [];
            messageSplit.forEach((string) => {
                messagePhonetics.push(Metaphone.process(string));
            });
        } else {
            //convert words
            messagePhonetics = Metaphone.process(messageFormatted);
        }

        return messagePhonetics;
    },

    checkMessage: function (message) {
        //convert message to phonetic version
        let messagePhonetics = this.convertMessage(message);

        //compare blacklisted words to words in message using phonetics
        let blacklist = this.wordData.blacklist;
        let noSlur = true;
        blacklist.every((phonetic) => {
            //find blacklisted words
            messagePhonetics.every((word) => {
                if (phonetic === word) {
                    noSlur = false;
                    return false;
                }
            });

            //if match found, dont look through the rest
            if (!noSlur) return false;

            //continue
            return true;
        });

        return noSlur;
    },
};
