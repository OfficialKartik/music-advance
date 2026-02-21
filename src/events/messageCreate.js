module.exports = {
  name: 'messageCreate',
  execute: async (client, message) => {

    if (message.author.bot) return;
    if (!message.guild) return;

    const { prefix } = client.config;
    if (!message.content.toLowerCase().startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/\s+/g);
    const commandName = args.shift()?.toLowerCase();
    if (!commandName) return;

    const command = client.commands.get(commandName);
    if (!command) return;

    try {
      await command.execute(client, message, args);
    } catch (error) {
      console.error(`[Command Error] ${commandName}`, error);
      const embed = buildErrorEmbed('Something went wrong while executing that command.');
      message.channel.send({ embeds: [embed] }).catch(() => {});
    } finally {
      message.delete().catch(() => {});
    }
  },
};