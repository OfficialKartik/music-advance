const { Client, GatewayIntentBits, Partials, Collection } = require('discord.js');
const config = require('./config');
const MusicEngine = require('./managers/musicEngine');
client.music = new MusicEngine(client);

// Minimal bootstrap: no business logic here.
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildVoiceStates,
  ],
  partials: [Partials.Channel],
});

client.config = config;
client.commands = new Collection();

require('./handlers/commandHandler')(client);
require('./handlers/eventHandler')(client);

client.login(process.env.DISCORD_TOKEN);
