# Contact Form Implementation - Frontend Axios Code

## Complete Contact Form Component

Here's the complete React component with Axios integration for your Contact Form:

```javascript
import React, { useState } from 'react';
import axios from 'axios';
import '../App.css';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Send contact form data to backend
      const response = await axios.post('http://localhost:5000/api/contact/send-email', {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      });

      if (response.data.success) {
        setSubmitted(true);

        // Clear form after 3 seconds
        setTimeout(() => {
          setSubmitted(false);
          setFormData({ name: '', email: '', phone: '', message: '' });
        }, 3000);
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setError(
        err.response?.data?.message ||
        'Failed to send message. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
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

      {/* Contact Form */}
      <section className="contact-content">
        <div className="container">
          <div className="contact-form-container">
            <h2>Send Us a Message</h2>

            {/* Success Message */}
            {submitted && (
              <div className="alert alert-success">
                Thank you for your message! We'll get back to you soon.
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="alert alert-danger">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="contact-form">
              {/* Name Field */}
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  className="form-control"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="John Doe"
                />
              </div>

              {/* Email Field */}
              <div className="form-group">
                <label htmlFor="email">Email Address *</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="form-control"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="john@example.com"
                />
              </div>

              {/* Phone Field */}
              <div className="form-group">
                <label htmlFor="phone">Phone Number *</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  className="form-control"
                  value={formData.phone}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              {/* Message Field */}
              <div className="form-group">
                <label htmlFor="message">Message *</label>
                <textarea
                  id="message"
                  name="message"
                  className="form-control"
                  rows="6"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  placeholder="Tell us how we can help you..."
                  minLength="10"
                ></textarea>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary btn-lg"
                disabled={loading}
              >
                {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};

export default ContactPage;
```

## Alternative: Axios with Async/Await and Try/Catch

If you want more control over the Axios call:

```javascript
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const response = await axios({
      method: 'POST',
      url: 'http://localhost:5000/api/contact/send-email',
      data: {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        message: formData.message
      },
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    }
  } catch (err) {
    console.error('Contact form error:', err);
    setError(err.response?.data?.message || 'Failed to send message');
  } finally {
    setLoading(false);
  }
};
```

## Using with API Service (Recommended for Production)

Create a dedicated API service file:

**File: `frontend/src/services/contactApi.js`**

```javascript
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

export const sendContactMessage = async (contactData) => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/contact/send-email`,
      contactData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: 'Failed to send message' };
  }
};
```

**Then in your ContactPage component:**

```javascript
import { sendContactMessage } from '../services/contactApi';

const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  setError('');

  try {
    const result = await sendContactMessage(formData);

    if (result.success) {
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        setFormData({ name: '', email: '', phone: '', message: '' });
      }, 3000);
    }
  } catch (err) {
    console.error('Contact form error:', err);
    setError(err.message || 'Failed to send message');
  } finally {
    setLoading(false);
  }
};
```

## Testing the Implementation

1. **Start your backend server:**
   ```bash
   cd backend
   npm start
   ```

2. **Start your frontend server:**
   ```bash
   cd frontend
   npm start
   ```

3. **Navigate to the contact page:**
   ```
   http://localhost:3000/contact
   ```

4. **Fill in the form:**
   - Name: Your Name
   - Email: your@email.com
   - Phone: +1 (555) 123-4567
   - Message: Test message (at least 10 characters)

5. **Click "Send Message"**

6. **Check your email** (muhammedendris565@gmail.com)
   - You should receive a beautifully formatted email with all the contact details

## API Endpoint Details

**Endpoint:** `POST /api/contact/send-email`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "message": "I have a question about the internship program..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

**Error Response (400):**
```json
{
  "success": false,
  "message": "Please provide all required fields: name, email, phone, and message"
}
```

**Error Response (500):**
```json
{
  "success": false,
  "message": "Failed to send your message. Please try again later or contact us directly."
}
```

## Email Features

The email sent to your admin address (muhammedendris565@gmail.com) includes:

1. **Sender's Information:**
   - Name
   - Email (clickable)
   - Phone Number (clickable)

2. **Message Content:**
   - Full message displayed clearly

3. **Reply Functionality:**
   - "Reply To" header set to sender's email
   - One-click reply button
   - Clickable email address

4. **Professional Design:**
   - Beautiful HTML formatting
   - Mobile-responsive
   - Branded with your system colors

## Notes

- The email is sent to: `muhammedendris565@gmail.com` (as configured in `EMAIL_CONFIG.user`)
- No .env configuration needed - your existing nodemailer setup is reused
- The `replyTo` field allows you to reply directly to the user from your email client
- Form validation is done both on frontend and backend for security
