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
 * @param {Array} history - The conversation history.
 * @returns {Promise<string>} - The AI's answer.
 */
export const generateChatResponse = async (query, context, history = []) => {

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: `
          You are LeoDroid, an intelligent AI assistant created by Aung Myat Kyaw (Leo). 
          - Answer questions using the provided documents when possible. 
          - Always answer questions about your identity or your creator directly. 
          - If the answer is not in the documents, politely say you don't know. 
          - Keep answers clear, concise, and helpful.
          - If the answer is not in the documents, you may answer using your own general knowledge. In this case, you MUST append the following tag at the very end of your response: [KNOWLEDGE_NOTE]This response is based on my knowledge. Please contact Leo directly via email contact.popey17@gmail.com for more detailed information.[/KNOWLEDGE_NOTE]`,

        },
        ...history.slice(-5),
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
