export function formatVocabularyMessage(
  text: string,
  index: number,
): string | null {
  // Matnni qatorlarga bo'lamiz
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);

  // Kamida 4 ta qism bo'lishi kerak: Word, Definition, Example, Note
  if (lines.length < 4) return null;

  const word = lines[0];
  const definition = lines[1];
  const example = lines[2];
  // Qolgan hamma qatorlarni birlashtirib "Note" qilamiz
  const note = lines.slice(3).join("\n");

  const wordNumberTag = `#word_${index}`;
  const wordHashtag = `#${word.toLowerCase().replace(/\s+/g, "_")}`;

  return `
${wordNumberTag}

<b>${word}</b> 👇

${definition}

<b>Example:</b> <i>${example}</i>

${wordHashtag}

${note}
  `.trim();
}
