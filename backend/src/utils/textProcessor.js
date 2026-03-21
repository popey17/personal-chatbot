/**
 * Chunks text into segments of a specified word count.
 * @param {string} text - The text to split.
 * @param {number} wordsPerChunk - Maximum words per chunk.
 * @returns {string[]} - Array of text chunks.
 */
export const chunkText = (text, wordsPerChunk = 300) => {
  const words = text.split(/\s+/);
  const chunks = [];
  
  for (let i = 0; i < words.length; i += wordsPerChunk) {
    chunks.push(words.slice(i, i + wordsPerChunk).join(' '));
  }
  
  return chunks;
};
