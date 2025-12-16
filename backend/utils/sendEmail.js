const nodemailer = require('nodemailer');

// ============================================
// EMAIL CONFIGURATION (Using Environment Variables)
// ============================================
const EMAIL_CONFIG = {
  user: process.env.EMAIL_USER,
  password: process.env.EMAIL_PASSWORD,
  fromName: process.env.EMAIL_FROM_NAME || 'Internship System',
  fromEmail: process.env.EMAIL_FROM || process.env.EMAIL_USER
};

// Create reusable transporter with environment variables
const createTransporter = () => {
  console.log('📧 Creating email transporter with Brevo...');
  console.log('📧 Email User:', EMAIL_CONFIG.user);
  console.log('📧 Email configured:', EMAIL_CONFIG.user ? 'Yes' : 'No');

  const transporter = nodemailer.createTransport({
    host: 'smtp-relay.brevo.com',
    port: 587,
    secure: false, // Use TLS
    auth: {
      user: EMAIL_CONFIG.user,
      pass: EMAIL_CONFIG.password,
    },
  });

  console.log('✅ Email transporter created successfully');
  return transporter;
};

/**
 * Send Registration/Email Verification OTP
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendRegistrationOTP = async (email, otp, fullName) => {
  console.log('\n========================================');
  console.log('📨 SENDING REGISTRATION OTP EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log(`Full Name: ${fullName}`);
  console.log('========================================\n');

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
      to: email,
      subject: 'Welcome! Verify Your Email - Internship Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #0060AA;
            }
            .header h1 {
              color: #0060AA;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background: linear-gradient(135deg, #0060AA 0%, #004D8C 100%);
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(20, 184, 166, 0.3);
            }
            .info-box {
              background-color: #E8F5E9;
              border-left: 4px solid #4CAF50;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box strong {
              color: #2E7D32;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Welcome to Internship Management System!</h1>
            </div>

            <div class="content">
              <p>Hello <strong>${fullName}</strong>,</p>

              <p>Thank you for registering with our Internship Management System. To complete your registration and activate your account, please verify your email address.</p>

              <p>Your verification code is:</p>

              <div class="otp-box">
                ${otp}
              </div>

              <p style="text-align: center; color: #666; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>
              </p>

              <div class="info-box">
                <strong>✅ Next Steps:</strong>
                <p style="margin: 5px 0 0 0;">
                  Enter the verification code on the registration page to complete your account setup. After verification, you'll be able to access your account and explore internship opportunities.
                </p>
              </div>

              <p>To verify your email:</p>
              <ol>
                <li>Return to the registration page</li>
                <li>Enter the 6-digit verification code shown above</li>
                <li>Click "Verify Email"</li>
              </ol>

              <p style="color: #666; font-size: 14px; margin-top: 20px;">
                <strong>Important:</strong> If you didn't create this account, please ignore this email.
              </p>
            </div>

            <div class="footer">
              <p>This is an automated email from Internship Management System</p>
              <p>© ${new Date().getFullYear()} Internship Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Internship Management System!

        Hello ${fullName},

        Thank you for registering. Please verify your email address using the code below:

        Your verification code is: ${otp}

        This code will expire in 10 minutes.

        To verify your email, enter this code on the registration page.

        If you didn't create this account, please ignore this email.

        © ${new Date().getFullYear()} Internship Management System
      `
    };

    console.log('📤 Sending email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n========================================');
    console.log('✅ EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ EMAIL SENDING FAILED!');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    console.error('========================================\n');

    throw new Error(`Failed to send verification email: ${error.message}`);
  }
};

/**
 * Send Password Reset OTP
 * @param {string} email - Recipient email address
 * @param {string} otp - 6-digit OTP code
 * @param {string} fullName - User's full name
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendPasswordResetOTP = async (email, otp, fullName) => {
  console.log('\n========================================');
  console.log('📨 SENDING PASSWORD RESET OTP EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`OTP: ${otp}`);
  console.log(`Full Name: ${fullName}`);
  console.log('========================================\n');

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
      to: email,
      subject: 'Password Reset - OTP Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #0060AA;
            }
            .header h1 {
              color: #0060AA;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background: linear-gradient(135deg, #0060AA 0%, #004D8C 100%);
              color: white;
              font-size: 32px;
              font-weight: bold;
              text-align: center;
              padding: 20px;
              border-radius: 8px;
              letter-spacing: 8px;
              margin: 20px 0;
              box-shadow: 0 4px 15px rgba(0, 96, 170, 0.3);
            }
            .warning {
              background-color: #FFF3CD;
              border-left: 4px solid #FFC107;
              padding: 15px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .warning strong {
              color: #856404;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>

            <div class="content">
              <p>Hello <strong>${fullName}</strong>,</p>

              <p>We received a request to reset your password for your Internship Management System account.</p>

              <p>Your One-Time Password (OTP) code is:</p>

              <div class="otp-box">
                ${otp}
              </div>

              <p style="text-align: center; color: #666; font-size: 14px;">
                This code will expire in <strong>10 minutes</strong>
              </p>

              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <p style="margin: 5px 0 0 0;">
                  If you did not request this password reset, please ignore this email or contact support if you have concerns.
                  Never share your OTP code with anyone.
                </p>
              </div>

              <p>To complete your password reset:</p>
              <ol>
                <li>Enter the OTP code above on the password reset page</li>
                <li>Create a new strong password</li>
                <li>Confirm your new password</li>
              </ol>
            </div>

            <div class="footer">
              <p>This is an automated email from Internship Management System</p>
              <p>© ${new Date().getFullYear()} Internship Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Password Reset Request

        Hello ${fullName},

        We received a request to reset your password for your Internship Management System account.

        Your One-Time Password (OTP) code is: ${otp}

        This code will expire in 10 minutes.

        If you did not request this password reset, please ignore this email.

        To complete your password reset:
        1. Enter the OTP code above on the password reset page
        2. Create a new strong password
        3. Confirm your new password

        © ${new Date().getFullYear()} Internship Management System
      `
    };

    console.log('📤 Sending password reset email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n========================================');
    console.log('✅ PASSWORD RESET EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ PASSWORD RESET EMAIL SENDING FAILED!');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    console.error('========================================\n');

    throw new Error(`Failed to send password reset email: ${error.message}`);
  }
};

/**
 * Send Application Accepted Email
 * @param {string} email - Student's email address
 * @param {string} fullName - Student's full name
 * @param {number} internshipDurationWeeks - Duration of internship in weeks
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendApplicationAcceptedEmail = async (email, fullName, internshipDurationWeeks) => {
  console.log('\n========================================');
  console.log('📨 SENDING APPLICATION ACCEPTED EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Full Name: ${fullName}`);
  console.log(`Duration: ${internshipDurationWeeks} weeks`);
  console.log('========================================\n');

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
      to: email,
      subject: '🎉 Congratulations! Your Internship Application Has Been Accepted',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #4CAF50;
            }
            .header h1 {
              color: #4CAF50;
              margin: 0;
              font-size: 28px;
            }
            .success-badge {
              background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
              color: white;
              font-size: 18px;
              font-weight: bold;
              text-align: center;
              padding: 15px 25px;
              border-radius: 50px;
              margin: 20px auto;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(76, 175, 80, 0.3);
            }
            .content {
              padding: 30px 0;
            }
            .info-box {
              background-color: #E8F5E9;
              border-left: 4px solid #4CAF50;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .info-box h3 {
              color: #2E7D32;
              margin-top: 0;
            }
            .next-steps {
              background-color: #FFF3E0;
              border-left: 4px solid #FF9800;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .next-steps h3 {
              color: #E65100;
              margin-top: 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🎉 Congratulations!</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>

              <p style="text-align: center;">
                <span class="success-badge">✅ APPLICATION ACCEPTED</span>
              </p>

              <p>We are delighted to inform you that your internship application has been <strong>approved</strong>! Welcome to our Internship Management System.</p>

              <div class="info-box">
                <h3>📋 Internship Details:</h3>
                <ul style="list-style-type: none; padding-left: 0;">
                  <li><strong>Duration:</strong> ${internshipDurationWeeks} weeks</li>
                  <li><strong>Status:</strong> Accepted</li>
                  <li><strong>Next Step:</strong> An advisor will be assigned to you soon</li>
                </ul>
              </div>

              <div class="next-steps">
                <h3>🚀 What's Next?</h3>
                <ul>
                  <li><strong>Advisor Assignment:</strong> You will be assigned an advisor who will guide you throughout your internship</li>
                  <li><strong>Dashboard Access:</strong> Log in to your dashboard to track your progress and communicate with your advisor</li>
                  <li><strong>Stay Connected:</strong> Check your email regularly for updates and important information</li>
                  <li><strong>Prepare:</strong> Start preparing for your internship experience</li>
                </ul>
              </div>

              <p>We're excited to have you on board! If you have any questions, please don't hesitate to reach out through the system.</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Internship Management Team</strong>
              </p>
            </div>

            <div class="footer">
              <p>This is an automated email from Internship Management System</p>
              <p>© ${new Date().getFullYear()} Internship Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Congratulations!

        Dear ${fullName},

        We are delighted to inform you that your internship application has been APPROVED!

        Internship Details:
        - Duration: ${internshipDurationWeeks} weeks
        - Status: Accepted
        - Next Step: An advisor will be assigned to you soon

        What's Next?
        - You will be assigned an advisor who will guide you throughout your internship
        - Log in to your dashboard to track your progress
        - Check your email regularly for updates
        - Start preparing for your internship experience

        We're excited to have you on board!

        Best regards,
        Internship Management Team

        © ${new Date().getFullYear()} Internship Management System
      `
    };

    console.log('📤 Sending acceptance email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n========================================');
    console.log('✅ ACCEPTANCE EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ ACCEPTANCE EMAIL SENDING FAILED!');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    console.error('========================================\n');

    throw new Error(`Failed to send acceptance email: ${error.message}`);
  }
};

/**
 * Send Application Rejected Email
 * @param {string} email - Student's email address
 * @param {string} fullName - Student's full name
 * @param {string} rejectionReason - Reason for rejection
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendApplicationRejectedEmail = async (email, fullName, rejectionReason) => {
  console.log('\n========================================');
  console.log('📨 SENDING APPLICATION REJECTED EMAIL');
  console.log('========================================');
  console.log(`To: ${email}`);
  console.log(`Full Name: ${fullName}`);
  console.log(`Reason: ${rejectionReason}`);
  console.log('========================================\n');

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
      to: email,
      subject: 'Application Status Update - Internship Management System',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #FF5722;
            }
            .header h1 {
              color: #FF5722;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 0;
            }
            .status-badge {
              background: linear-gradient(135deg, #FF5722 0%, #E64A19 100%);
              color: white;
              font-size: 16px;
              font-weight: bold;
              text-align: center;
              padding: 12px 20px;
              border-radius: 50px;
              margin: 20px auto;
              display: inline-block;
              box-shadow: 0 4px 15px rgba(255, 87, 34, 0.3);
            }
            .reason-box {
              background-color: #FFF3E0;
              border-left: 4px solid #FF9800;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .reason-box h3 {
              color: #E65100;
              margin-top: 0;
            }
            .encouragement-box {
              background-color: #E3F2FD;
              border-left: 4px solid #2196F3;
              padding: 20px;
              margin: 20px 0;
              border-radius: 4px;
            }
            .encouragement-box h3 {
              color: #1565C0;
              margin-top: 0;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
            }
            ul {
              padding-left: 20px;
            }
            li {
              margin-bottom: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Application Status Update</h1>
            </div>

            <div class="content">
              <p>Dear <strong>${fullName}</strong>,</p>

              <p style="text-align: center;">
                <span class="status-badge">APPLICATION NOT ACCEPTED</span>
              </p>

              <p>Thank you for your interest in our internship program. After careful consideration, we regret to inform you that we are unable to accept your application at this time.</p>

              <div class="reason-box">
                <h3>📝 Feedback:</h3>
                <p style="margin: 10px 0 0 0;">${rejectionReason || 'Unfortunately, we were unable to proceed with your application at this time.'}</p>
              </div>

              <div class="encouragement-box">
                <h3>💡 Moving Forward:</h3>
                <ul>
                  <li><strong>Don't be discouraged:</strong> This decision doesn't reflect your potential or capabilities</li>
                  <li><strong>Review the feedback:</strong> Use this as an opportunity to grow and improve</li>
                  <li><strong>Apply again:</strong> You're welcome to apply for future internship opportunities</li>
                  <li><strong>Stay connected:</strong> Keep an eye on our system for new opportunities</li>
                  <li><strong>Seek guidance:</strong> Consider reaching out to your academic advisors for support</li>
                </ul>
              </div>

              <p>We appreciate your interest in our program and wish you the best in your future endeavors. Remember, every setback is a setup for a comeback!</p>

              <p style="margin-top: 30px;">
                Best regards,<br>
                <strong>Internship Management Team</strong>
              </p>
            </div>

            <div class="footer">
              <p>This is an automated email from Internship Management System</p>
              <p>© ${new Date().getFullYear()} Internship Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Application Status Update

        Dear ${fullName},

        Thank you for your interest in our internship program. After careful consideration, we regret to inform you that we are unable to accept your application at this time.

        Feedback:
        ${rejectionReason || 'Unfortunately, we were unable to proceed with your application at this time.'}

        Moving Forward:
        - Don't be discouraged - this doesn't reflect your potential
        - Review the feedback and use it as an opportunity to grow
        - You're welcome to apply for future internship opportunities
        - Keep an eye on our system for new opportunities
        - Consider reaching out to your academic advisors for support

        We appreciate your interest and wish you the best in your future endeavors.

        Best regards,
        Internship Management Team

        © ${new Date().getFullYear()} Internship Management System
      `
    };

    console.log('📤 Sending rejection email...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n========================================');
    console.log('✅ REJECTION EMAIL SENT SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ REJECTION EMAIL SENDING FAILED!');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    console.error('========================================\n');

    throw new Error(`Failed to send rejection email: ${error.message}`);
  }
};

/**
 * Send Contact Form Email to Admin
 * @param {Object} contactData - Contact form data
 * @param {string} contactData.name - Sender's name
 * @param {string} contactData.email - Sender's email
 * @param {string} contactData.phone - Sender's phone number
 * @param {string} contactData.message - Message content
 * @returns {Promise<Object>} - Success status and message ID
 */
const sendContactEmail = async (contactData) => {
  const { name, email, phone, message } = contactData;

  console.log('\n========================================');
  console.log('📨 SENDING CONTACT FORM EMAIL TO ADMIN');
  console.log('========================================');
  console.log(`From: ${name} <${email}>`);
  console.log(`Phone: ${phone}`);
  console.log(`Message: ${message.substring(0, 50)}...`);
  console.log('========================================\n');

  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${EMAIL_CONFIG.fromName}" <${EMAIL_CONFIG.fromEmail}>`,
      to: EMAIL_CONFIG.user, // Send to admin email (your email)
      replyTo: email, // Allow admin to reply directly to the sender
      subject: `New Contact Form Submission from ${name}`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body {
              font-family: 'Arial', sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #f4f4f4;
            }
            .container {
              background-color: #ffffff;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #0060AA;
              background: linear-gradient(135deg, #0060AA 0%, #004D8C 100%);
              color: white;
              margin: -30px -30px 20px -30px;
              padding: 30px;
              border-radius: 10px 10px 0 0;
            }
            .header h1 {
              color: white;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 20px 0;
            }
            .info-row {
              margin: 15px 0;
              padding: 15px;
              background-color: #f8f9fa;
              border-radius: 5px;
              border-left: 4px solid #0060AA;
            }
            .info-label {
              font-weight: bold;
              color: #0060AA;
              margin-bottom: 5px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .info-value {
              color: #333;
              font-size: 16px;
            }
            .message-box {
              background-color: #ffffff;
              padding: 20px;
              border-radius: 5px;
              border: 2px solid #0060AA;
              margin-top: 20px;
            }
            .message-label {
              font-weight: bold;
              color: #0060AA;
              margin-bottom: 10px;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 1px;
            }
            .message-content {
              color: #333;
              line-height: 1.8;
              white-space: pre-wrap;
            }
            .reply-button {
              display: inline-block;
              padding: 12px 30px;
              background: linear-gradient(135deg, #0060AA 0%, #004D8C 100%);
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 20px 0;
              font-weight: bold;
            }
            .footer {
              text-align: center;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              color: #666;
              font-size: 12px;
              margin-top: 30px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📧 New Contact Form Submission</h1>
            </div>

            <div class="content">
              <p style="color: #666; margin-bottom: 20px;">
                You have received a new message from the Internship Management System contact form.
              </p>

              <div class="info-row">
                <div class="info-label">👤 Name</div>
                <div class="info-value">${name}</div>
              </div>

              <div class="info-row">
                <div class="info-label">📧 Email Address</div>
                <div class="info-value">
                  <a href="mailto:${email}" style="color: #0060AA; text-decoration: none;">${email}</a>
                </div>
              </div>

              <div class="info-row">
                <div class="info-label">📱 Phone Number</div>
                <div class="info-value">
                  <a href="tel:${phone}" style="color: #0060AA; text-decoration: none;">${phone}</a>
                </div>
              </div>

              <div class="message-box">
                <div class="message-label">💬 Message</div>
                <div class="message-content">${message}</div>
              </div>

              <div style="text-align: center; margin-top: 30px;">
                <a href="mailto:${email}" class="reply-button">Reply to ${name}</a>
              </div>

              <p style="color: #999; font-size: 12px; margin-top: 30px;">
                <strong>Tip:</strong> Click the email address or "Reply" button above to respond directly to the sender.
              </p>
            </div>

            <div class="footer">
              <p>This email was sent from the Internship Management System Contact Form</p>
              <p>Received on: ${new Date().toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' })}</p>
              <p>© ${new Date().getFullYear()} Internship Management System. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        NEW CONTACT FORM SUBMISSION
        ========================================

        You have received a new message from the contact form.

        Name: ${name}
        Email: ${email}
        Phone: ${phone}

        Message:
        ${message}

        ========================================
        Reply to this email to respond to the sender.
        Received on: ${new Date().toLocaleString()}

        © ${new Date().getFullYear()} Internship Management System
      `
    };

    console.log('📤 Sending contact form email to admin...');
    const info = await transporter.sendMail(mailOptions);

    console.log('\n========================================');
    console.log('✅ CONTACT EMAIL SENT TO ADMIN SUCCESSFULLY!');
    console.log('========================================');
    console.log(`Message ID: ${info.messageId}`);
    console.log(`Response: ${info.response}`);
    console.log('========================================\n');

    return {
      success: true,
      messageId: info.messageId,
      response: info.response
    };
  } catch (error) {
    console.error('\n========================================');
    console.error('❌ CONTACT EMAIL SENDING FAILED!');
    console.error('========================================');
    console.error('Error Name:', error.name);
    console.error('Error Message:', error.message);
    console.error('Error Code:', error.code);
    console.error('Error Details:', error);
    console.error('========================================\n');

    throw new Error(`Failed to send contact email: ${error.message}`);
  }
};

module.exports = {
  sendRegistrationOTP,
  sendPasswordResetOTP,
  sendApplicationAcceptedEmail,
  sendApplicationRejectedEmail,
  sendContactEmail
};
