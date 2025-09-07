import { Server } from 'socket.io';
import { EventEmitter } from 'events';

export interface GCodeCommand {
  id: string;
  command: string;
  timestamp: Date;
  userId: string;
  priority: boolean;
  status: 'queued' | 'executing' | 'completed' | 'error';
  response?: string;
  error?: string;
  executionTime?: number;
}

export interface TerminalSession {
  id: string;
  userId: string;
  startTime: Date;
  lastActivity: Date;
  commandCount: number;
  isActive: boolean;
}

export class GCodeTerminalService extends EventEmitter {
  private io: Server;
  private commandQueue: GCodeCommand[] = [];
  private commandHistory: GCodeCommand[] = [];
  private sessions: Map<string, TerminalSession> = new Map();
  private isProcessing: boolean = false;
  private currentCommand: GCodeCommand | null = null;
  private maxHistorySize: number = 1000;
  private maxQueueSize: number = 100;

  // Mock printer responses for demo
  private mockResponsePatterns = new Map<string, string>([
    ['M105', 'ok T:210.0 /210.0 B:60.0 /60.0 @:127 B@:127'],
    ['M114', 'ok X:150.0 Y:150.0 Z:10.0 E:0.0 Count X:12000 Y:12000 Z:800'],
    ['G28', 'ok'],
    ['M119', 'ok x_min:TRIGGERED y_min:open z_min:open'],
    ['M503', 'ok Settings stored to EEPROM'],
    ['G1', 'ok'],
    ['G0', 'ok'],
    ['M104', 'ok'],
    ['M140', 'ok'],
    ['M109', 'ok'],
    ['M190', 'ok'],
    ['M106', 'ok'],
    ['M107', 'ok'],
  ]);

  constructor(io: Server) {
    super();
    this.io = io;
    this.startCommandProcessor();
    this.setupCleanupInterval();
  }

  public createSession(userId: string): TerminalSession {
    const sessionId = `session_${userId}_${Date.now()}`;
    const session: TerminalSession = {
      id: sessionId,
      userId,
      startTime: new Date(),
      lastActivity: new Date(),
      commandCount: 0,
      isActive: true,
    };

    this.sessions.set(sessionId, session);
    
    // Emit session created event
    this.io.to(`user:${userId}`).emit('terminal:session:created', { session });
    
    return session;
  }

  public async sendCommand(
    command: string, 
    userId: string, 
    priority: boolean = false,
    sessionId?: string
  ): Promise<GCodeCommand> {
    // Validate command
    this.validateCommand(command);

    // Check queue size
    if (this.commandQueue.length >= this.maxQueueSize) {
      throw new Error('Command queue is full. Please wait for commands to complete.');
    }

    // Update session activity
    if (sessionId) {
      const session = this.sessions.get(sessionId);
      if (session && session.userId === userId) {
        session.lastActivity = new Date();
        session.commandCount++;
      }
    }

    const gcodeCommand: GCodeCommand = {
      id: `cmd_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      command: command.trim().toUpperCase(),
      timestamp: new Date(),
      userId,
      priority,
      status: 'queued',
    };

    // Add to queue (priority commands go to front)
    if (priority) {
      this.commandQueue.unshift(gcodeCommand);
    } else {
      this.commandQueue.push(gcodeCommand);
    }

    // Add to history
    this.addToHistory(gcodeCommand);

    // Emit command queued event
    this.emitCommandUpdate(gcodeCommand);

    return gcodeCommand;
  }

  public getCommandHistory(
    userId: string, 
    limit: number = 50, 
    offset: number = 0
  ): GCodeCommand[] {
    return this.commandHistory
      .filter(cmd => cmd.userId === userId)
      .slice(offset, offset + limit)
      .reverse(); // Most recent first
  }

  public getQueueStatus(): { 
    queueLength: number; 
    isProcessing: boolean; 
    currentCommand: GCodeCommand | null;
  } {
    return {
      queueLength: this.commandQueue.length,
      isProcessing: this.isProcessing,
      currentCommand: this.currentCommand,
    };
  }

  public clearQueue(userId: string): number {
    const initialLength = this.commandQueue.length;
    
    // Only allow clearing own commands or if admin
    this.commandQueue = this.commandQueue.filter(cmd => cmd.userId !== userId);
    
    const clearedCount = initialLength - this.commandQueue.length;
    
    // Emit queue cleared event
    this.io.to(`user:${userId}`).emit('terminal:queue:cleared', { count: clearedCount });
    
    return clearedCount;
  }

  public async emergencyStop(userId: string): Promise<void> {
    // Clear all commands from queue
    this.commandQueue = [];
    
    // Mark current command as interrupted
    if (this.currentCommand) {
      this.currentCommand.status = 'error';
      this.currentCommand.error = 'Emergency stop executed';
      this.currentCommand = null;
    }

    // Send emergency stop command immediately
    const emergencyCommand: GCodeCommand = {
      id: `emergency_${Date.now()}`,
      command: 'M112', // Emergency Stop
      timestamp: new Date(),
      userId,
      priority: true,
      status: 'executing',
    };

    // Simulate emergency stop response
    setTimeout(() => {
      emergencyCommand.status = 'completed';
      emergencyCommand.response = 'ok Emergency Stop';
      emergencyCommand.executionTime = 50;
      
      this.emitCommandUpdate(emergencyCommand);
      this.addToHistory(emergencyCommand);
    }, 50);

    // Broadcast emergency stop to all connected users
    this.io.emit('terminal:emergency:stop', { 
      executedBy: userId,
      timestamp: new Date()
    });
  }

  public getSessionInfo(sessionId: string): TerminalSession | null {
    return this.sessions.get(sessionId) || null;
  }

  public closeSession(sessionId: string): boolean {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.isActive = false;
      session.lastActivity = new Date();
      
      // Emit session closed event
      this.io.to(`user:${session.userId}`).emit('terminal:session:closed', { sessionId });
      
      return true;
    }
    return false;
  }

  public getPopularCommands(): Array<{ command: string; count: number; description: string }> {
    const commandCounts = new Map<string, number>();
    
    this.commandHistory.forEach(cmd => {
      const baseCommand = cmd.command.split(' ')[0];
      commandCounts.set(baseCommand, (commandCounts.get(baseCommand) || 0) + 1);
    });

    const commands = Array.from(commandCounts.entries())
      .map(([command, count]) => ({
        command,
        count,
        description: this.getCommandDescription(command),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 20);

    return commands;
  }

  private validateCommand(command: string): void {
    const trimmed = command.trim();
    
    if (!trimmed) {
      throw new Error('Command cannot be empty');
    }

    if (trimmed.length > 200) {
      throw new Error('Command too long (max 200 characters)');
    }

    // Basic G-code validation
    const gcodePattern = /^[A-Z][0-9]*(\s+[A-Z][-\d.]+)*$/i;
    if (!gcodePattern.test(trimmed)) {
      throw new Error('Invalid G-code format');
    }

    // Check for dangerous commands in production
    if (process.env.NODE_ENV === 'production') {
      const dangerousCommands = ['M112', 'M999', 'M502'];
      const baseCommand = trimmed.split(' ')[0].toUpperCase();
      if (dangerousCommands.includes(baseCommand)) {
        throw new Error(`Command ${baseCommand} requires elevated privileges`);
      }
    }
  }

  private async startCommandProcessor(): Promise<void> {
    setInterval(async () => {
      if (!this.isProcessing && this.commandQueue.length > 0) {
        await this.processNextCommand();
      }
    }, 100); // Check every 100ms
  }

  private async processNextCommand(): Promise<void> {
    if (this.commandQueue.length === 0 || this.isProcessing) {
      return;
    }

    this.isProcessing = true;
    this.currentCommand = this.commandQueue.shift()!;
    this.currentCommand.status = 'executing';

    // Emit command started
    this.emitCommandUpdate(this.currentCommand);

    try {
      const startTime = Date.now();
      
      // Simulate command execution with mock printer
      const response = await this.executeCommand(this.currentCommand.command);
      
      const executionTime = Date.now() - startTime;
      
      this.currentCommand.status = 'completed';
      this.currentCommand.response = response;
      this.currentCommand.executionTime = executionTime;
      
      // Emit command completed
      this.emitCommandUpdate(this.currentCommand);
      
    } catch (error) {
      this.currentCommand.status = 'error';
      this.currentCommand.error = error instanceof Error ? error.message : 'Unknown error';
      
      // Emit command error
      this.emitCommandUpdate(this.currentCommand);
    }

    this.currentCommand = null;
    this.isProcessing = false;
  }

  private async executeCommand(command: string): Promise<string> {
    // Simulate network delay
    await this.delay(200 + Math.random() * 800);

    const baseCommand = command.split(' ')[0];
    
    // Check for mock responses
    for (const [pattern, response] of this.mockResponsePatterns.entries()) {
      if (baseCommand === pattern) {
        return response;
      }
    }

    // Handle parameter-based commands
    if (baseCommand.startsWith('M104') || baseCommand.startsWith('M109')) {
      const match = command.match(/S(\d+)/);
      const temp = match ? match[1] : '200';
      return `ok Target temperature set to ${temp}°C`;
    }

    if (baseCommand.startsWith('M140') || baseCommand.startsWith('M190')) {
      const match = command.match(/S(\d+)/);
      const temp = match ? match[1] : '60';
      return `ok Bed target temperature set to ${temp}°C`;
    }

    if (baseCommand.startsWith('G1') || baseCommand.startsWith('G0')) {
      return 'ok Movement completed';
    }

    if (baseCommand.startsWith('M106')) {
      const match = command.match(/S(\d+)/);
      const speed = match ? Math.round((parseInt(match[1]) / 255) * 100) : 100;
      return `ok Fan speed set to ${speed}%`;
    }

    // Default response for unknown commands
    if (Math.random() > 0.1) {
      return 'ok';
    } else {
      throw new Error('Error: Unknown command');
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private addToHistory(command: GCodeCommand): void {
    this.commandHistory.unshift(command);
    
    // Trim history to max size
    if (this.commandHistory.length > this.maxHistorySize) {
      this.commandHistory = this.commandHistory.slice(0, this.maxHistorySize);
    }
  }

  private emitCommandUpdate(command: GCodeCommand): void {
    // Emit to specific user
    this.io.to(`user:${command.userId}`).emit('terminal:command:update', command);
    
    // Emit to all authenticated users (excluding sensitive data)
    this.io.to('authenticated').emit('terminal:activity', {
      commandId: command.id,
      status: command.status,
      timestamp: command.timestamp,
    });
  }

  private setupCleanupInterval(): void {
    // Clean up old inactive sessions every hour
    setInterval(() => {
      const cutoffTime = Date.now() - (60 * 60 * 1000); // 1 hour ago
      
      for (const [sessionId, session] of this.sessions.entries()) {
        if (session.lastActivity.getTime() < cutoffTime) {
          session.isActive = false;
          this.sessions.delete(sessionId);
        }
      }
    }, 60 * 60 * 1000); // Every hour
  }

  private getCommandDescription(command: string): string {
    const descriptions: { [key: string]: string } = {
      'G28': 'Auto home all axes',
      'G1': 'Linear move',
      'G0': 'Rapid move',
      'M105': 'Get extruder temperature',
      'M104': 'Set extruder temperature',
      'M109': 'Set extruder temperature and wait',
      'M140': 'Set bed temperature',
      'M190': 'Set bed temperature and wait',
      'M106': 'Fan on',
      'M107': 'Fan off',
      'M114': 'Get current position',
      'M119': 'Get endstop status',
      'M503': 'Report settings',
      'M112': 'Emergency stop',
      'M999': 'Restart after emergency stop',
      'G92': 'Set position',
      'M82': 'Set E absolute',
      'M83': 'Set E relative',
      'G90': 'Set absolute positioning',
      'G91': 'Set relative positioning',
    };

    return descriptions[command] || 'Custom G-code command';
  }
}