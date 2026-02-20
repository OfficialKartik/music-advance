const { paginateQueue } = require('../../utils/queuePagination');
const { buildQueueEmbed, buildErrorEmbed } = require('../../utils/embedBuilder');
const { ensureSameVoice } = require('../../utils/permissions');

module.exports = {
  name: 'queue',
  description: 'View the current queue (10 per page).',
  usage: 'alexa queue [page]',
  execute: async (client, message, args) => {
    const player = client.kazagumo.players.get(message.guild.id);
    if (!player) {
      const embed = buildErrorEmbed('Nothing is playing right now.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    if (!ensureSameVoice(message, player)) return;

    const tracks = player.queue ?? [];
    const pages = paginateQueue(tracks, 10);
    const totalPages = Math.max(pages.length, 1);

    const requestedPage = Number(args[0] || 1);
    if (!Number.isFinite(requestedPage) || requestedPage < 1 || requestedPage > totalPages) {
      const embed = buildErrorEmbed(`Page must be between 1 and ${totalPages}.`);
      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    const pageIndex = requestedPage - 1;
    const embed = buildQueueEmbed(client, player, pages[pageIndex] || [], requestedPage, totalPages);
    message.channel.send({ embeds: [embed] }).catch(() => {});
  },
};
