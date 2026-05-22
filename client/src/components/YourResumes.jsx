import React, { useState } from "react";
import api from "../utils/api";
import "./YourResumes.css";

const YourResumes = () => {
  const [file, setFile] = useState(null);
  const [jobDescription, setJobDescription] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile && selectedFile.type === "application/pdf") {
      setFile(selectedFile);
      setError("");
    } else {
      setError("Please select a valid PDF file");
      setFile(null);
    }
  };

 const handleUploadAndAnalyze = async () => {
  if (!file) {
    setError("Please select a resume file");
    return;
  }
  if (!jobDescription.trim()) {
    setError("Please enter a job description");
    return;
  }

  setAnalyzing(true);
  setError("");

  try {
    // First, upload the PDF and extract text
    const formData = new FormData();
    formData.append("resume", file);

    console.log("Uploading file...", file.name);
    
    const uploadResponse = await api.post("/resume/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    console.log("Upload response:", uploadResponse.data);

    if (uploadResponse.data.success) {
      const extractedText = uploadResponse.data.data?.text || uploadResponse.data.text;
      
      if (!extractedText) {
        throw new Error("Could not extract text from PDF");
      }
      
      console.log("Extracted text length:", extractedText.length);
      
      // Then, analyze the resume against job description
      const analyzeResponse = await api.post("/resume/analyze", {
        resumeText: extractedText,
        jobDescription: jobDescription,
        fileName: file.name
      });

      console.log("Analysis response:", analyzeResponse.data);

      if (analyzeResponse.data.success) {
        setResult(analyzeResponse.data.data || analyzeResponse.data);
        setShowModal(true);
      } else {
        setError(analyzeResponse.data.error || "Analysis failed");
      }
    } else {
      setError(uploadResponse.data.error || "Failed to parse PDF");
    }
  } catch (err) {
    console.error("Analysis error:", err);
    setError(err.response?.data?.error || err.message || "Analysis failed. Please try again.");
  } finally {
    setAnalyzing(false);
  }
};

  const getScoreColor = (score) => {
    if (score >= 80) return "score-excellent";
    if (score >= 60) return "score-good";
    if (score >= 40) return "score-average";
    return "score-poor";
  };

  return (
    <div className="resumes-container fade-in">
      <div className="analyzer-header">
        <h1>📄 Resume ATS Analyzer</h1>
        <p>Upload your resume and paste the job description to get AI-powered insights</p>
      </div>

      <div className="analyzer-grid">
        {/* Left Column - Resume Upload */}
        <div className="upload-section glass">
          <h3>📁 Upload Resume (PDF)</h3>
          <div className="file-upload-area">
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              id="resume-upload"
              className="file-input"
            />
            <label htmlFor="resume-upload" className="file-label">
              {file ? file.name : "Click or drag to upload PDF"}
            </label>
          </div>
          {file && (
            <div className="file-info">
              ✅ File ready: {file.name}
            </div>
          )}
        </div>

        {/* Right Column - Job Description */}
        <div className="jd-section glass">
          <h3>📝 Job Description</h3>
          <textarea
            className="jd-textarea"
            placeholder="Paste the job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={8}
          />
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="analyze-btn-container">
        <button
          className="analyze-btn"
          onClick={handleUploadAndAnalyze}
          disabled={analyzing || !file || !jobDescription}
        >
          {analyzing ? (
            <>
              <span className="spinner"></span>
              Analyzing...
            </>
          ) : (
            "🚀 Analyze Resume"
          )}
        </button>
      </div>

      {/* Results Modal */}
      {showModal && result && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content glass" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <h2>ATS Analysis Report</h2>
            
            {/* Score Section */}
            <div className="score-section">
              <div className={`score-circle ${getScoreColor(result.atsScore)}`}>
                <span className="score-number">{result.atsScore}</span>
                <span className="score-label">ATS Score</span>
              </div>
            </div>

            {/* Keyword Analysis */}
            <div className="analysis-section">
              <h3>📊 Keyword Analysis</h3>
              <div className="keyword-stats">
                <div className="stat-item">
                  <span className="stat-value">{result.keywordAnalysis?.totalKeywords || 0}</span>
                  <span className="stat-name">Total Keywords in JD</span>
                </div>
                <div className="stat-item">
                  <span className="stat-value">{result.keywordAnalysis?.matchingKeywords || 0}</span>
                  <span className="stat-name">Keywords Matched</span>
                </div>
              </div>
              
              {result.keywordAnalysis?.missingKeywords?.length > 0 && (
                <div className="missing-keywords">
                  <h4>⚠️ Missing Keywords</h4>
                  <div className="keyword-tags">
                    {result.keywordAnalysis.missingKeywords.slice(0, 15).map((keyword, idx) => (
                      <span key={idx} className="keyword-tag missing">+ {keyword}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* AI Suggestions */}
            {result.suggestions && (
              <div className="analysis-section">
                <h3>🤖 AI-Powered Suggestions</h3>
                
                {result.suggestions.strengths && (
                  <div className="strengths">
                    <h4>✅ Strengths</h4>
                    <ul>
                      {result.suggestions.strengths.map((strength, idx) => (
                        <li key={idx}>{strength}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestions.weaknesses && (
                  <div className="weaknesses">
                    <h4>⚠️ Areas for Improvement</h4>
                    <ul>
                      {result.suggestions.weaknesses.map((weakness, idx) => (
                        <li key={idx}>{weakness}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestions.optimization_tips && (
                  <div className="tips">
                    <h4>💡 Optimization Tips</h4>
                    <ul>
                      {result.suggestions.optimization_tips.map((tip, idx) => (
                        <li key={idx}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.suggestions.overall_assessment && (
                  <div className="assessment">
                    <h4>📋 Overall Assessment</h4>
                    <p>{result.suggestions.overall_assessment}</p>
                  </div>
                )}
              </div>
            )}

            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default YourResumes;