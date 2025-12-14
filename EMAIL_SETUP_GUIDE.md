# Email Configuration Setup Guide

This guide will help you configure email functionality for the Contact Form in your Internship Management System.

## Prerequisites

- A Gmail account (or any SMTP email provider)
- 2-Step Verification enabled on your Gmail account

## Setup Instructions

### Step 1: Enable 2-Step Verification (Gmail)

1. Go to your Google Account: https://myaccount.google.com/security
2. Under "Signing in to Google," select **2-Step Verification**
3. Follow the prompts to set it up if not already enabled

### Step 2: Generate Gmail App Password

1. Visit: https://myaccount.google.com/apppasswords
2. Select **App**: Choose "Mail"
3. Select **Device**: Choose "Other (Custom name)"
4. Enter a name like "Internship Management System"
5. Click **Generate**
6. Google will display a 16-character password (e.g., `abcd efgh ijkl mnop`)
7. **Copy this password** - you'll need it for the .env file

### Step 3: Configure .env File

Open your `backend/.env` file and update the email configuration:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=abcdefghijklmnop  # Your 16-character app password (no spaces)
EMAIL_FROM=your-email@gmail.com
CONTACT_EMAIL_RECIPIENT=your-email@gmail.com  # Where you want to receive contact form submissions
```

**Replace:**
- `your-email@gmail.com` with your actual Gmail address
- `abcdefghijklmnop` with the app password you generated (remove spaces)
- `CONTACT_EMAIL_RECIPIENT` with the email where you want to receive messages

### Step 4: Using Other Email Providers

If you're using a different email provider, update these values:

#### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_USER=your-email@outlook.com
EMAIL_PASSWORD=your-password
EMAIL_FROM=your-email@outlook.com
```

#### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_USER=your-email@yahoo.com
EMAIL_PASSWORD=your-app-password
EMAIL_FROM=your-email@yahoo.com
```

#### Custom SMTP Server
```env
EMAIL_HOST=smtp.your-domain.com
EMAIL_PORT=587  # or 465 for SSL
EMAIL_USER=your-username
EMAIL_PASSWORD=your-password
EMAIL_FROM=noreply@your-domain.com
```

### Step 5: Restart Backend Server

After updating the .env file:

1. Stop the backend server (Ctrl+C)
2. Restart it: `npm start`

## Testing the Contact Form

1. Navigate to the Contact page: http://localhost:3000/contact
2. Fill in the form with:
   - Your Name
   - Email Address
   - Phone Number
   - Message
3. Click "Send Message"
4. You should see a success message
5. Check your email (CONTACT_EMAIL_RECIPIENT) for the message

## Troubleshooting

### Issue: "Failed to send message"

**Solution 1: Check Gmail Settings**
- Ensure 2-Step Verification is enabled
- Verify the App Password is correct (no spaces)
- Make sure "Less secure app access" is NOT needed (we're using App Passwords)

**Solution 2: Check .env File**
- Verify all email variables are set correctly
- Ensure there are no extra spaces in the values
- Make sure the .env file is in the `backend` folder

**Solution 3: Check Backend Logs**
- Look at the backend console for error messages
- Common errors:
  - "Invalid login" - Wrong email/password
  - "Connection timeout" - Wrong host/port
  - "Authentication failed" - App password not configured

### Issue: Email sent but not received

**Check:**
- Spam/Junk folder
- CONTACT_EMAIL_RECIPIENT is correct
- EMAIL_FROM is a valid email address

### Issue: Backend crashes when sending email

**Check:**
- All required environment variables are set
- Nodemailer is installed: `npm list nodemailer`
- Backend server was restarted after .env changes

## Security Best Practices

1. **Never commit .env file to Git**
   - The .env file should be in .gitignore
   - Never share your app password publicly

2. **Use App Passwords (not regular password)**
   - App passwords are more secure
   - Can be revoked without changing your main password

3. **Limit Email Recipient**
   - Set CONTACT_EMAIL_RECIPIENT to a monitored email
   - Consider using a dedicated support email

4. **Rate Limiting**
   - Consider implementing rate limiting to prevent spam
   - Use CAPTCHA for production environments

## Production Deployment

When deploying to production:

1. **Environment Variables**
   - Set email variables in your hosting platform's environment settings
   - Examples: Heroku Config Vars, Vercel Environment Variables, etc.

2. **Domain Email**
   - Consider using a professional email (e.g., support@yourdomain.com)
   - Use services like SendGrid, Mailgun, or AWS SES for better deliverability

3. **Email Templates**
   - Customize email templates in `backend/services/emailService.js`
   - Add your company logo and branding

## Files Modified

- `backend/services/emailService.js` - Added sendContactFormEmail function
- `backend/routes/contact.js` - New route for contact form
- `backend/server.js` - Registered contact route
- `backend/.env` - Added email configuration
- `frontend/src/pages/ContactPage.js` - Updated to use phone field and submit to backend

## API Endpoint

**POST** `/api/contact/send-email`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1 (555) 123-4567",
  "message": "Hello, I have a question..."
}
```

**Success Response:**
```json
{
  "success": true,
  "message": "Your message has been sent successfully! We will get back to you soon."
}
```

**Error Response:**
```json
{
  "success": false,
  "message": "Failed to send message. Please try again later."
}
```

## Support

If you encounter any issues, check:
1. Backend console logs
2. Browser console (F12)
3. Network tab in browser DevTools
4. Gmail security settings

For more help, refer to:
- Nodemailer Documentation: https://nodemailer.com/
- Gmail App Passwords: https://support.google.com/accounts/answer/185833
