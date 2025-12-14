import React from 'react';

const MeetOurTeamTailwind = () => {
  // Team members data with Ethiopian names
  const teamMembers = [
    {
      id: 1,
      name: "Abebe Kebede",
      role: "Chief Executive Officer",
      image: "https://ui-avatars.com/api/?name=Abebe+Kebede&size=400&background=1a1a2e&color=fff&bold=true",
      bio: "Leading the company with 15+ years of experience in tech industry"
    },
    {
      id: 2,
      name: "Tigist Alemu",
      role: "Chief Technology Officer",
      image: "https://ui-avatars.com/api/?name=Tigist+Alemu&size=400&background=16213e&color=fff&bold=true",
      bio: "Expert in software development and innovation"
    },
    {
      id: 3,
      name: "Yohannes Tadesse",
      role: "Lead Developer",
      image: "https://ui-avatars.com/api/?name=Yohannes+Tadesse&size=400&background=0f3460&color=fff&bold=true",
      bio: "Passionate about building scalable applications"
    },
    {
      id: 4,
      name: "Almaz Tesfaye",
      role: "HR Manager",
      image: "https://ui-avatars.com/api/?name=Almaz+Tesfaye&size=400&background=533483&color=fff&bold=true",
      bio: "Dedicated to building a strong and diverse team"
    }
  ];

  return (
    <section className="py-20 px-5 bg-gradient-to-br from-gray-50 to-gray-200 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-800 mb-4 relative inline-block">
            Meet Our Team
            <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -mb-3 w-20 h-1 bg-gradient-to-r from-teal-500 to-teal-600 rounded"></span>
          </h2>
          <p className="text-xl text-gray-600 mt-8 max-w-2xl mx-auto">
            Passionate professionals dedicated to delivering excellence
          </p>
        </div>

        {/* Team Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {teamMembers.map((member, index) => (
            <div
              key={member.id}
              className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:-translate-y-3 transition-all duration-300 cursor-pointer group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Image Container */}
              <div className="relative h-80 overflow-hidden bg-gray-200">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Bio Overlay */}
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-teal-600/95 to-transparent p-5 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                  <p className="text-white text-sm leading-relaxed">
                    {member.bio}
                  </p>
                </div>
              </div>

              {/* Info Section */}
              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {member.name}
                </h3>
                <p className="text-teal-600 font-medium uppercase text-sm tracking-wide">
                  {member.role}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default MeetOurTeamTailwind;
