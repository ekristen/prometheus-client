var test = require('tape')

var counterRand = Math.floor(Math.random() * (20 - 1 + 1) + 1)
var gaugeRand = Math.floor(Math.random() * (20 - 1 + 1) + 1)
var histogramRand = Math.floor(Math.random() * (20 - 1 + 1) + 1)

test('counter (random ' + counterRand + ')', function(t) {
  var Prometheus = require("./lib/client")
  var client = new Prometheus()

  var counter = client.newCounter({
    namespace: "counter_test",
    name: "elapsed_counters_total",
    help: "The number of counter intervals that have elapsed."
  });

  function testEnd() {
    t.deepEqual(counter.values(), [ [ { period: '1sec' }, counterRand ] ])
    t.end()
  }

  var x = 0
  var interval = setInterval(function() {
    counter.increment({
      period: "1sec" //period is a custom label name in this case with a value of "1sec"
    })
    
    if (++x == counterRand) {
      clearInterval(interval)
      testEnd()
    }
  }, 150)
})

test('gauge (random ' + gaugeRand + ')', function(t) {
  var Prometheus = require("./lib/client")
  var client = new Prometheus()

  var gauge = client.newGauge({
    namespace: "gauge_test",
    name: "random_number",
    help: "A random number we occasionally set."
  });
  
  function testEnd() {
    t.end()
  }

  var x = 0
  var interval = setInterval(function() {
    var gaugeNum = Math.random() * 1000

    gauge.set({
        period: "1sec"
    }, gaugeNum);
    
    t.deepEqual(gauge.values(), [ [ { period: '1sec' }, gaugeNum ] ])

    if (++x == gaugeRand) {
      clearInterval(interval)
      testEnd()
    }
  }, 150)
})

test('histogram (random ' + histogramRand + ')', function(t) {
  var Prometheus = require("./lib/client")
  var client = new Prometheus()
  
  var histogram = client.newHistogram({
    namespace: "histogram_test",
    name: "random_histogram",
    help: "random historgram",
  })

  function testEnd() {
    t.equal(histogram.values()[histogram.values().length-1][0].le, '+Inf')
    t.end()
  }

  var x = 0
  var interval = setInterval(function() {
    var rand = Math.random() * (0 + 10) + 1
    histogram.observe(rand)

    if (++x == histogramRand) {
      clearInterval(interval)
      testEnd()
    }
  }, 150)
})
