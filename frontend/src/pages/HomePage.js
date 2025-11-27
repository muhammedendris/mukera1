import React from 'react';
import { Link } from 'react-router-dom';
import '../App.css';

const HomePage = () => {
  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-overlay">
          <div className="container hero-content">
            <h1 className="hero-title">Build Your Future with Us</h1>
            <p className="hero-subtitle">
              Connect with top companies and gain real-world experience through our
              comprehensive internship program
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="btn btn-primary btn-lg">
                Apply Now
              </Link>
              <Link to="/about" className="btn btn-outline btn-lg">
                Learn More
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <h2 className="section-title">Why Choose Our Program?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=400&h=300&fit=crop"
                  alt="Professional Guidance"
                />
              </div>
              <h3>Professional Guidance</h3>
              <p>
                Work with experienced advisors who will mentor and guide you
                throughout your internship journey.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=400&h=300&fit=crop"
                  alt="Real Projects"
                />
              </div>
              <h3>Real-World Projects</h3>
              <p>
                Gain hands-on experience working on actual company projects that
                make a real impact.
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <img
                  src="https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=400&h=300&fit=crop"
                  alt="Career Growth"
                />
              </div>
              <h3>Career Development</h3>
              <p>
                Build your professional network and develop skills that will
                accelerate your career growth.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works-section">
        <div className="container">
          <h2 className="section-title">How It Works</h2>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p>Create your account and upload required documents</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Get Verified</h3>
              <p>Wait for your university dean to verify your account</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Apply</h3>
              <p>Submit your internship application with cover letter</p>
            </div>
            <div className="step-arrow">→</div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Start Learning</h3>
              <p>Begin your internship with an assigned advisor</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Start Your Journey?</h2>
          <p>Join hundreds of students who have already transformed their careers</p>
          <Link to="/register" className="btn btn-primary btn-lg">
            Get Started Today
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
