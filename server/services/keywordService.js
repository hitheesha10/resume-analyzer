const STOP_WORDS = new Set([
  "the", "and", "for", "with", "this", "that", "are", "was", "were",
  "have", "has", "had", "but", "not", "you", "your", "from", "they",
  "will", "can", "all", "been", "our", "their", "about", "what",
  "which", "when", "where", "who", "how", "could", "would", "should",
  "use", "using", "used", "able", "also", "being", "than", "then",
  "there", "their", "theyre", "would", "should", "could", "does",
  "doing", "did", "into", "through", "during", "without", "within"
]);

export const extractKeywords = (text, minLength = 3) => {
  if (!text || typeof text !== "string") return [];
  
  // Convert to lowercase and extract words
  const words = text
    .toLowerCase()
    .match(new RegExp(`\\b[a-z0-9]{${minLength},}\\b`, "g")) || [];
  
  // Filter stop words and duplicates
  const filtered = words.filter(word => !STOP_WORDS.has(word));
  
  // Return unique keywords with frequency
  const keywordMap = new Map();
  filtered.forEach(word => {
    keywordMap.set(word, (keywordMap.get(word) || 0) + 1);
  });
  
  // Sort by frequency (highest first)
  const sortedKeywords = Array.from(keywordMap.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword);
  
  return sortedKeywords;
};

export const extractPhrases = (text, maxLength = 3) => {
  const sentences = text.split(/[.!?]+/);
  const phrases = [];
  
  for (const sentence of sentences) {
    const words = sentence.trim().split(/\s+/);
    if (words.length >= maxLength && words.length <= maxLength + 2) {
      phrases.push(words.slice(0, maxLength).join(" ").toLowerCase());
    }
  }
  
  return [...new Set(phrases)].slice(0, 20);
};