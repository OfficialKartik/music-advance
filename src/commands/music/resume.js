const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'resume',
  description: 'Resume the current track.',
  usage: 'alexa resume',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    player.pause(false);
    message.channel.send({ content: 'Playback resumed.' }).catch(() => {});
  },
};
