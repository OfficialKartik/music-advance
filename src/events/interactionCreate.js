const { buildNowPlayingEmbed, buildQueueEmbed } = require('../utils/embedBuilder');
const { buildMusicButtons } = require('../components/musicButtons');
const { paginateQueue } = require('../utils/queuePagination');
const { ensureSameVoiceInteraction } = require('../utils/permissions');

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const normalizeLoop = (player) => {
  const loop = player.loop ?? player.loopMode ?? 'off';
  if (typeof loop === 'string') return loop === 'none' ? 'off' : loop;
  if (loop === 1) return 'track';
  if (loop === 2) return 'queue';
  return 'off';
};

module.exports = {
  name: 'interactionCreate',
  execute: async (client, interaction) => {
    if (!interaction.isButton()) return;
    if (!interaction.customId?.startsWith('music:')) return;

    // Persistent button system: always defer and react via edits, no collectors.
    await interaction.deferUpdate().catch(() => {});

    const player = client.kazagumo.players.get(interaction.guildId);
    if (!player) return;

    const voiceCheck = ensureSameVoiceInteraction(interaction, player);
    if (!voiceCheck.ok) {
      interaction.followUp({ content: voiceCheck.reason, ephemeral: true }).catch(() => {});
      return;
    }

    const updateNowPlaying = async () => {
      try {
        // Only update embed fields that reflect state changes (no card regeneration).
        const embed = buildNowPlayingEmbed(client, player, player.queue.current || {});
        await client.nowPlayingManager?.edit(interaction.guildId, {
          embeds: [embed],
          components: buildMusicButtons(),
        });
      } catch {
        // Silent failures to avoid breaking interactions in production.
      }
    };

    try {
      switch (interaction.customId) {
        case 'music:pause':
          player.pause(true);
          break;
        case 'music:resume':
          player.pause(false);
          break;
        case 'music:skip':
          player.skip();
          break;
        case 'music:stop':
          {
            const npMessage = player.data?.get('nowPlayingMessage');
            if (npMessage) {
              const ttl = client.config.messageCleanupMs ?? 3000;
              setTimeout(() => npMessage.delete().catch(() => {}), ttl);
            }
          }
          player.queue.clear();
          player.destroy();
          client.nowPlayingManager?.delete(interaction.guildId);
          break;
        case 'music:loop': {
          const modes = ['off', 'track', 'queue'];
          const current = normalizeLoop(player);
          const next = modes[(modes.indexOf(current) + 1) % modes.length];

          if (typeof player.setLoop === 'function') {
            player.setLoop(next === 'off' ? 'none' : next);
          } else {
            player.loop = next === 'off' ? 'none' : next;
          }

          await updateNowPlaying();
          break;
        }
        case 'music:voldown': {
          const next = clamp((player.volume ?? 100) - 10, 1, 200);
          player.setVolume(next);
          await updateNowPlaying();
          break;
        }
        case 'music:volup': {
          const next = clamp((player.volume ?? 100) + 10, 1, 200);
          player.setVolume(next);
          await updateNowPlaying();
          break;
        }
        case 'music:shuffle':
          player.queue.shuffle();
          break;
        case 'music:queue': {
          const tracks = player.queue ?? [];
          const pages = paginateQueue(tracks, 10);
          const totalPages = Math.max(pages.length, 1);
          const embed = buildQueueEmbed(client, player, pages[0] || [], 1, totalPages);

          interaction.channel?.send({ embeds: [embed] }).catch(() => {});
          break;
        }
        case 'music:autoplay': {
          const current = player.data.get('autoplay') === true;
          const next = !current;
          player.data.set('autoplay', next);

          if (typeof player.setAutoPlay === 'function') {
            await player.setAutoPlay(next);
          } else if (typeof player.setAutoplay === 'function') {
            await player.setAutoplay(next);
          }

          await updateNowPlaying();
          break;
        }
        default:
          break;
      }
    } catch {
      // Silent fail to keep interaction flow stable.
    }
  },
};
