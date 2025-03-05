export const API_CONFIG = {
  // Deepseek API Configuration
  DEEPSEEK_URL: process.env.DEEPSEEK_URL,
  DEEPSEEK_V3_MODEL: process.env.DEEPSEEK_V3_MODEL,
  DEEPSEEK_R1_MODEL: process.env.DEEPSEEK_R1_MODEL,
  DEEPSEEK_API_KEY: process.env.DEEPSEEK_API_KEY,

  // Claude API Configuration
  CLAUDE_URL: process.env.CLAUDE_URL || 'https://api.anthropic.com/v1/messages',
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY,
  CLAUDE_MODEL: process.env.CLAUDE_MODEL,

  // Gemini API Configuration
  GEMINI_URL: process.env.GEMINI_URL || 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY,
  GEMINI_MODEL: process.env.GEMINI_MODEL,
};

