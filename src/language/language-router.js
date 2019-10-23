'use strict';

const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./linkedList')

const languageRouter = express.Router()

const jsonBodyParser = express.json()

languageRouter
    .use(requireAuth) 
    .use(async (req, res, next) => {
        try {

            const language = await LanguageService.getUsersLanguage(
                req.app.get('db'),
                req.user.id
            )

            if (!language)
                return res.status(404).json({
                    error: `You don't have any languages`,
                })

            req.language = language
            next()
        } 
        catch (error) {
              next(error)
        }
    })

languageRouter
    .get('/', async (req, res, next) => {
        try {

            const words = await LanguageService.getLanguageWords(
                req.app.get('db'),
                req.language.id
            )

            res.json({
                language: req.language,
                words,
            })
            next()
          }
          catch (error) {
              next(error)
          }
    })

languageRouter
    .get('/head', async (req, res, next) => {
        try {
            const language = await LanguageService.getUsersLanguage(
                req.app.get('db'),
                req.user.id
            )

            const [ word ] = await LanguageService.getWordById(
                req.app.get('db'),
                language.head
            )

            res.json({
                "nextWord": word.original,
                "wordCorrectCount": word.correct_count,
                "wordIncorrectCount": word.incorrect_count,
                "totalScore": language.total_score,
                "wordObj": word
            })

        }
        catch (error) {
            next(error)
        }
    })

languageRouter
    .post('/guess', jsonBodyParser, async (req, res, next) => {
        try {
            // validate req body
            console.log('-----------------------/api/language/guess/-----------------------');
            const { currWord, guess } = req.body;
            console.log(`
            currWord: ${currWord}, 
            guess: ${guess}
            `)

            if(!currWord) {
                return res
                    .status(400)
                    .send('A "currWord" is required.')
            }
            if(!guess) {
                return res
                    .status(400)
                    .send('A "guess" is required.')
            }
            if(typeof currWord !== 'string') {
                return res
                    .status(400)
                    .send('"currWord" must be of type string.')
            }
            if(typeof guess !== 'string') {
                return res
                    .status(400)
                    .send('"guess" must be of type string.')
            }

            // get the current head
            const language = await LanguageService.getUsersLanguage(
                req.app.get('db'),
                req.language.id
            )

            const currHead = language.head;
            let totalScore = language.total_score;
            console.log('current language')
            console.log(language);

            const wordsList = await makeLinkedList(
                req.app.get('db'),
                currHead
            );
            // console.log(wordsList);
            
            // update language head with head.next value
            const newLanguage = await LanguageService.updateHead(
                req.app.get('db'),
                req.user.id,
                req.language.id,
                { head: wordsList.head.value.next }
            )
            console.log('new language objext')
            console.log(newLanguage);

            // remove current head from linked list
            let word = wordsList.head.value;
            wordsList.remove(word);
            // console.log(currWord);
            // console.log(wordsList);
            
            // check if guess is correct translation and update values
            const answer = word.translation;
            let memory_value = word.memory_value;
            let correct_count = word.correct_count;
            let incorrect_count = word.incorrect_count;
            let isCorrect;
            
            if(answer === guess) {
              isCorrect = true;
              memory_value *= 2;
              correct_count ++;
              totalScore ++;
            }
            else {
              isCorrect = false;
              memory_value = 1;
              incorrect_count ++;
            }

            console.log(`
                word: ${currWord},
                guess: ${guess}, 
                answer: ${answer},
                isCorrect: ${isCorrect},
                memory_value: ${memory_value},
                correct_count: ${correct_count}, 
                incorrect_count: ${incorrect_count},
                totalScore: ${totalScore}
                `);

            // update totalScore
            totalScore = await LanguageService.updateTotalScore(
                req.app.get('db'),
                req.language.id,
                { total_score: totalScore }
            )

            // console.log(totalScore);

            // update the current word in the db with memory_value, correct_count, and incorrect_count
            word = await LanguageService.updateWord(
              req.app.get('db'),
              word.id,
              {
                memory_value,
                correct_count,
                incorrect_count 
              }
            );
            // console.log(word)

            // move question back m places in the list
            const length = size(wordsList)
            const index = (word.memory_value > length)
              ? length
              : word.memory_value

            // console.log(length, index)

            // displayList(wordsList);
            wordsList.insertAt(index, word);
            // displayList(wordsList);

            // update the next field in each word in the database
            await updateNextInDb(
                req.app.get('db'),
                wordsList
            )

            // return json
            res.json({
                answer,
                isCorrect,
                nextWord: wordsList.head.value.original,
                totalScore,
                wordCorrectCount: word.correct_count,
                wordIncorrectCount: word.incorrect_count
            })
        }
        catch (error) {
            next(error)
        }
    })

async function makeLinkedList(db, currHead) {
  let next = currHead
  const wordsList = new LinkedList();
  while(next !== null) {
      let [ word ] = await LanguageService.getWordById(
          db, 
          next
      );
      wordsList.insertLast(word)
      next = word.next
  }

  return wordsList;
}

async function updateNextInDb(db, wordsList) {
  let currNode = wordsList.head
  // updates the first through n - 1 words in linked list
  while(currNode.next !== null) {
    await LanguageService.updateWord(
      db, 
      currNode.value.id,
      { next: currNode.next.value.id }
    )
    currNode = currNode.next
  }
  // update the last word in the linked list
  await LanguageService.updateWord(
    db,
    currNode.value.id,
    { next: null }
  )
}

function size(list){
  let counter = 0;
  let currNode = list.head;
  if(!currNode){
      return counter;
  }
  else
      counter++;
  while (!(currNode.next === null)) {
      counter++;
      currNode = currNode.next;
  }
  return counter;
}

function displayList(list){
  let currNode = list.head;
  while (currNode !== null) {
      console.log(currNode.value);
      currNode = currNode.next;
  }
}

module.exports = languageRouter
