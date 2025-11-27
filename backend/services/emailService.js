const nodemailer = require('nodemailer');

// Create reusable transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
};

// Send Password Reset OTP Email
const sendPasswordResetOTP = async (email, otp, fullName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM,
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
            }
            .container {
              background-color: #f9f9f9;
              border-radius: 10px;
              padding: 30px;
              box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            }
            .header {
              text-align: center;
              padding-bottom: 20px;
              border-bottom: 2px solid #14B8A6;
            }
            .header h1 {
              color: #14B8A6;
              margin: 0;
              font-size: 24px;
            }
            .content {
              padding: 30px 0;
            }
            .otp-box {
              background: linear-gradient(135deg, #14B8A6 0%, #0D9488 100%);
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
            .button {
              display: inline-block;
              padding: 12px 24px;
              background-color: #14B8A6;
              color: white;
              text-decoration: none;
              border-radius: 5px;
              margin: 10px 0;
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

    const info = await transporter.sendMail(mailOptions);
    console.log('Password reset email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
};

module.exports = {
  sendPasswordResetOTP
};
