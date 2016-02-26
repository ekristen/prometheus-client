const debug = require('debug')('prometheus-client:metric')
const _ = require('underscore')
const hash = require('object-hash')
const xtend = require('xtend')

var BaseMetric = module.exports = function BaseMetric(opts) {
  this.opts = xtend({
    name: void 0,
    namespace: void 0,
    subsystem: void 0,
    help: void 0,
    labels: void 0
  }, opts)
  
  this.name = this.opts.name
  this.namespace = this.opts.namespace
  this.subsystem = this.opts.subsystem
  this.help = this.opts.help
  this.base_labels = this.opts.labels

  this._values = {}
  this._labelCache = {}
  this._labelKeys = null

  if (!this.name) {
    throw "Name is required"
  }

  if (!this.help) {
    throw "Help is required"
  }

  this._full_name = _.compact([this.namespace, this.subsystem, this.name]).join("_")
}

BaseMetric.prototype.type = function() {
  throw "Metrics must set a type"
}

BaseMetric.prototype["default"] = function() {
  return null
}

BaseMetric.prototype.get = function(labels) {
  var lh

  if (labels == null) {
    labels = {}
  }

  lh = this.label_hash_for(labels)

  return this._values[lh] || this["default"]()
}

BaseMetric.prototype.values = function() {
  var values = []
  var _ref = this._values
  var lh

  for (lh in _ref) {
    var v = _ref[lh]
    values.push([this._labelCache[lh], v])
  }

  return values
}

BaseMetric.prototype.label_hash_for = function(labels) {
  var lh = hash.sha1(labels)

  if (this._labelCache[lh]) {
    return lh
  }

  for (var k in labels) {
    var v = labels[k]

    if (/^__/.test(k)) {
      throw "Label " + k + " must not start with __"
    }

    if (_(['instance', 'job']).contains(k)) {
      throw "Label " + k + " is reserved"
    }
  }

  if (this._labelKeys && hash.keys(labels) !== this._labelKeys) {
    throw "Labels must have the same signature"
  }

  if (!this._labelKeys) {
    this._labelKeys = hash.keys(labels)
  }

  this._labelCache[lh] = labels

  return lh
}

