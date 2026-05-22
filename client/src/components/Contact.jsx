import React, { useState } from "react";
import "./Contact.css";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: ""
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    console.log("Contact form submitted:", formData);
    setSubmitted(true);
    setFormData({ name: "", email: "", subject: "", message: "" });
    setLoading(false);
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="contact-container fade-in">
      <div className="contact-header">
        <h1>Get in Touch</h1>
        <p>We'd love to hear from you! Send us a message and we'll respond within 24 hours.</p>
      </div>

      <div className="contact-grid">
        {/* Left Side - Contact Info */}
        <div className="contact-info glass">
          <h3>📬 Contact Information</h3>
          
          <div className="info-items">
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div>
                <h4>Email</h4>
                <p>support@greenats.com</p>
                <span className="info-detail">Response within 24h</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div>
                <h4>Phone</h4>
                <p>+1 (555) 123-4567</p>
                <span className="info-detail">Mon-Fri, 9am-5pm EST</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">💬</div>
              <div>
                <h4>Live Chat</h4>
                <p>Available 24/7</p>
                <span className="info-detail">Click the chat bubble</span>
              </div>
            </div>
            
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div>
                <h4>Office</h4>
                <p>123 Green Street, Suite 100</p>
                <span className="info-detail">San Francisco, CA 94105</span>
              </div>
            </div>
          </div>

          <div className="social-links">
            <h4>Follow Us</h4>
            <div className="social-icons">
              <a href="#" className="social-icon">📘</a>
              <a href="#" className="social-icon">🐦</a>
              <a href="#" className="social-icon">📷</a>
              <a href="#" className="social-icon">💼</a>
              <a href="#" className="social-icon">🎥</a>
            </div>
          </div>
        </div>

        {/* Right Side - Contact Form */}
        <div className="contact-form glass">
          <h3>📝 Send us a Message</h3>
          
          {submitted && (
            <div className="success-message">
              ✓ Thank you for your message! We'll get back to you soon.
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Your Name *</label>
                <input
                  type="text"
                  name="name"
                  placeholder="John Doe"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label>Email Address *</label>
                <input
                  type="email"
                  name="email"
                  placeholder="john@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div className="form-group">
              <label>Subject *</label>
              <input
                type="text"
                name="subject"
                placeholder="How can we help you?"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                placeholder="Tell us about your question or concern..."
                rows={5}
                value={formData.message}
                onChange={handleChange}
                required
              ></textarea>
            </div>
            
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Sending...
                </>
              ) : (
                <>
                  Send Message
                  <span className="send-icon">📤</span>
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="faq-section glass">
        <h3>❓ Frequently Asked Questions</h3>
        <div className="faq-grid">
          <div className="faq-item">
            <h4>How does the ATS analysis work?</h4>
            <p>Our AI compares your resume keywords against the job description to calculate a compatibility score.</p>
          </div>
          <div className="faq-item">
            <h4>Is my data secure?</h4>
            <p>Yes! We use 256-bit encryption and never share your personal information.</p>
          </div>
          <div className="faq-item">
            <h4>Can I analyze multiple resumes?</h4>
            <p>Absolutely! Premium users can analyze unlimited resumes and track their history.</p>
          </div>
          <div className="faq-item">
            <h4>What file formats are supported?</h4>
            <p>We currently support PDF files for resume uploads.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;