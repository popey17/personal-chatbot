/**
 * Chunks text by grouping semantic blocks (paragraphs) into segments.
 * Prioritizes double newlines for breaks, falling back to single newlines if needed.
 * Ensures the split never occurs in the middle of a line unless the line itself is massive.
 * @param {string} text - The raw text to split.
 * @param {number} maxWords - The word count threshold for each chunk.
 * @returns {string[]} - Array of semantically grouped chunks.
 */
export const chunkText = (text, maxWords = 500) => {
  if (!text || typeof text !== 'string') return [];

  // 1. First, split into paragraphs by double newlines or similar
  const paragraphs = text.split(/\r?\n\s*\r?\n/);
  const chunks = [];
  let currentGroup = [];
  let currentWordCount = 0;

  for (const para of paragraphs) {
    const trimmedPara = para.trim();
    if (!trimmedPara) continue;

    const paraWordCount = trimmedPara.split(/\s+/).length;

    // A: Single paragraph is within limits: Group it
    if (paraWordCount <= maxWords) {
      if (currentWordCount + paraWordCount > maxWords && currentGroup.length > 0) {
        // Push current group as a chunk
        chunks.push(currentGroup.join('\n\n').trim());
        currentGroup = [];
        currentWordCount = 0;
      }
      currentGroup.push(trimmedPara);
      currentWordCount += paraWordCount;
      continue;
    }

    // B: Single paragraph is massive: Split it by line breaks
    // First, flush any existing group
    if (currentGroup.length > 0) {
      chunks.push(currentGroup.join('\n\n').trim());
      currentGroup = [];
      currentWordCount = 0;
    }

    // Split the large paragraph into lines
    const lines = trimmedPara.split(/\r?\n/);
    let currentLineGroup = [];
    let currentLineWordCount = 0;

    for (const line of lines) {
      const lineTrimmed = line.trim();
      const lineWordCount = lineTrimmed ? lineTrimmed.split(/\s+/).length : 0;

      // Group lines until they hit the limit
      if (currentLineWordCount + lineWordCount > maxWords && currentLineGroup.length > 0) {
        chunks.push(currentLineGroup.join('\n').trim());
        currentLineGroup = [];
        currentLineWordCount = 0;
      }

      currentLineGroup.push(line);
      currentLineWordCount += lineWordCount;
    }

    if (currentLineGroup.length > 0) {
      chunks.push(currentLineGroup.join('\n').trim());
    }
  }

  // Final push for remaining grouped paragraphs
  if (currentGroup.length > 0) {
    chunks.push(currentGroup.join('\n\n').trim());
  }

  return chunks;
};
