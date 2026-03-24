import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generates a chat response using Google Gemini (Gemini 1.5 Flash).
 * @param {string} query - The user's question.
 * @param {string} context - The retrieved document chunks as context.
 * @param {Array} history - The conversation history.
 * @returns {Promise<string>} - The AI's answer.
 */
export const generateGeminiChatResponse = async (query, context, history = []) => {
  try {
    const systemInstruction = `
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
    `;

    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash-lite',
      systemInstruction: systemInstruction
    });

    // Format history for Gemini (must alternate user/model)
    // We'll filter to ensure we don't have consecutive roles
    const historyMessages = history.slice(-5).map(msg => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }]
    }));

    const contents = [];
    let lastRole = null;
    
    for (const msg of historyMessages) {
      if (msg.role !== lastRole) {
        contents.push(msg);
        lastRole = msg.role;
      } else {
        // Merge consecutive messages of the same role
        contents[contents.length - 1].parts[0].text += "\n" + msg.parts[0].text;
      }
    }

    // Ensure the last message is from 'user' and not consecutive if context is added
    const userQuery = { role: 'user', parts: [{ text: `Context:\n${context}\n\nQuestion: ${query}` }] };
    if (lastRole === 'user') {
      contents[contents.length - 1].parts[0].text += "\n\n" + userQuery.parts[0].text;
    } else {
      contents.push(userQuery);
    }

    const result = await model.generateContent({ contents });
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Error generating Gemini chat response:', error);
    throw new Error('Failed to generate Gemini AI response');
  }
};
