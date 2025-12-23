import React, { useState } from 'react';
import '../App.css';

const HelpCenterPage = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How do I create an account?",
      answer: "Click the 'Register' button in the navigation bar, fill in your details including your role (Student, Company, or Advisor), and submit the form. You'll receive a confirmation email to verify your account."
    },
    {
      question: "How do I apply for an internship?",
      answer: "Once logged in as a student, browse available internships on your dashboard. Click on any internship to view details, then click 'Apply' to submit your application. Make sure your profile is complete before applying."
    },
    {
      question: "How can I track my application status?",
      answer: "Navigate to your dashboard and click on 'My Applications'. You'll see all your submitted applications with their current status (Pending, Under Review, Accepted, or Rejected)."
    },
    {
      question: "How do companies post internship opportunities?",
      answer: "Company users can log in to their dashboard and click 'Post New Internship'. Fill in the job details, requirements, and deadline, then publish. The posting will be visible to students after admin approval."
    },
    {
      question: "What should I include in my profile?",
      answer: "Include your personal information, educational background, skills, GPA, and upload your resume. A complete profile increases your chances of being selected for internships."
    },
    {
      question: "How do I reset my password?",
      answer: "Click 'Forgot Password' on the login page, enter your email address, and follow the instructions sent to your email to reset your password."
    },
    {
      question: "Can I withdraw my application?",
      answer: "Yes, you can withdraw an application as long as it hasn't been processed. Go to 'My Applications', find the application you want to withdraw, and click the 'Withdraw' button."
    },
    {
      question: "How do advisors supervise student internships?",
      answer: "Advisors can log in to view their assigned students, track their internship progress, submit evaluations, and communicate with students through the platform's messaging system."
    },
    {
      question: "What documents do I need to submit?",
      answer: "Required documents typically include your resume, cover letter, and academic transcripts. Some internships may require additional documents like recommendation letters or portfolios."
    },
    {
      question: "How do I contact support?",
      answer: "You can reach our support team by emailing muhammedendris565@gmail.com. We typically respond within 24-48 hours during business days."
    }
  ];

  const toggleFaq = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="help-center-page">
      {/* Hero Section */}
      <section className="help-hero">
        <div className="container">
          <h1>Help Center</h1>
          <p className="lead">Find answers to common questions and get the support you need</p>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="help-actions">
        <div className="container">
          <div className="help-actions-grid">
            <div className="help-action-card">
              <div className="help-action-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
                </svg>
              </div>
              <h3>Contact Support</h3>
              <p>Get personalized help from our team</p>
              <a href="mailto:muhammedendris565@gmail.com" className="help-action-btn">
                Email Us
              </a>
            </div>

            <div className="help-action-card">
              <div className="help-action-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                  <line x1="16" y1="13" x2="8" y2="13"/>
                  <line x1="16" y1="17" x2="8" y2="17"/>
                  <polyline points="10 9 9 9 8 9"/>
                </svg>
              </div>
              <h3>Documentation</h3>
              <p>Browse our detailed guides</p>
              <a href="#getting-started" className="help-action-btn">
                View Guides
              </a>
            </div>

            <div className="help-action-card">
              <div className="help-action-icon">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
              </div>
              <h3>FAQs</h3>
              <p>Quick answers to common questions</p>
              <a href="#faqs" className="help-action-btn">
                Browse FAQs
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Getting Started Section */}
      <section id="getting-started" className="getting-started-section">
        <div className="container">
          <h2 className="section-title">Getting Started</h2>
          <div className="getting-started-grid">
            <div className="getting-started-card">
              <div className="step-number">1</div>
              <h3>Create Your Account</h3>
              <p>
                Register with your email and select your role: Student, Company Representative,
                or Advisor. Complete your profile with accurate information.
              </p>
            </div>
            <div className="getting-started-card">
              <div className="step-number">2</div>
              <h3>Complete Your Profile</h3>
              <p>
                Add your educational background, skills, and upload relevant documents.
                A complete profile improves your chances of success.
              </p>
            </div>
            <div className="getting-started-card">
              <div className="step-number">3</div>
              <h3>Explore Opportunities</h3>
              <p>
                Browse available internships, filter by your preferences, and apply
                to positions that match your skills and interests.
              </p>
            </div>
            <div className="getting-started-card">
              <div className="step-number">4</div>
              <h3>Track Your Progress</h3>
              <p>
                Monitor your applications, receive notifications on status updates,
                and manage your internship journey all in one place.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faqs" className="faq-section">
        <div className="container">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <div className="faq-list">
            {faqs.map((faq, index) => (
              <div
                key={index}
                className={`faq-item ${activeIndex === index ? 'active' : ''}`}
              >
                <button
                  className="faq-question"
                  onClick={() => toggleFaq(index)}
                >
                  <span>{faq.question}</span>
                  <svg
                    className="faq-icon"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points={activeIndex === index ? "18 15 12 9 6 15" : "6 9 12 15 18 9"} />
                  </svg>
                </button>
                <div className="faq-answer">
                  <p>{faq.answer}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="help-contact-section">
        <div className="container">
          <div className="help-contact-card">
            <h2>Still Need Help?</h2>
            <p>
              Our support team is here to assist you. Reach out to us and we'll get back
              to you as soon as possible.
            </p>
            <a href="mailto:muhammedendris565@gmail.com" className="btn btn-primary">
              Contact Support
            </a>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HelpCenterPage;
