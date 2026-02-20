const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'previous',
  description: 'Play the previously played track.',
  usage: 'alexa previous',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const previous = player.queue.previous;
    if (!previous) {
      const embed = buildErrorEmbed('There is no previous track to play.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (typeof player.queue.unshift === 'function') {
      player.queue.unshift(previous);
    }

    player.skip();
    message.channel.send({ content: 'Playing the previous track.' }).catch(() => {});
  },
};
