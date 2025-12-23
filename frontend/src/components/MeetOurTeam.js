import React from 'react';
import './MeetOurTeam.css';

const MeetOurTeam = () => {
  // Team members data with Ethiopian names and African professional images
  const teamMembers = [
    {
      id: 1,
      name: "Abebe Kebede",
      role: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1578758803946-2c4f6738df87?w=400&h=400&fit=crop&crop=faces",
      bio: "Leading the company with 15+ years of experience in tech industry"
    },
    {
      id: 2,
      name: "Tigist Alemu",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1573496799515-eebbb63814f2?w=400&h=400&fit=crop&crop=faces",
      bio: "Expert in software development and innovation"
    },
    {
      id: 3,
      name: "Yohannes Tadesse",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1616805765352-beedbad46b2a?w=400&h=400&fit=crop&crop=faces",
      bio: "Passionate about building scalable applications"
    },
    {
      id: 4,
      name: "Almaz Tesfaye",
      role: "HR Manager",
      image: "https://images.unsplash.com/photo-1563132337-f159f484226c?w=400&h=400&fit=crop&crop=faces",
      bio: "Dedicated to building a strong and diverse team"
    }
  ];

  return (
    <section className="meet-our-team">
      <div className="team-container">
        <div className="team-header">
          <h2 className="team-title">Meet Our Team</h2>
          <p className="team-subtitle">
            Passionate professionals dedicated to delivering excellence
          </p>
        </div>

        <div className="team-grid">
          {teamMembers.map((member) => (
            <div key={member.id} className="team-card">
              <div className="team-image-wrapper">
                <img
                  src={member.image}
                  alt={member.name}
                  className="team-image"
                  loading="lazy"
                />
                <div className="team-overlay">
                  <p className="team-bio">{member.bio}</p>
                </div>
              </div>
              <div className="team-info">
                <h3 className="team-name">{member.name}</h3>
                <p className="team-role">{member.role}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeam;
