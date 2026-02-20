const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'shuffle',
  description: 'Shuffle the queue.',
  usage: 'alexa shuffle',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    const tracks = player?.queue ?? [];
    if (!player || tracks.length === 0) {
      const embed = buildErrorEmbed('There are no tracks in the queue to shuffle.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    player.queue.shuffle();
    message.channel.send({ content: 'Queue shuffled.' }).catch(() => {});
  },
};
