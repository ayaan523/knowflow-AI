export function normalizeText(text) {
  return text
    .replace(/\r/g, "")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
export function splitText(text, size = 900, overlap = 120) {
  const clean = normalizeText(text);
  const chunks = [];
  let start = 0;
  while (start < clean.length) {
    let end = Math.min(start + size, clean.length);
    if (end < clean.length) {
      const boundary = clean.lastIndexOf(" ", end);
      if (boundary > start + size * 0.55) end = boundary;
    }
    chunks.push({ text: clean.slice(start, end).trim(), start, end });
    if (end >= clean.length) break;
    start = Math.max(end - overlap, start + 1);
  }
  return chunks.filter((chunk) => chunk.text);
}
