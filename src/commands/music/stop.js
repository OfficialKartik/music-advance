const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'stop',
  description: 'Stop playback and clear the queue.',
  usage: 'alexa stop',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const npMessage = player.data?.get('nowPlayingMessage');
    if (npMessage) {
      const ttl = client.config.messageCleanupMs ?? 3000;
      setTimeout(() => npMessage.delete().catch(() => {}), ttl);
    }

    player.queue.clear();
    player.destroy();
    client.nowPlayingManager?.delete(message.guild.id);

    message.channel.send({ content: 'Stopped playback and cleared the queue.' }).catch(() => {});
  },
};
