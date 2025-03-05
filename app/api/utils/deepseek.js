import { API_CONFIG } from '../config';
import { getCharacterInfoPrompt, getChatGenerationPrompt } from './prompt';
import { extractAndParseJSON } from './helpers';

async function makeDeepseekRequest(messages, model) {
  const response = await fetch(API_CONFIG.DEEPSEEK_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_CONFIG.DEEPSEEK_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
    }),
  });

  if (!response.ok) {
    throw new Error(`API request failed with status ${response.status}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

export async function getCharactersInfo(characters) {
  console.log('Getting character info using Deepseek');
  
  const messages = [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: getCharacterInfoPrompt(characters)
    }
  ];

  const response = await makeDeepseekRequest(messages, API_CONFIG.DEEPSEEK_V3_MODEL);
  
  try {
    const result = extractAndParseJSON(response);
    
    // Check if any character info is "UNKNOWN"
    if (Array.isArray(result)) {
      for (let i = 0; i < result.length; i++) {
        if (result[i] === "UNKNOWN") {
          const unknownCharacter = characters[i].name;
          throw new Error(`没有找到${unknownCharacter}这个人的信息，请换一个人试试`);
        }
      }
    }
    
    return result;
  } catch (error) {
    if (error.message.includes("请换一个人试试")) {
      throw error;
    }
    throw new Error('Failed to parse character information');
  }
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

  const response = await makeDeepseekRequest(messages, API_CONFIG.DEEPSEEK_R1_MODEL);
  return extractAndParseJSON(response);
} 