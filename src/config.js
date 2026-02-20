const dotenv = require('dotenv');

dotenv.config();

module.exports = {
  prefix: 'alexa ',
  embed: {
    primary: 0xff7a00,
    error: 0xff4d4d,
  },
  lavalink: {
    host: process.env.LAVALINK_HOST,
    port: Number(process.env.LAVALINK_PORT || 2333),
    password: process.env.LAVALINK_PASSWORD,
  },
  messageCleanupMs: 3000,
  defaultSearchEngine: 'youtube',
};
