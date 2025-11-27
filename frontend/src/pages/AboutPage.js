import React from 'react';
import '../App.css';

const AboutPage = () => {
  return (
    <div className="about-page">
      {/* About Hero */}
      <section className="about-hero">
        <div className="container">
          <h1>About Our Program</h1>
          <p className="lead">Bridging the gap between education and industry</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-grid">
            <div className="mission-content">
              <h2>Our Mission</h2>
              <p>
                We believe that practical experience is essential for career success.
                Our internship management system connects talented students with
                leading companies to provide meaningful work experience that prepares
                them for the challenges of the modern workplace.
              </p>
              <p>
                Through our comprehensive platform, we streamline the entire
                internship process - from application to completion - ensuring that
                students, universities, and companies can focus on what matters most:
                learning and growth.
              </p>
            </div>
            <div className="mission-image">
              <img
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop"
                alt="Team Collaboration"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2 className="section-title">Our Core Values</h2>
          <div className="values-grid">
            <div className="value-card">
              <h3>Excellence</h3>
              <p>
                We strive for excellence in everything we do, from the quality of
                our internship placements to the support we provide to students and
                companies.
              </p>
            </div>
            <div className="value-card">
              <h3>Collaboration</h3>
              <p>
                We foster strong partnerships between students, universities, and
                companies to create a collaborative ecosystem that benefits everyone.
              </p>
            </div>
            <div className="value-card">
              <h3>Innovation</h3>
              <p>
                We continuously improve our platform and processes to provide the
                best possible internship experience for all stakeholders.
              </p>
            </div>
            <div className="value-card">
              <h3>Integrity</h3>
              <p>
                We operate with transparency and honesty, ensuring fair and ethical
                treatment of all participants in our program.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Team Section */}
      <section className="team-section">
        <div className="container">
          <h2 className="section-title">Meet Our Team</h2>
          <div className="team-grid">
            <div className="team-member">
              <img
                src="https://images.unsplash.com/photo-1560250097-0b93528c311a?w=300&h=300&fit=crop"
                alt="Team Member"
              />
              <h3>John Anderson</h3>
              <p className="role">Program Director</p>
            </div>
            <div className="team-member">
              <img
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop"
                alt="Team Member"
              />
              <h3>Sarah Johnson</h3>
              <p className="role">Student Relations Manager</p>
            </div>
            <div className="team-member">
              <img
                src="https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=300&h=300&fit=crop"
                alt="Team Member"
              />
              <h3>Michael Chen</h3>
              <p className="role">Company Partnerships Lead</p>
            </div>
            <div className="team-member">
              <img
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?w=300&h=300&fit=crop"
                alt="Team Member"
              />
              <h3>Emily Davis</h3>
              <p className="role">Technical Coordinator</p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>500+</h3>
              <p>Students Placed</p>
            </div>
            <div className="stat-card">
              <h3>100+</h3>
              <p>Partner Companies</p>
            </div>
            <div className="stat-card">
              <h3>50+</h3>
              <p>Universities</p>
            </div>
            <div className="stat-card">
              <h3>95%</h3>
              <p>Success Rate</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AboutPage;
