const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'vibrato',
  description: 'Apply a vibrato filter.',
  usage: 'alexa vibrato',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    await player.setFilters({
      vibrato: { frequency: 5, depth: 0.75 },
    });

    const active = player.data.get('activeFilters') ?? new Set();
    active.add('vibrato');
    player.data.set('activeFilters', active);

    message.channel.send({ content: 'Vibrato enabled.' }).catch(() => {});
  },
};
