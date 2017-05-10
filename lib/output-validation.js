const debug = require('debug')('output-validation')
const OutputValidationRule = require('./output-validation-rule.js')

// {'200': {header, body}, '400-500': {body}}
const OutputValidation = function (spes) {
  // for array support in future
  if (typeof spes === 'object' && Array.isArray(spes)) {
    spes = spes[0]
  }
  const rules = this.rules = []
  Object.keys(spes).forEach(function (key) {
    debug('key = %s', key)
    const schema = spes[key]
    rules.push(new OutputValidationRule(key, schema))
  })
  assertIfOverlappingStatusRules(rules)
}

module.exports = OutputValidation

function assertIfOverlappingStatusRules (rules) {
  for (let i = 0; i < rules.length; ++i) {
    const ruleA = rules[i]

    for (let j = i + 1; j < rules.length; ++j) {
      const ruleB = rules[j]
      if (overlaps(ruleA, ruleB)) {
        debug('overlop occur between %s and %s', JSON.stringify(ruleA.ranges), JSON.stringify(ruleB.ranges))
        throw new Error(
          'Output validation rules may not overlap: ' + ruleA + ' <=> ' + ruleB
        )
      }
    }
  }
};

function overlaps (a, b) {
  debug('overlap judge between %s and %s', JSON.stringify(a.ranges), JSON.stringify(b.ranges))
  /* eslint-disable prefer-arrow-callback */
  return a.ranges.some(function (rangeA) {
    return b.ranges.some(function (rangeB) {
      if (rangeA.end >= rangeB.start && rangeA.start <= rangeB.end) {
        return true
      }
      return false
    })
  })
};

OutputValidation.prototype.validate = function (status, body) {
  debug('start validate by %s rules', this.rules.length)
  // for each rule, validate
  for (let i = 0; i < this.rules.length; i++) {
    const rule = this.rules[i]
    if (rule.match(status)) {
      debug('rule %s match status %s', JSON.stringify(rule.ranges), status)
      const result = rule.validate(body)
      return result
    }
  }
}
