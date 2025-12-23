import React from 'react';
import '../App.css';

const PrivacyPolicyPage = () => {
  return (
    <div className="legal-page">
      {/* Hero Section */}
      <section className="legal-hero">
        <div className="container">
          <h1>Privacy Policy</h1>
          <p className="lead">Your privacy is important to us</p>
          <p className="legal-date">Last updated: December 2024</p>
        </div>
      </section>

      {/* Content Section */}
      <section className="legal-content">
        <div className="container">
          <div className="legal-card">
            <h2>1. Information We Collect</h2>
            <p>
              We collect information you provide directly to us, such as when you create an account,
              submit an internship application, or contact us for support. This may include:
            </p>
            <ul>
              <li>Name, email address, and contact information</li>
              <li>Educational background and academic records</li>
              <li>Resume, cover letter, and portfolio materials</li>
              <li>Employment history and professional experience</li>
              <li>Account credentials and profile information</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>2. How We Use Your Information</h2>
            <p>We use the information we collect to:</p>
            <ul>
              <li>Process and manage internship applications</li>
              <li>Match students with suitable internship opportunities</li>
              <li>Communicate with you about your applications and account</li>
              <li>Improve our services and user experience</li>
              <li>Send important updates about our platform</li>
              <li>Comply with legal obligations</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>3. Information Sharing</h2>
            <p>
              We may share your information with:
            </p>
            <ul>
              <li>Partner companies when you apply for their internship positions</li>
              <li>Universities and educational institutions for verification purposes</li>
              <li>Service providers who assist in operating our platform</li>
              <li>Legal authorities when required by law</li>
            </ul>
            <p>
              We do not sell your personal information to third parties.
            </p>
          </div>

          <div className="legal-card">
            <h2>4. Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your
              personal information against unauthorized access, alteration, disclosure, or
              destruction. These measures include:
            </p>
            <ul>
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security assessments and audits</li>
              <li>Access controls and authentication mechanisms</li>
              <li>Employee training on data protection</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>5. Cookies and Tracking</h2>
            <p>
              We use cookies and similar technologies to enhance your experience on our platform.
              These help us:
            </p>
            <ul>
              <li>Remember your preferences and settings</li>
              <li>Understand how you use our services</li>
              <li>Improve our platform based on usage patterns</li>
              <li>Provide personalized content and recommendations</li>
            </ul>
            <p>
              You can manage cookie preferences through your browser settings.
            </p>
          </div>

          <div className="legal-card">
            <h2>6. Your Rights</h2>
            <p>You have the right to:</p>
            <ul>
              <li>Access and receive a copy of your personal data</li>
              <li>Correct inaccurate or incomplete information</li>
              <li>Request deletion of your personal data</li>
              <li>Object to or restrict certain processing activities</li>
              <li>Withdraw consent at any time</li>
              <li>Lodge a complaint with a supervisory authority</li>
            </ul>
          </div>

          <div className="legal-card">
            <h2>7. Data Retention</h2>
            <p>
              We retain your personal information for as long as necessary to fulfill the purposes
              outlined in this policy, unless a longer retention period is required by law. When
              your data is no longer needed, we will securely delete or anonymize it.
            </p>
          </div>

          <div className="legal-card">
            <h2>8. Changes to This Policy</h2>
            <p>
              We may update this privacy policy from time to time. We will notify you of any
              significant changes by posting the new policy on this page and updating the
              "Last updated" date. We encourage you to review this policy periodically.
            </p>
          </div>

          <div className="legal-card">
            <h2>9. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy or our data practices,
              please contact us at:
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

export default PrivacyPolicyPage;
