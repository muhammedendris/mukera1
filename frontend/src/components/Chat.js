import React, { useState, useEffect, useRef, useCallback } from 'react';
import { chatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import io from 'socket.io-client';

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
    return <div>Loading chat...</div>;
  }

  return (
    <div className="chat-container" style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Chat Header */}
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
          title="Clear all messages"
        >
          🗑️ Clear Chat
        </button>
      </div>

      {/* Messages Area */}
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
          messages.map((msg) => {
            const isOwnMessage = msg.sender._id === user._id;
            const isEditing = editingMessageId === msg._id;

            return (
              <div
                key={msg._id}
                className={`chat-message ${
                  isOwnMessage ? 'message-sent' : 'message-received'
                }`}
                style={{
                  display: 'flex',
                  justifyContent: isOwnMessage ? 'flex-end' : 'flex-start',
                  marginBottom: '15px'
                }}
              >
                <div style={{
                  maxWidth: '70%',
                  padding: '12px 16px',
                  borderRadius: '18px',
                  background: isOwnMessage
                    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                    : '#e9ecef',
                  color: isOwnMessage ? 'white' : '#333',
                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.08)',
                  position: 'relative'
                }}>
                  {/* Sender Name */}
                  <div className="message-sender" style={{
                    fontSize: '12px',
                    fontWeight: '600',
                    marginBottom: '4px',
                    opacity: isOwnMessage ? 0.9 : 1,
                    color: isOwnMessage ? 'white' : '#667eea'
                  }}>
                    {msg.sender.fullName}
                  </div>

                  {/* Message Content or Edit Input */}
                  {isEditing ? (
                    <div>
                      <input
                        type="text"
                        value={editedText}
                        onChange={(e) => setEditedText(e.target.value)}
                        style={{
                          width: '100%',
                          padding: '8px',
                          border: '2px solid #667eea',
                          borderRadius: '8px',
                          fontSize: '15px',
                          marginBottom: '8px'
                        }}
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            handleSaveEdit(msg._id);
                          }
                        }}
                        autoFocus
                      />
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleSaveEdit(msg._id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          ✓ Save
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#6c757d',
                            color: 'white',
                            border: 'none',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '13px'
                          }}
                        >
                          ✕ Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="message-content" style={{
                        fontSize: '15px',
                        lineHeight: '1.5',
                        wordWrap: 'break-word'
                      }}>
                        {msg.message}
                      </div>

                      {/* Message Time and Edited Badge */}
                      <div className="message-time" style={{
                        fontSize: '11px',
                        marginTop: '4px',
                        opacity: 0.8,
                        display: 'flex',
                        gap: '8px',
                        alignItems: 'center'
                      }}>
                        <span>{new Date(msg.timestamp).toLocaleString()}</span>
                        {msg.isEdited && (
                          <span style={{
                            fontSize: '10px',
                            fontStyle: 'italic',
                            opacity: 0.7
                          }}>
                            (edited)
                          </span>
                        )}
                      </div>

                      {/* Edit/Delete Buttons (Only for Own Messages) */}
                      {isOwnMessage && (
                        <div style={{
                          marginTop: '8px',
                          display: 'flex',
                          gap: '8px'
                        }}>
                          <button
                            onClick={() => handleEditMessage(msg._id, msg.message)}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            title="Edit message"
                          >
                            ✏️ Edit
                          </button>
                          <button
                            onClick={() => handleDeleteMessage(msg._id)}
                            style={{
                              padding: '4px 10px',
                              backgroundColor: 'rgba(220, 53, 69, 0.9)',
                              color: 'white',
                              border: '1px solid rgba(255, 255, 255, 0.3)',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              fontSize: '12px',
                              fontWeight: '500'
                            }}
                            title="Delete message"
                          >
                            🗑️ Delete
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input Form */}
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
