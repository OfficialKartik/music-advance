const { buildNowPlayingEmbed } = require('../utils/embedBuilder');
const { buildMusicButtons } = require('../components/musicButtons');
const { buildMusicCard } = require('../utils/musicCard');

module.exports = (client) => {
  const kazagumo = client.kazagumo;

  const clearLeaveTimer = (player) => {
    const timeout = player.data.get('leaveTimeout');
    if (timeout) clearTimeout(timeout);
    player.data.delete('leaveTimeout');
  };

  const clearNowPlayingCleanup = (player) => {
    const timeout = player.data.get('npCleanupTimeout');
    if (timeout) clearTimeout(timeout);
    player.data.delete('npCleanupTimeout');
  };

  const tryAutoPlay = async (player) => {
    const enabled = player.data.get('autoplay') === true;
    if (!enabled) return false;

    if (typeof player.autoplay === 'function') {
      await player.autoplay();
      return true;
    }

    if (typeof player.autoPlay === 'function') {
      await player.autoPlay();
      return true;
    }

    return false;
  };

  kazagumo.on('playerStart', async (player, track) => {
    // Track started: cancel pending leave timers, send fresh now playing message.
    clearLeaveTimer(player);
    clearNowPlayingCleanup(player);

    const textChannelId = player.data.get('textChannel') || player.textId;
    if (!textChannelId) return;

    const channel = await client.channels.fetch(textChannelId).catch(() => null);
    if (!channel) return;

    const embed = buildNowPlayingEmbed(client, player, track);

    let musicCard;
    try {
      // Music card is generated once per track on playerStart.
      musicCard = await buildMusicCard(track);
    } catch (error) {
      console.error('[MusicCard] Failed to build music card:', error);
    }

    try {
      const message = await channel.send({
        embeds: [embed],
        files: musicCard ? [musicCard] : [],
        components: buildMusicButtons(),
      });

      client.nowPlayingManager?.set(player.guildId, message);
      player.data.set('nowPlayingMessage', message);
    } catch {
      // Silent fail to keep playback unaffected.
    }
  });

  kazagumo.on('playerEnd', async (player) => {
    // Queue drained: either autoplay or schedule leave timeout.
    const remaining = player.queue ?? [];
    if (remaining.length > 0) return;

    const usedAutoplay = await tryAutoPlay(player);
    if (usedAutoplay) return;

    // Delete now playing message 5s after song ends.
    const cleanup = setTimeout(() => {
      client.nowPlayingManager?.delete(player.guildId);
    }, 5000);
    player.data.set('npCleanupTimeout', cleanup);

    const timeout = setTimeout(() => {
      try {
        player.destroy();
      } catch {
        // Ignore cleanup errors.
      }
    }, 2 * 60 * 1000);

    player.data.set('leaveTimeout', timeout);
  });

  kazagumo.on('playerClosed', (player) => {
    // Player destroyed: cleanup timers and now playing message.
    clearLeaveTimer(player);
    client.nowPlayingManager?.delete(player.guildId);
  });

  kazagumo.on('playerException', (player) => {
    // Keep playback moving by skipping bad tracks.
    try {
      player.skip();
    } catch {}
  });

  kazagumo.on('playerStuck', (player) => {
    // Skip stuck tracks to prevent deadlocks.
    try {
      player.skip();
    } catch {}
  });
};
