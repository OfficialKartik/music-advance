const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'filterreset',
  description: 'Reset all active filters.',
  usage: 'alexa filterreset',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    if (typeof player.clearFilters === 'function') {
      await player.clearFilters();
    } else {
      await player.setFilters({});
    }

    player.data.set('activeFilters', new Set());
    message.channel.send({ content: 'Filters reset.' }).catch(() => {});
  },
};
