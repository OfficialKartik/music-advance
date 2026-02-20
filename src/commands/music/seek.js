const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed, formatDuration } = require('../../utils/embedBuilder');

module.exports = {
  name: 'seek',
  description: 'Seek to a position in the current track (seconds).',
  usage: 'alexa seek <seconds>',
  execute: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const seconds = Number(args[0]);
    if (!Number.isFinite(seconds) || seconds < 0) {
      const embed = buildErrorEmbed('Provide a valid number of seconds to seek to.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    const position = Math.floor(seconds * 1000);
    if (position > player.queue.current.length) {
      const embed = buildErrorEmbed(`Seek position exceeds track length (${formatDuration(player.queue.current.length)}).`);
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    player.seek(position);
    message.channel.send({ content: `Seeked to **${formatDuration(position)}**.` }).catch(() => {});
  },
};
