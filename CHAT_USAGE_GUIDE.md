# Real-Time Chat Implementation - Usage Guide

## Overview
This implementation provides a real-time chat system using Socket.io with message persistence in MongoDB. The chat includes typing indicators, read receipts, and a clear chat feature.

## Prerequisites
- Node.js installed
- MongoDB running
- Socket.io dependencies installed (already done)

## Usage Example

### In Your React Component/Page

```jsx
import React from 'react';
import { useAuth } from '../context/AuthContext'; // Your auth context
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage = () => {
  const { user } = useAuth(); // Get current user from your auth context
  const applicationId = "YOUR_APPLICATION_ID"; // Get from route params or props

  return (
    <div>
      <ChatInterface
        applicationId={applicationId}
        currentUserId={user._id}
      />
    </div>
  );
};

export default ChatPage;
```

### With React Router (Example)

```jsx
// In your App.js or Routes file
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/chat/:applicationId" element={<ChatPage />} />
      </Routes>
    </BrowserRouter>
  );
}

// In ChatPage.jsx
import { useParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ChatInterface from '../components/chat/ChatInterface';

const ChatPage = () => {
  const { applicationId } = useParams();
  const { user } = useAuth();

  return (
    <div style={{ padding: '20px' }}>
      <ChatInterface
        applicationId={applicationId}
        currentUserId={user._id}
      />
    </div>
  );
};

export default ChatPage;
```

## Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/your-database
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000
```

## Starting the Application

### Backend
```bash
cd backend
npm run dev
# or
npm start
```

### Frontend
```bash
cd frontend
npm start
```

## Features Implemented

✅ **Real-Time Messaging**
- Messages appear instantly without page refresh
- Uses Socket.io for real-time communication
- Messages are saved to MongoDB for persistence

✅ **Typing Indicators**
- Shows when the other person is typing
- Automatically clears after 3 seconds of inactivity

✅ **Read Receipts**
- Double checkmark (✓✓) appears when message is read
- Only shown for sent messages

✅ **Clear Chat Feature**
- Button in header to clear all messages
- Confirmation dialog before clearing
- Updates all connected clients in real-time

✅ **Beautiful UI**
- Chat bubbles with distinct colors for sender/receiver
- Smooth animations
- Responsive design
- Gradient backgrounds
- Professional styling with plain CSS

## API Endpoints

### POST /api/chats
Send a new message
```json
{
  "applicationId": "string",
  "message": "string"
}
```

### GET /api/chats/:applicationId
Get all messages for an application

### DELETE /api/chats/:applicationId
Clear all messages for an application

### GET /api/chats/unread/count
Get count of unread messages

## Socket.io Events

### Client → Server
- `join-chat` - Join a chat room
- `leave-chat` - Leave a chat room
- `typing` - Send typing indicator

### Server → Client
- `new-message` - Receive new message
- `user-typing` - Receive typing indicator
- `chat-cleared` - Receive chat cleared notification

## Component Props

### ChatInterface
| Prop | Type | Required | Description |
|------|------|----------|-------------|
| applicationId | string | Yes | ID of the application/conversation |
| currentUserId | string | Yes | ID of the currently logged-in user |

## Troubleshooting

### Socket.io not connecting
- Check if backend server is running
- Verify REACT_APP_API_URL in frontend .env
- Check browser console for errors
- Ensure CORS is properly configured

### Messages not appearing in real-time
- Check if Socket.io connection is established (browser console)
- Verify both users are in the same chat room (applicationId)
- Check backend logs for Socket.io events

### Clear Chat not working
- Ensure user is authenticated
- Check if user has permission (student or advisor of the application)
- Verify DELETE endpoint is working (check network tab)

## Testing

1. Open the chat in two different browsers/windows
2. Log in as different users (student and advisor)
3. Send messages - they should appear instantly on both sides
4. Start typing - typing indicator should show on the other side
5. Click "Clear Chat" - all messages should disappear on both sides

## Notes
- Messages are persisted in MongoDB even after clearing (just marked as deleted)
- Socket.io reconnects automatically if connection is lost
- The chat is scoped to applications (student-advisor conversations)
- Authentication is handled via JWT token in localStorage
