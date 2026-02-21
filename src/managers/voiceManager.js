const { joinVoiceChannel, createAudioPlayer, createAudioResource, AudioPlayerStatus, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const { spawn } = require('child_process');
const prism = require('prism-media');

function buildFilterGraph(filters) {
  const chain = [];

  if (filters.bass > 0) chain.push(`bass=g=${filters.bass}`);
  if (filters.nightcore) chain.push('asetrate=48000*1.25,aresample=48000,atempo=1.1');
  if (filters.speed !== 1) chain.push(`atempo=${filters.speed}`);

  chain.push('loudnorm');

  return chain.join(',');
}

function createStream(url, filters, seekMs = 0) {
  const yt = spawn('yt-dlp', ['-f', 'bestaudio', '-o', '-', url]);

  const ffmpegArgs = [
    '-ss', (seekMs / 1000).toString(),
    '-i', 'pipe:0',
    '-af', buildFilterGraph(filters),
    '-f', 'opus',
    'pipe:1'
  ];

  const ffmpeg = new prism.FFmpeg({ args: ffmpegArgs });

  yt.stdout.pipe(ffmpeg);

  return createAudioResource(ffmpeg);
}

function createGuildState() {
  return {
    connection: null,
    player: createAudioPlayer(),
    queue: [],
    currentTrack: null,
    startedAt: 0,
    pausedDuration: 0,
    filters: {
      bass: 0,
      speed: 1,
      nightcore: false
    }
  };
}

module.exports = {
  createGuildState,
  createStream
};
