# joi-router
:basketball: Input &amp; Output validated routing for Express

[![npm version](https://badge.fury.io/js/joi-router.svg)](https://badge.fury.io/js/joi-router) [![Build Status](https://travis-ci.org/sunkuo/joi-router.svg?branch=master)](https://travis-ci.org/sunkuo/joi-router) [![Coverage Status](https://coveralls.io/repos/github/sunkuo/joi-router/badge.svg?branch=master)](https://coveralls.io/github/sunkuo/joi-router?branch=master) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Todo List
- :white_check_mark: Input Validated Routing
- :white_check_mark: Output Validated Routing
- :white_check_mark: Examples to show how to use joi-router
- :white_check_mark: Self-contained Test
- :white_check_mark: Continuous integration
- :white_check_mark: Code coverage
- :ballot_box_with_check: Joi-router to api documents

## How to install

`yarn add joi-router`

## Get Started

### Input Validaiton
```
const express = require('express')
const Joi = require('joi')
require('joi-router')
const app = express()

app.get('/foo', {query: {
  userId: Joi.string().alphanum().min(3).max(30).required()
}}, function (req, res, next) {
  res.json({
    result: 'success'
  })
})
```

#### Output Validation
```
app.get('/foo', {
  output: {
    '200': { content: Joi.string().alphanum().min(3).max(30).required() }
  }
}, function (req, res, next) {
  res.json({
    content: 'Lorem'
  })
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