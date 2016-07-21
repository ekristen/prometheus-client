var _ = require('underscore')
var xtend = require('xtend')

function BaseMetric (opts) {
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
    throw new Error('Name is required')
  }

  if (!this.help) {
    throw new Error('Help is required')
  }

  this._full_name = _.compact([this.namespace, this.subsystem, this.name]).join('_')
}
module.exports = BaseMetric

BaseMetric.prototype.type = function BaseMetricType () {
  throw new Error('Metrics must set a type')
}

BaseMetric.prototype['default'] = function BaseMetricDefault () {
  return null
}

BaseMetric.prototype.get = function BaseMetricGet (labels) {
  var lh

  if (labels === null) {
    labels = {}
  }

  lh = this.label_hash_for(labels)

  return this._values[lh] || this['default']()
}

BaseMetric.prototype.values = function BaseMetricValues () {
  var values = []
  var _ref = this._values
  var lh

  for (lh in _ref) {
    var v = _ref[lh]
    values.push([this._labelCache[lh], v])
  }

  return values
}

BaseMetric.prototype.labelHashFor = function labelHashFor (labels) {
  var lh = ''
  for (var j in labels) {
    var v = labels[j]
    lh += j + v
  }

  if (this._labelCache[lh]) {
    return lh
  }

  for (var k in labels) {
    if (/^__/.test(k)) {
      throw new Error('Label ' + k + ' must not start with __')
    }

    if (_(['instance', 'job']).contains(k)) {
      throw new Error('Label ' + k + ' is reserved')
    }
  }

  var lkh = ''
  for (var h in labels) {
    lkh += h
  }

  if (this._labelKeys && (lkh !== this._labelKeys)) {
    throw new Error('Labels must have the same signature')
  }

  if (!this._labelKeys) {
    this._labelKeys = lkh
  }

  this._labelCache[lh] = labels

  return lh
}

