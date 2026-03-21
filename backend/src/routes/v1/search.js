import express from 'express';
import { generateEmbedding } from '../../utils/openai.js';
import { supabase } from '../../utils/supabaseClient.js';

const router = express.Router();

/**
 * Handle similarity search queries
 * POST /api/v1/search
 * Body: { query, match_threshold, match_count }
 */
router.post('/', async (req, res) => {
  try {
    const { query, match_threshold = 0.5, match_count = 5 } = req.body;

    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Please provide a search query as a string.' });
    }

    // 1. Generate embedding for the query
    const embedding = await generateEmbedding(query);

    // 2. Call Supabase RPC for similarity search
    const { data: matches, error } = await supabase.rpc('match_document_sections', {
      query_embedding: embedding,
      match_threshold: match_threshold,
      match_count: match_count,
    });

    if (error) {
      console.error('Supabase RPC error:', error);
      return res.status(500).json({ error: `Search failed: ${error.message}` });
    }

    // 3. Return matches
    res.json({
      query,
      matchCount: matches.length,
      matches: matches.map(match => ({
        content: match.content,
        similarity: match.similarity,
        metadata: match.metadata,
      }))
    });

  } catch (error) {
    console.error('Search processing error:', error);
    res.status(500).json({ error: 'Internal server error during search processing.' });
  }
});

export default router;
