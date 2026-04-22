const numberToWords = (num: number): string => {
  const words = [
    "zero",
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
  ];
  return words[num] || num.toString();
};

export function formatVocabularyMessage(
  text: string,
  index: number,
): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l.length > 0);
  if (lines.length < 4) return null;

  const [word, definition, example, ...noteParts] = lines;
  const note = noteParts.join("\n");

  // Teglar uchun formatlash
  const wordTag = `#word_${numberToWords(index)}`;
  const actionTag = `#${word.toLowerCase().replace(/\s+/g, "_")}`;

  return `
${wordTag}

<b>${word}</b> 👇

<pre>
${definition}
</pre>

<b>Example:</b> ${example}

${actionTag}

<b>Note:</b> <i>${note}</i>
  `.trim();
}
