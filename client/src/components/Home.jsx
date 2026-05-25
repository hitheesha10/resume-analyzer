import React, { useEffect, useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { motion, useInView, useAnimation } from 'framer-motion'
import './Home.css'

const Home = () => {
  const { isAuthenticated } = useAuth()
  const [animated, setAnimated] = useState(false)
  const controls = useAnimation()
  const ref = useRef(null)
  const inView = useInView(ref, { once: true })

  useEffect(() => {
    setAnimated(true)
    if (inView) {
      controls.start('visible')
    }
  }, [controls, inView])

  // Stats Data
  const stats = [
    { value: '90%+', label: 'Fortune 500 Companies Use ATS', icon: '🏢', delay: 0.1 },
    { value: '75%', label: 'Resumes Rejected by ATS', icon: '📊', delay: 0.2 },
    { value: '6s', label: 'Average Recruiter Scan Time', icon: '⏱️', delay: 0.3 },
    { value: '10K+', label: 'Resumes Analyzed', icon: '📄', delay: 0.4 }
  ]

  // Features Data
  const features = [
    {
      icon: '📄',
      title: 'Upload Resume',
      description: 'Upload your PDF resume for instant AI-powered analysis',
      color: '#2563eb',
      delay: 0.1
    },
    {
      icon: '📝',
      title: 'Paste Job Description',
      description: 'Add the job description you\'re targeting for comparison',
      color: '#3b82f6',
      delay: 0.2
    },
    {
      icon: '🤖',
      title: 'AI Analysis',
      description: 'Get detailed ATS score and intelligent improvement suggestions',
      color: '#60a5fa',
      delay: 0.3
    },
    {
      icon: '✨',
      title: 'Optimize Resume',
      description: 'Apply AI-powered recommendations to boost your ATS score',
      color: '#1d4ed8',
      delay: 0.4
    }
  ]

  // Testimonials Data
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Frontend Developer',
      company: 'Google',
      text: 'ResumeScore helped me land interviews at 3 top companies within 2 weeks! The AI suggestions were spot-on.',
      rating: 5,
      avatar: '👩‍💻',
      delay: 0.1
    },
    {
      name: 'Michael Chen',
      role: 'Full Stack Engineer',
      company: 'Microsoft',
      text: 'My resume score went from 45% to 85% after following the optimization tips. Game changer!',
      rating: 5,
      avatar: '👨‍💻',
      delay: 0.2
    },
    {
      name: 'Emily Rodriguez',
      role: 'Product Manager',
      company: 'Amazon',
      text: 'Finally understood why I wasn\'t getting calls. The keyword analysis is incredibly accurate.',
      rating: 5,
      avatar: '👩‍💼',
      delay: 0.3
    }
  ]

  // Container Variants for Stagger Animation
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.15, delayChildren: 0.2 }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, type: 'spring', stiffness: 100 }
    }
  }

  return (
    <div className="home">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-bg">
          <div className="gradient-orb orb-1"></div>
          <div className="gradient-orb orb-2"></div>
          <div className="gradient-orb orb-3"></div>
        </div>
        
        <div className="container">
          <motion.div 
            className="hero-content"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, type: 'spring' }}
          >
            <motion.div 
              className="hero-badge"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <span className="badge-icon">✨</span>
              AI-Powered Resume Optimization
            </motion.div>
            
            <h1 className="hero-title">
              Boost Your Resume Score
              <span className="gradient-text"> Get More Interviews</span>
            </h1>
            
            <p className="hero-subtitle">
              Join over 10,000+ job seekers who improved their ATS score by an average of 45%
            </p>
            
            <motion.div 
              className="hero-buttons"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.5 }}
            >
              {!isAuthenticated ? (
                <>
                  <Link to="/register" className="btn-primary">
                    Get Started Free <span className="arrow">→</span>
                  </Link>
                  <Link to="/login" className="btn-outline">
                    Sign In
                  </Link>
                </>
              ) : (
                <Link to="/dashboard" className="btn-primary">
                  Go to Dashboard <span className="arrow">→</span>
                </Link>
              )}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <motion.div 
            className="stats-grid"
            ref={ref}
            variants={containerVariants}
            initial="hidden"
            animate={controls}
          >
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="stat-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="stat-icon">
                  <span>{stat.icon}</span>
                </div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <motion.div 
            className="features-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>How ResumeScore Works</h2>
            <p>Four simple steps to optimize your resume</p>
          </motion.div>

          <motion.div 
            className="features-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {features.map((feature, index) => (
              <motion.div 
                key={index} 
                className="feature-card"
                variants={itemVariants}
                whileHover={{ y: -10, transition: { duration: 0.2 } }}
              >
                <div className="feature-icon" style={{ background: `${feature.color}15` }}>
                  <span>{feature.icon}</span>
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
                <div className="feature-number">{String(index + 1).padStart(2, '0')}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="container">
          <motion.div 
            className="testimonials-header"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2>Success Stories</h2>
            <p>Hear from our happy users</p>
          </motion.div>

          <motion.div 
            className="testimonials-grid"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {testimonials.map((testimonial, index) => (
              <motion.div 
                key={index} 
                className="testimonial-card"
                variants={itemVariants}
                whileHover={{ y: -5, transition: { duration: 0.2 } }}
              >
                <div className="testimonial-avatar">{testimonial.avatar}</div>
                <div className="testimonial-rating">
                  {'⭐'.repeat(testimonial.rating)}
                </div>
                <p className="testimonial-text">"{testimonial.text}"</p>
                <div className="testimonial-name">{testimonial.name}</div>
                <div className="testimonial-role">{testimonial.role}</div>
                <div className="testimonial-company">{testimonial.company}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="cta-section">
          <div className="container">
            <motion.div 
              className="cta-content"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2>Ready to Boost Your Career?</h2>
              <p>Start optimizing your resume today and stand out to recruiters</p>
              <Link to="/register" className="btn-primary cta-btn">
                Start Now - It's Free <span className="rocket">🚀</span>
              </Link>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  )
}

export default Home