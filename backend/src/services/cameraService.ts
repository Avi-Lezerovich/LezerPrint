import { Server } from 'socket.io';
import { createReadStream, existsSync } from 'fs';
import { join } from 'path';

export interface CameraSettings {
  enabled: boolean;
  streamUrl?: string;
  resolution: '720p' | '1080p' | '480p';
  framerate: number;
  rotation: 0 | 90 | 180 | 270;
}

export class CameraService {
  private io: Server;
  private isStreaming: boolean = false;
  private streamInterval?: NodeJS.Timeout;
  private settings: CameraSettings = {
    enabled: false,
    resolution: '720p',
    framerate: 15,
    rotation: 0,
  };

  constructor(io: Server) {
    this.io = io;
  }

  public getSettings(): CameraSettings {
    return { ...this.settings };
  }

  public updateSettings(newSettings: Partial<CameraSettings>): void {
    this.settings = { ...this.settings, ...newSettings };
    
    // Restart stream if settings changed and streaming is active
    if (this.isStreaming) {
      this.stopStream();
      this.startStream();
    }
  }

  public startStream(): boolean {
    if (this.isStreaming) {
      return true;
    }

    try {
      // For demo purposes, we'll simulate a camera stream
      // In a real implementation, this would connect to an actual camera
      this.isStreaming = true;
      this.simulateCameraStream();
      
      console.log('Camera stream started');
      return true;
    } catch (error) {
      console.error('Failed to start camera stream:', error);
      return false;
    }
  }

  public stopStream(): void {
    if (!this.isStreaming) {
      return;
    }

    this.isStreaming = false;
    if (this.streamInterval) {
      clearInterval(this.streamInterval);
      this.streamInterval = undefined;
    }

    this.io.emit('camera:stream-stopped');
    console.log('Camera stream stopped');
  }

  public takeSnapshot(): Promise<{ success: boolean; filename?: string; error?: string }> {
    return new Promise((resolve) => {
      try {
        // For demo purposes, we'll create a mock snapshot
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const filename = `snapshot-${timestamp}.jpg`;
        
        // In a real implementation, this would capture from the camera
        // For now, we'll just return success with a mock filename
        setTimeout(() => {
          resolve({ 
            success: true, 
            filename,
          });
        }, 500);
        
      } catch (error) {
        resolve({ 
          success: false, 
          error: error instanceof Error ? error.message : 'Failed to take snapshot' 
        });
      }
    });
  }

  public getStreamStatus(): { isStreaming: boolean; settings: CameraSettings } {
    return {
      isStreaming: this.isStreaming,
      settings: this.getSettings(),
    };
  }

  private simulateCameraStream(): void {
    // Simulate MJPEG frames for demo mode
    this.streamInterval = setInterval(() => {
      if (!this.isStreaming) return;

      // Generate mock frame data
      const mockFrame = {
        timestamp: Date.now(),
        frameNumber: Math.floor(Math.random() * 10000),
        quality: 'good',
        // In a real implementation, this would be base64 encoded image data
        data: 'data:image/svg+xml;base64,' + Buffer.from(this.generateMockCameraFrame()).toString('base64'),
      };

      this.io.emit('camera:frame', mockFrame);
    }, 1000 / this.settings.framerate);
  }

  private generateMockCameraFrame(): string {
    // Generate a simple SVG that looks like a camera view of a 3D printer
    const timestamp = new Date().toLocaleTimeString();
    
    return `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
      <!-- Background -->
      <rect width="640" height="480" fill="#1a1a1a"/>
      
      <!-- Print bed outline -->
      <rect x="120" y="180" width="400" height="280" fill="none" stroke="#444" stroke-width="2" rx="8"/>
      
      <!-- Print bed grid -->
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#333" stroke-width="1"/>
        </pattern>
      </defs>
      <rect x="120" y="180" width="400" height="280" fill="url(#grid)"/>
      
      <!-- Simulated print object (changes position slightly for animation) -->
      <circle cx="${320 + Math.sin(Date.now() / 1000) * 2}" cy="${320 + Math.cos(Date.now() / 1000) * 2}" r="30" fill="#ff6b35" opacity="0.8"/>
      
      <!-- Hotend indicator -->
      <circle cx="320" cy="200" r="8" fill="#ff4444"/>
      <circle cx="320" cy="200" r="12" fill="none" stroke="#ff4444" stroke-width="1" opacity="0.5"/>
      
      <!-- Temperature overlay -->
      <text x="20" y="30" fill="#00ff88" font-family="monospace" font-size="14">Hotend: 210°C</text>
      <text x="20" y="50" fill="#4488ff" font-family="monospace" font-size="14">Bed: 60°C</text>
      
      <!-- Timestamp -->
      <text x="20" y="460" fill="#888" font-family="monospace" font-size="12">${timestamp}</text>
      
      <!-- Demo watermark -->
      <text x="500" y="460" fill="#666" font-family="sans-serif" font-size="12">DEMO MODE</text>
    </svg>`;
  }
}