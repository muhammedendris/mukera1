import React, { useState, useEffect, useRef } from 'react';
import * as Avatar from '@radix-ui/react-avatar';
import { Send, Paperclip, X, Phone, MoreVertical, Search } from 'lucide-react';
import { io } from 'socket.io-client';

const ChatInterface = ({ user }) => {
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Socket.IO
  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
      auth: {
        token: localStorage.getItem('token'),
      },
    });

    // Listen for new messages
    socketRef.current.on('message', (message) => {
      if (message.chatId === activeConversation?._id) {
        setMessages((prev) => [...prev, message]);
      }
      // Update conversation list
      fetchConversations();
    });

    // Listen for typing indicators
    socketRef.current.on('typing', ({ chatId, isTyping: typing }) => {
      if (chatId === activeConversation?._id) {
        setIsTyping(typing);
      }
    });

    return () => {
      socketRef.current?.disconnect();
    };
  }, [activeConversation]);

  // Fetch conversations on mount
  useEffect(() => {
    fetchConversations();
  }, []);

  // Fetch messages when conversation changes
  useEffect(() => {
    if (activeConversation) {
      fetchMessages(activeConversation._id);
    }
  }, [activeConversation]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await fetch('/api/chats', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setConversations(data.chats);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const response = await fetch(`/api/chats/${chatId}/messages`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        setMessages(data.messages);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageInput.trim() && !attachedFile) return;

    const formData = new FormData();
    formData.append('text', messageInput);
    if (attachedFile) {
      formData.append('file', attachedFile);
    }

    try {
      const response = await fetch(`/api/chats/${activeConversation._id}/messages`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        setMessageInput('');
        setAttachedFile(null);
        socketRef.current.emit('message', data.message);
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleTyping = (e) => {
    setMessageInput(e.target.value);
    socketRef.current.emit('typing', {
      chatId: activeConversation._id,
      isTyping: e.target.value.length > 0,
    });
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachedFile(file);
    }
  };

  const getTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    return `${Math.floor(seconds / 86400)}d ago`;
  };

  const formatMessageTime = (date) => {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  };

  const filteredConversations = conversations.filter((conv) =>
    conv.participant?.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-64px)] bg-white">
      {/* Conversations Sidebar */}
      <div className="w-80 border-r border-gray-200 flex flex-col">
        {/* Header */}
        <div className="h-14 px-5 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
          <h2 className="text-lg font-semibold text-black">Messages</h2>
          <button className="w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
            <MoreVertical className="w-5 h-5 text-gray-700" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-gray-200 flex-shrink-0">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search conversations"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 border border-gray-200 rounded-lg text-sm focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200"
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conv) => (
              <div
                key={conv._id}
                onClick={() => setActiveConversation(conv)}
                className={`p-3 cursor-pointer border-b border-gray-100 transition-colors duration-150 ${
                  activeConversation?._id === conv._id
                    ? 'bg-info border-l-3 border-blue-accent'
                    : 'hover:bg-gray-50'
                }`}
              >
                <div className="flex items-start gap-3">
                  <Avatar.Root className="inline-flex items-center justify-center w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                    <Avatar.Image
                      src={conv.participant?.avatar}
                      alt={conv.participant?.fullName}
                      className="w-full h-full object-cover"
                    />
                    <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-accent to-blue-hover text-white text-base font-semibold">
                      {conv.participant?.fullName?.split(' ').map(n => n[0]).join('')}
                    </Avatar.Fallback>
                  </Avatar.Root>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-baseline justify-between mb-1">
                      <h3 className="text-base font-semibold text-black truncate">
                        {conv.participant?.fullName}
                      </h3>
                      <span className="text-xs text-gray-400 ml-2 flex-shrink-0">
                        {getTimeAgo(conv.lastMessage?.createdAt)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 truncate">
                      {conv.lastMessage?.text || 'No messages yet'}
                    </p>
                  </div>

                  {conv.unreadCount > 0 && (
                    <div className="w-5 h-5 rounded-full bg-blue-accent text-white text-xs font-semibold flex items-center justify-center flex-shrink-0">
                      {conv.unreadCount}
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center">
              <p className="text-base text-gray-700">No conversations found</p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      {activeConversation ? (
        <div className="flex-1 flex flex-col">
          {/* Chat Header */}
          <div className="h-18 px-6 border-b border-gray-200 flex items-center justify-between flex-shrink-0">
            <div className="flex items-center gap-3">
              <Avatar.Root className="inline-flex items-center justify-center w-10 h-10 rounded-full overflow-hidden">
                <Avatar.Image
                  src={activeConversation.participant?.avatar}
                  alt={activeConversation.participant?.fullName}
                  className="w-full h-full object-cover"
                />
                <Avatar.Fallback className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-accent to-blue-hover text-white text-sm font-semibold">
                  {activeConversation.participant?.fullName?.split(' ').map(n => n[0]).join('')}
                </Avatar.Fallback>
              </Avatar.Root>

              <div>
                <h3 className="text-lg font-semibold text-black">
                  {activeConversation.participant?.fullName}
                </h3>
                <p className="text-sm text-success">
                  {activeConversation.participant?.role} • Online
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button className="w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <Phone className="w-5 h-5 text-gray-700" />
              </button>
              <button className="w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center">
                <MoreVertical className="w-5 h-5 text-gray-700" />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => {
              const isSent = message.sender === user._id;
              return (
                <div
                  key={message._id}
                  className={`flex flex-col ${isSent ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl text-base leading-relaxed ${
                      isSent
                        ? 'bg-blue-accent text-white rounded-br-sm'
                        : 'bg-gray-100 text-black rounded-bl-sm'
                    }`}
                  >
                    {message.text}
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-xs text-gray-400">
                      {formatMessageTime(message.createdAt)}
                    </span>
                    {isSent && message.read && (
                      <span className="text-xs text-blue-accent">✓✓</span>
                    )}
                  </div>
                </div>
              );
            })}

            {isTyping && (
              <div className="flex items-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-sm">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* File Attachment Preview */}
          {attachedFile && (
            <div className="px-6 py-3 border-t border-gray-200 bg-gray-50">
              <div className="flex items-center justify-between p-3 bg-info border border-blue-accent rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded bg-blue-accent bg-opacity-20 flex items-center justify-center">
                    <Paperclip className="w-5 h-5 text-blue-accent" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">{attachedFile.name}</p>
                    <p className="text-xs text-gray-700">
                      {(attachedFile.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAttachedFile(null)}
                  className="w-6 h-6 rounded hover:bg-error hover:text-white transition-colors flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="h-18 px-6 py-4 border-t border-gray-200 flex items-center gap-3 flex-shrink-0">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center flex-shrink-0"
            >
              <Paperclip className="w-5 h-5 text-gray-700" />
            </button>

            <input
              type="text"
              value={messageInput}
              onChange={handleTyping}
              placeholder="Type a message..."
              className="flex-1 h-10 px-4 border border-gray-200 rounded-full text-base focus:border-blue-accent focus:ring-2 focus:ring-blue-accent focus:ring-opacity-20 outline-none transition-all duration-200"
            />

            <button
              type="submit"
              disabled={!messageInput.trim() && !attachedFile}
              className="w-10 h-10 bg-blue-accent text-white rounded-full hover:bg-blue-hover transition-all duration-200 flex items-center justify-center flex-shrink-0 disabled:bg-gray-200 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
            </button>
          </form>
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
              <MoreVertical className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-black mb-2">
              Select a conversation
            </h3>
            <p className="text-base text-gray-700">
              Choose a conversation from the list to start messaging
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;
