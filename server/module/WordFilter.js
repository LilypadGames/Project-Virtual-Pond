// Global Data

//config
import wordDataSource from '../data/wordData.json' assert { type: 'json' };

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
        this.wordData.blacklist = this.wordData.blacklist.concat(wordDataSource.blacklistPhonetic);
    },

    get: function (listType) {
        return this.wordData[listType];
    },
};
