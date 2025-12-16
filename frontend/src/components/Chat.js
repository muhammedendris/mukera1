import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';
import './Chat.css';

const Chat = React.memo(({ applicationId, hasAdvisor = false, advisorInfo = null }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingMessageId, setEditingMessageId] = useState(null);
  const [editedText, setEditedText] = useState('');
  const { user } = useAuth();
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);

  const scrollToBottom = useCallback(() => {
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
      setMessages(prev => [...prev, message]);
    });

    // Listen for edited messages
    socketRef.current.on('receive_edit_message', (editedMessage) => {
      setMessages(prev => prev.map(msg =>
        msg._id === editedMessage._id ? editedMessage : msg
      ));
    });

    // Listen for deleted messages
    socketRef.current.on('receive_delete_message', (data) => {
      setMessages(prev => prev.filter(msg => msg._id !== data.messageId));
    });

    // Listen for chat cleared event
    socketRef.current.on('chat-cleared', () => {
      setMessages([]);
    });

    // Listen for advisor assignment
    socketRef.current.on('advisor-assigned', () => {
      loadMessages();
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
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }, [applicationId, newMessage]);

  const handleEditMessage = useCallback((messageId, currentText) => {
    setEditingMessageId(messageId);
    setEditedText(currentText);
  }, []);

  const handleSaveEdit = useCallback(async (messageId) => {
    if (!editedText.trim()) return;

    try {
      await chatsAPI.edit(messageId, editedText);
      setEditingMessageId(null);
      setEditedText('');
    } catch (error) {
      console.error('Failed to edit message:', error);
      alert('Failed to edit message: ' + (error.response?.data?.message || error.message));
    }
  }, [editedText]);

  const handleCancelEdit = useCallback(() => {
    setEditingMessageId(null);
    setEditedText('');
  }, []);

  const handleDeleteMessage = useCallback(async (messageId) => {
    if (!window.confirm('Are you sure you want to delete this message?')) {
      return;
    }

    try {
      await chatsAPI.deleteMessage(messageId);
    } catch (error) {
      console.error('Failed to delete message:', error);
      alert('Failed to delete message: ' + (error.response?.data?.message || error.message));
    }
  }, []);

  const handleClearChat = useCallback(async () => {
    const confirmMessage =
      'Are you sure you want to clear all messages?\n\n' +
      '⚠️ This will PERMANENTLY delete ALL chat history.\n\n' +
      'This action CANNOT be undone!';

    if (!window.confirm(confirmMessage)) {
      return;
    }

    try {
      const response = await chatsAPI.clear(applicationId);

      if (response.data.success) {
        setMessages([]);
        alert('✅ Chat cleared successfully!');
      } else {
        alert('❌ Failed to clear chat: ' + response.data.message);
      }
    } catch (error) {
      const errorMessage = error.response?.data?.message || error.message || 'Unknown error';
      alert('❌ Failed to clear chat: ' + errorMessage);
    }
  }, [applicationId]);

  if (loading) {
    return <div className="telegram-loading">Loading chat...</div>;
  }

  return (
    <div className="telegram-chat-container">
      {/* Chat Header - Telegram Style */}
      <div className={`telegram-chat-header ${!hasAdvisor ? 'no-advisor' : ''}`}>
        <div className="telegram-header-info">
          <h3>
            {hasAdvisor ? 'Chat Messages' : 'Prepare Your Questions'}
          </h3>
          <span>
            {hasAdvisor
              ? `🟢 Advisor: ${advisorInfo?.fullName || 'Online'}`
              : '⏳ Waiting for advisor assignment'}
          </span>
        </div>
        <button
          onClick={handleClearChat}
          className="telegram-clear-btn"
          title="Clear all messages"
        >
          🗑️ Clear
        </button>
      </div>

      {/* Messages Area - Telegram Beige Background */}
      <div className="telegram-messages-area">
        {messages.length === 0 ? (
          <div className="telegram-empty-state">
            {hasAdvisor
              ? 'No messages yet. Start a conversation!'
              : 'No messages yet. Start preparing your questions for when an advisor is assigned!'}
          </div>
        ) : (
          messages.map((msg) => {
            const isOwnMessage = msg.sender._id === user._id;
            const isEditing = editingMessageId === msg._id;

            return (
              <div
                key={msg._id}
                className={`telegram-message-wrapper ${isOwnMessage ? 'sent' : 'received'}`}
              >
                <div className={`telegram-message-bubble ${isOwnMessage ? 'sent' : 'received'}`}>
                  {/* Sender Name */}
                  <div className="telegram-sender-name">
                    {msg.sender.fullName}
                  </div>

                  {/* Message Content or Edit Mode */}
                  {isEditing ? (
                    <div className="telegram-edit-container">
                      <input
                        type="text"
                        className="telegram-edit-input"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(msg._id);
                          }
                        }}
                        autoFocus
                      />
                      <div className="telegram-edit-actions">
                        <button
                          onClick={() => handleSaveEdit(msg._id)}
                          className="telegram-edit-save"
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="telegram-edit-cancel"
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Message Text */}
                      <div className="telegram-message-content">
                        {msg.message}
                      </div>

                      {/* Footer: Time + Actions */}
                      <div className="telegram-message-footer">
                        <span className="telegram-timestamp">
                          {new Date(msg.timestamp).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>

                        {msg.isEdited && (
                          <span className="telegram-edited-badge">edited</span>
                        )}

                        {/* Edit/Delete Icons (Shown on Hover - Only for Own Messages) */}
                        {isOwnMessage && (
                          <div className="telegram-message-actions">
                            <button
                              onClick={() => handleEditMessage(msg._id, msg.message)}
                              className="telegram-icon-btn edit-btn"
                              title="Edit message"
                            >
                              ✎
                            </button>
                            <button
                              onClick={() => handleDeleteMessage(msg._id)}
                              className="telegram-icon-btn delete-btn"
                              title="Delete message"
                            >
                              🗑
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area - Fixed at Bottom */}
      <form onSubmit={handleSubmit} className="telegram-input-area">
        <div className="telegram-input-wrapper">
          <input
            type="text"
            className="telegram-input"
            placeholder="Type your message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="telegram-send-btn"
          title="Send message"
        >
          <span className="telegram-send-icon">✈</span>
        </button>
      </form>
    </div>
  );
});

Chat.displayName = 'Chat';

export default Chat;
