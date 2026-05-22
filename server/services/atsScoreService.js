export const calculateATSScore = (jdKeywords, resumeKeywords, jdOriginal, resumeOriginal) => {
  if (!jdKeywords.length) {
    return {
      score: 0,
      totalJDKeywords: 0,
      matchingKeywords: 0,
      missingKeywords: [],
      matchedKeywordsList: [],
      matchPercentage: 0
    };
  }
  
  const uniqueJD = [...new Set(jdKeywords)];
  const resumeSet = new Set(resumeKeywords);
  
  // Find matching and missing keywords
  const matchedKeywords = uniqueJD.filter(keyword => resumeSet.has(keyword));
  const missingKeywords = uniqueJD.filter(keyword => !resumeSet.has(keyword));
  
  // Calculate weighted score (give more weight to important keywords)
  const importantKeywords = extractImportantKeywords(jdOriginal);
  let weightedScore = 0;
  let totalWeight = 0;
  
  for (const keyword of uniqueJD) {
    const weight = importantKeywords.has(keyword) ? 2 : 1;
    totalWeight += weight;
    if (resumeSet.has(keyword)) {
      weightedScore += weight;
    }
  }
  
  const weightedPercentage = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
  const simplePercentage = (matchedKeywords.length / uniqueJD.length) * 100;
  
  // Combine both scores (60% simple, 40% weighted)
  const finalScore = Math.round((simplePercentage * 0.6) + (weightedPercentage * 0.4));
  
  return {
    score: Math.min(finalScore, 100),
    totalJDKeywords: uniqueJD.length,
    matchingKeywords: matchedKeywords.length,
    missingKeywords: missingKeywords.slice(0, 20),
    matchedKeywordsList: matchedKeywords.slice(0, 20),
    matchPercentage: Math.round((matchedKeywords.length / uniqueJD.length) * 100)
  };
};

const extractImportantKeywords = (text) => {
  const important = new Set();
  const patterns = [
    /required:?\s*([^.!]+)/gi,
    /must have:?\s*([^.!]+)/gi,
    /essential:?\s*([^.!]+)/gi,
    /years of experience in ([^.!]+)/gi
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const words = match[1].toLowerCase().match(/\b[a-z]{3,}\b/g) || [];
      words.forEach(word => important.add(word));
    }
  }
  
  return important;
};

export const getScoreGrade = (score) => {
  if (score >= 80) return { grade: "Excellent", color: "#2ecc71", message: "Your resume is highly optimized for this role!" };
  if (score >= 60) return { grade: "Good", color: "#f39c12", message: "Good match! A few improvements will make it excellent." };
  if (score >= 40) return { grade: "Average", color: "#e67e22", message: "Needs improvement to stand out." };
  return { grade: "Needs Work", color: "#e74c3c", message: "Significant optimization needed." };
};