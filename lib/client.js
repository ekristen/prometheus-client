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
    port: 6754,
    host: '0.0.0.0'
  }, opts)

  this.registry = this.opts.registry || this.Registry()

  return this
}



Client.prototype.createCounter = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Counter(args))
}
Client.prototype.newCounter = function(args) {
  console.warn('newCounter is deprecated, will be removed in the next major version')
  return this.createCounter(args)
}


Client.prototype.createGauge = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Gauge(args))
}
Client.prototype.newGauge = function(args) {
  console.warn('newGauge is deprecated, will be removed in the next major version')
  return this.createGauge(args)
}


Client.prototype.createHistogram = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Histogram(args))
}
Client.prototype.newHistogram = function(args) {
  console.warn('newHistogram is deprecated, will be removed in the next major version')
  return this.createHistogram(args)
}


Client.prototype.createSummary = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Summary(args))
}
Client.prototype.newSummary = function(args) {
  console.warn('newSummary is deprecated, will be removed in the next major version')
  return this.createSummary(args)
}


Client.prototype.register = function(metric) {
  return this.registry.register(metric)
}

Client.prototype.httpHandler = function() {
  return this.registry.httpHandler.bind(this.registry)
}

Client.prototype.createServer = function(listen) {
  var self = this
  var http = require('http')
  var server = http.createServer(this.registry.httpHandler.bind(this.registry))

  server._listen = server.listen.bind(server)
  server.listen = function(port, host, callback) {
    if (typeof callback != 'function') {
      callback = function serverListenNoop() {}
    }

    server._listen(port || self.opts.port, host || self.opts.host, function() {
      debug('Listening on ' + self.opts.port)
      callback.apply(null, arguments)
    })
  }
  
  if (listen) {
    server.listen()
  }
  
  return server
}
