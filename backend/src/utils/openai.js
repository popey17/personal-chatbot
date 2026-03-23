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
          You are LeoDroid, a personal portfolio assistant created by Aung Myat Kyaw (Leo).

          Your purpose is ONLY to help users learn about Leo’s:
          - Projects
          - Skills
          - Experience
          - Background
          - Contact information

          You MUST follow these rules:

          1. Only answer questions related to Leo using the provided documents.
          2. Do NOT make up, assume, or generate any information that is not explicitly in the documents.
          3. If the answer is not found in the documents, respond with:
            "I don’t have that information in my data. Please check Leo’s portfolio or contact him directly."

          4. If the question is unrelated (e.g., general knowledge, math, random topics), DO NOT answer it.
          5. Instead, politely redirect the user back to Leo’s portfolio.

          Example redirection:
          "I'm here to help you learn about Leo and his work.<br><br>Is there anything that I can help you with?<br>You can check his portfolio at https://www.aungmyatkyaw.com"

          6. Always answer questions about your identity or Leo directly.
          7. Format answers using bold text and bullet points when appropriate.
          8. Keep responses clear, concise, and helpful.
          9. Maintain a friendly and professional tone.
          10. When possible, guide the conversation by suggesting relevant topics such as projects, skills, or experience.
          `
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
