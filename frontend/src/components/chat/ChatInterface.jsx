import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { chatsAPI } from '../../services/api';
import './ChatInterface.css';

const ChatInterface = ({ applicationId, currentUserId }) => {
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    // Use base URL without /api for socket.io connection
    const SOCKET_URL = process.env.REACT_APP_API_URL
      ? process.env.REACT_APP_API_URL.replace('/api', '')
      : 'https://internship-api-cea6.onrender.com';

    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Connection event listeners
    socketRef.current.on('connect', () => {
      console.log('✅ Socket.io connected:', socketRef.current.id);
    });

    socketRef.current.on('connect_error', (error) => {
      console.error('❌ Socket.io connection error:', error.message);
    });

    socketRef.current.on('disconnect', (reason) => {
      console.log('⚠️ Socket.io disconnected:', reason);
    });

    // Join the chat room for this application
    socketRef.current.emit('join-chat', applicationId);

    // Listen for new messages
    socketRef.current.on('new-message', (message) => {
      setMessages((prev) => [...prev, message]);
    });

    // Listen for typing indicators
    socketRef.current.on('user-typing', ({ isTyping: typing }) => {
      setIsTyping(typing);

      // Clear typing indicator after 3 seconds
      if (typing) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = setTimeout(() => {
          setIsTyping(false);
        }, 3000);
      }
    });

    // Listen for chat cleared event
    socketRef.current.on('chat-cleared', (data) => {
      console.log('🗑️ Chat cleared event received:', data);
      setMessages([]);

      // Show notification if someone else cleared the chat
      if (data.clearedBy) {
        alert(`💬 Chat was cleared by ${data.clearedBy}`);
      }
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', applicationId);
        socketRef.current.disconnect();
      }
      clearTimeout(typingTimeoutRef.current);
    };
  }, [applicationId]);

  // Fetch initial messages
  useEffect(() => {
    fetchMessages();
  }, [applicationId]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    // Scroll only the messages area, not the entire window
    const messagesArea = messagesEndRef.current?.parentElement;
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  };

  const fetchMessages = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

      const response = await fetch(`${API_URL}/chats/${applicationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setMessages(data.chats || []);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim()) return;

    const messageText = messageInput;
    setMessageInput(''); // Clear input immediately for better UX

    try {
      const token = localStorage.getItem('token');
      const API_URL = process.env.REACT_APP_API_URL || 'https://internship-api-cea6.onrender.com/api';

      const response = await fetch(`${API_URL}/chats`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          applicationId,
          message: messageText,
        }),
      });

      const data = await response.json();
      if (!data.success) {
        console.error('Failed to send message:', data.message);
        setMessageInput(messageText); // Restore message on error
      }
    } catch (error) {
      console.error('Error sending message:', error);
      setMessageInput(messageText); // Restore message on error
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);

    // Emit typing indicator
    if (socketRef.current) {
      socketRef.current.emit('typing', {
        applicationId,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  const handleClearChat = async () => {
    // Show confirmation dialog with clear warning
    const confirmMessage = 'Are you sure you want to clear all messages?\n\n⚠️ This will permanently delete ALL chat history.\n\nThis action CANNOT be undone!';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      console.log('🗑️ Clearing chat for application:', applicationId);

      const response = await chatsAPI.clear(applicationId);

      if (response.data.success) {
        console.log('✅ Chat cleared successfully');
        setMessages([]);
        alert('✅ Chat cleared successfully!');
      } else {
        console.error('❌ Failed to clear chat:', response.data.message);
        alert('❌ Failed to clear chat: ' + response.data.message);
      }
    } catch (error) {
      console.error('❌ Error clearing chat:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('❌ Failed to clear chat: ' + errorMessage);
    }
  };

  const formatMessageTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  if (loading) {
    return (
      <div className="chat-container">
        <div className="chat-loading">Loading messages...</div>
      </div>
    );
  }

  return (
    <div className="chat-container">
      {/* Chat Header */}
      <div className="chat-header">
        <div className="chat-header-info">
          <h2 className="chat-title">Chat Messages</h2>
          <span className="chat-status">🟢 Online</span>
        </div>
        <button
          className="clear-chat-btn"
          onClick={handleClearChat}
          title="Clear all messages - This will permanently delete all chat history"
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Messages Area */}
      <div className="messages-area">
        {messages.length === 0 ? (
          <div className="no-messages">
            <p>No messages yet. Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const isSent = message.sender._id === currentUserId;
            return (
              <div
                key={message._id}
                className={`message ${isSent ? 'message-sent' : 'message-received'}`}
              >
                <div className="message-content">
                  <div className="message-sender">
                    {message.sender.fullName} ({message.sender.role})
                  </div>
                  <div className="message-text">{message.message}</div>
                  <div className="message-time">
                    {formatMessageTime(message.timestamp)}
                    {isSent && message.isRead && (
                      <span className="message-read"> ✓✓</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}

        {/* Typing Indicator */}
        {isTyping && (
          <div className="typing-indicator">
            <div className="typing-dots">
              <span></span>
              <span></span>
              <span></span>
            </div>
            <span className="typing-text">Someone is typing...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <form className="message-input-container" onSubmit={handleSendMessage}>
        <input
          type="text"
          value={messageInput}
          onChange={handleTyping}
          placeholder="Type a message..."
          className="message-input"
        />
        <button
          type="submit"
          disabled={!messageInput.trim()}
          className="send-btn"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
