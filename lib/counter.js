var debug = require('debug')('prometheus-client:counter')
var util = require('util')

var Metric = require('./metric')

function Counter (opts) {
  if (!(this instanceof Counter)) {
    return new Counter(opts)
  }

  Counter.super_.call(this, opts)

  debug('Creating new counter', opts)
  debug('New counter\'s full name is %s', this._full_name)

  this._value = 0

  return this
}
module.exports = Counter

util.inherits(Counter, Metric)

Counter.prototype.type = function CounterType () {
  return 'counter'
}

Counter.prototype['default'] = function CounterDefault () {
  return 0
}

Counter.prototype.increment = function CounterIncrement (incBy, labels) {
  if (typeof incBy === 'undefined') {
    incBy = 1
  }

  if (typeof incBy === 'object') {
    labels = incBy
    incBy = 1
  }

  if (typeof labels === 'undefined') {
    labels = {}
  }

  debug('increment: labels: %j, incBy: %d', labels, incBy)

  var labelHash
  var _base = this._values

  if (labels === null) {
    labels = {}
  }
  if (incBy === null) {
    incBy = 1
  }

  labelHash = this.labelHashFor(labels)

  if (typeof _base[labelHash] === 'undefined') {
    _base[labelHash] = this['default']()
  }

  this._values[labelHash] += incBy

  return this._values[labelHash]
}

Counter.prototype.decrement = function CounterDecrement (labels, decBy) {
  if (labels === null) {
    labels = {}
  }

  if (decBy === null || typeof decBy === 'undefined') {
    decBy = 1
  }

  debug('decrement: labels: %j, decBy: %d', labels, decBy)

  return this.increment(labels, -decBy)
}
