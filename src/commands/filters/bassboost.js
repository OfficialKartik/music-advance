const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

const BASS_BOOST_EQ = [
  { band: 0, gain: 0.25 },
  { band: 1, gain: 0.2 },
  { band: 2, gain: 0.15 },
  { band: 3, gain: 0.1 },
  { band: 4, gain: 0.05 },
];

module.exports = {
  name: 'bassboost',
  description: 'Apply a bassboost equalizer filter.',
  usage: 'alexa bassboost',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    await player.setFilters({ equalizer: BASS_BOOST_EQ });

    const active = player.data.get('activeFilters') ?? new Set();
    active.add('bassboost');
    player.data.set('activeFilters', active);

    message.channel.send({ content: 'Bassboost enabled.' }).catch(() => {});
  },
};
