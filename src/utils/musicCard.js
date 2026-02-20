const { AttachmentBuilder } = require('discord.js');
const { formatDuration } = require('./embedBuilder');

const truncate = (text, max) => {
  if (!text) return '';
  return text.length > max ? `${text.slice(0, max - 3)}...` : text;
};

const resolveClassicCard = () => {
  const moduleExports = require('musicard');
  return moduleExports.Classic || moduleExports.default || moduleExports;
};

const buildMusicCard = async (track) => {
  // Build once on playerStart. Never regenerate during button interactions.
  const ClassicCard = resolveClassicCard();
  if (typeof ClassicCard !== 'function') {
    throw new Error('musicard Classic theme not found.');
  }

  const title = truncate(track.title || 'Unknown Title', 30);
  const author = track.author || 'Unknown';
  const thumbnail = track.thumbnail || track.artworkUrl || track.displayThumbnail || null;

  const startTime = '0:00';
  const endTime = formatDuration(track.length);

  const buffer = await ClassicCard({
    name: title,
    author,
    thumbnailImage: thumbnail || undefined,
    progress: 0,
    startTime,
    endTime,
    progressColor: '#FF7A00',
    nameColor: '#FF7A00',
    authorColor: '#FFFFFF',
    timeColor: '#FFFFFF',
    backgroundColor: '#070707',
  });

  return new AttachmentBuilder(buffer, { name: 'music-card.png' });
};

module.exports = {
  buildMusicCard,
};
