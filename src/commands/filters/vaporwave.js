const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'vaporwave',
  description: 'Apply a vaporwave timescale filter.',
  usage: 'alexa vaporwave',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    await player.setFilters({
      timescale: { speed: 0.85, pitch: 0.8, rate: 0.85 },
    });

    const active = player.data.get('activeFilters') ?? new Set();
    active.add('vaporwave');
    player.data.set('activeFilters', active);

    message.channel.send({ content: 'Vaporwave enabled.' }).catch(() => {});
  },
};
