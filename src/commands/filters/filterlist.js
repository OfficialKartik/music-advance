const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'filterlist',
  description: 'List available filters and show active ones.',
  usage: 'alexa filterlist',
  execute: async (client, message) => {
    const available = ['bassboost', 'nightcore', 'vaporwave', 'tremolo', 'vibrato'];

    const player = client.kazagumo.players.get(message.guild.id);
    const active = player?.data.get('activeFilters') ?? new Set();

    const activeText = active.size
      ? Array.from(active).join(', ')
      : 'None';

    const content = `Available filters: ${available.join(', ')}\nActive filters: ${activeText}`;

    message.channel.send({ content }).catch(() => {
      const embed = buildErrorEmbed('Unable to send filter list.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
    });
  },
};
