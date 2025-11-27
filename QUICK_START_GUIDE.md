# Quick Start Guide - React Components Setup

This guide will help you set up and use all the React components created for your Internship Management System.

---

## Prerequisites

- Node.js >= 16.x
- npm or yarn
- Existing MERN backend running on http://localhost:5000

---

## Installation

### 1. Install Required Dependencies

Navigate to your frontend directory and run:

```bash
cd frontend

# Core React packages (if not already installed)
npm install react react-dom react-router-dom

# Radix UI Primitives
npm install @radix-ui/react-avatar
npm install @radix-ui/react-dialog
npm install @radix-ui/react-dropdown-menu
npm install @radix-ui/react-select
npm install @radix-ui/react-progress
npm install @radix-ui/react-tabs
npm install @radix-ui/react-popover
npm install @radix-ui/react-accordion
npm install @radix-ui/react-switch

# Form handling and validation
npm install react-hook-form zod @hookform/resolvers

# Icons
npm install lucide-react

# Real-time communication
npm install socket.io-client

# Data visualization (for charts)
npm install recharts

# Utilities
npm install date-fns

# Development dependencies
npm install -D tailwindcss autoprefixer postcss
npm install -D @tailwindcss/forms
```

### 2. Configure Tailwind CSS

Create `tailwind.config.js`:

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
  plugins: [require('@tailwindcss/forms')],
};
```

Create `postcss.config.js`:

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

Update `src/index.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

/* Inter font from Google Fonts */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

body {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 3. Environment Variables

Create `.env` file in frontend root:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_WS_URL=http://localhost:5000
```

---

## Component Organization

Your components are organized as follows:

```
frontend/src/
├── components/
│   ├── profile/
│   │   ├── ProfileHeader.jsx          ✅ Created
│   │   ├── ProfileOverview.jsx        ✅ Created
│   │   └── PersonalInfoForm.jsx       ✅ Created
│   ├── chat/
│   │   └── ChatInterface.jsx          ✅ Created
│   ├── notifications/
│   │   └── NotificationDropdown.jsx   ✅ Created
│   └── shared/
│       └── UIComponents.jsx           ✅ Created
├── hooks/
│   └── useAPI.js                      ✅ Created
├── pages/
│   └── ProfilePage.jsx                ✅ Created
└── App.jsx
```

---

## Usage Guide

### 1. Using the Profile Page

In your `App.jsx` or router configuration:

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ProfilePage from './pages/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/profile" element={<ProfilePage />} />
        {/* Other routes */}
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. Adding Notifications to Navigation

In your navigation bar component:

```jsx
import NotificationDropdown from './components/notifications/NotificationDropdown';

function NavigationBar({ user }) {
  return (
    <nav className="h-16 border-b border-gray-200 flex items-center justify-between px-6">
      <div>Logo</div>
      <div className="flex items-center gap-4">
        <NotificationDropdown userId={user._id} />
        <UserMenu user={user} />
      </div>
    </nav>
  );
}
```

### 3. Using Chat Interface

Create a chat page:

```jsx
import ChatInterface from './components/chat/ChatInterface';
import { useProfile } from './hooks/useAPI';

function ChatPage() {
  const { profile } = useProfile();

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="h-screen">
      <ChatInterface user={profile} />
    </div>
  );
}

export default ChatPage;
```

### 4. Using Shared Components

Import and use shared components anywhere:

```jsx
import { Button, Card, Badge, Input, ProgressBar } from './components/shared/UIComponents';

function MyComponent() {
  return (
    <Card>
      <h2>Student Progress</h2>
      <ProgressBar value={45} max={100} />

      <Input
        label="Email"
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />

      <div className="flex gap-3 mt-4">
        <Button variant="secondary">Cancel</Button>
        <Button variant="primary">Save</Button>
      </div>

      <Badge variant="success">Active</Badge>
    </Card>
  );
}
```

### 5. Using Custom Hooks

For Student Dashboard with Progress Tracking:

```jsx
import { useProgress, useApplications } from './hooks/useAPI';
import { ProgressBar, Card } from './components/shared/UIComponents';

function StudentDashboard() {
  const { applications } = useApplications();
  const activeApplication = applications.find(app => app.status === 'accepted');
  const { progress } = useProgress(activeApplication?._id);

  return (
    <div className="p-10">
      <Card>
        <h2 className="text-xl font-semibold mb-4">Internship Progress</h2>
        <ProgressBar
          value={progress?.currentProgress || 0}
          max={100}
          showLabel
        />
        <p className="mt-2 text-sm text-gray-700">
          {progress?.reportsSubmitted} of {progress?.internshipDurationWeeks} reports submitted
        </p>
      </Card>
    </div>
  );
}
```

For Admin Dashboard (Accepting Applications):

```jsx
import { useApplications } from './hooks/useAPI';
import { Button, Input, Card } from './components/shared/UIComponents';
import { useState } from 'react';

function AdminDashboard() {
  const { applications, updateApplicationStatus } = useApplications();
  const [duration, setDuration] = useState(12);

  const handleAccept = async (applicationId) => {
    try {
      await updateApplicationStatus(applicationId, 'accepted', {
        internshipDurationWeeks: duration,
      });
      alert('Application accepted!');
    } catch (error) {
      alert('Error accepting application');
    }
  };

  const pendingApps = applications.filter(app => app.status === 'pending');

  return (
    <div className="p-10 space-y-4">
      {pendingApps.map(app => (
        <Card key={app._id}>
          <h3 className="font-semibold">{app.student.fullName}</h3>
          <p className="text-sm">{app.student.email}</p>

          <div className="mt-4">
            <Input
              label="Internship Duration (weeks)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              helper="This determines how progress is calculated"
              required
            />
          </div>

          <div className="flex gap-3 mt-4">
            <Button
              variant="danger"
              onClick={() => updateApplicationStatus(app._id, 'rejected')}
            >
              Reject
            </Button>
            <Button
              variant="primary"
              onClick={() => handleAccept(app._id)}
            >
              Accept Application
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
```

---

## Testing the Components

### 1. Start the Backend

```bash
cd backend
npm start
# Backend should run on http://localhost:5000
```

### 2. Start the Frontend

```bash
cd frontend
npm start
# Frontend should run on http://localhost:3000
```

### 3. Test Features

**Profile Page:**
- Navigate to `/profile`
- Test avatar upload
- Edit personal information
- Check validation errors

**Chat:**
- Navigate to `/chat`
- Start a conversation
- Send messages
- Upload files

**Notifications:**
- Click bell icon in navigation
- Mark notifications as read
- Click notification to navigate

**Progress Tracking (Student):**
- Submit weekly reports
- Watch progress bar update automatically
- Progress = (reportsSubmitted / internshipDurationWeeks) × 100

**Admin Features:**
- Accept application with duration setting
- Progress tracking initializes at 0%

---

## Troubleshooting

### Components not showing up

1. Check Tailwind CSS is imported in `src/index.css`
2. Verify `tailwind.config.js` content paths include your components
3. Make sure `postcss.config.js` is configured

### WebSocket connection issues

1. Check `REACT_APP_WS_URL` in `.env`
2. Verify backend Socket.IO is running
3. Check CORS configuration in backend

### API request failures

1. Verify backend is running
2. Check `REACT_APP_API_URL` in `.env`
3. Ensure JWT token is stored in localStorage
4. Check network tab in browser DevTools

### Icons not displaying

```bash
npm install lucide-react
```

Then import icons:
```jsx
import { Bell, User, Settings } from 'lucide-react';
```

---

## Next Steps

### 1. Add Authentication

Create login/register pages using the shared components:

```jsx
import { Input, Button } from './components/shared/UIComponents';
import { useForm } from './hooks/useAPI';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

function LoginPage() {
  const { values, errors, handleChange, handleSubmit } = useForm(
    { email: '', password: '' },
    loginSchema,
    async (data) => {
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      localStorage.setItem('token', result.token);
      window.location.href = '/dashboard';
    }
  );

  return (
    <form onSubmit={handleSubmit} className="max-w-md mx-auto mt-20">
      <Input
        label="Email"
        type="email"
        value={values.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
      />
      <Input
        label="Password"
        type="password"
        value={values.password}
        onChange={(e) => handleChange('password', e.target.value)}
        error={errors.password}
      />
      <Button type="submit" fullWidth className="mt-4">
        Login
      </Button>
    </form>
  );
}
```

### 2. Create Dashboard Pages

Use the patterns from the documentation to build:
- Student Dashboard
- Advisor Dashboard
- Admin Dashboard

### 3. Add Settings Page

Use the same tab pattern as Profile Page for settings.

### 4. Implement Report Submission

```jsx
import { useReports } from './hooks/useAPI';
import { Input, Textarea, Button } from './components/shared/UIComponents';
import { useState } from 'react';

function SubmitReportPage({ applicationId }) {
  const { submitReport } = useReports(applicationId);
  const [file, setFile] = useState(null);
  const [formData, setFormData] = useState({
    weekNumber: '',
    title: '',
    description: '',
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await submitReport(formData, file);
      alert('Report submitted successfully!');
    } catch (error) {
      alert('Error submitting report');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto p-10">
      <h1 className="text-2xl font-bold mb-6">Submit Weekly Report</h1>

      <Input
        label="Week Number"
        type="number"
        required
        value={formData.weekNumber}
        onChange={(e) => setFormData({ ...formData, weekNumber: e.target.value })}
      />

      <Input
        label="Report Title"
        required
        value={formData.title}
        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
        className="mt-4"
      />

      <Textarea
        label="Description"
        required
        maxLength={500}
        showCount
        value={formData.description}
        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
        className="mt-4"
      />

      <div className="mt-4">
        <label className="block text-sm font-medium mb-2">Upload Report</label>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
          accept=".pdf,.doc,.docx"
          required
        />
      </div>

      <Button type="submit" fullWidth className="mt-6">
        Submit Report
      </Button>
    </form>
  );
}
```

---

## Documentation References

- **Component Documentation:** `REACT_COMPONENTS_DOCUMENTATION.md`
- **Design Specifications:** `DESIGN_SPECIFICATION.md`
- **Additional Views:** `DESIGN_ADDITIONAL_VIEWS.md`

---

## Support

If you encounter any issues:
1. Check the browser console for errors
2. Verify all dependencies are installed
3. Ensure backend API is running
4. Review the documentation files

---

**Happy Coding! 🚀**
