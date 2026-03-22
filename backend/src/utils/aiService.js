import { generateChatResponse as generateOpenAIChatResponse, generateEmbedding as generateOpenAIEmbedding } from './openai.js';
import { generateGeminiChatResponse } from './gemini.js';

/**
 * Unified function to generate a chat response based on the selected service.
 * @param {string} query - The user's question.
 * @param {string} context - The retrieved document chunks as context.
 * @param {Array} history - The conversation history.
 * @param {string} service - The AI service to use ('openai' or 'gemini').
 * @returns {Promise<string>} - The AI's answer.
 */
export const generateChatResponse = async (query, context, history = [], service = 'openai') => {
  if (service === 'gemini') {
    return generateGeminiChatResponse(query, context, history);
  }
  // Default to OpenAI
  return generateOpenAIChatResponse(query, context, history);
};

/**
 * Unified function for embeddings (currently only OpenAI as agreed).
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
export const generateEmbedding = async (text) => {
  // We use OpenAI for embeddings for consistency with the database
  return generateOpenAIEmbedding(text);
};
