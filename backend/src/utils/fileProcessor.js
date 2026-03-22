import { createRequire } from 'module';
import { chunkText } from './textProcessor.js';
import { generateEmbedding } from './aiService.js';
import { supabase } from './supabaseClient.js';

const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

/**
 * Extracts text from a buffer based on mimetype, chunks it,
 * generates embeddings for each chunk, and stores them in Supabase.
 * @param {Buffer} buffer - The file buffer.
 * @param {string} mimetype - The file mimetype.
 * @param {string} filename - Original filename for metadata.
 * @returns {Promise<{totalChunks: number, chunks: any[]}>}
 */
export const processFile = async (buffer, mimetype, filename) => {
  let extractedText = '';

  // 1. Extract Text
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

  // 2. Document Tracking & Deduplication
  // Check if document already exists
  let { data: existingDoc, error: findError } = await supabase
    .from('documents')
    .select('id')
    .eq('name', filename)
    .single();

  if (findError && findError.code !== 'PGRST116') { // PGRST116 is "not found"
    throw new Error(`Error finding document: ${findError.message}`);
  }

  let documentId;

  if (existingDoc) {
    documentId = existingDoc.id;
    // Cleanup existing chunks for this document
    const { error: deleteError } = await supabase
      .from('document_sections')
      .delete()
      .eq('document_id', documentId);

    if (deleteError) {
      throw new Error(`Failed to clean up old chunks: ${deleteError.message}`);
    }
  } else {
    // Create new document entry
    const { data: newDoc, error: createError } = await supabase
      .from('documents')
      .insert([{ name: filename, status: 'processing' }])
      .select()
      .single();

    if (createError) {
      throw new Error(`Failed to create document entry: ${createError.message}`);
    }
    documentId = newDoc.id;
  }

  // 3. Chunk Text (300 words per chunk)
  const chunks = chunkText(extractedText, 300);

  // 4. Generate Embeddings
  const processedChunks = await Promise.all(
    chunks.map(async (content, index) => {
      const embedding = await generateEmbedding(content);
      
      return {
        document_id: documentId,
        content: content.trim(),
        metadata: {
          filename,
          index,
          totalChunks: chunks.length,
        },
        embedding,
      };
    })
  );

  // 5. Bulk Insert into Supabase
  const { error: insertError } = await supabase
    .from('document_sections')
    .insert(processedChunks);

  if (insertError) {
    console.error('Supabase insert error:', insertError);
    throw new Error(`Failed to store chunks in database: ${insertError.message}`);
  }

  // 6. Update document status to completed
  await supabase
    .from('documents')
    .update({ status: 'completed' })
    .eq('id', documentId);

  return {
    documentId,
    totalChunks: chunks.length,
    chunks: processedChunks.map(pc => ({
      index: pc.metadata.index,
      wordCount: pc.content.split(/\s+/).length,
      content: pc.content
    }))
  };
};
