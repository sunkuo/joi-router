# joi-router
:basketball: Input &amp; Output validated routing for Express

## Todo List
- :white_check_mark: Input Validated Routing
- :white_check_mark: Output Validated Routing
- :white_check_mark: Examples to show how to use joi-router
- :white_check_mark: Self-contained Test
- :ballot_box_with_check: Continuous integration
- :ballot_box_with_check: Code coverage
- :ballot_box_with_check: Joi-router to documents

## How to install

`yarn add joi-router`

## Get Started
```
const express = require('express')
const Joi = require('joi')
require('joi-router')
const app = express()

// Input Validaiton
app.get('/foo', {query: {
  userId: Joi.string().alphanum().min(3).max(30).required()
}}, function (req, res, next) {
  res.json({
    result: 'success'
  })
})

// Output Validation
app.get('/foo', {output: {
  '200': {
    body: {
      content: Joi.string().alphanum().min(3).max(30).required()
    }
  }
}}, function (req, res, next) {
  res._data = {content: 'Lorem'}
  next()
})
app.use((req, res, next) => {
  res.json({res._data})
})

app.listen(3000, () => {
  console.log('Server Run!')
})
```

## Node compatibility

NodeJS `>= 6.0` is required.

## Performance

Joi-router only run once to add validation middleware when express start, so it does not make express slow.

## LICENSE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)