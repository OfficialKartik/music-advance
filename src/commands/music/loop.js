const { ensureSameVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

const normalizeLoop = (player) => {
  const loop = player.loop ?? player.loopMode ?? 'off';
  if (typeof loop === 'string') return loop === 'none' ? 'off' : loop;
  if (loop === 1) return 'track';
  if (loop === 2) return 'queue';
  return 'off';
};

module.exports = {
  name: 'loop',
  description: 'Set loop mode (off, track, queue).',
  usage: 'alexa loop [off|track|queue]',
  execute: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const modes = ['off', 'track', 'queue'];
    const requested = args[0]?.toLowerCase();
    let nextMode;

    if (requested && modes.includes(requested)) {
      nextMode = requested;
    } else {
      const current = normalizeLoop(player);
      const index = modes.indexOf(current);
      nextMode = modes[(index + 1) % modes.length];
    }

    if (typeof player.setLoop === 'function') {
      player.setLoop(nextMode === 'off' ? 'none' : nextMode);
    } else {
      player.loop = nextMode === 'off' ? 'none' : nextMode;
    }

    message.channel.send({ content: `Loop mode set to **${nextMode}**.` }).catch(() => {});
  },
};
