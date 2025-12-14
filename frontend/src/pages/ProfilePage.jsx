import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ProfileHeader from '../components/profile/ProfileHeader';
import ProfileOverview from '../components/profile/ProfileOverview';
import PersonalInfoForm from '../components/profile/PersonalInfoForm';
import SecuritySettings from '../components/profile/SecuritySettings';
import ActivityLog from '../components/profile/ActivityLog';
import { User, Lock, Activity, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

const ProfilePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch user data on mount
  React.useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateAvatar = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setUser({ ...user, avatar: data.avatar });
      }
    } catch (error) {
      console.error('Error uploading avatar:', error);
    }
  };

  const handleSavePersonalInfo = async (formData) => {
    try {
      const response = await fetch(`${API_URL}/users/profile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        setUser({ ...user, ...formData });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-blue-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <p className="text-base text-gray-700">Failed to load profile</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Page Container */}
      <div className="max-w-[1200px] mx-auto px-10 py-10">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-base font-medium text-gray-700 hover:text-black transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Profile Header */}
        <div className="mb-6">
          <ProfileHeader
            user={user}
            onUpdateAvatar={handleUpdateAvatar}
            onUpdateProfile={() => setActiveTab('personal')}
          />
        </div>

        {/* Tabs Layout */}
        <Tabs.Root value={activeTab} onValueChange={setActiveTab} className="flex gap-6">
          {/* Sidebar Navigation */}
          <Tabs.List className="flex-shrink-0 w-60 bg-white border border-gray-200 rounded-md p-4 shadow-sm self-start sticky top-6">
            <div className="space-y-1">
              <Tabs.Trigger
                value="overview"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === 'overview'
                    ? 'bg-info text-black border-l-3 border-blue-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Activity className="w-5 h-5" />
                Overview
              </Tabs.Trigger>

              <Tabs.Trigger
                value="personal"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === 'personal'
                    ? 'bg-info text-black border-l-3 border-blue-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <User className="w-5 h-5" />
                Personal Info
              </Tabs.Trigger>

              <Tabs.Trigger
                value="security"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === 'security'
                    ? 'bg-info text-black border-l-3 border-blue-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Lock className="w-5 h-5" />
                Security
              </Tabs.Trigger>

              <Tabs.Trigger
                value="activity"
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  activeTab === 'activity'
                    ? 'bg-info text-black border-l-3 border-blue-accent'
                    : 'text-gray-700 hover:bg-gray-50 hover:text-black'
                }`}
              >
                <Activity className="w-5 h-5" />
                Activity Log
              </Tabs.Trigger>
            </div>
          </Tabs.List>

          {/* Content Area */}
          <div className="flex-1 min-w-0">
            <Tabs.Content value="overview">
              <ProfileOverview
                user={user}
                stats={{
                  applications: user.applications?.length || 0,
                  reportsSubmitted: user.reportsSubmitted || 0,
                  totalReports: user.internshipDurationWeeks || 0,
                  progress: user.currentProgress || 0,
                }}
                recentActivity={user.recentActivity || []}
              />
            </Tabs.Content>

            <Tabs.Content value="personal">
              <PersonalInfoForm
                user={user}
                onSave={handleSavePersonalInfo}
                onCancel={() => setActiveTab('overview')}
              />
            </Tabs.Content>

            <Tabs.Content value="security">
              <SecuritySettings user={user} />
            </Tabs.Content>

            <Tabs.Content value="activity">
              <ActivityLog userId={user._id} />
            </Tabs.Content>
          </div>
        </Tabs.Root>
      </div>
    </div>
  );
};

export default ProfilePage;
