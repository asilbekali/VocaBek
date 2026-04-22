export function formatVocabularyMessage(text: string): string | null {
  // Format: So'z | Ta'rif | Namuna | O'zbekcha izoh
  const parts = text.split("|").map((p) => p.trim());

  if (parts.length < 4) return null;

  const [word, definition, example, uzbekNote] = parts;
  const hashtag = `#${word.toLowerCase().replace(/\s+/g, "_")}`;

  return `
${hashtag} 

**${word}** 👇

${definition}

**Example:** ${example}

**${word.toLowerCase()}** — ${uzbekNote}
  `.trim();
}
