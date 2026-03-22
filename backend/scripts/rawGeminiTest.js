import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

async function rawGeminiTest() {
  const apiKey = process.env.GEMINI_API_KEY;
  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  
  const body = {
    contents: [{ parts: [{ text: "Hello, how are you?" }] }]
  };

  try {
    console.log('Sending raw fetch to:', url.replace(apiKey, 'HIDDEN'));
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const data = await response.json();
    console.log('Status:', response.status);
    console.log('Raw Response:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Raw Fetch Error:', error);
  }
}

rawGeminiTest();
