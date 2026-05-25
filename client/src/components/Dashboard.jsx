import React, { useState } from 'react'
import api from '../utils/api'
import { toast } from 'react-toastify'
import './Dashboard.css'

const Dashboard = () => {
  const [file, setFile] = useState(null)
  const [jobDescription, setJobDescription] = useState('')
  const [analyzing, setAnalyzing] = useState(false)
  const [result, setResult] = useState(null)
  const [showModal, setShowModal] = useState(false)

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0]
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile)
      toast.success(`Selected: ${selectedFile.name}`)
    } else {
      toast.error('Please select a valid PDF file')
    }
  }

  const handleAnalyze = async () => {
    if (!file) {
      toast.warning('Please select a PDF file')
      return
    }
    if (!jobDescription.trim()) {
      toast.warning('Please enter a job description')
      return
    }

    setAnalyzing(true)
    const loadingToast = toast.loading('Analyzing your resume...')

    try {
      // Upload file
      const formData = new FormData()
      formData.append('resume', file)

      const uploadRes = await api.post('/resume/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      if (uploadRes.data.success) {
        // Analyze
        const analyzeRes = await api.post('/resume/analyze', {
          resumeText: uploadRes.data.data.text,
          jobDescription: jobDescription,
          fileName: file.name
        })

        if (analyzeRes.data.success) {
          setResult(analyzeRes.data.data)
          setShowModal(true)
          toast.update(loadingToast, { 
            render: 'Analysis complete!', 
            type: 'success', 
            isLoading: false, 
            autoClose: 3000 
          })
        } else {
          toast.update(loadingToast, { 
            render: analyzeRes.data.error || 'Analysis failed', 
            type: 'error', 
            isLoading: false, 
            autoClose: 3000 
          })
        }
      } else {
        toast.update(loadingToast, { 
          render: uploadRes.data.error || 'Upload failed', 
          type: 'error', 
          isLoading: false, 
          autoClose: 3000 
        })
      }
    } catch (error) {
      console.error('Error:', error)
      toast.update(loadingToast, { 
        render: error.response?.data?.error || 'Something went wrong', 
        type: 'error', 
        isLoading: false, 
        autoClose: 3000 
      })
    } finally {
      setAnalyzing(false)
    }
  }

  const getScoreClass = (score) => {
    if (score >= 80) return 'excellent'
    if (score >= 60) return 'good'
    if (score >= 40) return 'average'
    return 'poor'
  }

  return (
    <div className="dashboard">
      <div className="container">
        {/* Header */}
        <div className="dashboard-header">
          <h1>Resume ATS Analyzer</h1>
          <p>Upload your resume and paste the job description to get AI-powered insights</p>
        </div>

        {/* Main Content */}
        <div className="analyzer-container">
          {/* Upload Section */}
          <div className="upload-section">
            <div className="section-header">
              <span className="section-icon">📄</span>
              <h2>Upload Resume</h2>
            </div>
            <div className={`upload-area ${file ? 'has-file' : ''}`}>
              <input
                type="file"
                id="resume-input"
                accept="application/pdf"
                onChange={handleFileChange}
                style={{ display: 'none' }}
              />
              <label htmlFor="resume-input" className="upload-label">
                <span className="upload-icon">📁</span>
                <span>{file ? file.name : 'Click to upload PDF'}</span>
              </label>
              {file && (
                <div className="file-info">
                  ✅ {file.name} ({(file.size / 1024).toFixed(2)} KB)
                </div>
              )}
            </div>
          </div>

          {/* Job Description Section */}
          <div className="jd-section">
            <div className="section-header">
              <span className="section-icon">📝</span>
              <h2>Job Description</h2>
            </div>
            <textarea
              className="jd-textarea"
              placeholder="Paste the job description here..."
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              rows={8}
            />
          </div>
        </div>

        {/* Analyze Button */}
        <div className="analyze-btn-container">
          <button
            className={`analyze-btn ${analyzing ? 'loading' : ''}`}
            onClick={handleAnalyze}
            disabled={analyzing || !file || !jobDescription}
          >
            {analyzing ? (
              <>
                <span className="spinner"></span>
                Analyzing...
              </>
            ) : (
              '🚀 Analyze Resume'
            )}
          </button>
        </div>

        {/* History Section (Optional) */}
        <div className="history-section">
          <h3>Recent Analyses</h3>
          <div className="history-list">
            <div className="empty-state">
              <div className="empty-state-icon">📭</div>
              <p>No analyses yet. Upload a resume to get started!</p>
            </div>
          </div>
        </div>
      </div>

      {/* Results Modal */}
      {showModal && result && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            
            <h2>ATS Analysis Report</h2>
            
            {/* Score Circle */}
            <div className={`score-circle ${getScoreClass(result.atsScore)}`}>
              <span className="score-number">{result.atsScore || 0}</span>
              <span className="score-label">ATS Score</span>
            </div>

            {/* Analysis Sections */}
            <div className="analysis-sections">
              {/* Keyword Analysis */}
              <div className="analysis-section">
                <h3>📊 Keyword Analysis</h3>
                <div className="keyword-stats">
                  <div className="stat">
                    <span className="stat-value">{result.keywordAnalysis?.totalKeywords || 0}</span>
                    <span className="stat-label">Total Keywords</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{result.keywordAnalysis?.matchingKeywords || 0}</span>
                    <span className="stat-label">Matched</span>
                  </div>
                  <div className="stat">
                    <span className="stat-value">{result.keywordAnalysis?.matchPercentage || 0}%</span>
                    <span className="stat-label">Match Rate</span>
                  </div>
                </div>
                
                {result.keywordAnalysis?.missingKeywords?.length > 0 && (
                  <div className="missing-keywords">
                    <h4>⚠️ Missing Keywords</h4>
                    <div className="keyword-tags">
                      {result.keywordAnalysis.missingKeywords.slice(0, 10).map((keyword, idx) => (
                        <span key={idx} className="keyword-tag">+ {keyword}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Optimization Tips */}
              <div className="analysis-section">
                <h3>💡 Optimization Tips</h3>
                <ul className="tips-list">
                  {result.suggestions?.optimizationTips?.slice(0, 5).map((tip, idx) => (
                    <li key={idx}>{tip}</li>
                  ))}
                </ul>
              </div>

              {/* Overall Assessment */}
              <div className="analysis-section">
                <h3>📋 Overall Assessment</h3>
                <p className="assessment-text">{result.suggestions?.overallAssessment || 'Analysis complete. Review the tips above to improve your resume.'}</p>
              </div>
            </div>

            <button className="close-modal-btn" onClick={() => setShowModal(false)}>
              Close Report
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard