const paginateQueue = (queue, pageSize = 10) => {
  const pages = [];
  if (!Array.isArray(queue) || queue.length === 0) return pages;

  for (let i = 0; i < queue.length; i += pageSize) {
    pages.push(queue.slice(i, i + pageSize));
  }

  return pages;
};

module.exports = {
  paginateQueue,
};
