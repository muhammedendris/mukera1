const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const compression = require('compression');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');

// Load environment variables
dotenv.config();

const fs = require('fs');

// Ensure upload directories exist on server startup
const uploadDirs = [
  path.join(__dirname, 'uploads'),
  path.join(__dirname, 'uploads/id-cards'),
  path.join(__dirname, 'uploads/reports'),
  path.join(__dirname, 'uploads/acceptance-letters'),
  path.join(__dirname, 'uploads/attachments'),
  path.join(__dirname, 'uploads/live-photos')
];

uploadDirs.forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`📁 Created upload directory: ${dir}`);
  }
});

// Create Express app
const app = express();
const server = http.createServer(app);

// Initialize Socket.io
const io = new Server(server, {
  cors: {
    origin: '*', // Allow all origins (matches HTTP CORS behavior)
    methods: ['GET', 'POST'],
    credentials: false // Must be false when origin is '*'
  }
});

// Make io accessible to routes
app.set('io', io);

// Middleware
app.use(compression()); // Enable gzip compression for all responses
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const applicationRoutes = require('./routes/applications');
const advisorRoutes = require('./routes/advisors');
const chatRoutes = require('./routes/chats');
const evaluationRoutes = require('./routes/evaluations');
const reportRoutes = require('./routes/reports');
const contactRoutes = require('./routes/contact');
const studentRoutes = require('./routes/students');
const downloadRoutes = require('./routes/download');

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/advisors', advisorRoutes);
app.use('/api/chats', chatRoutes);
app.use('/api/evaluations', evaluationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/download', downloadRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Internship Management System API',
    version: '1.0.0'
  });
});

// Database connection (MODIFIED TO FIX ETIMEOUT)
const connectDB = async () => {
  try {
    // እዚህ ጋር ነው ለውጡ! የ Atlas አድራሻዎችን በቀጥታ አስገብተናል (Hardcoded)
    // ይህ የ DNS ችግርን ይቀርፋል
    const mongoURI = 'mongodb://muhammedendris:mau1401867@ac-vfrshjj-shard-00-00.ggluymy.mongodb.net:27017,ac-vfrshjj-shard-00-01.ggluymy.mongodb.net:27017,ac-vfrshjj-shard-00-02.ggluymy.mongodb.net:27017/internship-management?ssl=true&authSource=admin&retryWrites=true&w=majority';

    await mongoose.connect(mongoURI); 
    
    console.log('✅ MongoDB Connected Successfully to ATLAS (Online)');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    process.exit(1);
  }
};

// Socket.io connection handling
io.on('connection', (socket) => {
  console.log('✅ Socket.io client connected:', socket.id);
  console.log('   Auth token:', socket.handshake.auth.token ? 'Present' : 'Missing');

  socket.on('join-chat', (applicationId) => {
    socket.join(`chat-${applicationId}`);
    console.log(`📥 Socket ${socket.id} joined room: chat-${applicationId}`);
  });

  socket.on('leave-chat', (applicationId) => {
    socket.leave(`chat-${applicationId}`);
    console.log(`📤 Socket ${socket.id} left room: chat-${applicationId}`);
  });

  socket.on('typing', ({ applicationId, isTyping }) => {
    socket.to(`chat-${applicationId}`).emit('user-typing', { isTyping });
  });

  socket.on('disconnect', () => {
    console.log('⚠️ Client disconnected:', socket.id);
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Global error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal server error',
    error: process.env.NODE_ENV === 'development' ? err : {}
  });
});

// Start server
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  server.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});