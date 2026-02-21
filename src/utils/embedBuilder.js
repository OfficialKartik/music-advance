const { EmbedBuilder } = require('discord.js');

const formatDuration = (ms) => {
  if (typeof ms !== 'number' || Number.isNaN(ms)) return '0:00';
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

const buildNowPlayingEmbed = (client, state) => {
  const track = state.current;

  if (!track) {
    return new EmbedBuilder()
      .setColor(client.config.embed.primary)
      .setTitle('🎵 Now Playing')
      .setDescription('Nothing is currently playing.');
  }

  const description = [
    `**${track.title || 'Unknown Track'}**`,
    `Author: ${track.author || 'Unknown'}`,
    `Volume: ${state.volume ?? 100}%`,
    `Bass: ${state.filters.bass}`,
    `Speed: ${state.filters.speed}`,
    `Nightcore: ${state.filters.nightcore ? 'ON' : 'OFF'}`,
  ].join('\n');

  return new EmbedBuilder()
    .setColor(client.config.embed.primary)
    .setTitle('🎵 Now Playing')
    .setDescription(description);
};

const buildQueueEmbed = (client, state, tracks, page, totalPages) => {
  const description = tracks.length
    ? tracks
        .map((track, index) => `**${index + 1}.** ${track.title}`)
        .join('\n')
    : 'Queue is empty.';

  const current = state.current
    ? `**Now Playing:** ${state.current.title}`
    : 'Nothing is playing.';

  return new EmbedBuilder()
    .setColor(client.config.embed.primary)
    .setTitle('🎶 Queue')
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
  buildNowPlayingEmbed,
  buildQueueEmbed,
  buildErrorEmbed,
};