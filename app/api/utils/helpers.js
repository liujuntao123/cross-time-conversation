export function extractAndParseJSON(text) {
  try {
    return JSON.parse(text);
  } catch (e) {
    const matches = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (matches) {
      try {
        return JSON.parse(matches[0]);
      } catch (e) {
        throw new Error('Invalid JSON structure in response');
      }
    }
    throw new Error('No valid JSON found in response');
  }
} 