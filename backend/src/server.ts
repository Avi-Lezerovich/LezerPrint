import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import cameraRoutes, { setCameraService } from './routes/camera.routes';
import historyRoutes, { setHistoryService } from './routes/history.routes';
import printerApiRoutes from './api/routes/printer.routes';
import filesApiRoutes from './api/routes/files.routes';
import jobsApiRoutes from './api/routes/jobs.routes';
import analyticsApiRoutes from './api/routes/analytics.routes';
import { CameraService } from './services/cameraService';
import { PrintHistoryService } from './services/printHistoryService';

// Load environment variables
dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: { 
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use(morgan('combined'));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Basic API status
app.get('/api/status', (req, res) => {
  res.json({
    server: 'LezerPrint Backend',
    status: 'running',
    timestamp: new Date().toISOString()
  });
});

// Initialize services
const cameraService = new CameraService(io);
const historyService = new PrintHistoryService(io);
setCameraService(cameraService);
setHistoryService(historyService);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/camera', cameraRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/printer', printerApiRoutes);
app.use('/api/files', filesApiRoutes);
app.use('/api/jobs', jobsApiRoutes);
app.use('/api/analytics', analyticsApiRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
  
  // Send initial status
  socket.emit('status', { 
    connected: true,
    message: 'Connected to LezerPrint server'
  });
});

// Start server
const PORT = process.env.PORT || 3001;
httpServer.listen(PORT, () => {
  console.log(`LezerPrint backend server running on port ${PORT}`);
  console.log(`Health check available at http://localhost:${PORT}/api/health`);
});

export default app;