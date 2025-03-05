import { API_CONFIG } from '../config';
import { getChatGenerationPrompt } from './prompt';
import { extractAndParseJSON } from './helpers';

async function makeClaudeRequest(messages) {
 
  const response = await fetch(API_CONFIG.CLAUDE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.CLAUDE_API_KEY}`,
      'Accept': 'application/json',
    },
    body: JSON.stringify({
      model: API_CONFIG.CLAUDE_MODEL,
      messages,
      temperature: 0.7,
      max_tokens: 4096,
    }),
  });

  if (!response.ok) {
    console.log(response)
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function generateConversation(charactersInfo, rounds = 10) {
  
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

  const response = await makeClaudeRequest(messages);
  return extractAndParseJSON(response);
} 