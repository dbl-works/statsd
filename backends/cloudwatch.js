// Refer to here if we want to send to cloudwatch directly
// and have more customisation on cloudwatch logs => https://github.com/camitz/aws-cloudwatch-statsd-backend/blob/master/lib/aws-cloudwatch-statsd-backend.js#L81

// statsD will output explicitly 0 / [] for each counter/timer where no values were tracked.
// We don't want all the blank values in our data warehouse.
function removeBlankValues(obj) {
  return Object.entries(obj).reduce((acc, [key, value]) => {
    if (value !== 0 && value !== undefined && (!Array.isArray(value) || value.length > 0) && (typeof value !== 'object' || Object.keys(value).length > 0)) {
      acc[key] = value;
    }
    return acc;
  }, {});
}

function ConsoleBackend(startupTime, config, emitter) {
  var self = this;
  this.lastFlush = startupTime;
  this.lastException = startupTime;

  // attach
  emitter.on("flush", function (timestamp, metrics) {
    self.flush(timestamp, metrics);
  });
  emitter.on("status", function (callback) {
    self.status(callback);
  });
}

ConsoleBackend.prototype.flush = function (timestamp, metrics) {
  // Sample:
  // {
  //   "counters": {
  //     "statsd.bad_lines_seen": 0,
  //     "statsd.packets_received": 0,
  //     "statsd.metrics_received": 0,
  //     "GoogleBase.insert;environment=staging;region=eu-central-1": 0
  //   },
  //   "timers": {
  //     "test.from-console": [
  //       1,
  //       8,
  //       13,
  //       123
  //     ]
  //   },
  //   "gauges": {
  //     "statsd.timestamp_lag": 0
  //   },
  //   "timer_data": {
  //     "test.from-console": {
  //       "count_90": 4,
  //       "mean_90": 36.25,
  //       "upper_90": 123,
  //       "sum_90": 145,
  //       "sum_squares_90": 15363,
  //       "std": 50.26616655365714,
  //       "upper": 123,
  //       "lower": 1,
  //       "count": 4,
  //       "count_ps": 0.0044444444444444444,
  //       "sum": 145,
  //       "sum_squares": 15363,
  //       "mean": 36.25,
  //       "median": 10.5
  //     }
  //   },
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

  // transform this into the same shape as "counters", i.e. { "key;tag1=val1;tag2=val2": value }
  const timers = Object.entries(removeBlankValues(metrics.timer_data)).map(([key, values]) => {
    const tags = [
      `min=${values['lower']}`,
      `median=${values['median']}`,
      `p90=${values['mean_90']}`,
      `max=${values['upper']}`,
      `count=${values['count']}`
    ].join(';');
    const keyWithTags = `${key};${tags}`;
    return [keyWithTags, values['mean_90']];
  });

  var out = {
    counters: removeBlankValues(metrics.counters),
    timers: Object.fromEntries(timers),
    gauges: removeBlankValues(metrics.gauges),
    // counter_rates: removeBlankValues(metrics.counter_rates), // this is just statsd's internal meta data (e.g. "statsd.packets_received")
  };

  const isoTimeStamp = new Date(timestamp * 1000).toISOString();
  const logLine = `[StatsD] ${isoTimeStamp} - ${JSON.stringify(out)}`;
  console.log(logLine);
  const used = process.memoryUsage();
  for (let key in used) {
    console.log(
      `[Analysis] Memory: ${key} ${(used[key] / 1024 / 1024).toFixed(2)} MB`
    );
  }
};

ConsoleBackend.prototype.status = function (write) {
  ["lastFlush", "lastException"].forEach(function (key) {
    write(null, "console", key, this[key]);
  }, this);
};

exports.init = function (startupTime, config, events) {
  var instance = new ConsoleBackend(startupTime, config, events);
  return true;
};
