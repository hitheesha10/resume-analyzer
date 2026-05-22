import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css";

const Home = () => {
  const { isAuthenticated } = useAuth();
  const [animated, setAnimated] = useState(false);
  const [currentStatIndex, setCurrentStatIndex] = useState(0);

  useEffect(() => {
    setAnimated(true);
    
    const interval = setInterval(() => {
      setCurrentStatIndex((prev) => (prev + 1) % stats.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { number: "90%+", label: "Fortune 500 companies use ATS", icon: "🏢" },
    { number: "75%", label: "Resumes rejected by ATS", icon: "📊" },
    { number: "6s", label: "Average recruiter scan time", icon: "⏱️" }
  ];

  const features = [
    { icon: "📄", title: "Upload Resume", desc: "Upload your PDF resume for instant analysis", color: "#3b82f6" },
    { icon: "📝", title: "Paste Job Description", desc: "Add the job description you're targeting", color: "#2563eb" },
    { icon: "🤖", title: "AI Analysis", desc: "Get detailed ATS score and improvement suggestions", color: "#1d4ed8" },
    { icon: "✨", title: "Optimize", desc: "Apply AI-powered recommendations", color: "#1e3a8a" }
  ];

  const testimonials = [
    { name: "Sarah Johnson", role: "Frontend Developer", text: "This tool helped me land interviews at 3 top companies!", rating: 5, avatar: "👩‍💻" },
    { name: "Michael Chen", role: "Full Stack Engineer", text: "My resume score went from 45% to 85% after following the tips!", rating: 5, avatar: "👨‍💻" },
    { name: "Emily Rodriguez", role: "Product Manager", text: "Finally understood why I wasn't getting calls. Game changer!", rating: 5, avatar: "👩‍💼" }
  ];

  return (
    <div className={`home ${animated ? 'fade-in-up' : ''}`}>
      {/* Hero Section */}
      <div className="hero">
        <div className="hero-badge float">
          <span>✨ AI-Powered ATS Analyzer</span>
        </div>
        <h1 className="gradient-text">
          Boost Your Resume Score
          <br />
          <span className="highlight">Get More Interviews</span>
        </h1>
        <p className="subtitle">
          Join thousands of job seekers who improved their resume ATS score by an average of 45%
        </p>
        
        <div className="hero-buttons">
          {!isAuthenticated ? (
            <>
              <Link to="/register" className="btn-primary">
                Get Started Free <span>→</span>
              </Link>
              <Link to="/login" className="btn-secondary">
                Sign In
              </Link>
            </>
          ) : (
            <Link to="/resumes" className="btn-primary">
              Analyze Your Resume <span>→</span>
            </Link>
          )}
        </div>
        
        <div className="stats-carousel">
          <div className="stat-card floating-stat">
            <div className="stat-icon">{stats[currentStatIndex].icon}</div>
            <div className="stat-number">{stats[currentStatIndex].number}</div>
            <div className="stat-label">{stats[currentStatIndex].label}</div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="features-section">
        <h2>How ResumeScore Works</h2>
        <div className="feature-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card" style={{ '--hover-color': feature.color }}>
              <div className="feature-icon">{feature.icon}</div>
              <h3>{feature.title}</h3>
              <p>{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Stats Section */}
      <div className="stats-section">
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-value">10K+</div>
            <div className="stat-label">Resumes Analyzed</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">85%</div>
            <div className="stat-label">Average Score Increase</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">5000+</div>
            <div className="stat-label">Happy Users</div>
          </div>
          <div className="stat-item">
            <div className="stat-value">98%</div>
            <div className="stat-label">Success Rate</div>
          </div>
        </div>
      </div>

      {/* Testimonials Section */}
      <div className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div className="testimonial-grid">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="testimonial-card">
              <div className="testimonial-avatar">{testimonial.avatar}</div>
              <div className="testimonial-rating">
                {"⭐".repeat(testimonial.rating)}
              </div>
              <p className="testimonial-text">"{testimonial.text}"</p>
              <div className="testimonial-name">{testimonial.name}</div>
              <div className="testimonial-role">{testimonial.role}</div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      {!isAuthenticated && (
        <div className="cta-section">
          <h2>Ready to Boost Your Career?</h2>
          <p>Start optimizing your resume today and stand out to recruiters</p>
          <Link to="/register" className="btn-primary cta-btn">
            Start Now - It's Free <span>🚀</span>
          </Link>
        </div>
      )}
    </div>
  );
};

export default Home;