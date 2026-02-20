module.exports = (client) => {
  // Central store for per-guild now playing messages.
  client.nowPlaying = new Map();

  const set = (guildId, message) => {
    // Replace existing message to keep the channel clean.
    const existing = client.nowPlaying.get(guildId);
    if (existing && existing.id !== message.id) {
      existing.delete().catch(() => {});
    }

    client.nowPlaying.set(guildId, message);
  };

  const get = (guildId) => client.nowPlaying.get(guildId);

  const edit = async (guildId, payload) => {
    const message = client.nowPlaying.get(guildId);
    if (!message) return null;

    try {
      return await message.edit(payload);
    } catch {
      return null;
    }
  };

  const remove = async (guildId) => {
    const message = client.nowPlaying.get(guildId);
    if (!message) return;

    client.nowPlaying.delete(guildId);

    try {
      await message.delete();
    } catch {
      // Silent cleanup failures.
    }
  };

  return {
    set,
    get,
    edit,
    delete: remove,
  };
};
