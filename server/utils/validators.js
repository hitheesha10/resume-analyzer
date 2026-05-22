import dotenv from "dotenv";
dotenv.config();

function buildPrompt(resumeText, jobDescription) {
  return `You are an expert ATS resume analyzer. Analyze this resume against the job description.

Resume:
${resumeText.substring(0, 6000)}

Job Description:
${jobDescription.substring(0, 3000)}

Return ONLY valid JSON (no markdown, no other text):
{
  "compatibility_score": 75,
  "strengths": ["strength1", "strength2", "strength3"],
  "weaknesses": ["weakness1", "weakness2"],
  "missing_keywords": ["keyword1", "keyword2", "keyword3", "keyword4", "keyword5"],
  "optimization_tips": ["tip1", "tip2", "tip3", "tip4"],
  "overall_assessment": "Brief summary of resume quality"
}`;
}

export async function analyzeWithGemini(resumeText, jobDescription) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is not configured");
    }
    
    const prompt = buildPrompt(resumeText, jobDescription);
    
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${process.env.GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.2, maxOutputTokens: 2000 }
        })
      }
    );
    
    if (!response.ok) {
      throw new Error(`Gemini API Error: ${response.status}`);
    }
    
    const data = await response.json();
    const rawText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!rawText) throw new Error("Empty response from Gemini");
    
    let cleanedText = rawText.replace(/```json\s*/g, "").replace(/```\s*/g, "").trim();
    const jsonMatch = cleanedText.match(/\{[\s\S]*\}/);
    if (jsonMatch) cleanedText = jsonMatch[0];
    
    return JSON.parse(cleanedText);
  } catch (err) {
    console.error("Gemini Error:", err);
    return {
      compatibility_score: 50,
      strengths: ["AI analysis temporarily unavailable"],
      weaknesses: ["Please try again later"],
      missing_keywords: ["Unable to analyze"],
      optimization_tips: ["Check your API key configuration"],
      overall_assessment: "Analysis failed. Please check your Gemini API key."
    };
  }
}