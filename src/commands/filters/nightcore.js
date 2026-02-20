const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'nightcore',
  description: 'Apply a nightcore timescale filter.',
  usage: 'alexa nightcore',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    await player.setFilters({
      timescale: { speed: 1.1, pitch: 1.125, rate: 1.05 },
    });

    const active = player.data.get('activeFilters') ?? new Set();
    active.add('nightcore');
    player.data.set('activeFilters', active);

    message.channel.send({ content: 'Nightcore enabled.' }).catch(() => {});
  },
};
