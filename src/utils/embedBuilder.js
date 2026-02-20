const { EmbedBuilder } = require('discord.js');

const formatDuration = (ms) => {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const formatLoop = (player) => {
  const loop = player.loop ?? player.loopMode ?? 'off';
  if (typeof loop === 'string') return loop === 'none' ? 'off' : loop;
  if (loop === 1) return 'track';
  if (loop === 2) return 'queue';
  return 'off';
};

const buildNowPlayingEmbed = (client, player, track) => {
  const autoplay = player.data.get('autoplay') === true ? 'ON' : 'OFF';
  const description = [
    `**${track.title || 'Unknown Track'}**`,
    `Author: ${track.author || 'Unknown'}`,
    `Duration: ${formatDuration(track.length)}`,
    `Volume: ${player.volume ?? 100}%`,
    `Loop: ${formatLoop(player)}`,
    `Autoplay: ${autoplay}`,
  ].join('\n');

  return new EmbedBuilder()
    .setColor(client.config.embed.primary)
    .setTitle('?? Now Playing')
    .setDescription(description);
};

const buildQueueEmbed = (client, player, tracks, page, totalPages) => {
  const description = tracks.length
    ? tracks
        .map((track, index) => `**${index + 1}.** ${track.title} • ${formatDuration(track.length)}`)
        .join('\n')
    : 'Queue is empty.';

  const current = player.queue.current
    ? `**Now Playing:** ${player.queue.current.title}`
    : 'Nothing is playing.';

  return new EmbedBuilder()
    .setColor(client.config.embed.primary)
    .setTitle('?? Queue')
    .setDescription(`${current}\n\n${description}`)
    .setFooter({ text: `Page ${page}/${totalPages}` });
};

const buildErrorEmbed = (message) => (
  new EmbedBuilder()
    .setColor(0xff4d4d)
    .setTitle('Error')
    .setDescription(message)
);

module.exports = {
  formatDuration,
  buildNowPlayingEmbed,
  buildQueueEmbed,
  buildErrorEmbed,
};
