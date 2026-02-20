const { buildNowPlayingEmbed, buildErrorEmbed } = require('../../utils/embedBuilder');
const { ensureSameVoice } = require('../../utils/permissions');

module.exports = {
  name: 'nowplaying',
  description: 'Show the currently playing track.',
  usage: 'alexa nowplaying',
  execute: async (client, message) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player || !player.queue.current) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const embed = buildNowPlayingEmbed(client, player, player.queue.current);
    message.channel.send({ embeds: [embed] }).catch(() => {});
  },
};
