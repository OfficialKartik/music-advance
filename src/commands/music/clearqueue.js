const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'clearqueue',
  description: 'Clear all tracks from the queue.',
  usage: 'alexa clearqueue',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    player.queue.clear();
    message.channel.send({ content: 'Cleared the queue.' }).catch(() => {});
  },
};
