var debug = require('debug')('prometheus-client:counter')
var util = require('util')

var Metric = require('./metric')

module.exports = Counter

function Counter(opts) {
  if (!(this instanceof Counter)) {
    return new Counter(opts)
  }
  
  Counter.super_.call(this, opts)

  debug("Creating new counter", opts)

  this._value = 0

  debug("New counter's full name is " + this._full_name)
  
  return this
}
util.inherits(Counter, Metric)

Counter.prototype.type = function() {
  return "counter"
}

Counter.prototype["default"] = function() {
  return 0
}

Counter.prototype.increment = function(labels, inc_by) {
  if (typeof inc_by == 'undefined') {
    inc_by = 1
  }

  debug('increment: labels: %j, inc_by: %d', labels, inc_by)

  var label_hash
  var _base = this._values

  if (labels == null) {
    labels = {}
  }
  if (inc_by == null) {
    inc_by = 1
  }

  label_hash = this.label_hash_for(labels)
  
  if (typeof _base[label_hash] == 'undefined') {
    _base[label_hash] = this["default"]()
  }

  return this._values[label_hash] += inc_by
}

Counter.prototype.decrement = function(labels, dec_by) {
  if (labels == null) {
    labels = {}
  }
  if (dec_by == null || typeof dec_by == 'undefined') {
    dec_by = 1
  }

  debug('decrement: labels: %j, dec_by: %d', labels, dec_by)

  return this.increment(labels, -dec_by)
}
