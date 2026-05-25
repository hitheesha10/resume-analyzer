import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-toastify'
import './Contact.css'

const Contact = () => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    toast.success('Message sent! We\'ll get back to you soon.')
    setFormData({ name: '', email: '', message: '' })
    setLoading(false)
  }

  const contactInfo = [
    { icon: '📧', title: 'Email', value: 'support@resumescore.com', detail: '24/7 Response' },
    { icon: '💬', title: 'Live Chat', value: 'Available 9am-5pm EST', detail: 'Instant replies' },
    { icon: '📍', title: 'Office', value: 'San Francisco, CA', detail: 'Remote worldwide' }
  ]

  return (
    <div className="contact-page">
      <div className="container">
        <motion.div 
          className="contact-header"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1>Get in Touch</h1>
          <p>Have questions? We'd love to hear from you</p>
        </motion.div>

        <div className="contact-grid">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
          >
            <h2>Contact Information</h2>
            <div className="info-items">
              {contactInfo.map((info, idx) => (
                <div key={idx} className="info-item">
                  <div className="info-icon">{info.icon}</div>
                  <div>
                    <h3>{info.title}</h3>
                    <p>{info.value}</p>
                    <span className="info-detail">{info.detail}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="social-links">
              <h3>Follow Us</h3>
              <div className="social-icons">
                <a href="#" className="social-icon">🐦</a>
                <a href="#" className="social-icon">📘</a>
                <a href="#" className="social-icon">📷</a>
                <a href="#" className="social-icon">💼</a>
              </div>
            </div>
          </motion.div>

          <motion.form 
            className="contact-form"
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            onSubmit={handleSubmit}
          >
            <h2>Send a Message</h2>
            <div className="form-group">
              <input 
                type="text" 
                placeholder="Your Name" 
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <input 
                type="email" 
                placeholder="Your Email" 
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <textarea 
                rows={5} 
                placeholder="Your Message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
              ></textarea>
            </div>
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </motion.form>
        </div>

        <motion.div 
          className="faq-section"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2>Frequently Asked Questions</h2>
          <div className="faq-grid">
            <div className="faq-item">
              <h3>How does the analysis work?</h3>
              <p>Our AI compares your resume keywords against the job description to calculate an ATS compatibility score.</p>
            </div>
            <div className="faq-item">
              <h3>Is my data secure?</h3>
              <p>Yes! We use 256-bit encryption and never share your personal information.</p>
            </div>
            <div className="faq-item">
              <h3>What file formats are supported?</h3>
              <p>We currently support PDF files for resume uploads.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Contact;