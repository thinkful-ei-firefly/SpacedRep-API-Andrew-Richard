const express = require('express')
const LanguageService = require('./language-service')
const LanguageHelper = require('./language-helper')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router()

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.user.id,
      )

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        })

      req.language = language
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/', async (req, res, next) => {
    try {
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id,
      )

      res.json({
        language: req.language,
        words,
      })
      next()
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .get('/head', async (req, res, next) => {
    // get next word from the database
    try {
      const { word } = await LanguageService.getNextWord(
          req.app.get('db')
      )

      const allWords = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )

      const totalScore = LanguageService.getTotalScore(allWords)

      res.json({
        "nextWord": word.original,
        "wordCorrectCount": word.correct_count,
        "wordIncorrectCount": word.incorrect_count,
        "totalScore": totalScore
      })

    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {

    try {
      // validate req body
      const { currWord, guess } = req.body;

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
      // create linked list
      const wordsArr = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language
      )
      const wordsList = LanguageService.populateLinkedList(wordsArr);
      
      // take the word out of the linked list to edit and reinsert
      const word = wordsList.find(currWord);
      wordsList.remove(word)
      
      // check if guess is correct translation
      const answer = word.translation
      if(answer === guess) {
        isCorrect = true;
      }
      else {
        isCorrect = false;
      }
      /* 
      set new memory_value (m)
      if correct answer double m else m = 1 and
       update correct and incorrect
      */
      if(isCorrect) {
        word.memory_value *= 2
        word.correct_count += 1
      }
      else {
        word.memory_value = 1
        word.incorrect_count += 1
      }

      // update totalScore
      const allWords = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      )

      const totalScore = LanguageService.getTotalScore(allWords)

      // move question back m places in the list
      const length = LanguageService.getLength(wordsList)
      const index = (word.memory_value > length)
        ? length
        : word.memory_value
      wordsList.insertAt(word, index); // length of wordList is +1

      // persist the updated words and lang to database
      LanguageHelper.persistDb(
          req.app.get('db'),
          wordsList,
          length + 1
      );
      
      // return json
      res.json({
        answer,
        isCorrect,
        nexWord,
        totalScore,
        wordCorrectCount: word.correct_count,
        wordIncorrectCount: word.incorrect_count
      })

    }
    catch (error) {
      next(error)
    }
  })

module.exports = languageRouter
