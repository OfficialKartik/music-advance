const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'autoplay',
  description: 'Toggle autoplay (related tracks when queue ends).',
  usage: 'alexa autoplay',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const current = player.data.get('autoplay') === true;
    const next = !current;
    player.data.set('autoplay', next);

    // Try to keep Kazagumo's internal autoplay in sync when available.
    if (typeof player.setAutoPlay === 'function') {
      await player.setAutoPlay(next);
    } else if (typeof player.setAutoplay === 'function') {
      await player.setAutoplay(next);
    }

    message.channel.send({ content: `Autoplay is now **${next ? 'ON' : 'OFF'}**.` }).catch(() => {});
  },
};
