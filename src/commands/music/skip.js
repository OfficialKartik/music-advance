const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'skip',
  description: 'Skip the current track.',
  usage: 'alexa skip',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    player.skip();
    message.channel.send({ content: 'Skipped the current track.' }).catch(() => {});
  },
};
