import { API_CONFIG } from '../config';
import { getChatGenerationPrompt } from './prompt';
import { extractAndParseJSON } from './helpers';

async function makeGeminiRequest(messages) {
  const response = await fetch(API_CONFIG.GEMINI_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.GEMINI_API_KEY}`,
    },
    body: JSON.stringify({
      model: API_CONFIG.GEMINI_MODEL,
      messages,
      temperature: 0.7,
      maxOutputTokens: 4096,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateConversation(charactersInfo, rounds = 10) {
  console.log('Generating conversation using Gemini');
  
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: getChatGenerationPrompt(charactersInfo, rounds)
    }
  ];

  const response = await makeGeminiRequest(messages);
  return extractAndParseJSON(response);
} 