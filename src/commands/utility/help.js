const { EmbedBuilder } = require('discord.js');

module.exports = {
  name: 'help',
  description: 'Show available commands.',
  usage: 'alexa help [command]',
  execute: async (client, message, args) => {
    const requested = args[0]?.toLowerCase();

    if (requested) {
      const command = client.commands.get(requested);
      if (!command) {
        message.channel.send({ content: 'Command not found.' }).catch(() => {});
        return;
      }

      const embed = new EmbedBuilder()
        .setColor(client.config.embed.primary)
        .setTitle(`Help: ${command.name}`)
        .setDescription(command.description || 'No description provided.')
        .addFields({ name: 'Usage', value: command.usage || 'No usage info.' });

      message.channel.send({ embeds: [embed] }).catch(() => {});
      return;
    }

    const embed = new EmbedBuilder()
      .setColor(client.config.embed.primary)
      .setTitle('Alexa Music Bot Commands')
      .setDescription(`Prefix: \`${client.config.prefix}\``);

    for (const [category, commands] of client.commandCategories.entries()) {
      embed.addFields({
        name: category.charAt(0).toUpperCase() + category.slice(1),
        value: commands.sort().join(', '),
        inline: false,
      });
    }

    message.channel.send({ embeds: [embed] }).catch(() => {});
  },
};
