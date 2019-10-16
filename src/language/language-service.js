'use strict';

const LinkedList = require('./linkedList');

const LanguageService = {
    getUsersLanguage(db, user_id) {
        return db
            .from('language')
            .select(
                'language.id',
                'language.name',
                'language.user_id',
                'language.head',
                'language.total_score'
            )
            .where('language.user_id', user_id)
            .first();
    },
    getLanguageWords(db, language_id) {
        return db
            .from('word')
            .select(
                'id',
                'language_id',
                'original',
                'translation',
                'next',
                'memory_value',
                'correct_count',
                'incorrect_count'
            )
            .where({ language_id });
    },
    getNextWord(db) {
        return db
            .from('word')
            .select('*')
            .limit(1);
    },
    update(db, id, fields) {
        return db
            .where({ id })
            .update(fields)
    },
    getTotalScore(allWords) {
        allWords
        .reduce((acc, score) => {
          return acc + score.correct_count
      }, 0)
    },
    populateLinkedList(wordsArr) {
        let wordsList = new LinkedList();
        return wordsArr.forEach(word => 
            wordsList.insertLast(word)
        );
    },
    getLength = (list) => {
        let counter = 0;
        let tempNode=list.head;
        while (tempNode !== null) {
            counter++;
            tempNode=tempNode.next;
        }
        return counter;
    };
};
    
module.exports = LanguageService;
    