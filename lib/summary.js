var debug = require('debug')('prometheus-client:summary')
var xtend = require('xtend')
var util = require('util')

var Metric = require('./metric')


module.exports = Summary

function Summary(opts) {
  if (!(this instanceof Summary)) {
    return new Summary(opts)
  }

  Summary.super_.call(this, opts)
  
  throw "Not yet fully implemented"

  debug("Creating new Summary", opts)

  this.opts = xtend({
    MaxAge: 60 * 60 * 10 * 1000, // 10 minutes
    AgeBuckets: 5,
    BufCap: 500,
    Objectives: {0.5: 0.05,0.9: 0.01,0.99: 0.001}
  }, opts)

  this.count = 0
  this.sum = 0

  debug("New Summary's full name is " + this._full_name)

  if (this.buckets.length == 0) {
    throw "Summary must have at least one bucket."
  }

  for (var i = 0; i < this.buckets.length; i++) {
    if (this.buckets[i] >= this.buckets[i + 1]) {
      throw "Summary buckets must be in increasing order: " + this.buckets[i] + ' >= ' + this.buckets[i + 1]
    }
  }

  return this
}
util.inherits(Summary, Metric)

Summary.prototype.type = function() {
  return "summary"
};

Summary.prototype["default"] = function() {
  return 0
};

Summary.prototype.buckets = function(buckets) {
  this.buckets = buckets
  return this
}

// TODO: Finish Implementing
Summary.prototype.observe = function(amount) {
  var self = this

  this.sum += amount
  this.count += 1


  return this
}
