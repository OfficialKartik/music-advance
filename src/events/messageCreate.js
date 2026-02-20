const { buildErrorEmbed } = require('../utils/embedBuilder');

module.exports = {
  name: 'messageCreate',
  execute: async (client, message) => {
    // Auto-delete bot responses except the active now playing message.
    if (message.author.bot) {
      if (message.author.id !== client.user?.id) return;

      const nowPlaying = client.nowPlayingManager?.get(message.guild?.id);
      if (nowPlaying && nowPlaying.id === message.id) return;

      const ttl = client.config.messageCleanupMs ?? 3000;
      setTimeout(() => message.delete().catch(() => {}), ttl);
      return;
    }

    if (!message.guild) return;

    const { prefix } = client.config;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/g);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`[Command Error] ${commandName}`, error);
      const embed = buildErrorEmbed('Something went wrong while executing that command.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
    } finally {
      // Delete the user's command message to keep channels clean.
      message.delete().catch(() => {});
    }
  },
};
