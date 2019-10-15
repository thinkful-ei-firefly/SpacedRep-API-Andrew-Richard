const express = require('express')
const LanguageService = require('./language-service')
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
      const word = await LanguageService.getNextWord(
          req.app.get('db')
      )
      const scores = await LanguageService.getTotalScore(
        req.app.get('db'),
        req.language.id
      )

      const totalScore = scores
        .reduce((acc, score) => {
          return acc + score.correct_count
      }, 0)

      res.json({
        "nextWord": word[0].original,
        "wordCorrectCount": word[0].correct_count,
        "wordIncorrectCount": word[0].incorrect_count,
        "totalScore": totalScore
      })
      /* /head expected return
          {
          "nextWord": "Testnextword",
          "wordCorrectCount": 222,
          "wordIncorrectCount": 333,
          "totalScore": 999
          }
      */
    } catch (error) {
      next(error)
    }
  })

languageRouter
  .post('/guess', async (req, res, next) => {
    // implement me
    res.send('implement me!')
  })

module.exports = languageRouter
