import React from 'react';
import './MeetOurTeam.css';

const MeetOurTeam = () => {
  // Team members data with Ethiopian names and Ethiopian professional images
  const teamMembers = [
    {
      id: 1,
      name: "Abebe Kebede",
      role: "Chief Executive Officer",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop&crop=faces",
      bio: "Leading the company with 15+ years of experience in tech industry"
    },
    {
      id: 2,
      name: "Tigist Alemu",
      role: "Chief Technology Officer",
      image: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop&crop=faces",
      bio: "Expert in software development and innovation"
    },
    {
      id: 3,
      name: "Yohannes Tadesse",
      role: "Lead Developer",
      image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop&crop=faces",
      bio: "Passionate about building scalable applications"
    },
    {
      id: 4,
      name: "Almaz Tesfaye",
      role: "HR Manager",
      image: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop&crop=faces",
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
