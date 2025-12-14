import React, { useState, useEffect } from 'react';
import * as Popover from '@radix-ui/react-popover';
import { Bell, Settings, X, CheckCircle, FileText, MessageSquare, AlertCircle } from 'lucide-react';

const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

const NotificationDropdown = ({ userId }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  useEffect(() => {
    // Fetch initial unread count
    fetchUnreadCount();

    // Set up polling or WebSocket for real-time updates
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(data.notifications);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications?unread=true&count=true`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setUnreadCount(data.count);
      }
    } catch (error) {
      console.error('Error fetching unread count:', error);
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map(n =>
          n._id === notificationId ? { ...n, read: true } : n
        ));
        setUnreadCount(Math.max(0, unreadCount - 1));
      }
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      const response = await fetch(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setNotifications(notifications.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
      }
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'report':
        return <FileText className="w-4 h-4 text-blue-accent" />;
      case 'feedback':
        return <MessageSquare className="w-4 h-4 text-blue-accent" />;
      case 'application':
        return <CheckCircle className="w-4 h-4 text-blue-accent" />;
      case 'alert':
        return <AlertCircle className="w-4 h-4 text-warning" />;
      default:
        return <Bell className="w-4 h-4 text-blue-accent" />;
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    return new Date(date).toLocaleDateString();
  };

  const groupedNotifications = notifications.reduce((acc, notification) => {
    const today = new Date();
    const notifDate = new Date(notification.createdAt);
    const diffDays = Math.floor((today - notifDate) / (1000 * 60 * 60 * 24));

    let group;
    if (diffDays === 0) group = 'Today';
    else if (diffDays === 1) group = 'Yesterday';
    else group = notifDate.toLocaleDateString();

    if (!acc[group]) acc[group] = [];
    acc[group].push(notification);
    return acc;
  }, {});

  return (
    <Popover.Root open={open} onOpenChange={setOpen}>
      <Popover.Trigger asChild>
        <button className="relative w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
          <Bell className="w-5 h-5 text-gray-700" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-accent text-white text-xs font-semibold rounded-full flex items-center justify-center">
              {unreadCount > 9 ? '9+' : unreadCount}
            </span>
          )}
        </button>
      </Popover.Trigger>

      <Popover.Portal>
        <Popover.Content
          className="w-[400px] max-h-[600px] bg-white border border-gray-200 rounded-md shadow-lg z-[9999] animate-slideDown"
          sideOffset={8}
          align="end"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-black">Notifications</h3>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="text-sm font-medium text-blue-accent hover:text-blue-hover transition-colors"
                >
                  Mark all read
                </button>
              )}
              <button className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Settings className="w-4 h-4 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Notifications List */}
          <div className="overflow-y-auto max-h-[500px]">
            {Object.keys(groupedNotifications).length > 0 ? (
              Object.entries(groupedNotifications).map(([group, groupNotifications]) => (
                <div key={group}>
                  <div className="px-4 py-2 bg-gray-50">
                    <h4 className="text-xs font-semibold text-gray-700 uppercase">
                      {group}
                    </h4>
                  </div>
                  {groupNotifications.map((notification) => (
                    <div
                      key={notification._id}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification._id);
                        }
                        // Handle navigation based on notification type
                        if (notification.link) {
                          window.location.href = notification.link;
                        }
                      }}
                      className={`p-4 cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
                        notification.read
                          ? 'bg-white hover:bg-gray-50'
                          : 'bg-info hover:bg-blue-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                            notification.read ? 'bg-gray-100' : 'bg-blue-accent'
                          }`}
                        >
                          {notification.read ? (
                            <span className="text-gray-700">
                              {getNotificationIcon(notification.type)}
                            </span>
                          ) : (
                            <span className="text-white">
                              {getNotificationIcon(notification.type)}
                            </span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h4
                            className={`text-base mb-1 ${
                              notification.read ? 'font-normal text-gray-700' : 'font-medium text-black'
                            }`}
                          >
                            {notification.title}
                          </h4>
                          <p className="text-sm text-gray-700 mb-1 line-clamp-2">
                            {notification.message}
                          </p>
                          <span className="text-xs text-gray-400">
                            {getTimeAgo(notification.createdAt)}
                          </span>
                        </div>

                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-blue-accent flex-shrink-0 mt-2" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <Bell className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-base text-gray-700">No notifications</p>
              </div>
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="p-3 border-t border-gray-200 text-center">
              <button
                onClick={() => {
                  setOpen(false);
                  window.location.href = '/notifications';
                }}
                className="text-sm font-medium text-blue-accent hover:text-blue-hover transition-colors"
              >
                View All Notifications
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default NotificationDropdown;
