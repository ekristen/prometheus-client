[![Build Status](https://travis-ci.org/ekristen/prometheus-client.svg?branch=master)](https://travis-ci.org/ekristen/prometheus-client) [![npm](https://img.shields.io/npm/v/prometheus-client-js.svg)](https://www.npmjs.com/package/prometheus-client-js) [![David](https://img.shields.io/david/ekristen/prometheus-client.svg)](https://david-dm.org/ekristen/prometheus-client) [![David](https://img.shields.io/david/dev/ekristen/prometheus-client.svg)](https://david-dm.org/ekristen/prometheus-client#info=devDependencies&view=table)

# Prometheus Client (Pure Javascript)
Originally based https://github.com/StreamMachine/prometheus_client_nodejs, but written without CoffeScript in just JavaScript. (Originally Licensed under Apache 2.0)

[Prometheus](http://prometheus.io) instrumentation metrics library for Node.JS. Metrics are intended to be scraped by a Prometheus server.

![NPM Stats](https://nodei.co/npm/prometheus-client-js.png?downloads=true&downloadRank=true&stars=true)

## Major Changes in v4

Labels are now the secondard argument to most metrics, having labels first, just didn't make sense for node.js.

## Usage

### Getting Started

Install the `prometheus-client` package with NPM:

    npm install prometheus-client-js

Then require the package and set up a new client instance:

```javascript
var Prometheus = require('prometheus-client-js')
var client = new Prometheus()
```

The client library can create an HTTP app to serve up your metrics, or you
can point to the output function from your own app router.

### Counter

```javascript
var Prometheus = require('prometheus-client-js')
var client = new Prometheus()

var myCounter = client.createCounter({
  namespace: 'example',
  subsystem: 'readme',
  name: 'hits'
})

// This will increment the counter by 1
myCounter.increment()

// You can also specify labels to further group your increments
myCounter.increment({
  path: 'README.md#counter'
})
```

Counting HTTP request with additional labels

**Caveat** You don't want to get to granular with your labels, Proemtheus advises against this. In the below example if you don't have too many paths this would be ok, but if you have thousands of paths, it could become an issue.

If you have a limited number of paths, you can use this setup, but you'd want to exclude query strings as that could infinitely increase the number of metrics created.

```javascript
var Prometheus = require('prometheus-client-js')
var client = new Prometheus()

var myCounter = client.createCounter({
  namespace: 'example',
  subsystem: 'http',
  name: 'requests'
})

// You can also specify labels to further group your increments
myCounter.increment({
  path: '/README.md',
  method: 'GET',
  status: 200
})
```

### Gauge

### Histogram



## Metric Types

1. Counter (http://prometheus.io/docs/concepts/metric_types/#counter)
2. Gauge (http://prometheus.io/docs/concepts/metric_types/#gauge)
3. Histogram (http://prometheus.io/docs/concepts/metric_types/#histogram)
