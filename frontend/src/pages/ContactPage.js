import React, { useState } from 'react';
import '../App.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // In a real application, this would send the message to an API
    console.log('Contact form submitted:', formData);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setFormData({ name: '', email: '', subject: '', message: '' });
    }, 3000);
  };

  return (
    <div className="contact-page">
      {/* Contact Hero */}
      <section className="contact-hero">
        <div className="container">
          <h1>Get In Touch</h1>
          <p>We're here to help and answer any questions you might have</p>
        </div>
      </section>

      {/* Contact Content */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-grid">
            {/* Contact Information */}
            <div className="contact-info">
              <h2>Contact Information</h2>
              <p>
                Have questions about our internship program? We'd love to hear
                from you. Send us a message and we'll respond as soon as possible.
              </p>

              <div className="contact-details">
                <div className="contact-item">
                  <h3>Email</h3>
                  <p>info@internshipportal.com</p>
                </div>
                <div className="contact-item">
                  <h3>Phone</h3>
                  <p>+1 (555) 123-4567</p>
                </div>
                <div className="contact-item">
                  <h3>Address</h3>
                  <p>123 Education Street<br />Campus Building, Suite 456<br />City, State 12345</p>
                </div>
                <div className="contact-item">
                  <h3>Office Hours</h3>
                  <p>Monday - Friday: 9:00 AM - 5:00 PM<br />Saturday - Sunday: Closed</p>
                </div>
              </div>

              <div className="contact-image">
                <img
                  src="https://images.unsplash.com/photo-1423666639041-f56000c27a9a?w=500&h=400&fit=crop"
                  alt="Office"
                />
              </div>
            </div>

            {/* Contact Form */}
            <div className="contact-form-container">
              <h2>Send Us a Message</h2>

              {submitted && (
                <div className="alert alert-success">
                  Thank you for your message! We'll get back to you soon.
                </div>
              )}

              <form onSubmit={handleSubmit} className="contact-form">
                <div className="form-group">
                  <label htmlFor="name">Full Name</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    className="form-control"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="email">Email Address</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    className="form-control"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="subject">Subject</label>
                  <input
                    type="text"
                    id="subject"
                    name="subject"
                    className="form-control"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="message">Message</label>
                  <textarea
                    id="message"
                    name="message"
                    className="form-control"
                    rows="6"
                    value={formData.message}
                    onChange={handleChange}
                    required
                  ></textarea>
                </div>

                <button type="submit" className="btn btn-primary btn-lg">
                  Send Message
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
