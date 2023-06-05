// Refer to here if we want to send to cloudwatch directly
// and have more customisation on cloudwatch logs => https://github.com/camitz/aws-cloudwatch-statsd-backend/blob/master/lib/aws-cloudwatch-statsd-backend.js#L81

function ConsoleBackend(startupTime, config, emitter){
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;

  // attach
  emitter.on('flush', function(timestamp, metrics) { self.flush(timestamp, metrics); });
  emitter.on('status', function(callback) { self.status(callback); });
}

ConsoleBackend.prototype.flush = function(timestamp, metrics) {
  // Sample:
  // {
  //   "counters": {
  //     "statsd.bad_lines_seen": 0,
  //     "statsd.packets_received": 0,
  //     "statsd.metrics_received": 0,
  //     "GoogleBase.insert;environment=staging;region=eu-central-1": 0
  //   },
  //   "timers": {},
  //   "gauges": {
  //     "statsd.timestamp_lag": 0
  //   },
  //   "timer_data": {},
  //   "counter_rates": {
  //     "statsd.bad_lines_seen": 0,
  //     "statsd.packets_received": 0,
  //     "statsd.metrics_received": 0,
  //     "GoogleBase.insert;environment=staging;region=eu-central-1": 0
  //   },
  //   "sets": {},
  //   "pctThreshold": [
  //     90
  //   ]
  // }

  // Only output the metric with value > 0 so that the collector doesn't need to handle huge object
  const counters = Object.entries(metrics.counters).reduce((acc, [key, value]) => {
    if (value !== 0) {
      acc[key] = value;
    }
    return acc;
  }, {});

  var out = {
    counters,
    // timers: metrics.timers,
    // gauges: metrics.gauges,
    // timer_data: metrics.timer_data,
    // counter_rates: metrics.counter_rates,
    // sets: function (vals) {
    //   var ret = {};
    //   for (var val in vals) {
    //     ret[val] = vals[val].values();
    //   }
    //   return ret;
    // }(metrics.sets),
    // pctThreshold: metrics.pctThreshold
  };

  const isoTimeStamp = new Date(timestamp * 1000).toISOString()
  const logLine = `[StatsD] ${isoTimeStamp} - ${JSON.stringify(out)}`
  console.log(logLine);
  const used = process.memoryUsage()
  for (let key in used) {
    console.log(`[Analysis] Memory: ${key} ${Math.round(used[key] / 1024 / 1024)} MB`);
  }
};

ConsoleBackend.prototype.status = function(write) {
  ['lastFlush', 'lastException'].forEach(function(key) {
    write(null, 'console', key, this[key]);
  }, this);
};

exports.init = function(startupTime, config, events) {
  var instance = new ConsoleBackend(startupTime, config, events);
  return true;
};
