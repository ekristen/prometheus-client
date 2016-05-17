var debug = require('debug')('prometheus-client:guage')
var util = require('util')

var Metric = require('./metric')

function Gauge (opts) {
  if (!(this instanceof Gauge)) {
    return new Gauge(opts)
  }

  Gauge.super_.call(this, opts)

  debug('Creating new gauge, options: %j', opts)
  debug('New gauge\'s full name is %s', this._full_name)

  this._value = 0

  return this
}
module.exports = Gauge

util.inherits(Gauge, Metric)

Gauge.prototype.type = function GaugeType () {
  return 'gauge'
}

Gauge.prototype['default'] = function GaugeDefault () {
  return 0
}

Gauge.prototype.set = function GaugeSet (labels, value) {
  if (typeof value === 'undefined') {
    value = labels
    labels = {}
  }

  var labelHash = this.labelHashFor(labels)

  debug('set - labels: %j, value: %s, hash: %s', labels, value, labelHash)

  this._values[labelHash] = value

  return this._values[labelHash]
}
