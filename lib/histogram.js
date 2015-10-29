var debug = require('debug')('prometheus-client:histogram')
var xtend = require('xtend')
var util = require('util')

var Metric = require('./metric')

module.exports = Histogram

function Histogram(opts) {
  if (!(this instanceof Histogram)) {
    return new Histogram(opts)
  }

  Histogram.super_.call(this, opts)

  debug("Creating new Histogram", opts)

  this.opts = xtend({
    buckets: [.005, .01, .025, .05, .1, .25, .5, 1, 2.5, 5, 10]
  }, opts)

  this.count = 0
  this.sum = 0
  this.buckets = this.opts.buckets
  this.upperBounds = this.buckets
  
  this.upperBounds.push(Number.POSITIVE_INFINITY)
  
  this.counts = this.buckets.map(function(b) {
    return 0
  })

  debug("New Histogram's full name is " + this._full_name)

  if (this.buckets.length == 0) {
    throw "Histogram must have at least one bucket."
  }

  for (var i = 0; i < this.buckets.length; i++) {
    if (this.buckets[i] >= this.buckets[i + 1]) {
      throw "Histogram buckets must be in increasing order: " + this.buckets[i] + ' >= ' + this.buckets[i + 1]
    }
  }

  return this
}
util.inherits(Histogram, Metric)

Histogram.prototype.type = function() {
  return "histogram"
};

Histogram.prototype["default"] = function() {
  return 0
};

Histogram.prototype.buckets = function(buckets) {
  this.buckets = buckets
  return this
}

Histogram.prototype.observe = function(amount) {
  var self = this

  this.sum += amount
  this.count += 1

  var label_hash
  var found = false
  var counts = this.upperBounds.map(function(bound) {
    if (found == true) {
      return 0
    }

    if (bound == Number.POSITIVE_INFINITY) {
      return 1
    }
    
    if (amount <= bound && found == false) {
      found = true
      return 1
    }

    return 0
  })

  var labels = this.upperBounds.map(function(bound) {
    if (bound == Number.POSITIVE_INFINITY) {
      return {le: '+Inf'}
    }

    return {le: bound}
  })

  for (var i = 0; i < labels.length; i++) {
    var label_hash = this.label_hash_for(labels[i])

    debug('observe - labels: %j, value: %s, hash: %s', labels[i], amount, label_hash)

    if (typeof this._values[label_hash] == 'undefined') {
      this._values[label_hash] = 0
    }

    this._values[label_hash] += counts[i]
  }
  
  return this
}
