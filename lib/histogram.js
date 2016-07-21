var debug = require('debug')('prometheus-client:histogram')
var xtend = require('xtend')
var util = require('util')

var Metric = require('./metric')

function Histogram (opts) {
  if (!(this instanceof Histogram)) {
    return new Histogram(opts)
  }

  Histogram.super_.call(this, opts)

  debug('Creating new Histogram, options: %j', opts)

  this.opts = xtend({
    buckets: [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]
  }, opts)

  this.count = 0
  this.sum = 0
  this.buckets = this.opts.buckets
  this.upperBounds = this.buckets

  this.upperBounds.push(Number.POSITIVE_INFINITY)

  this.counts = this.buckets.map(function (b) {
    return 0
  })

  debug("New Histogram's full name is " + this._full_name)

  if (this.buckets.length === 0) {
    throw new Error('Histogram must have at least one bucket')
  }

  for (var i = 0; i < this.buckets.length; i++) {
    if (this.buckets[i] >= this.buckets[i + 1]) {
      throw new Error('Histogram buckets must be in increasing order: ' + this.buckets[i] + ' >= ' + this.buckets[i + 1])
    }
  }

  return this
}
module.exports = Histogram

util.inherits(Histogram, Metric)

Histogram.prototype.type = function HistogramType () {
  return 'histogram'
}

Histogram.prototype['default'] = function HistogramDefault () {
  return 0
}

Histogram.prototype.buckets = function HistogramBuckets (buckets) {
  this.buckets = buckets
  return this
}

Histogram.prototype.observe = function HistogramObserve (amount, labels) {
  if (typeof labels === 'undefined') {
    labels = {}
  }

  this.sum += amount
  this.count += 1

  var found = false
  var counts = this.upperBounds.map(function (bound) {
    if (found === true) {
      return 0
    }

    if (bound === Number.POSITIVE_INFINITY) {
      return 1
    }

    if (amount <= bound && found === false) {
      found = true
      return 1
    }

    return 0
  })

  var finalLabels = this.upperBounds.map(function (bound) {
    if (bound === Number.POSITIVE_INFINITY) {
      return xtend({le: '+Inf'}, labels)
    }

    return xtend({le: bound}, labels)
  })

  for (var i = 0; i < finalLabels.length; i++) {
    var labelHash = this.labelHashFor(finalLabels[i])

    debug('observe - labels: %j, value: %s, hash: %s', finalLabels[i], amount, labelHash)

    if (typeof this._values[labelHash] === 'undefined') {
      this._values[labelHash] = 0
    }

    this._values[labelHash] += counts[i]
  }

  return this
}
