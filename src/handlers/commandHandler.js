const fs = require('fs');
const path = require('path');

module.exports = (client) => {
  const commandsPath = path.join(__dirname, '..', 'commands');
  const categories = fs.readdirSync(commandsPath, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);

  client.commandCategories = new Map();

  for (const category of categories) {
    const categoryPath = path.join(commandsPath, category);
    const commandFiles = fs.readdirSync(categoryPath)
      .filter((file) => file.endsWith('.js'));

    for (const file of commandFiles) {
      const commandPath = path.join(categoryPath, file);
      const command = require(commandPath);

      if (!command?.name || typeof command.execute !== 'function') {
        // Skip invalid command modules to avoid hard crashes on boot.
        continue;
      }

      client.commands.set(command.name, command);

      if (!client.commandCategories.has(category)) {
        client.commandCategories.set(category, []);
      }

      client.commandCategories.get(category).push(command.name);
    }
  }
};
