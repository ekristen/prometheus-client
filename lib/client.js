var xtend = require('xtend')

function Client (opts) {
  if (!(this instanceof Client)) {
    return new Client(opts)
  }

  this.opts = opts

  this.Registry = require('./registry')
  this.Counter = require('./counter')
  this.Gauge = require('./gauge')
  this.Histogram = require('./histogram')

  this.registry = this.Registry()

  return this
}
module.exports = Client

Client.prototype.createCounter = function (args) {
  args = xtend(this.opts, args)
  return this.register(this.Counter(args))
}

Client.prototype.createGauge = function (args) {
  args = xtend(this.opts, args)
  return this.register(this.Gauge(args))
}

Client.prototype.createHistogram = function (args) {
  args = xtend(this.opts, args)
  return this.register(this.Histogram(args))
}

Client.prototype.createSummary = function (args) {
  args = xtend(this.opts, args)
  return this.register(this.Summary(args))
}

Client.prototype.register = function (metric) {
  return this.registry.register(metric)
}

Client.prototype.getMetrics = function () {
  return this.registry.generateMetrics(this.registry)
}

Client.prototype.httpHandler = function () {
  return this.registry.httpHandler.bind(this.registry)
}
