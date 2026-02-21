const {
  joinVoiceChannel,
  createAudioPlayer,
  createAudioResource,
  AudioPlayerStatus,
  entersState,
  VoiceConnectionStatus
} = require('@discordjs/voice');

const { spawn } = require('child_process');
const prism = require('prism-media');

class MusicEngine {
  constructor(client) {
    this.client = client;
    this.guilds = new Map();
  }

  getGuild(guildId) {
    if (!this.guilds.has(guildId)) {
      this.guilds.set(guildId, {
        connection: null,
        player: createAudioPlayer(),
        queue: [],
        current: null,
        startedAt: 0,
        pausedTime: 0,
        filters: {
          bass: 0,
          speed: 1,
          nightcore: false
        }
      });
    }
    return this.guilds.get(guildId);
  }

  async connect(guild, voiceChannel) {
    const state = this.getGuild(guild.id);

    state.connection = joinVoiceChannel({
      channelId: voiceChannel.id,
      guildId: guild.id,
      adapterCreator: guild.voiceAdapterCreator,
      selfDeaf: true
    });

    state.connection.subscribe(state.player);

    state.player.on(AudioPlayerStatus.Idle, () => {
      state.queue.shift();
      this.playNext(guild.id);
    });

    await entersState(state.connection, VoiceConnectionStatus.Ready, 15_000);

    return state;
  }

  async search(query) {
    return {
      tracks: [{
        title: query,
        url: query
      }]
    };
  }

  buildFilterGraph(filters) {
    const chain = [];

    if (filters.bass > 0)
      chain.push(`bass=g=${filters.bass}`);

    if (filters.nightcore)
      chain.push('asetrate=48000*1.25,aresample=48000,atempo=1.1');

    if (filters.speed !== 1)
      chain.push(`atempo=${filters.speed}`);

    chain.push('loudnorm');

    return chain.join(',');
  }

  createStream(url, filters, seekMs = 0) {
    const yt = spawn('yt-dlp', [
      '-f', 'bestaudio',
      '-o', '-',
      url
    ]);

    const ffmpeg = new prism.FFmpeg({
      args: [
        '-ss', (seekMs / 1000).toString(),
        '-i', 'pipe:0',
        '-af', this.buildFilterGraph(filters),
        '-f', 'opus',
        'pipe:1'
      ]
    });

    yt.stdout.pipe(ffmpeg);

    return createAudioResource(ffmpeg);
  }

  async playNext(guildId) {
    const state = this.getGuild(guildId);

    if (!state.queue.length) {
      state.current = null;
      return;
    }

    const track = state.queue[0];
    state.current = track;

    const resource = this.createStream(track.url, state.filters);

    state.startedAt = Date.now();
    state.pausedTime = 0;

    state.player.play(resource);
  }

  async restartWithResume(guildId) {
    const state = this.getGuild(guildId);
    if (!state.current) return;

    const now = Date.now();
    const position = now - state.startedAt - state.pausedTime;

    state.player.stop(true);

    const resource = this.createStream(
      state.current.url,
      state.filters,
      position
    );

    state.startedAt = Date.now() - position;
    state.player.play(resource);
  }
}

module.exports = MusicEngine;
