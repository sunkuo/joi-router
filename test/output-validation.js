const assert = require('assert')
const Joi = require('joi')
const OutputValidation = require('../lib/output-validation.js')

describe('status code overlap is not allowed', function () {
  it('success with right schema combination', function () {
    const outputValidation = new OutputValidation({
      '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
      '300-400': {body: {}},
      '500': {body: {}}
    })
    assert(outputValidation)
  })
  it('fail with wrong schema combination', function () {
    assert.throws(() => {
      const outputValidation = new OutputValidation({
        '200': {body: {content: Joi.string().alphanum().min(3).max(30).required()}},
        '300-500': {body: {}},
        '500': {body: {}}
      })
      assert(outputValidation)
    })
  })
})

describe('validate should work', function () {
  it('success with right output', function () {
    const outputValidation = new OutputValidation({
      '200': {content: Joi.string().alphanum().min(3).max(30).required()},
      '300-400': {userId: Joi.string().alphanum().min(3).max(30).required()},
      '500': {limit: Joi.number().integer().min(0).max(50).required()}
    })
    assert(!outputValidation.validate(200, {content: 'lorem'}))
    assert(!outputValidation.validate(300, {userId: '111'}))
    assert(!outputValidation.validate(500, {limit: 1}))
  })
  it('fail with wrong output', function () {
    const outputValidation = new OutputValidation({
      '200': {content: Joi.string().alphanum().min(3).max(30).required()},
      '300-400': {userId: Joi.string().alphanum().min(3).max(30).required()},
      '500': {limit: Joi.number().integer().min(0).max(50).required()}
    })
    assert(outputValidation.validate(200, {content: 'l'}))
    assert(outputValidation.validate(300, {userId: '1'}))
    assert(outputValidation.validate(500, {limit: 100}))
  })
})
