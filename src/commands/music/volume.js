const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'volume',
  description: 'Set or view the current volume (1-200).',
  usage: 'alexa volume <1-200>',
  execute: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    if (!args.length) {
      message.channel.send({ content: `Current volume: **${player.volume ?? 100}%**` }).catch(() => {});
      return;
    }

    const volume = Number(args[0]);
    if (!Number.isFinite(volume) || volume < 1 || volume > 200) {
      const embed = buildErrorEmbed('Volume must be a number between 1 and 200.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    player.setVolume(volume);
    message.channel.send({ content: `Volume set to **${volume}%**.` }).catch(() => {});
  },
};
