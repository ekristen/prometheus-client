var debug = require('debug')('prometheus-client:registry')

var util = require('util')

function Registry () {
  if (!(this instanceof Registry)) {
    return new Registry()
  }

  this._metrics = {}

  return this
}
module.exports = Registry

Registry.prototype.register = function RegistryRegister (metric) {
  var metricName = metric._full_name

  if (typeof this._metrics[metricName] !== 'undefined') {
    throw new Error('Metric name must be unique')
  }

  debug('Registering new metric: %s', metricName)

  this._metrics[metricName] = metric

  return metric
}

Registry.prototype.generateMetrics = function generateMetrics () {
  var self = this

  var _metrics = self._metrics
  var _output = []

  for (var metricName in _metrics) {
    var metricData = _metrics[metricName]

    var metricHelp = util.format('# HELP %s %s', metricName, metricData.help)
    var metricType = util.format('# TYPE %s %s', metricName, metricData.type())

    _output.push(metricHelp)
    _output.push(metricType)

    var _metrics1 = metricData.values()

    for (var _i = 0, _len = _metrics1.length; _i < _len; _i++) {
      var v = _metrics1[_i]
      var labels = ((function () {
        var _metrics2 = v[0]
        var _results = []

        for (var lmetricName in _metrics2) {
          var lv = _metrics2[lmetricName]
          _results.push(lmetricName + '="' + lv + '"')
        }

        return _results
      })()).join(',')

      var labelsField = ' '
      if (labels.length > 0) {
        labelsField = '{' + labels + '} '
      }

      if (metricData.type() === 'histogram') {
        _output.push(metricName + '_bucket' + labelsField + v[1])
      } else {
        _output.push(metricName + labelsField + v[1])
      }
    }

    if (typeof metricData.count !== 'undefined') {
      _output.push(metricName + '_count ' + metricData.count)
    }
    if (typeof metricData.sum !== 'undefined') {
      _output.push(metricName + '_sum ' + metricData.sum)
    }
  }

  return _output.join('\n') + '\n'
}

Registry.prototype.httpHandler = function RegistryHttpHandler (req, res, next) {
  var self = this

  if (typeof next !== 'function') {
    next = function nextNoop () {}
  }

  if (req.url !== '/metrics') {
    return res.end('<a href="/metrics">Metrics</a>')
  }

  res.writeHead(200, {
    'content-type': 'text/plain; version=0.0.4'
  })

  debug('Preparing to write %d metrics.', Object.keys(self._metrics).length)

  return res.end(self.generateMetrics())
}
