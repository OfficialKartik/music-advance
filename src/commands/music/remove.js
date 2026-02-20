const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'remove',
  description: 'Remove a track from the queue by its position.',
  usage: 'alexa remove <position>',
  execute: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || player.queue.isEmpty) {
      const embed = buildErrorEmbed('There are no tracks in the queue.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const index = Number(args[0]) - 1;
    const tracks = player.queue ?? [];

    if (!Number.isFinite(index) || index < 0 || index >= tracks.length) {
      const embed = buildErrorEmbed(`Provide a valid queue position between 1 and ${tracks.length}.`);
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    let removedTrack = tracks[index];

    if (typeof player.queue.remove === 'function') {
      player.queue.remove(index);
    } else {
      tracks.splice(index, 1);
      if (typeof player.queue.emitChanges === 'function') player.queue.emitChanges();
    }

    message.channel.send({ content: `Removed **${removedTrack?.title || 'track'}** from the queue.` }).catch(() => {});
  },
};
