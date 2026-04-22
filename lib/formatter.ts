// Raqamni matnga o'girish (one, two, three...)
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
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "nineteen",
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

  const word = lines[0];
  const definition = lines[1];
  const example = lines[2];
  const note = lines.slice(3).join("\n");

  const wordNumberTag = `#word_${numberToWords(index)}`;
  const lowerWord = word.toLowerCase().replace(/\s+/g, "_");

  // Rasmdagi kabi HTML format
  return `
${wordNumberTag}

${word} 👇

<pre>copy
${definition}
</pre>

Example: ${example}

${lowerWord}-for actions or trouble.

<i>${note}</i>
  `.trim();
}
