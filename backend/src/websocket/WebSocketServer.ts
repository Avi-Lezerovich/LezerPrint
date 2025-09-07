import { Server as SocketIOServer } from 'socket.io';
import { Server as HTTPServer } from 'http';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface ClientInfo {
  userId?: string;
  role?: string;
  isDemo: boolean;
  connectedAt: number;
  lastActivity: number;
}

export interface PrinterStatus {
  state: 'idle' | 'printing' | 'paused' | 'error';
  temperatures: {
    hotend: { actual: number; target: number };
    bed: { actual: number; target: number };
    chamber?: { actual: number; target: number };
  };
  position: { x: number; y: number; z: number; e: number };
  currentJob?: {
    id: string;
    progress: number;
    estimatedTime?: number;
    remainingTime?: number;
  };
}

export interface TemperatureData {
  hotend: { actual: number; target: number };
  bed: { actual: number; target: number };
  chamber?: { actual: number; target: number };
  timestamp: number;
}

export interface ProgressData {
  jobId: string;
  progress: number;
  layer?: number;
  totalLayers?: number;
  estimatedTime?: number;
  remainingTime?: number;
  timestamp: number;
}

export interface Alert {
  id: string;
  type: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  timestamp: number;
  metadata?: any;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private clients: Map<string, ClientInfo> = new Map();
  private rooms = {
    authenticated: 'authenticated',
    demo: 'demo',
    statusUpdates: 'status-updates',
    temperatureUpdates: 'temperature-updates',
    cameraStream: 'camera-stream',
  };

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.FRONTEND_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupEventHandlers();
  }

  private setupMiddleware(): void {
    // Authentication middleware
    this.io.use(async (socket, next) => {
      try {
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
        
        if (!token) {
          // Allow demo mode connections
          socket.data = { isDemo: true };
          return next();
        }

        // Verify JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
        
        // Check if user exists and is active
        const user = await prisma.user.findUnique({
          where: { id: decoded.userId },
          select: { id: true, email: true, username: true, role: true },
        });

        if (!user) {
          return next(new Error('Authentication failed'));
        }

        socket.data = {
          userId: user.id,
          email: user.email,
          username: user.username,
          role: user.role,
          isDemo: false,
        };

        next();
      } catch (error) {
        // If token is invalid, allow as demo user
        socket.data = { isDemo: true };
        next();
      }
    });
  }

  private setupEventHandlers(): void {
    this.io.on('connection', (socket) => {
      const clientInfo: ClientInfo = {
        userId: socket.data.userId,
        role: socket.data.role,
        isDemo: socket.data.isDemo,
        connectedAt: Date.now(),
        lastActivity: Date.now(),
      };

      this.clients.set(socket.id, clientInfo);

      // Join appropriate rooms
      if (clientInfo.isDemo) {
        socket.join(this.rooms.demo);
        console.log(`Demo client connected: ${socket.id}`);
      } else {
        socket.join(this.rooms.authenticated);
        socket.join(`user:${clientInfo.userId}`);
        console.log(`Authenticated client connected: ${socket.id} (${socket.data.username})`);
      }

      // Handle subscriptions
      socket.on('subscribe:status', () => {
        socket.join(this.rooms.statusUpdates);
        this.sendCurrentStatus(socket);
      });

      socket.on('subscribe:temperature', () => {
        socket.join(this.rooms.temperatureUpdates);
        this.sendCurrentTemperature(socket);
      });

      socket.on('subscribe:camera', () => {
        if (this.canViewCamera(socket)) {
          socket.join(this.rooms.cameraStream);
        } else {
          socket.emit('error', { message: 'Demo users cannot access camera' });
        }
      });

      socket.on('unsubscribe:status', () => {
        socket.leave(this.rooms.statusUpdates);
      });

      socket.on('unsubscribe:temperature', () => {
        socket.leave(this.rooms.temperatureUpdates);
      });

      socket.on('unsubscribe:camera', () => {
        socket.leave(this.rooms.cameraStream);
      });

      // Control commands (authenticated users only)
      socket.on('control:pause', () => {
        if (this.canControl(socket)) {
          this.handlePrintControl('pause', socket);
        }
      });

      socket.on('control:resume', () => {
        if (this.canControl(socket)) {
          this.handlePrintControl('resume', socket);
        }
      });

      socket.on('control:stop', () => {
        if (this.canControl(socket)) {
          this.handlePrintControl('stop', socket);
        }
      });

      socket.on('control:emergency', () => {
        if (this.canControl(socket)) {
          this.handlePrintControl('emergency', socket);
        }
      });

      socket.on('control:command', (data) => {
        if (this.canControl(socket) && data.gcode) {
          this.handleGCodeCommand(data.gcode, socket);
        }
      });

      // File upload progress
      socket.on('file:upload:start', (data) => {
        if (!clientInfo.isDemo) {
          socket.emit('file:upload:ready', { uploadId: data.uploadId });
        }
      });

      // Activity tracking
      socket.on('activity', () => {
        const client = this.clients.get(socket.id);
        if (client) {
          client.lastActivity = Date.now();
        }
      });

      // Handle disconnection
      socket.on('disconnect', (reason) => {
        console.log(`Client disconnected: ${socket.id} (${reason})`);
        this.clients.delete(socket.id);
      });

      // Send initial connection status
      socket.emit('connected', {
        isDemo: clientInfo.isDemo,
        user: clientInfo.isDemo ? null : {
          id: clientInfo.userId,
          username: socket.data.username,
          role: clientInfo.role,
        },
        timestamp: Date.now(),
      });
    });
  }

  private canControl(socket: any): boolean {
    return !socket.data.isDemo && ['ADMIN', 'OPERATOR'].includes(socket.data.role);
  }

  private canViewCamera(socket: any): boolean {
    return !socket.data.isDemo; // Only authenticated users can view camera
  }

  private async sendCurrentStatus(socket: any): Promise<void> {
    // This would integrate with PrinterService to get current status
    // For now, sending mock data
    const status: PrinterStatus = {
      state: 'idle',
      temperatures: {
        hotend: { actual: 25, target: 0 },
        bed: { actual: 25, target: 0 },
      },
      position: { x: 0, y: 0, z: 0, e: 0 },
    };

    socket.emit('status:current', status);
  }

  private async sendCurrentTemperature(socket: any): Promise<void> {
    // This would integrate with PrinterService to get current temperature
    const temperature: TemperatureData = {
      hotend: { actual: 25, target: 0 },
      bed: { actual: 25, target: 0 },
      timestamp: Date.now(),
    };

    socket.emit('temperature:current', temperature);
  }

  private handlePrintControl(action: string, socket: any): void {
    // This would integrate with PrinterService
    console.log(`Print control action: ${action} by ${socket.data.username}`);
    socket.emit('control:response', { action, success: true });
    
    // Broadcast status update to all subscribers
    this.broadcastStatus({
      state: action === 'pause' ? 'paused' : action === 'resume' ? 'printing' : 'idle',
      temperatures: { hotend: { actual: 200, target: 200 }, bed: { actual: 60, target: 60 } },
      position: { x: 100, y: 100, z: 10, e: 50 },
    });
  }

  private handleGCodeCommand(gcode: string, socket: any): void {
    // This would integrate with PrinterService
    console.log(`G-code command: ${gcode} by ${socket.data.username}`);
    socket.emit('command:response', { gcode, response: 'ok' });
  }

  // Public broadcast methods
  public broadcastStatus(status: PrinterStatus): void {
    this.io.to(this.rooms.statusUpdates).emit('status:update', status);
  }

  public broadcastTemperature(temperature: TemperatureData): void {
    this.io.to(this.rooms.temperatureUpdates).emit('temperature:update', temperature);
  }

  public broadcastProgress(progress: ProgressData): void {
    this.io.to(this.rooms.authenticated).emit('progress:update', progress);
    
    // Send limited progress to demo users
    this.io.to(this.rooms.demo).emit('progress:update', {
      ...progress,
      jobId: 'demo-job',
    });
  }

  public broadcastAlert(alert: Alert): void {
    this.io.to(this.rooms.authenticated).emit('alert', alert);
    
    // Send public alerts to demo users
    if (['info', 'warning'].includes(alert.type)) {
      this.io.to(this.rooms.demo).emit('alert', alert);
    }
  }

  public sendToUser(userId: string, event: string, data: any): void {
    this.io.to(`user:${userId}`).emit(event, data);
  }

  // Camera streaming
  public streamCameraFrame(frame: Buffer): void {
    // Convert to base64 for web transmission
    const base64Frame = `data:image/jpeg;base64,${frame.toString('base64')}`;
    this.io.to(this.rooms.cameraStream).emit('camera:frame', { frame: base64Frame });
  }

  public broadcastNotification(notification: { userId: string; type: string; title: string; message: string }): void {
    this.sendToUser(notification.userId, 'notification', notification);
  }

  // Statistics
  public getConnectedClients(): { total: number; authenticated: number; demo: number } {
    const stats = { total: 0, authenticated: 0, demo: 0 };
    
    this.clients.forEach((client) => {
      stats.total++;
      if (client.isDemo) {
        stats.demo++;
      } else {
        stats.authenticated++;
      }
    });

    return stats;
  }

  public getClientInfo(): ClientInfo[] {
    return Array.from(this.clients.values());
  }
}
