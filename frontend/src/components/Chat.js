import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

const Chat = React.memo(({ applicationId, hasAdvisor = false, advisorInfo = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
    // Scroll only the messages area, not the entire window
    const messagesArea = messagesEndRef.current?.parentElement;
    if (messagesArea) {
      messagesArea.scrollTop = messagesArea.scrollHeight;
    }
  }, []);

  const loadMessages = useCallback(async () => {
    try {
      const response = await chatsAPI.getHistory(applicationId);
      setMessages(response.data.chats);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  }, [applicationId]);

  useEffect(() => {
    loadMessages();

    // Connect to Socket.io server for real-time updates
    const SOCKET_URL = process.env.REACT_APP_API_URL?.replace('/api', '') || 'https://internship-api-cea6.onrender.com';
    socketRef.current = io(SOCKET_URL, {
      auth: {
        token: localStorage.getItem('token')
      }
    });

    // Join the chat room for this application
    socketRef.current.emit('join-chat', applicationId);

    // Listen for new messages
    socketRef.current.on('new-message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    // Listen for chat cleared event
    socketRef.current.on('chat-cleared', () => {
      setMessages([]);
    });

    // Listen for advisor assignment
    socketRef.current.on('advisor-assigned', () => {
      loadMessages(); // Reload messages when advisor is assigned
    });

    // Cleanup on unmount
    return () => {
      if (socketRef.current) {
        socketRef.current.emit('leave-chat', applicationId);
        socketRef.current.disconnect();
      }
    };
  }, [applicationId, loadMessages]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatsAPI.send({
        applicationId,
        message: newMessage
      });
      setNewMessage('');
      // No need to call loadMessages() - Socket.io will update in real-time
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [applicationId, newMessage]);

  const handleClearChat = useCallback(async () => {
    // Show strong warning
    const confirmMessage =
      'Are you sure you want to clear all messages?\n\n' +
      '⚠️ This will PERMANENTLY delete ALL chat history.\n\n' +
      'This action CANNOT be undone!';

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
  }, [applicationId]);

  if (loading) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="chat-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Chat Header with Clear Button */}
      <div style={{
        background: hasAdvisor
          ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
          : 'linear-gradient(135deg, #ffa726 0%, #fb8c00 100%)',
        color: 'white',
        padding: '20px',
        borderRadius: '12px 12px 0 0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <h3 style={{ margin: 0 }}>
            {hasAdvisor ? 'Chat Messages' : 'Prepare Your Questions'}
          </h3>
          <span style={{ fontSize: '12px', opacity: 0.9 }}>
            {hasAdvisor
              ? `🟢 Advisor: ${advisorInfo?.fullName || 'Online'}`
              : '⏳ Waiting for advisor assignment'}
          </span>
        </div>
        <button
          onClick={handleClearChat}
          style={{
            backgroundColor: '#dc3545',
            color: 'white',
            border: '2px solid white',
            padding: '10px 20px',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            transition: 'all 0.3s ease',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'
          }}
          onMouseOver={(e) => {
            e.target.style.backgroundColor = '#c82333';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onMouseOut={(e) => {
            e.target.style.backgroundColor = '#dc3545';
            e.target.style.transform = 'translateY(0)';
          }}
          title="Clear all messages - This will permanently delete all chat history"
        >
          🗑️ Clear Chat
        </button>
      </div>

      <div className="chat-messages" style={{
        background: 'white',
        padding: '20px',
        maxHeight: '500px',
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: '300px',
        position: 'relative'
      }}>
        {messages.length === 0 ? (
          <p className="text-center" style={{
            color: '#999',
            padding: '50px',
            textAlign: 'center'
          }}>
            {hasAdvisor
              ? 'No messages yet. Start a conversation!'
              : 'No messages yet. Start preparing your questions for when an advisor is assigned!'}
          </p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender._id === user._id ? 'message-sent' : 'message-received'
              }`}
              style={{
                display: 'flex',
                justifyContent: msg.sender._id === user._id ? 'flex-end' : 'flex-start',
                marginBottom: '15px'
              }}
            >
              <div style={{
                maxWidth: '70%',
                padding: '12px 16px',
                borderRadius: '18px',
                background: msg.sender._id === user._id
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#e9ecef',
                color: msg.sender._id === user._id ? 'white' : '#333',
                boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)'
              }}>
                <div className="message-sender" style={{
                  fontSize: '12px',
                  fontWeight: '600',
                  marginBottom: '4px',
                  opacity: msg.sender._id === user._id ? 0.9 : 1,
                  color: msg.sender._id === user._id ? 'white' : '#667eea'
                }}>
                  {msg.sender.fullName}
                </div>
                <div className="message-content" style={{
                  fontSize: '15px',
                  lineHeight: '1.5',
                  wordWrap: 'break-word'
                }}>
                  {msg.message}
                </div>
                <div className="message-time" style={{
                  fontSize: '11px',
                  marginTop: '4px',
                  opacity: 0.8
                }}>
                  {new Date(msg.timestamp).toLocaleString()}
                </div>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-form" style={{
        display: 'flex',
        gap: '12px',
        padding: '16px 20px',
        background: 'white',
        borderTop: '1px solid #e5e7eb',
        borderRadius: '0 0 12px 12px'
      }}>
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          style={{
            flex: 1,
            padding: '12px 16px',
            border: '2px solid #e5e7eb',
            borderRadius: '24px',
            fontSize: '15px',
            outline: 'none'
          }}
        />
        <button
          type="submit"
          className="btn btn-primary"
          style={{
            padding: '12px 28px',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '24px',
            fontSize: '15px',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          Send
        </button>
      </form>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
