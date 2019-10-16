'use strict';

const LanguageService = require('./language-service')


const LanguageHelper = {

    persistDb(db, wordsList, length) {
        for(let i = 0; i < length; i++) {
            const updateFields = {
                original: wordsList[i].orignal,
                translation: wordsList[i].translation,
                memory_value: wordsList[i].memory_value,
                correct_count: wordsList[i].correct_count,
                incorrect_count: wordsList[i].incorrect_count,
                language_id: wordsList[i].language_id,
                next: i + 1
            };

            LanguageService.update(db, i+1, updateFields);
        }
    }
    /*
      Fields in a word
        id
        original
        translation
        memory_value
        correct_count
        incorrect_count
        language_id
        next
      */
}

module.exports = LanguageHelper;