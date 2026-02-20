const { Kazagumo, Plugins } = require('kazagumo');
const { Connectors } = require('shoukaku');
const nodes = require('../lavalink/nodes');
const bindPlayerEvents = require('../lavalink/playerEvents');
const createNowPlayingManager = require('../managers/nowPlayingManager');

module.exports = (client) => {
  // Kazagumo wraps Shoukaku and provides a higher-level player API.
  client.kazagumo = new Kazagumo(
    {
      defaultSearchEngine: client.config.defaultSearchEngine,
      send: (guildId, payload) => {
        const guild = client.guilds.cache.get(guildId);
        if (guild) guild.shard.send(payload);
      },
      plugins: [new Plugins.PlayerMoved(client)],
    },
    new Connectors.DiscordJS(client),
    nodes,
  );

  // Lavalink node lifecycle logging (useful for production health checks).
  client.kazagumo.shoukaku.on('ready', (name) => {
    console.log(`[Lavalink] Node "${name}" is ready.`);
  });

  client.kazagumo.shoukaku.on('error', (name, error) => {
    console.error(`[Lavalink] Node "${name}" error:`, error);
  });

  client.kazagumo.shoukaku.on('close', (name, code, reason) => {
    console.warn(`[Lavalink] Node "${name}" closed: ${code} ${reason}`);
  });

  client.nowPlayingManager = createNowPlayingManager(client);

  bindPlayerEvents(client);
};
