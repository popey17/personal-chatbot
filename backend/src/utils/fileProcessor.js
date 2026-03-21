import { createRequire } from 'module';
import { chunkText } from './textProcessor.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Extracts text from a buffer based on mimetype and chunks it.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} mimetype - The file mimetype.
 * @returns {Promise<{totalChunks: number, chunks: any[]}>}
 */
export const processFile = async (buffer, mimetype) => {
  let extractedText = '';

  if (mimetype === 'application/pdf') {
    const parser = new PDFParse(new Uint8Array(buffer));
    const result = await parser.getText();
    extractedText = result.text;
  } else if (mimetype === 'text/plain') {
    extractedText = buffer.toString('utf-8');
  } else {
    throw new Error('Unsupported file type. Please upload PDF or TXT.');
  }

  if (!extractedText || !extractedText.trim()) {
    throw new Error('No readable text found in the document.');
  }

  const chunks = chunkText(extractedText, 300);

  return {
    totalChunks: chunks.length,
    chunks: chunks.map((chunk, index) => ({
      index,
      wordCount: chunk.trim().split(/\s+/).length,
      content: chunk.trim()
    }))
  };
};
