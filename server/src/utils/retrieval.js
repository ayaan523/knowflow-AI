const words = (value) =>
  new Set(
    value
      .toLowerCase()
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter((word) => word.length > 2),
  );
export function retrieve(chunks, question, limit = 5) {
  const query = words(question);
  return chunks
    .map((chunk) => {
      const tokens = words(chunk.text);
      let score = 0;
      query.forEach((word) => {
        if (tokens.has(word)) score += 1;
        if (chunk.text.toLowerCase().includes(word)) score += 0.25;
      });
      return { ...chunk, score };
    })
    .filter((chunk) => chunk.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
