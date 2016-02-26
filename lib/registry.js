var debug = require('debug')('prometheus-client:registry')

module.exports = Registry

function Registry() {
  if (!(this instanceof Registry)) {
    return new Registry()
  }
  
  this._metrics = {}
  
  return this
}

Registry.prototype.register = function(metric) {
  var name

  name = metric._full_name

  if (this._metrics[name]) {
    throw "Metric name must be unique."
  }

  debug("Registering new metric: " + name)

  this._metrics[name] = metric

  return metric
}

Registry.prototype.httpHandler = function(req, res, next) {
  var self = this

  if (typeof(next) != 'function') {
    next = function nextNoop() {}
  }

  if (req.url != '/metrics') {
    return res.end('<a href="/metrics">Metrics</a>')
  }

  var k, labels, lk, lv, obj, v, _i, _len, _ref, _ref1, labels_field

  res.writeHead(200, {
    "content-type": "text/plain; version=0.0.4"
  })

  debug("Preparing to write " + (Object.keys(self._metrics).length) + " metrics.")

  var _ref = self._metrics

  for (var k in _ref) {
    var obj = _ref[k]

    res.write("# HELP " + k + " " + obj.help + "\n# TYPE " + k + " " + (obj.type()) + "\n")
    var _ref1 = obj.values()

    for (var _i = 0, _len = _ref1.length; _i < _len; _i++) {
      var v = _ref1[_i]
      labels = ((function() {
        var _ref2, _results
        _ref2 = v[0]
        _results = []
        for (var lk in _ref2) {
          var lv = _ref2[lk]
          _results.push("" + lk + "=\"" + lv + "\"")
        }
        return _results
      })()).join(",")

      labels_field = " "
      if (labels.length > 0) {
        labels_field = "{" + labels + "} "
      }

      if (obj.type() == 'histogram') {
        res.write("" + k + "_bucket" + labels_field + v[1] + "\n")
      }
      else {
        res.write("" + k + labels_field + v[1] + "\n")        
      }
    }
    
    if (typeof obj.count != 'undefined') {
      res.write("" + k + "_count " + obj.count + "\n")
    }
    if (typeof obj.sum != 'undefined') {
      res.write("" + k + "_sum " + obj.sum + "\n")
    }
  }

  return res.end()
}
