const config = require('../config');

// Shoukaku expects a Lavalink v4 websocket endpoint. Lavalink v4 uses /v4/websocket
// internally; Shoukaku handles the correct route when given host:port.
module.exports = [
  {
    name: 'main',
    url: `${config.lavalink.host}:${config.lavalink.port}`,
    auth: config.lavalink.password,
    secure: false,
  },
];
