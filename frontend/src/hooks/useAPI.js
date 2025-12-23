import { useState, useEffect, useCallback } from 'react';

const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

// Base API Hook
export const useAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const request = useCallback(async (url, options = {}) => {
    setLoading(true);
    setError(null);

    const token = sessionStorage.getItem('token');
    const headers = {
      'Content-Type': 'application/json',
      ...(token && { 'Authorization': `Bearer ${token}` }),
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'An error occurred');
      }

      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      throw err;
    }
  }, []);

  return { request, loading, error };
};

// User Profile Hook
export const useProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useAPI();

  const fetchProfile = useCallback(async () => {
    try {
      const data = await request(`${API_URL}/users/profile`);
      setProfile(data.user);
      return data.user;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const updateProfile = useCallback(async (updates) => {
    try {
      const data = await request(`${API_URL}/users/profile`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
      setProfile(data.user);
      return data.user;
    } catch (err) {
      throw err;
    }
  }, [request]);

  const uploadAvatar = useCallback(async (formData) => {
    try {
      const response = await fetch(`${API_URL}/users/avatar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setProfile({ ...profile, avatar: data.avatar });
        return data.avatar;
      }
    } catch (err) {
      throw err;
    }
  }, [profile]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, error, updateProfile, uploadAvatar, refetch: fetchProfile };
};

// Applications Hook
export const useApplications = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useAPI();

  const fetchApplications = useCallback(async () => {
    try {
      const data = await request(`${API_URL}/applications`);
      setApplications(data.applications);
      return data.applications;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const submitApplication = useCallback(async (applicationData) => {
    try {
      const data = await request(`${API_URL}/applications`, {
        method: 'POST',
        body: JSON.stringify(applicationData),
      });
      setApplications([...applications, data.application]);
      return data.application;
    } catch (err) {
      throw err;
    }
  }, [request, applications]);

  const updateApplicationStatus = useCallback(async (applicationId, status, additionalData = {}) => {
    try {
      const data = await request(`${API_URL}/applications/${applicationId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, ...additionalData }),
      });
      setApplications(applications.map(app =>
        app._id === applicationId ? data.application : app
      ));
      return data.application;
    } catch (err) {
      throw err;
    }
  }, [request, applications]);

  const assignAdvisor = useCallback(async (applicationId, advisorId) => {
    try {
      const data = await request(`${API_URL}/applications/${applicationId}/assign-advisor`, {
        method: 'PATCH',
        body: JSON.stringify({ advisorId }),
      });
      setApplications(applications.map(app =>
        app._id === applicationId ? data.application : app
      ));
      return data.application;
    } catch (err) {
      throw err;
    }
  }, [request, applications]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    error,
    submitApplication,
    updateApplicationStatus,
    assignAdvisor,
    refetch: fetchApplications,
  };
};

// Reports Hook
export const useReports = (applicationId) => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { request } = useAPI();

  const fetchReports = useCallback(async () => {
    if (!applicationId) return;
    try {
      const data = await request(`${API_URL}/reports/application/${applicationId}`);
      setReports(data.reports);
      return data.reports;
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [request, applicationId]);

  const submitReport = useCallback(async (reportData, file) => {
    try {
      const formData = new FormData();
      formData.append('applicationId', applicationId);
      formData.append('weekNumber', reportData.weekNumber);
      formData.append('title', reportData.title);
      formData.append('description', reportData.description);
      if (file) {
        formData.append('report', file);
      }

      const response = await fetch(`${API_URL}/reports`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        setReports([...reports, data.report]);
        return data.report;
      }
      throw new Error(data.message);
    } catch (err) {
      throw err;
    }
  }, [applicationId, reports]);

  const addFeedback = useCallback(async (reportId, feedback) => {
    try {
      const data = await request(`${API_URL}/reports/${reportId}/feedback`, {
        method: 'PATCH',
        body: JSON.stringify({ feedback }),
      });
      setReports(reports.map(report =>
        report._id === reportId ? data.report : report
      ));
      return data.report;
    } catch (err) {
      throw err;
    }
  }, [request, reports]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  return { reports, loading, error, submitReport, addFeedback, refetch: fetchReports };
};

// Notifications Hook
export const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const { request } = useAPI();

  const fetchNotifications = useCallback(async () => {
    try {
      const data = await request(`${API_URL}/notifications`);
      setNotifications(data.notifications);
      const unread = data.notifications.filter(n => !n.read).length;
      setUnreadCount(unread);
      return data.notifications;
    } catch (err) {
      console.error('Error fetching notifications:', err);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const markAsRead = useCallback(async (notificationId) => {
    try {
      await request(`${API_URL}/notifications/${notificationId}/read`, {
        method: 'PATCH',
      });
      setNotifications(notifications.map(n =>
        n._id === notificationId ? { ...n, read: true } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  }, [request, notifications]);

  const markAllAsRead = useCallback(async () => {
    try {
      await request(`${API_URL}/notifications/mark-all-read`, {
        method: 'POST',
      });
      setNotifications(notifications.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error('Error marking all as read:', err);
    }
  }, [request, notifications]);

  useEffect(() => {
    fetchNotifications();

    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications]);

  return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    refetch: fetchNotifications,
  };
};

// Progress Hook (for gamified progress tracking)
export const useProgress = (applicationId) => {
  const [progress, setProgress] = useState(null);
  const [loading, setLoading] = useState(true);
  const { request } = useAPI();

  const fetchProgress = useCallback(async () => {
    if (!applicationId) return;
    try {
      const data = await request(`${API_URL}/applications/${applicationId}`);
      setProgress({
        currentProgress: data.application.currentProgress || 0,
        internshipDurationWeeks: data.application.internshipDurationWeeks || 0,
        reportsSubmitted: data.reportsCount || 0,
      });
      return data.application;
    } catch (err) {
      console.error('Error fetching progress:', err);
    } finally {
      setLoading(false);
    }
  }, [request, applicationId]);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  return { progress, loading, refetch: fetchProgress };
};

// Chat/Messages Hook
export const useChat = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const { request } = useAPI();

  const fetchConversations = useCallback(async () => {
    try {
      const data = await request(`${API_URL}/chats`);
      setConversations(data.chats);
      return data.chats;
    } catch (err) {
      console.error('Error fetching conversations:', err);
    } finally {
      setLoading(false);
    }
  }, [request]);

  const fetchMessages = useCallback(async (chatId) => {
    try {
      const data = await request(`${API_URL}/chats/${chatId}/messages`);
      return data.messages;
    } catch (err) {
      console.error('Error fetching messages:', err);
      throw err;
    }
  }, [request]);

  const sendMessage = useCallback(async (chatId, messageData, file = null) => {
    try {
      const formData = new FormData();
      formData.append('text', messageData.text);
      if (file) {
        formData.append('file', file);
      }

      const response = await fetch(`${API_URL}/chats/${chatId}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
        },
        body: formData,
      });

      const data = await response.json();
      if (data.success) {
        return data.message;
      }
      throw new Error(data.message);
    } catch (err) {
      throw err;
    }
  }, []);

  useEffect(() => {
    fetchConversations();
  }, [fetchConversations]);

  return {
    conversations,
    loading,
    fetchMessages,
    sendMessage,
    refetch: fetchConversations,
  };
};

// Custom hook for form handling with validation
export const useForm = (initialValues, validationSchema, onSubmit) => {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = useCallback((fieldValues = values) => {
    if (!validationSchema) return {};

    try {
      validationSchema.parse(fieldValues);
      return {};
    } catch (err) {
      const fieldErrors = {};
      err.errors?.forEach((error) => {
        fieldErrors[error.path[0]] = error.message;
      });
      return fieldErrors;
    }
  }, [values, validationSchema]);

  const handleChange = useCallback((name, value) => {
    setValues(prev => ({ ...prev, [name]: value }));

    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  }, [errors]);

  const handleBlur = useCallback((name) => {
    setTouched(prev => ({ ...prev, [name]: true }));

    // Validate single field
    const fieldErrors = validate({ ...values });
    if (fieldErrors[name]) {
      setErrors(prev => ({ ...prev, [name]: fieldErrors[name] }));
    }
  }, [values, validate]);

  const handleSubmit = useCallback(async (e) => {
    e?.preventDefault();

    const fieldErrors = validate();
    setErrors(fieldErrors);

    if (Object.keys(fieldErrors).length === 0) {
      setIsSubmitting(true);
      try {
        await onSubmit(values);
      } catch (err) {
        console.error('Form submission error:', err);
      } finally {
        setIsSubmitting(false);
      }
    }
  }, [values, validate, onSubmit]);

  const reset = useCallback(() => {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setIsSubmitting(false);
  }, [initialValues]);

  return {
    values,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    reset,
  };
};

// Debounce Hook
export const useDebounce = (value, delay = 500) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

// Local Storage Hook
export const useLocalStorage = (key, initialValue) => {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = window.sessionStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
};
