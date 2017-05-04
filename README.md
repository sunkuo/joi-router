# joi-router
:basketball: Input &amp; Output validated routing for Express

## Todo List
- :white_check_mark: Input Validated Routing
- :ballot_box_with_check: Output Validated Routing
- :ballot_box_with_check: Examples to show how to use joi-router
- :ballot_box_with_check: Self-contained Test
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

app.get('/foo', {
  userId: Joi.string().alphanum().min(3).max(30).required()
}, function (req, res, next) {
  res.json({
    result: 'success'
  })
})

app.listen(3000, () => {
  console.log('Server Run!')
})
```

## Node compatibility

NodeJS `>= 5.0` is required.

## LICENSE

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)