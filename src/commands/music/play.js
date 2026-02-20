const { ensureVoice } = require('../../utils/permissions');
const { buildErrorEmbed } = require('../../utils/embedBuilder');

module.exports = {
  name: 'play',
  description: 'Play a track or playlist from a query or URL.',
  usage: 'alexa play <query|url>',
  execute: async (client, message, args) => {
    const voice = ensureVoice(message);
    if (!voice) return;

    const query = args.join(' ');
    if (!query) {
      const embed = buildErrorEmbed('Provide a song name or URL to play.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    const player = await client.kazagumo.createPlayer({
      guildId: message.guild.id,
      voiceId: voice.id,
      textId: message.channel.id,
      deaf: true,
    });

    // Persist the text channel for Lavalink events.
    if (!player.data) {
      player.data = new Map();
    }
    player.data.set('textChannel', message.channel.id);

    let result;
    try {
      result = await client.kazagumo.search(query, { requester: message.author });
    } catch (error) {
      console.error('[Search Error]', error);
      const embed = buildErrorEmbed('Search failed. Please try again.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!result?.tracks?.length) {
      const embed = buildErrorEmbed('No results found for that query.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (result.type === 'PLAYLIST') {
      player.queue.add(result.tracks);
      message.channel.send({ content: `Queued ${result.tracks.length} tracks from **${result.playlistName}**.` })
        .catch(() => {});
    } else {
      player.queue.add(result.tracks[0]);
      message.channel.send({ content: `Queued **${result.tracks[0].title}**.` })
        .catch(() => {});
    }

    if (!player.playing && !player.paused) {
      player.play();
    }
  },
};
