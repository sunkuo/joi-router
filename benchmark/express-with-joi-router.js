const express = require('express')
const Joi = require('joi')
const Database = require('./mock-db.js')
require('../joi-router')
const app = express()

const querySchema = {
  access_token: [Joi.string(), Joi.number()],
  birthyear: Joi.number().integer().min(1900).max(2013)
}

app.get('/foo', querySchema, (req, res, next) => {
  Database.find(1, () => {
    res.json({
      foo: 'bar'
    })
  })
})

app.listen(8000, () => {
  console.log('Express with joi-router run!')
})
