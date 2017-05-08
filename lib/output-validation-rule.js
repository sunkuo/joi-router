const assert = require('assert')
const Joi = require('joi')
const debug = require('debug')('output-validation-rule')

// {status, header, body}
const OutputValidationRule = function (schema) {
  this.schema = schema
  validateSchema.call(this, schema)
  this.ranges = rangeParser(schema.status || '*')
}
module.exports = OutputValidationRule

const validateSchema = function (schema) {
  assert(this.schema.body || this.schema.header, 'output validation key: ' +
    this.status + ' must have either a body or headers validator specified')
}

OutputValidationRule.prototype.match = function (status) {
  // validate status
  const statusMatch = this.ranges.some(function (range) {
    if (range.start <= status && range.end >= status) {
      return true
    }
    return false
  })
  return statusMatch
}

OutputValidationRule.prototype.validate = function (header, body) {
  // validate header
  if (this.schema.header) {
    const headerValidateResult = Joi.validate(header, this.schema.header)
    debug('headerValidationResult %s', headerValidateResult)
    if (headerValidateResult.error) { return headerValidateResult.error }
  }
  // validate body
  if (this.schema.body) {
    const bodyValidateResult = Joi.validate(body, this.schema.body)
    debug('bodyValidateResult %s', bodyValidateResult)
    if (bodyValidateResult.error) { return bodyValidateResult.error }
  }
}

function rangeParser (str) {
  // split the range string
  var arr = str.split(',').map((s) => s.trim()).filter(Boolean)
  var ranges = []
  debug('status range string: %s , range array: %s', str, arr)
  // parse all ranges
  for (var i = 0; i < arr.length; i++) {
    var range = arr[i].split('-')
    assert(range.length && range.length < 3, 'invalid status range string')
    var start = parseInt(range[0], 10)
    var end = range.length === 1 ? start : parseInt(range[1], 10)
    debug('parse status string %s ,result start = %s end = %s', arr[i], start, end)
    validateCode(start)
    validateCode(end)

    // add range
    ranges.push({
      start: start,
      end: end
    })
  }

  assert(ranges.length > 0, 'OutputValidationRule: missing status range')

  return combineRanges(ranges)
}

function validateCode (code) {
  assert(/^[1-5][0-9]{2}$/.test(code), 'invalid status code: ' + code +
    ' must be between 100-599')
}

function combineRanges (ranges) {
  if (ranges === '*') {
    return [{
      start: 0,
      end: Infinity
    }]
  }
  var ordered = ranges.map(mapWithIndex).sort(sortByRangeStart)

  for (var j = 0, i = 1; i < ordered.length; i++) {
    const range = ordered[i]
    const current = ordered[j]

    if (range.start > current.end + 1) {
      // next range
      ordered[++j] = range
    } else if (range.end > current.end) {
      // extend range
      current.end = range.end
      current.index = Math.min(current.index, range.index)
    }
  }

  // trim ordered array
  ordered.length = j + 1

  // generate combined range
  var combined = ordered.sort(sortByRangeIndex).map(mapWithoutIndex)
  return combined
}

function mapWithIndex (range, index) {
  return {
    start: range.start,
    end: range.end,
    index: index
  }
}

function mapWithoutIndex (range) {
  return {
    start: range.start,
    end: range.end
  }
}

function sortByRangeIndex (a, b) {
  return a.index - b.index
}

function sortByRangeStart (a, b) {
  return a.start - b.start
}
