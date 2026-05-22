export const calculateATSScore = (jdKeywords, resumeKeywords) => {
  if (!jdKeywords.length) return { score: 0, totalJDKeywords: 0, matchingKeywords: 0, missingKeywords: [] };
  
  const uniqueJD = [...new Set(jdKeywords)];
  const resumeKeywordSet = new Set(resumeKeywords);
  
  const matches = uniqueJD.filter(keyword => resumeKeywordSet.has(keyword));
  const missingKeywords = uniqueJD.filter(keyword => !resumeKeywordSet.has(keyword));
  
  const score = Math.round((matches.length / uniqueJD.length) * 100);
  
  return {
    score,
    totalJDKeywords: uniqueJD.length,
    matchingKeywords: matches.length,
    missingKeywords: missingKeywords.slice(0, 20)
  };
};