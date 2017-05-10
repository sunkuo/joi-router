const express = require('express')
const Joi = require('joi')
const Database = require('./mock-db.js')
require('../joi-router')
const app = express()

const querySchema = {
  access_token: [Joi.string(), Joi.number()],
  birthyear: Joi.number().integer().min(1900).max(2013)
}

const authenticationMiddleware = function (req, res, next) {
  const result = Joi.validate(req.query, querySchema)
  if (result.error) {
    return res.status(400).json({
      error: result.error.toString()
    })
  }
  next()
}

app.get('/foo', authenticationMiddleware, (req, res, next) => {
  Database.find(1, () => {
    res.json({
      foo: 'bar'
    })
  })
})

app.listen(8000, () => {
  console.log('Express without joi-router run!')
})
