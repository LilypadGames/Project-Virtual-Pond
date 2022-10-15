// Global Data

//config
import wordDataSource from '../data/wordData.json' assert { type: 'json' };

//imports
import { metaphone as convertToPhonetics } from 'metaphone';

export default {
    wordData: [],

    init: function () {
        //get word blacklist
        this.wordData.blacklist = wordDataSource.blacklist;

        //convert to phonetic symbols
        this.wordData.blacklist.forEach((word, index, array) => {
            array[index] = convertToPhonetics(word);
        });
    },

    get: function (listType) {
        return this.wordData[listType];
    },
};
