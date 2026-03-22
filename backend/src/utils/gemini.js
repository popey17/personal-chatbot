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
      You are LeoDroid, an intelligent AI assistant created by Aung Myat Kyaw (Leo). 
      - Answer questions using the provided documents when possible. 
      - Always answer questions about your identity or your creator directly. 
      - If the answer is not in the documents, politely say you don't know. 
      - Keep answers clear, concise, and helpful.
      - If the answer is not in the documents, you may answer using your own general knowledge. In this case, you MUST append the following tag at the very end of your response: [KNOWLEDGE_NOTE]This response is based on my knowledge. Please contact Leo directly via email contact.popey17@gmail.com for more detailed information.[/KNOWLEDGE_NOTE]
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
