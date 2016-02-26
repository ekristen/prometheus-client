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
  }, opts)

  this.registry = this.opts.registry || this.Registry()

  return this
}



Client.prototype.createCounter = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Counter(args))
}
Client.prototype.newCounter = function(args) {
  console.warn('newCounter is deprecated, will be removed in the next major version. Use createCounter instead.')
  return this.createCounter(args)
}


Client.prototype.createGauge = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Gauge(args))
}
Client.prototype.newGauge = function(args) {
  console.warn('newGauge is deprecated, will be removed in the next major version. Use createGauge instead.')
  return this.createGauge(args)
}


Client.prototype.createHistogram = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Histogram(args))
}
Client.prototype.newHistogram = function(args) {
  console.warn('newHistogram is deprecated, will be removed in the next major version. Use createHistogram instead.')
  return this.createHistogram(args)
}


Client.prototype.createSummary = function(args) {
  args = xtend(this.opts, args)
  return this.register(this.Summary(args))
}
Client.prototype.newSummary = function(args) {
  console.warn('newSummary is deprecated, will be removed in the next major version. Use createSummary instead.')
  return this.createSummary(args)
}


Client.prototype.register = function(metric) {
  return this.registry.register(metric)
}

Client.prototype.httpHandler = function() {
  return this.registry.httpHandler.bind(this.registry)
}

Client.prototype.createServer = function() {
  var self = this
  var http = require('http')
  var server = http.createServer(this.registry.httpHandler.bind(this.registry));

  return server
}
Client.prototype.listen = function(){
  var server = this.createServer();
  return server.listen.apply(server, arguments);
};
