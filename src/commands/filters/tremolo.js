const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'tremolo',
  description: 'Apply a tremolo filter.',
  usage: 'alexa tremolo',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    await player.setFilters({
      tremolo: { frequency: 4, depth: 0.75 },
    });

    const active = player.data.get('activeFilters') ?? new Set();
    active.add('tremolo');
    player.data.set('activeFilters', active);

    message.channel.send({ content: 'Tremolo enabled.' }).catch(() => {});
  },
};
