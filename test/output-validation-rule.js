const assert = require('assert')
const Joi = require('joi')
const OutputValidationRule = require('../lib/output-validation-rule.js')

describe('match should work', function () {
  it('single status code should match right code', function () {
    const outputValidationRule = new OutputValidationRule('200', {})
    assert(outputValidationRule.match(200), 'status code not match')
  })
  it('single status code should not match wrong conde', function () {
    const outputValidationRule = new OutputValidationRule('200', {})
    assert.throws(() => {
      assert(outputValidationRule.match(300), 'status code not match')
    }, 'status code not match')
  })
  it('status code range should work with right code', function () {
    const outputValidationRule = new OutputValidationRule('200-300', {})
    assert(outputValidationRule.match(200) && outputValidationRule.match(201) && outputValidationRule.match(300), 'status code not match')
  })
  it('status code range should not work with wrong code', function () {
    const outputValidationRule = new OutputValidationRule('200-300', {})
    assert.throws(() => {
      assert(outputValidationRule.match(301) || outputValidationRule.match(199), 'status code not match')
    }, 'status code not match')
  })
  it('* should work', () => {
    const outputValidationRule = new OutputValidationRule('200-300', {})
    assert(outputValidationRule.match(200) && outputValidationRule.match(201) && outputValidationRule.match(300), 'status code not match')
  })
})

describe('validate should work', function () {
  it('validate should success with right body', function () {
    const outputValidationRule = new OutputValidationRule(200, {
      content: Joi.string().alphanum().min(3).max(30).required(),
      nextPage: Joi.number().integer().min(0).max(50)
    })
    assert(!outputValidationRule.validate(undefined, {
      content: 'lorem',
      nextPage: 0
    }), 'validate should work')
  })

  it('validate should fail with wrong body', function () {
    const outputValidationRule = new OutputValidationRule(200, {
      content: Joi.string().alphanum().min(3).max(30).required(),
      nextPage: Joi.number().integer().min(0).max(50)
    })
    assert(outputValidationRule.validate({
      content: 'l',
      nextPage: 0
    }), 'validate should return error')
  })
})
