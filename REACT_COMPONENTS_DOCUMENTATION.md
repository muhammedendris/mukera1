# React Component Library Documentation
## Internship Management System - Frontend Components

This document provides comprehensive documentation for all React components created for the Internship Management System.

---

## Table of Contents
1. [Installation & Setup](#installation--setup)
2. [Profile Components](#profile-components)
3. [Chat Components](#chat-components)
4. [Notification Components](#notification-components)
5. [Shared UI Components](#shared-ui-components)
6. [Custom Hooks](#custom-hooks)
7. [Usage Examples](#usage-examples)

---

## Installation & Setup

### Dependencies

```bash
npm install @radix-ui/react-avatar @radix-ui/react-dialog @radix-ui/react-tabs @radix-ui/react-popover
npm install react-hook-form zod @hookform/resolvers/zod
npm install lucide-react socket.io-client
npm install react-router-dom
```

### Tailwind CSS Configuration

Add to your `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        white: '#FFFFFF',
        black: '#000000',
        'blue-accent': '#007BFF',
        'blue-hover': '#0056D9',
        gray: {
          50: '#FAFAFA',
          100: '#F5F5F5',
          200: '#E8E8E8',
          400: '#9E9E9E',
          700: '#4A4A4A',
          900: '#1A1A1A',
        },
        success: '#00C853',
        warning: '#FF9800',
        error: '#FF3D00',
        info: '#F7FAFF',
      },
      animation: {
        fadeIn: 'fadeIn 0.2s ease',
        slideUp: 'slideUp 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        slideDown: 'slideDown 0.2s ease',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
    },
  },
};
```

---

## Profile Components

### 1. ProfileHeader

Displays user profile header with avatar, name, email, and action buttons.

**Location:** `src/components/profile/ProfileHeader.jsx`

**Props:**
```typescript
{
  user: {
    _id: string;
    fullName: string;
    email: string;
    avatar?: string;
    role: 'student' | 'advisor' | 'company-admin' | 'dean';
    university?: string;
    department?: string;
    createdAt: Date;
    lastLogin?: Date;
  };
  onUpdateAvatar: (formData: FormData) => Promise<void>;
  onUpdateProfile: () => void;
}
```

**Usage:**
```jsx
import ProfileHeader from './components/profile/ProfileHeader';

function ProfilePage() {
  const handleAvatarUpload = async (formData) => {
    await fetch('/api/users/avatar', {
      method: 'POST',
      body: formData,
      headers: { 'Authorization': `Bearer ${token}` }
    });
  };

  return (
    <ProfileHeader
      user={currentUser}
      onUpdateAvatar={handleAvatarUpload}
      onUpdateProfile={() => setEditMode(true)}
    />
  );
}
```

### 2. ProfileOverview

Shows profile statistics, recent activity, and completion status.

**Location:** `src/components/profile/ProfileOverview.jsx`

**Props:**
```typescript
{
  user: User;
  stats: {
    applications: number;
    reportsSubmitted: number;
    totalReports: number;
    progress: number;
  };
  recentActivity: Array<{
    _id: string;
    type: 'report' | 'feedback' | 'application';
    title: string;
    description?: string;
    createdAt: Date;
  }>;
}
```

### 3. PersonalInfoForm

Editable form for user personal information with validation.

**Location:** `src/components/profile/PersonalInfoForm.jsx`

**Props:**
```typescript
{
  user: User;
  onSave: (data: object) => Promise<void>;
  onCancel: () => void;
}
```

**Features:**
- Real-time validation using Zod
- Character counter for bio field
- Role-specific fields (education for students, professional info for advisors)
- Success/error indicators
- Loading states

---

## Chat Components

### ChatInterface

Full-featured chat interface with conversations list and messaging.

**Location:** `src/components/chat/ChatInterface.jsx`

**Props:**
```typescript
{
  user: {
    _id: string;
    fullName: string;
    avatar?: string;
  };
}
```

**Features:**
- Real-time messaging via Socket.IO
- Conversation list with search
- Unread message indicators
- Typing indicators
- File attachments
- Read receipts
- Message timestamps

**WebSocket Events:**
```javascript
// Emitted events
socket.emit('message', messageData);
socket.emit('typing', { chatId, isTyping: boolean });

// Listened events
socket.on('message', (message) => {});
socket.on('typing', ({ chatId, isTyping }) => {});
```

**Environment Variables:**
```
REACT_APP_API_URL=http://localhost:5000
```

---

## Notification Components

### NotificationDropdown

Dropdown notification center with real-time updates.

**Location:** `src/components/notifications/NotificationDropdown.jsx`

**Props:**
```typescript
{
  userId: string;
}
```

**Features:**
- Unread count badge
- Grouped by date (Today, Yesterday, specific dates)
- Mark as read on click
- Mark all as read
- Visual distinction between read/unread
- Auto-refresh every 30 seconds

**API Endpoints:**
```
GET  /api/notifications          - Fetch all notifications
GET  /api/notifications?unread=true&count=true - Get unread count
PATCH /api/notifications/:id/read - Mark as read
POST /api/notifications/mark-all-read - Mark all as read
```

---

## Shared UI Components

All shared components are in `src/components/shared/UIComponents.jsx`

### Button

Primary, secondary, danger, and ghost button variants.

```jsx
import { Button } from './components/shared/UIComponents';

<Button
  variant="primary" // 'primary' | 'secondary' | 'danger' | 'ghost'
  size="md"         // 'sm' | 'md' | 'lg'
  fullWidth={false}
  disabled={false}
  loading={false}
  leftIcon={<Icon />}
  rightIcon={<Icon />}
  onClick={handleClick}
>
  Click Me
</Button>
```

### IconButton

Button with just an icon.

```jsx
import { IconButton } from './components/shared/UIComponents';
import { Trash } from 'lucide-react';

<IconButton
  icon={<Trash className="w-5 h-5" />}
  variant="danger"
  size="md"
  onClick={handleDelete}
  ariaLabel="Delete item"
/>
```

### Badge

Status badges with multiple variants.

```jsx
import { Badge } from './components/shared/UIComponents';

<Badge variant="success" size="md">
  Accepted
</Badge>

// Variants: default, success, warning, error, info, pending, accepted, rejected, reviewed
```

### Card

Container card with optional hover/click effects.

```jsx
import { Card } from './components/shared/UIComponents';

<Card hoverable clickable onClick={handleClick}>
  <h3>Card Title</h3>
  <p>Card content</p>
</Card>
```

### Input

Text input with label, error, and helper text.

```jsx
import { Input } from './components/shared/UIComponents';
import { Mail } from 'lucide-react';

<Input
  label="Email Address"
  error={errors.email}
  helper="We'll never share your email"
  required
  leftIcon={<Mail className="w-4 h-4" />}
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>
```

### Textarea

Multi-line text input with character counter.

```jsx
import { Textarea } from './components/shared/UIComponents';

<Textarea
  label="Description"
  maxLength={500}
  showCount
  required
  rows={5}
  value={description}
  onChange={(e) => setDescription(e.target.value)}
/>
```

### ProgressBar

Animated progress bar with optional label.

```jsx
import { ProgressBar } from './components/shared/UIComponents';

<ProgressBar
  value={45}
  max={100}
  size="md"
  showLabel
/>
```

### Spinner

Loading spinner in various sizes.

```jsx
import { Spinner } from './components/shared/UIComponents';

<Spinner size="md" />
```

### EmptyState

Empty state placeholder with icon, title, description, and action.

```jsx
import { EmptyState } from './components/shared/UIComponents';
import { Inbox } from 'lucide-react';

<EmptyState
  icon={<Inbox className="w-8 h-8 text-gray-400" />}
  title="No messages yet"
  description="Start a conversation with your advisor"
  action={<Button>New Message</Button>}
/>
```

---

## Custom Hooks

All hooks are in `src/hooks/useAPI.js`

### useAPI

Base hook for making API requests.

```jsx
import { useAPI } from './hooks/useAPI';

const { request, loading, error } = useAPI();

const fetchData = async () => {
  const data = await request('/api/endpoint', {
    method: 'POST',
    body: JSON.stringify({ key: 'value' }),
  });
};
```

### useProfile

Manage user profile data.

```jsx
import { useProfile } from './hooks/useAPI';

const {
  profile,
  loading,
  error,
  updateProfile,
  uploadAvatar,
  refetch
} = useProfile();

// Update profile
await updateProfile({ fullName: 'New Name' });

// Upload avatar
const formData = new FormData();
formData.append('avatar', file);
await uploadAvatar(formData);
```

### useApplications

Manage internship applications.

```jsx
import { useApplications } from './hooks/useAPI';

const {
  applications,
  loading,
  error,
  submitApplication,
  updateApplicationStatus,
  assignAdvisor,
  refetch
} = useApplications();

// Submit application
await submitApplication({
  requestedDuration: '12 weeks',
  coverLetter: 'I am interested...'
});

// Accept application (Admin)
await updateApplicationStatus(applicationId, 'accepted', {
  internshipDurationWeeks: 12
});

// Assign advisor
await assignAdvisor(applicationId, advisorId);
```

### useReports

Manage weekly reports.

```jsx
import { useReports } from './hooks/useAPI';

const {
  reports,
  loading,
  error,
  submitReport,
  addFeedback,
  refetch
} = useReports(applicationId);

// Submit report
await submitReport({
  weekNumber: 5,
  title: 'Week 5: API Integration',
  description: 'This week I worked on...'
}, file);

// Add advisor feedback
await addFeedback(reportId, 'Great work! Keep it up.');
```

### useNotifications

Manage notifications.

```jsx
import { useNotifications } from './hooks/useAPI';

const {
  notifications,
  unreadCount,
  loading,
  markAsRead,
  markAllAsRead,
  refetch
} = useNotifications();

// Mark single as read
await markAsRead(notificationId);

// Mark all as read
await markAllAsRead();
```

### useProgress

Track internship progress (Gamified Progress Feature).

```jsx
import { useProgress } from './hooks/useAPI';

const { progress, loading, refetch } = useProgress(applicationId);

// progress = {
//   currentProgress: 45,           // Percentage (0-100)
//   internshipDurationWeeks: 12,   // Total weeks
//   reportsSubmitted: 5            // Reports submitted so far
// }
```

### useChat

Manage chat conversations.

```jsx
import { useChat } from './hooks/useAPI';

const {
  conversations,
  loading,
  fetchMessages,
  sendMessage,
  refetch
} = useChat();

// Fetch messages for a conversation
const messages = await fetchMessages(chatId);

// Send message
await sendMessage(chatId, { text: 'Hello!' }, fileAttachment);
```

### useForm

Form state management with validation.

```jsx
import { useForm } from './hooks/useAPI';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const {
  values,
  errors,
  touched,
  isSubmitting,
  handleChange,
  handleBlur,
  handleSubmit,
  reset
} = useForm(
  { email: '', password: '' },  // Initial values
  schema,                        // Validation schema
  async (values) => {            // Submit handler
    await login(values);
  }
);

<form onSubmit={handleSubmit}>
  <input
    value={values.email}
    onChange={(e) => handleChange('email', e.target.value)}
    onBlur={() => handleBlur('email')}
  />
  {errors.email && <span>{errors.email}</span>}
</form>
```

### useDebounce

Debounce a value (useful for search).

```jsx
import { useDebounce } from './hooks/useAPI';

const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useDebounce(searchTerm, 500);

useEffect(() => {
  if (debouncedSearch) {
    performSearch(debouncedSearch);
  }
}, [debouncedSearch]);
```

### useLocalStorage

Persist state in localStorage.

```jsx
import { useLocalStorage } from './hooks/useAPI';

const [theme, setTheme] = useLocalStorage('theme', 'light');

setTheme('dark'); // Automatically saves to localStorage
```

---

## Usage Examples

### Complete Profile Page

```jsx
import React, { useState } from 'react';
import * as Tabs from '@radix-ui/react-tabs';
import ProfileHeader from './components/profile/ProfileHeader';
import ProfileOverview from './components/profile/ProfileOverview';
import PersonalInfoForm from './components/profile/PersonalInfoForm';
import { useProfile } from './hooks/useAPI';

function ProfilePage() {
  const [activeTab, setActiveTab] = useState('overview');
  const { profile, updateProfile, uploadAvatar } = useProfile();

  return (
    <div className="max-w-[1200px] mx-auto px-10 py-10">
      <ProfileHeader
        user={profile}
        onUpdateAvatar={uploadAvatar}
        onUpdateProfile={() => setActiveTab('personal')}
      />

      <Tabs.Root value={activeTab} onValueChange={setActiveTab}>
        {/* Sidebar and tabs */}
        <Tabs.Content value="overview">
          <ProfileOverview user={profile} />
        </Tabs.Content>

        <Tabs.Content value="personal">
          <PersonalInfoForm
            user={profile}
            onSave={updateProfile}
            onCancel={() => setActiveTab('overview')}
          />
        </Tabs.Content>
      </Tabs.Root>
    </div>
  );
}
```

### Student Dashboard with Progress

```jsx
import React from 'react';
import { useProgress, useReports } from './hooks/useAPI';
import { ProgressBar, Card, Badge } from './components/shared/UIComponents';

function StudentDashboard({ applicationId }) {
  const { progress } = useProgress(applicationId);
  const { reports } = useReports(applicationId);

  return (
    <div className="space-y-6">
      {/* Progress Card */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Your Progress</h2>
        <ProgressBar
          value={progress?.currentProgress || 0}
          max={100}
          showLabel
        />
        <p className="mt-2 text-sm text-gray-700">
          {progress?.reportsSubmitted} of {progress?.internshipDurationWeeks} weeks completed
        </p>
      </Card>

      {/* Reports List */}
      <Card>
        <h2 className="text-xl font-semibold mb-4">Recent Reports</h2>
        {reports.map(report => (
          <div key={report._id} className="flex items-center justify-between p-4 border-b">
            <div>
              <h3 className="font-medium">Week {report.weekNumber}</h3>
              <p className="text-sm text-gray-700">{report.title}</p>
            </div>
            <Badge variant={report.reviewed ? 'reviewed' : 'pending'}>
              {report.reviewed ? 'Reviewed' : 'Pending'}
            </Badge>
          </div>
        ))}
      </Card>
    </div>
  );
}
```

### Admin Application Review

```jsx
import React from 'react';
import { useApplications } from './hooks/useAPI';
import { Button, Badge, Input } from './components/shared/UIComponents';
import { useState } from 'react';

function AdminDashboard() {
  const { applications, updateApplicationStatus } = useApplications();
  const [duration, setDuration] = useState('');

  const handleAccept = async (applicationId) => {
    await updateApplicationStatus(applicationId, 'accepted', {
      internshipDurationWeeks: parseInt(duration)
    });
  };

  return (
    <div className="space-y-4">
      {applications.filter(app => app.status === 'pending').map(app => (
        <Card key={app._id}>
          <h3 className="font-semibold">{app.student.fullName}</h3>
          <p className="text-sm text-gray-700">{app.student.university}</p>

          <div className="mt-4">
            <Input
              label="Internship Duration (weeks)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="secondary"
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAccept(app._id)}
              disabled={!duration}
            >
              Accept
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

## Best Practices

### 1. Error Handling

```jsx
import { useApplications } from './hooks/useAPI';

function MyComponent() {
  const { applications, loading, error, submitApplication } = useApplications();

  if (loading) return <Spinner />;
  if (error) return <div>Error: {error}</div>;

  const handleSubmit = async (data) => {
    try {
      await submitApplication(data);
      // Success handling
    } catch (err) {
      // Error handling
      console.error(err);
    }
  };
}
```

### 2. Loading States

```jsx
<Button loading={isSubmitting} disabled={isSubmitting}>
  {isSubmitting ? 'Saving...' : 'Save Changes'}
</Button>
```

### 3. Form Validation

Always use Zod schemas for validation:

```jsx
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});
```

### 4. Responsive Design

All components are mobile-responsive. Test on different screen sizes.

### 5. Accessibility

- Always provide `ariaLabel` for icon buttons
- Use semantic HTML
- Ensure keyboard navigation works
- Maintain proper color contrast

---

## File Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── profile/
│   │   │   ├── ProfileHeader.jsx
│   │   │   ├── ProfileOverview.jsx
│   │   │   └── PersonalInfoForm.jsx
│   │   ├── chat/
│   │   │   └── ChatInterface.jsx
│   │   ├── notifications/
│   │   │   └── NotificationDropdown.jsx
│   │   └── shared/
│   │       └── UIComponents.jsx
│   ├── hooks/
│   │   └── useAPI.js
│   ├── pages/
│   │   └── ProfilePage.jsx
│   └── App.jsx
```

---

## Support

For issues or questions, refer to:
- Design specification: `DESIGN_SPECIFICATION.md`
- Additional views: `DESIGN_ADDITIONAL_VIEWS.md`

---

**Created for:** Internship Management System
**Design System:** Minimalist, high-contrast (White/Black/Blue)
**Component Library:** Radix UI + Tailwind CSS
**State Management:** React Hooks + Custom Hooks
**Real-time:** Socket.IO
