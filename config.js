// Refer to here for the full list of config variables:
// https://github.com/statsd/statsd/blob/master/exampleConfig.js
{
  debug: false,
  dumpMessages: false, // Dump all incoming messages to the log
  flushInterval: process.env.STATSD_FLUSH_INTERVAL_IN_MS || 900000, // interval (in ms) to flush metrics to each backend
  deleteIdleStats: true,
  log: {
    backend: 'stdout',
    level: 'LOG_INFO'
  },
  backends: ["./backends/cloudwatch"]
}
