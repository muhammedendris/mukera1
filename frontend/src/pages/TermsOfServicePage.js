import React from 'react';
import '../App.css';

const TermsOfServicePage = () => {
  return (
    <div className="legal-page">
      {/* Hero Section */}
      <section className="legal-hero">
        <div className="container">
          <h1>Terms of Service</h1>
          <p className="lead">Please read these terms carefully before using our platform</p>
          <p className="legal-date">Last updated: December 2024</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="legal-content">
        <div className="container">
          <div className="legal-card">
            <h2>1. Acceptance of Terms</h2>
            <p>
              By accessing or using the Internship Portal ("Platform"), you agree to be bound by
              these Terms of Service and all applicable laws and regulations. If you do not agree
              with any of these terms, you are prohibited from using or accessing this Platform.
            </p>
          </div>

          <div className="legal-card">
            <h2>2. User Accounts</h2>
            <p>
              To access certain features of the Platform, you must create an account. You agree to:
            </p>
            <ul>
              <li>Provide accurate, current, and complete information during registration</li>
              <li>Maintain and promptly update your account information</li>
              <li>Keep your password secure and confidential</li>
              <li>Accept responsibility for all activities under your account</li>
              <li>Notify us immediately of any unauthorized use of your account</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>3. User Types and Roles</h2>
            <p>Our Platform supports different types of users:</p>
            <ul>
              <li><strong>Students:</strong> Individuals seeking internship opportunities</li>
              <li><strong>Companies:</strong> Organizations offering internship positions</li>
              <li><strong>Advisors:</strong> Faculty members supervising student internships</li>
              <li><strong>Department Heads:</strong> Academic administrators managing programs</li>
              <li><strong>Administrators:</strong> Platform management personnel</li>
            </ul>
            <p>
              Each user type has specific permissions and responsibilities within the Platform.
            </p>
          </div>

          <div className="legal-card">
            <h2>4. User Conduct</h2>
            <p>You agree not to:</p>
            <ul>
              <li>Use the Platform for any unlawful purpose</li>
              <li>Submit false, misleading, or fraudulent information</li>
              <li>Impersonate any person or entity</li>
              <li>Interfere with or disrupt the Platform's functionality</li>
              <li>Attempt to gain unauthorized access to any portion of the Platform</li>
              <li>Use automated systems to access the Platform without permission</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Violate any applicable laws or regulations</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>5. Intellectual Property</h2>
            <p>
              The Platform and its original content, features, and functionality are owned by
              Internship Portal and are protected by international copyright, trademark, patent,
              trade secret, and other intellectual property laws.
            </p>
            <p>
              You retain ownership of content you submit to the Platform, but grant us a
              non-exclusive license to use, display, and distribute such content in connection
              with our services.
            </p>
          </div>

          <div className="legal-card">
            <h2>6. Internship Applications</h2>
            <p>When using the Platform for internship applications:</p>
            <ul>
              <li>All application materials must be truthful and accurate</li>
              <li>You are responsible for meeting application deadlines</li>
              <li>Acceptance of applications is at the discretion of companies</li>
              <li>The Platform does not guarantee placement or employment</li>
              <li>Terms of internship are between you and the company</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>7. Disclaimers</h2>
            <p>
              The Platform is provided "as is" without warranties of any kind. We do not guarantee:
            </p>
            <ul>
              <li>Uninterrupted or error-free service</li>
              <li>Accuracy or reliability of any information on the Platform</li>
              <li>That defects will be corrected</li>
              <li>That the Platform is free of viruses or harmful components</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>8. Limitation of Liability</h2>
            <p>
              To the fullest extent permitted by law, Internship Portal shall not be liable for
              any indirect, incidental, special, consequential, or punitive damages, including
              but not limited to loss of profits, data, use, or goodwill, arising out of or in
              connection with your use of the Platform.
            </p>
          </div>

          <div className="legal-card">
            <h2>9. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the Platform immediately,
              without prior notice, for any reason, including breach of these Terms. Upon
              termination, your right to use the Platform will cease immediately.
            </p>
          </div>

          <div className="legal-card">
            <h2>10. Changes to Terms</h2>
            <p>
              We reserve the right to modify these terms at any time. We will notify users of
              significant changes by posting the new Terms on this page. Continued use of the
              Platform after changes constitutes acceptance of the new terms.
            </p>
          </div>

          <div className="legal-card">
            <h2>11. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of
              Ethiopia, without regard to its conflict of law provisions.
            </p>
          </div>

          <div className="legal-card">
            <h2>12. Contact Us</h2>
            <p>
              If you have any questions about these Terms of Service, please contact us at:
            </p>
            <p className="contact-email">
              <a href="mailto:muhammedendris565@gmail.com">muhammedendris565@gmail.com</a>
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default TermsOfServicePage;
