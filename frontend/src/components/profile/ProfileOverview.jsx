import React from 'react';
import * as Progress from '@radix-ui/react-progress';
import { FileText, CheckCircle, TrendingUp, MessageSquare } from 'lucide-react';

const ProfileOverview = ({ user, stats, recentActivity }) => {
  const profileCompletionItems = [
    { completed: !!user.phone, label: 'Add phone number' },
    { completed: !!user.bio, label: 'Complete bio' },
    { completed: !!user.address, label: 'Add address' },
    { completed: !!user.avatar, label: 'Upload profile picture' },
  ];

  const completedItems = profileCompletionItems.filter(item => item.completed).length;
  const completionPercentage = Math.round((completedItems / profileCompletionItems.length) * 100);

  const getActivityIcon = (type) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4 text-blue-accent" />;
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-blue-accent" />;
      case 'application':
        return <CheckCircle className="w-4 h-4 text-blue-accent" />;
      default:
        return <TrendingUp className="w-4 h-4 text-blue-accent" />;
    }
  };

  const formatActivityTime = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  return (
    <div className="bg-white border border-gray-200 rounded-md p-8 shadow-sm">
      {/* Header */}
      <h2 className="text-xl font-semibold text-black mb-6">Profile Overview</h2>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {/* Applications Stat */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-accent" />
            </div>
            <span className="text-sm font-medium text-gray-700">Applications</span>
          </div>
          <p className="text-2xl font-bold text-black">{stats?.applications || 0}</p>
        </div>

        {/* Reports Stat */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-blue-accent" />
            </div>
            <span className="text-sm font-medium text-gray-700">Reports</span>
          </div>
          <p className="text-2xl font-bold text-black">
            {stats?.reportsSubmitted || 0}/{stats?.totalReports || 0}
          </p>
        </div>

        {/* Progress Stat */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-5 hover:shadow-sm transition-shadow duration-200">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 bg-info rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-blue-accent" />
            </div>
            <span className="text-sm font-medium text-gray-700">Progress</span>
          </div>
          <p className="text-2xl font-bold text-black">{stats?.progress || 0}%</p>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-black mb-4">Recent Activity</h3>
        <div className="space-y-0 border border-gray-200 rounded-lg overflow-hidden">
          {recentActivity && recentActivity.length > 0 ? (
            recentActivity.slice(0, 5).map((activity, index) => (
              <div
                key={activity._id || index}
                className={`flex items-center justify-between p-4 hover:bg-gray-50 transition-colors duration-150 ${
                  index !== recentActivity.length - 1 && index !== 4 ? 'border-b border-gray-100' : ''
                }`}
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 bg-info rounded-lg flex items-center justify-center flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-base font-medium text-black truncate">
                      {activity.title}
                    </p>
                    {activity.description && (
                      <p className="text-sm text-gray-700 truncate">
                        {activity.description}
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-sm text-gray-400 ml-4 flex-shrink-0">
                  {formatActivityTime(activity.createdAt)}
                </span>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-base text-gray-700">No recent activity</p>
            </div>
          )}
        </div>
      </div>

      {/* Profile Completion */}
      <div>
        <h3 className="text-lg font-semibold text-black mb-4">Profile Completion</h3>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-medium text-black">{completionPercentage}%</span>
            <span className="text-sm text-gray-700">
              {completedItems} of {profileCompletionItems.length} completed
            </span>
          </div>
          <Progress.Root
            className="relative overflow-hidden bg-gray-100 rounded-full h-2 w-full"
            value={completionPercentage}
          >
            <Progress.Indicator
              className="h-full bg-gradient-to-r from-blue-accent to-blue-hover rounded-full transition-all duration-500 ease-out"
              style={{ width: `${completionPercentage}%` }}
            />
          </Progress.Root>
        </div>

        {/* Completion Items */}
        <div className="space-y-2">
          {profileCompletionItems.map((item, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg"
            >
              {item.completed ? (
                <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
              ) : (
                <div className="w-5 h-5 border-2 border-gray-300 rounded-full flex-shrink-0" />
              )}
              <span
                className={`text-base ${
                  item.completed
                    ? 'text-gray-700 line-through'
                    : 'text-black font-medium'
                }`}
              >
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
