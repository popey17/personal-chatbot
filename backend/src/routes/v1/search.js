import express from 'express';
import { generateEmbedding, generateChatResponse } from '../../utils/aiService.js';
import { supabase } from '../../utils/supabaseClient.js';

const router = express.Router();

/**
 * Handle similarity search queries and generate AI answer
 * POST /api/v1/search
 * Body: { query, match_threshold, match_count }
 */
router.post('/', async (req, res) => {
  try {
    const { query, history = [], match_threshold = 0.5, match_count = 5, service = 'openai' } = req.body;


    if (!query || typeof query !== 'string') {
      return res.status(400).json({ error: 'Please provide a search query as a string.' });
    }

    // 1. Query Expansion for better RAG retrieval
    let expandedQuery = query;
    
    // Check if the query contains pronouns referring to the subject (Leo)
    const hasPronoun = /\b(he|him|his)\b/i.test(query);
    const hasLeo = /\bleo\b/i.test(query);
    const hasAung = /aung myat/i.test(query);

    // Provide context if the user uses pronouns without explicit names
    if (hasPronoun && !hasLeo && !hasAung) {
      expandedQuery = `${query} Leo Aung Myat Kyaw`;
    } else if (hasLeo && !hasAung) {
      expandedQuery = `${query} Aung Myat Kyaw`;
    }

    // 2. Generate embedding for the expanded query
    const embedding = await generateEmbedding(expandedQuery);


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

    // 3. Generate AI answer using retrieved context
    const context = (matches && matches.length > 0) 
      ? matches.map(match => match.content).join('\n---\n')
      : 'No relevant document context found.';
      
    const answer = await generateChatResponse(query, context, history, service);


    // 4. Return answer and matches
    res.json({
      query,
      answer,
      matchCount: matches ? matches.length : 0,
      matches: matches ? matches.map(match => ({
        content: match.content,
        similarity: match.similarity,
        metadata: match.metadata,
      })) : []
    });

  } catch (error) {
    console.error('Search processing error:', error);
    res.status(500).json({ error: 'Internal server error during search processing.' });
  }
});

export default router;
