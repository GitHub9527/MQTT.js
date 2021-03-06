
var tls = require("tls")

function buildBuilder(mqttClient, opts) {
  opts.port = opts.port || 8883;
  opts.host = opts.host || opts.hostname || 'localhost';

  opts.rejectUnauthorized = !(opts.rejectUnauthorized === false);

  var connection = tls.connect(opts)

  connection.on('secureConnect', function() {
    if (opts.rejectUnauthorized && !connection.authorized) {
      connection.emit('error', new Error('TLS not authorized'));
    } else {
      connection.removeListener('error', handleTLSerrors)
    }
  });

  function handleTLSerrors(err) {
    // How can I get verify this error is a tls error?
    if (opts.rejectUnauthorized) {
      mqttClient.emit('error', err)
    }

    // close this connection to match the behaviour of net
    // otherwise all we get is an error from the connection
    // and close event doesn't fire. This is a work around
    // to enable the reconnect code to work the same as with
    // net.createConnection
    connection.end();
  }

  connection.on('error', handleTLSerrors)

  return connection;
}

module.exports = buildBuilder;

