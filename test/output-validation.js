const assert = require('assert')
const Joi = require('joi')
const OutputValidation = require('../lib/output-validation.js')

describe('status code overlap is not allowed', function () {
  it('success with right schema combination', function () {
    const outputValidation = new OutputValidation({
      '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
      '300-400': {body: {}},
      '500': {header: {}}
    })
    assert(outputValidation)
  })
  it('fail with wrong schema combination', function () {
    assert.throws(() => {
      const outputValidation = new OutputValidation({
        '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
        '300-500': {body: {}},
        '500': {header: {}}
      })
      assert(outputValidation)
    })
  })
})

describe('validate should work', function () {
  it('success with right output', function () {
    const outputValidation = new OutputValidation({
      '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
      '300-400': {body: {userId: Joi.string().alphanum().min(3).max(30).required()}},
      '500': {header: {limit: Joi.number().integer().min(0).max(50).required()}}
    })
    assert(!outputValidation.validate(200, undefined, {content: 'lorem'}))
    assert(!outputValidation.validate(300, undefined, {userId: '111'}))
    assert(!outputValidation.validate(500, {limit: 1}, undefined))
  })
  it('fail with wrong output', function () {
    const outputValidation = new OutputValidation({
      '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
      '300-400': {body: {userId: Joi.string().alphanum().min(3).max(30).required()}},
      '500': {header: {limit: Joi.number().integer().min(0).max(50).required()}}
    })
    assert(outputValidation.validate(200, undefined, {content: 'l'}))
    assert(outputValidation.validate(300, undefined, {userId: '1'}))
    assert(outputValidation.validate(500, {limit: 100}, undefined))
  })
})
