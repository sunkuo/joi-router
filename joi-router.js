const assert = require('power-assert')
const debug = require('debug')('joi-router')
const flatten = require('flatten')
const methods = require('methods')
const Joi = require('joi')
const only = require('only')
const {Route} = require('express')
const Layer = require('express/lib/router/layer.js')
const {json, raw, text, urlencoded} = require('body-parser')

// For each verb, check validation schema. If exists, handle it
methods.forEach(function (method) {
  Route.prototype[method] = function () {
    let handles = flatten(Array.prototype.slice.call(arguments))
    // If validation schema exist, add validate handlers
    if (typeof handles[0] === 'object') {
      debug('handle validation schema')
      const supportedLocations = ['body', 'query', 'params', 'headers', 'output', 'type', 'failure']
      const schema = Object.assign({
        type: 'json',
        failure: 400
      }, only(handles[0], supportedLocations))
      const offset = 1
      handles = Array.prototype.slice.call(handles, offset)
      handleValidation(this, schema, handles)
    }
    for (var i = 0; i < handles.length; i++) {
      var handle = handles[i]

      if (typeof handle !== 'function') {
        var type = toString.call(handle)
        var msg = 'Route.' + method + '() requires callback functions but got a ' + type
        throw new Error(msg)
      }

      debug('%s %o', method, this.path)

      var layer = Layer('/', {}, handle)
      layer.method = method

      this.methods[method] = true
      this.stack.push(layer)
    }

    return this
  }
})

// For each verb, check validation schema. If exists, handle it
Route.prototype.all = function () {
  let handles = flatten(Array.prototype.slice.call(arguments))
  // If validation schema exist, add validate handlers
  if (typeof handles[0] === 'object') {
    debug('handle validation schema')
    const supportedLocations = ['body', 'query', 'params', 'headers', 'output', 'type', 'failure']
    const schema = Object.assign({
      type: 'json',
      failure: 400
    }, only(handles[0], supportedLocations))
    const offset = 1
    handles = Array.prototype.slice.call(handles, offset)
    handleValidation(this, schema, handles)
  }
  for (var i = 0; i < handles.length; i++) {
    var handle = handles[i]

    if (typeof handle !== 'function') {
      var type = toString.call(handle)
      var msg = 'Route.all() requires callback functions but got a ' + type
      throw new TypeError(msg)
    }

    var layer = Layer('/', {}, handle)
    layer.method = undefined

    this.methods._all = true
    this.stack.push(layer)
  }

  return this
}

// add validation handle to layer stack
const handleValidation = function (context, schema, handlers) {
  checkValidation(schema)
  const bodyParserHandler = makeBodyParserHandler(schema)
  const inputValidationHandler = makeInputValidationHandler(schema)
  const extraHandlers = [
    bodyParserHandler,
    inputValidationHandler
  ]
  Array.prototype.splice.call(handlers, 0, 0, ...extraHandlers)
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

const validateInput = function (location, req, schema) {
  debug('validating %s', location)
  const result = Joi.validate(req[location], schema[location])
  if (result.error) {
    result.error.status = schema.failure
    return result.error
  }
}

module.exports = Route
