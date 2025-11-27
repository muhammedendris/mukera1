require('dotenv').config();
const nodemailer = require('nodemailer');

// Test email configuration
const testEmailConfig = async () => {
  console.log('Testing email configuration...\n');
  console.log('Email settings:');
  console.log('- Host:', process.env.EMAIL_HOST);
  console.log('- Port:', process.env.EMAIL_PORT);
  console.log('- User:', process.env.EMAIL_USER);
  console.log('- Password:', process.env.EMAIL_PASSWORD ? '***' + process.env.EMAIL_PASSWORD.slice(-4) : 'NOT SET');
  console.log();

  const transporter = nodemailer.createTransporter({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASSWORD,
    },
  });

  try {
    // Verify connection
    console.log('Verifying SMTP connection...');
    await transporter.verify();
    console.log('✓ SMTP connection verified successfully!\n');

    // Send test email
    console.log('Sending test email...');
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: process.env.EMAIL_USER, // Send to yourself
      subject: 'Test Email - Nodemailer Configuration',
      html: `
        <h2>Email Configuration Test</h2>
        <p>This is a test email to verify your Nodemailer configuration is working correctly.</p>
        <p><strong>Sent at:</strong> ${new Date().toLocaleString()}</p>
        <p>If you received this email, your Gmail App Password is configured correctly!</p>
      `,
      text: `
        Email Configuration Test

        This is a test email to verify your Nodemailer configuration is working correctly.
        Sent at: ${new Date().toLocaleString()}

        If you received this email, your Gmail App Password is configured correctly!
      `
    });

    console.log('✓ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('\nCheck your inbox:', process.env.EMAIL_USER);
    process.exit(0);

  } catch (error) {
    console.error('✗ Email test failed:');
    console.error('Error:', error.message);
    if (error.code) {
      console.error('Error code:', error.code);
    }
    if (error.command) {
      console.error('Failed command:', error.command);
    }
    process.exit(1);
  }
};

testEmailConfig();
