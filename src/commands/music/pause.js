const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'pause',
  description: 'Pause the current track.',
  usage: 'alexa pause',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    player.pause(true);
    message.channel.send({ content: 'Playback paused.' }).catch(() => {});
  },
};
