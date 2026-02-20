const { buildErrorEmbed } = require('./embedBuilder');

const sendError = (message, content) => {
  const embed = buildErrorEmbed(content);
  message.channel.send({ embeds: [embed] }).catch(() => {});
};

const ensureVoice = (message) => {
  const voice = message.member?.voice?.channel;
  if (!voice) {
    sendError(message, 'You need to be in a voice channel to use this command.');
    return null;
  }

  const permissions = voice.permissionsFor(message.guild.members.me);
  if (!permissions?.has(['Connect', 'Speak', 'ViewChannel'])) {
    sendError(message, 'I need permission to connect and speak in your voice channel.');
    return null;
  }

  return voice;
};

const ensureSameVoice = (message, player) => {
  const userChannel = message.member?.voice?.channel;
  if (!userChannel) {
    sendError(message, 'You need to be in a voice channel to use this command.');
    return false;
  }

  const botChannelId = player?.voiceId || message.guild.members.me?.voice?.channelId;
  if (botChannelId && botChannelId !== userChannel.id) {
    sendError(message, 'You must be in the same voice channel as the bot.');
    return false;
  }

  return true;
};

const ensureSameVoiceInteraction = (interaction, player) => {
  const userChannel = interaction.member?.voice?.channel;
  if (!userChannel) {
    return { ok: false, reason: 'You need to be in a voice channel to use this button.' };
  }

  const botChannelId = player?.voiceId || interaction.guild.members.me?.voice?.channelId;
  if (botChannelId && botChannelId !== userChannel.id) {
    return { ok: false, reason: 'You must be in the same voice channel as the bot.' };
  }

  return { ok: true };
};

module.exports = {
  ensureVoice,
  ensureSameVoice,
  ensureSameVoiceInteraction,
};
