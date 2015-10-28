var debug = require('debug')('prometheus-client:client')
var _ = require('underscore')
var xtend = require('xtend')

module.exports = Client

function Client(opts) {
  this.Registry = require('./registry')
  this.Counter = require('./counter')
  this.Gauge = require('./gauge')
  this.Histogram = require('./histogram')
  this.Summary = require('./summary')

  if (!(this instanceof Client)) {
    return new Client(opts)
  }
  
  this.opts = xtend({
    registry: null,
    port: 6754
  }, opts)

  this.registry = this.opts.registry || this.Registry()

  return this
}

Client.prototype.register = function(metric) {
  return this.registry.register(metric)
};

Client.prototype.httpHandler = function() {
  return this.registry.httpHandler
};

Client.prototype.newCounter = function(args) {
  return this.register(this.Counter(args))
};

Client.prototype.newGauge = function(args) {
  return this.register(this.Gauge(args))
};

Client.prototype.newHistogram = function(args) {
  return this.register(this.Histogram(args))
}

Client.prototype.newSummary = function(args) {
  return this.register(this.Summary(args))
}

Client.prototype.createServer = function(port) {
  var self = this
  var http = require('http')
  http.createServer(this.registry.httpHandler.bind(this.registry))
    .listen(port || this.opts.port, function() {
      debug('Listening on ' + port || self.opts.port)
    })
}
