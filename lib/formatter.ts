export function formatVocabularyMessage(text: string): string | null {
  const parts = text.split("|").map((p) => p.trim());
  if (parts.length < 4) return null;

  const [word, definition, example, uzbekNote] = parts;
  const hashtag = `#${word.toLowerCase().replace(/\s+/g, "_")}`;

  // Markdown o'rniga HTML teglari (<b>, <i>) ishlatamiz
  return `
${hashtag} 

<b>${word}</b> 👇

${definition}

<b>Example:</b> <i>${example}</i>

<b>${word.toLowerCase()}</b> — ${uzbekNote}
  `.trim();
}
