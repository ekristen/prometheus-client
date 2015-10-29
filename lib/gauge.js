var debug = require('debug')('prometheus-client:guage')
var util = require('util')

var Metric = require('./metric')

module.exports = Gauge

function Gauge(opts) {
  if (!(this instanceof Gauge)) {
    return new Gauge(opts)
  }

  Gauge.super_.call(this, opts)

  debug("Creating new gauge", opts)

  this._value = 0

  debug("New gauge's full name is " + this._full_name)
  
  return this
}
util.inherits(Gauge, Metric)

Gauge.prototype.type = function() {
  return "gauge"
};

Gauge.prototype["default"] = function() {
  return 0
};

Gauge.prototype.set = function(labels, value) {
  var label_hash

  if (typeof value == 'undefined') {
    value = labels
    labels = {}
  }

  label_hash = this.label_hash_for(labels)

  debug('set - labels: %j, value: %s, hash: %s', labels, value, label_hash)

  return this._values[label_hash] = value
}
