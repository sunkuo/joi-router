const assert = require('power-assert')
const {ServerResponse} = require('http')
const debug = require('debug')('joi-router')
const flatten = require('flatten')
const methods = require('methods')
const Joi = require('joi')
const only = require('only')
const {Route} = require('express')
const {json, raw, text, urlencoded} = require('body-parser')
const OutputValidation = require('./lib/output-validation.js')

const supportedLocations = ['body', 'query', 'params', 'headers', 'output', 'type', 'failure']

// For each verb, check validation schema. If exists, handle it
methods.concat('all').forEach(function (method) {
  const origin = Route.prototype[method]
  Route.prototype[method] = function () {
    let handles = flatten(Array.prototype.slice.call(arguments))
    handles.forEach(function (handle, index) {
      debug(`handles index ${index}`)
      if (typeof handle === 'object') {
        debug('handle validation schema')
        const schema = Object.assign({
          type: 'json',
          failure: 400
        }, only(handle, supportedLocations))
        handleValidation(this, schema, handles, index)
      }
    })
    return origin.apply(this, handles)
  }
})

// add validation handle to layer stack
const handleValidation = function (context, schema, handlers, index) {
  checkValidation(schema)
  const bodyParserHandler = makeBodyParserHandler(schema)
  const inputValidationHandler = makeInputValidationHandler(schema)
  const extraHandlers = [
    bodyParserHandler,
    inputValidationHandler
  ]
  Array.prototype.splice.call(handlers, index, 1, extraHandlers)
  if (schema.output) {
    const outputValidationHandler = makeOutputValidationHandler(schema)
    handlers.push(outputValidationHandler)
  }
}

const checkValidation = function (schema) {
  assert(schema)
  if (schema.body) {
    assert(/json|raw|text|urlencoded/.test(schema.type))
  }
}

const makeBodyParserHandler = function (schema) {
  if (schema.body) {
    switch (schema.type) {
      case 'json':
        return json()
      case 'raw':
        return raw()
      case 'text':
        return text()
      case 'urlencoded':
        return urlencoded()
    }
  } else {
    return function (req, res, next) {
      next()
    }
  }
}

const makeInputValidationHandler = function (schema) {
  const locations = ['header', 'query', 'params', 'body']
  return function (req, res, next) {
    for (let location of locations) {
      if (!schema[location]) continue
      const error = validateInput(location, req, schema)
      if (error) {
        res.status(error.status)
        return res.json({
          error: error.toString()
        })
      }
    }
    next()
  }
}

const makeOutputValidationHandler = function (schema) {
  const outputValidation = new OutputValidation(schema.output)
  return function (req, res, next) {
    debug('start validate output. status code is %s', res.statusCode)
    const error = outputValidation.validate(res.statusCode, {}, res._body)
    if (error) {
      debug('output validation fail')
      res.status(error.status || 500)
      return res.json({
        error: error.toString()
      })
    } else {
      debug('output validation success')
      next()
    }
  }
}

const validateInput = function (location, req, schema) {
  debug('validating %s', location)
  const result = Joi.validate(req[location], schema[location])
  if (result.error) {
    result.error.status = schema.failure
    return result.error
  }
}

module.exports = Route
