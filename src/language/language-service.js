'use strict';

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
                'original',
                'translation',
                'memory_value',
                'correct_count',
                'incorrect_count',
                'language_id',
                'next'
            )
            .where({ language_id });
    },
    getWordById(db, id) {
        return db
            .from('word')
            .select('*')
            .where({ id });
    },
    getTotalScore(db, id) {
        return db
            .from('language')
            .select('total_score')
            .where({ id })
            .then(([language]) => 
                language.total_score
            );
    },
    updateTotalScore(db, id, fields) {
        return db('language')
            .where({ id })
            .update(fields)
            .returning('*')
            .then(([score]) => 
                score.total_score);
    },
    updateWord(db, id, fields) {
        return db('word')
            .where({ id })
            .update(fields)
            .then(() => 
                LanguageService.getWordById(db, id)
            )
            .then(([ word ]) => word);
    },
    updateHead(db, id, user_id, fields) {
        return db('language')
            .where({ id })
            .update(fields)
            .then(() => 
                LanguageService.getUsersLanguage(db, user_id)
            )
            .then(language => language);
    },
    getLength(list) {
        let counter = 1;
        let tempNode=list.head;
        while (tempNode !== null) {
            counter++;
            tempNode=tempNode.next;
        }
        return counter;
    },
};
    
module.exports = LanguageService;
    