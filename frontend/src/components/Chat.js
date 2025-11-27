import React, { useState, useEffect, useRef } from 'react';
import { chatsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Chat = ({ applicationId }) => {
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadMessages();
    // Poll for new messages every 5 seconds
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [applicationId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadMessages = async () => {
    try {
      const response = await chatsAPI.getHistory(applicationId);
      setMessages(response.data.chats);
    } catch (error) {
      console.error('Failed to load messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await chatsAPI.send({
        applicationId,
        message: newMessage
      });
      setNewMessage('');
      loadMessages();
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  if (loading) {
    return <div>Loading chat...</div>;
  }

  return (
    <div className="chat-container">
      <div className="chat-messages">
        {messages.length === 0 ? (
          <p className="text-center">No messages yet. Start a conversation!</p>
        ) : (
          messages.map((msg) => (
            <div
              key={msg._id}
              className={`chat-message ${
                msg.sender._id === user._id ? 'message-sent' : 'message-received'
              }`}
            >
              <div className="message-sender">{msg.sender.fullName}</div>
              <div className="message-content">{msg.message}</div>
              <div className="message-time">
                {new Date(msg.timestamp).toLocaleString()}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="chat-form">
        <input
          type="text"
          className="form-control"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
        />
        <button type="submit" className="btn btn-primary">
          Send
        </button>
      </form>
    </div>
  );
};

export default Chat;
