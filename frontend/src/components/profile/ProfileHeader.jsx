import React, { useState } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import * as Dialog from '@radix-ui/react-dialog';
import { Upload, Share2, X } from 'lucide-react';

const ProfileHeader = ({ user, onUpdateAvatar, onUpdateProfile }) => {
  const [showAvatarModal, setShowAvatarModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (selectedFile) {
      const formData = new FormData();
      formData.append('avatar', selectedFile);
      await onUpdateAvatar(formData);
      setShowAvatarModal(false);
      setSelectedFile(null);
      setPreviewUrl(null);
    }
  };

  const handleShare = () => {
    const profileUrl = `${window.location.origin}/profile/${user._id}`;
    navigator.clipboard.writeText(profileUrl);
    // Show toast notification: "Profile link copied!"
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric',
    });
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
  };

  return (
    <>
      <div className="bg-white border border-gray-200 rounded-md p-10 shadow-sm">
        <div className="flex items-start justify-between">
          {/* Left Side - Avatar and Info */}
          <div className="flex items-center gap-6">
            {/* Avatar with Upload Trigger */}
            <div className="relative group">
              <Avatar.Root className="inline-flex items-center justify-center w-30 h-30 rounded-full overflow-hidden border-3 border-white shadow-md">
                <Avatar.Image
                  src={user.avatar || previewUrl}
                  alt={user.fullName}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-accent to-blue-hover text-white text-2xl font-bold">
                  {user.initials || user.fullName?.split(' ').map(n => n[0]).join('')}
                </Avatar.Fallback>
              </Avatar.Root>

              {/* Upload Overlay */}
              <button
                onClick={() => setShowAvatarModal(true)}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 group-hover:bg-opacity-50 rounded-full transition-all duration-200 cursor-pointer"
              >
                <Upload className="w-8 h-8 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
              </button>
            </div>

            {/* User Information */}
            <div>
              <h1 className="text-2xl font-bold text-black mb-2 tracking-tight">
                {user.fullName}
              </h1>
              <p className="text-base text-gray-700 mb-1">
                {user.email}
              </p>
              <p className="text-base font-medium text-gray-700">
                {user.role === 'student' && 'Student'}
                {user.role === 'advisor' && 'Advisor'}
                {user.role === 'company-admin' && 'Company Admin'}
                {user.role === 'dean' && 'Dean'}
                {user.university && ` • ${user.university}`}
                {user.department && ` • ${user.department}`}
              </p>
            </div>
          </div>

          {/* Right Side - Action Buttons */}
          <div className="flex gap-3">
            <button
              onClick={onUpdateProfile}
              className="h-12 px-6 bg-blue-accent text-white rounded-lg text-base font-semibold hover:bg-blue-hover hover:-translate-y-0.5 hover:shadow-blue transition-all duration-200"
            >
              Edit Profile
            </button>
            <button
              onClick={handleShare}
              className="h-12 px-6 border border-gray-200 text-black rounded-lg text-base font-semibold hover:border-blue-accent hover:text-blue-accent transition-all duration-200 flex items-center gap-2"
            >
              <Share2 className="w-4 h-4" />
              Share Profile
            </button>
          </div>
        </div>

        {/* Bottom Meta Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-gray-700">
            Member since: {formatDate(user.createdAt)} • Last login: {getTimeAgo(user.lastLogin || user.updatedAt)}
          </p>
        </div>
      </div>

      {/* Avatar Upload Modal */}
      <Dialog.Root open={showAvatarModal} onOpenChange={setShowAvatarModal}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-[9998] animate-fadeIn" />
          <Dialog.Content className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg p-10 w-[480px] max-h-[90vh] overflow-y-auto shadow-lg z-[9999] animate-slideUp">
            {/* Modal Header */}
            <div className="flex items-center justify-between mb-6 pb-5 border-b border-gray-200">
              <Dialog.Title className="text-2xl font-semibold text-black">
                Change Profile Picture
              </Dialog.Title>
              <Dialog.Close className="w-8 h-8 rounded-sm hover:bg-gray-100 transition-colors flex items-center justify-center">
                <X className="w-5 h-5 text-gray-700" />
              </Dialog.Close>
            </div>

            {/* Modal Content */}
            <div className="space-y-6">
              {/* Preview */}
              <div className="flex justify-center">
                <Avatar.Root className="inline-flex items-center justify-center w-32 h-32 rounded-full overflow-hidden border-3 border-gray-200">
                  <Avatar.Image
                    src={previewUrl || user.avatar}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-accent to-blue-hover text-white text-3xl font-bold">
                    {user.initials || user.fullName?.split(' ').map(n => n[0]).join('')}
                  </Avatar.Fallback>
                </Avatar.Root>
              </div>

              {/* Upload Area */}
              <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center hover:border-blue-accent hover:bg-gray-50 transition-all duration-200 cursor-pointer">
                <input
                  type="file"
                  id="avatar-upload"
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <label htmlFor="avatar-upload" className="cursor-pointer">
                  <Upload className="w-12 h-12 mx-auto mb-4 text-blue-accent" />
                  <p className="text-base font-semibold text-black mb-2">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-sm text-gray-700">
                    PNG, JPG or GIF (Max 5MB)
                  </p>
                </label>
              </div>

              {selectedFile && (
                <div className="flex items-center justify-between p-3 bg-info border border-blue-accent rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded bg-blue-accent bg-opacity-20 flex items-center justify-center">
                      <Upload className="w-5 h-5 text-blue-accent" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-black">
                        {selectedFile.name}
                      </p>
                      <p className="text-xs text-gray-700">
                        {(selectedFile.size / 1024).toFixed(2)} KB
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                    }}
                    className="w-6 h-6 rounded hover:bg-error hover:text-white transition-colors flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <Dialog.Close asChild>
                  <button className="flex-1 h-12 px-6 border border-gray-200 rounded-lg text-base font-semibold text-black hover:border-blue-accent hover:text-blue-accent transition-all">
                    Cancel
                  </button>
                </Dialog.Close>
                <button
                  onClick={handleAvatarUpload}
                  disabled={!selectedFile}
                  className="flex-1 h-12 px-6 bg-blue-accent text-white rounded-lg text-base font-semibold hover:bg-blue-hover hover:-translate-y-0.5 hover:shadow-blue transition-all disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed disabled:transform-none"
                >
                  Upload
                </button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </>
  );
};

export default ProfileHeader;
