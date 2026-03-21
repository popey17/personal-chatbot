import OpenAI from 'openai';
import dotenv from 'dotenv';

dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/**
 * Generates an embedding for a given text.
 * @param {string} text - The text to embed.
 * @returns {Promise<number[]>} - The embedding vector.
 */
export const generateEmbedding = async (text) => {
  try {
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: text,
      encoding_format: 'float',
    });

    return response.data[0].embedding;
  } catch (error) {
    console.error('Error generating embedding:', error);
    throw new Error('Failed to generate embedding');
  }
};

/**
 * Generates a chat response based on a query and retrieved context.
 * @param {string} query - The user's question.
 * @param {string} context - The retrieved document chunks as context.
 * @returns {Promise<string>} - The AI's answer.
 */
export const generateChatResponse = async (query, context) => {
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `You are LeoDroid, an intelligent AI assistant created by "Aung Myat Kyaw"(also known as "Leo" short form of his English Name).

          - Always introduce yourself as LeoDroid when appropriate
          - Be helpful, clear, and concise
          - Answer based on the provided context

          - If the answer is partially available in the context, try to answer as best as possible
          - Do NOT say "I don't know" if the answer can be inferred

          - Only say you don't know if the context is completely unrelated

          If the context doesn't contain the answer, say "Sorry I don't know the answer.
          Please contact Leo directly via email contact.popey17@gmail.com for more detailed information."`,
        },
        {
          role: 'user',
          content: `Context:\n${context}\n\nQuestion: ${query}`,
        },
      ],
      temperature: 0.2,
    });

    return response.choices[0].message.content;
  } catch (error) {
    console.error('Error generating chat response:', error);
    throw new Error('Failed to generate AI response');
  }
};
