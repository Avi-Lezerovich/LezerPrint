import { api } from '@/services/api';

export interface CameraSettings {
  enabled: boolean;
  streamUrl?: string;
  resolution: '720p' | '1080p' | '480p';
  framerate: number;
  rotation: 0 | 90 | 180 | 270;
}

export interface CameraStatus {
  isStreaming: boolean;
  settings: CameraSettings;
  demo?: boolean;
}

export interface SnapshotResult {
  success: boolean;
  filename?: string;
  timestamp?: string;
  error?: string;
}

export interface CameraFrame {
  timestamp: number;
  frameNumber: number;
  quality: string;
  data: string;
}

class CameraService {
  async getStatus(): Promise<CameraStatus> {
    const response = await api.get('/camera/status');
    return response.data;
  }

  async getDemoStatus(): Promise<CameraStatus> {
    const response = await api.get('/camera/demo/status');
    return response.data;
  }

  async startStream(): Promise<{ message: string; status: CameraStatus }> {
    const response = await api.post('/camera/start');
    return response.data;
  }

  async stopStream(): Promise<{ message: string; status: CameraStatus }> {
    const response = await api.post('/camera/stop');
    return response.data;
  }

  async takeSnapshot(): Promise<SnapshotResult> {
    const response = await api.post('/camera/snapshot');
    return response.data;
  }

  async updateSettings(settings: Partial<CameraSettings>): Promise<{ message: string; settings: CameraSettings }> {
    const response = await api.put('/camera/settings', settings);
    return response.data;
  }

  // Mock snapshot for demo mode
  async takeDemoSnapshot(): Promise<SnapshotResult> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const timestamp = new Date().toISOString();
        const filename = `demo-snapshot-${timestamp.replace(/[:.]/g, '-')}.jpg`;
        
        resolve({
          success: true,
          filename,
          timestamp,
        });
      }, 800); // Simulate processing time
    });
  }

  // Generate mock camera frame for demo
  generateDemoFrame(): CameraFrame {
    return {
      timestamp: Date.now(),
      frameNumber: Math.floor(Math.random() * 10000),
      quality: 'good',
      data: this.createDemoFrameData(),
    };
  }

  private createDemoFrameData(): string {
    // Create a simple demo frame representation
    const timestamp = new Date().toLocaleTimeString();
    const hotendTemp = (210 + (Math.random() - 0.5) * 4).toFixed(1);
    const bedTemp = (60 + (Math.random() - 0.5) * 2).toFixed(1);
    
    const svg = `<svg width="640" height="480" xmlns="http://www.w3.org/2000/svg">
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
      
      <!-- Simulated print object -->
      <circle cx="${320 + Math.sin(Date.now() / 1000) * 3}" cy="${320 + Math.cos(Date.now() / 1000) * 3}" r="25" fill="#ff6b35" opacity="0.8"/>
      <circle cx="${320 + Math.sin(Date.now() / 1000) * 3}" cy="${320 + Math.cos(Date.now() / 1000) * 3}" r="35" fill="none" stroke="#ff6b35" stroke-width="1" opacity="0.3"/>
      
      <!-- Hotend indicator -->
      <circle cx="320" cy="200" r="6" fill="#ff4444"/>
      <circle cx="320" cy="200" r="12" fill="none" stroke="#ff4444" stroke-width="1" opacity="0.6"/>
      
      <!-- Extruder arm simulation -->
      <line x1="320" y1="200" x2="${320 + Math.sin(Date.now() / 2000) * 50}" y2="200" stroke="#666" stroke-width="3"/>
      
      <!-- Temperature overlay -->
      <rect x="10" y="10" width="200" height="70" fill="rgba(0,0,0,0.7)" rx="5"/>
      <text x="20" y="30" fill="#00ff88" font-family="monospace" font-size="14">Hotend: ${hotendTemp}°C</text>
      <text x="20" y="50" fill="#4488ff" font-family="monospace" font-size="14">Bed: ${bedTemp}°C</text>
      <text x="20" y="70" fill="#ffaa00" font-family="monospace" font-size="12">Print: 67.3%</text>
      
      <!-- Status indicator -->
      <circle cx="600" cy="30" r="8" fill="#00ff88"/>
      <text x="570" y="50" fill="#00ff88" font-family="monospace" font-size="12">LIVE</text>
      
      <!-- Timestamp -->
      <text x="20" y="460" fill="#888" font-family="monospace" font-size="12">${timestamp}</text>
      
      <!-- Demo watermark -->
      <text x="480" y="460" fill="#666" font-family="sans-serif" font-size="14">DEMO MODE</text>
    </svg>`;

    // Browser-safe base64 encoding
    const base64 = typeof window !== 'undefined'
      ? btoa(unescape(encodeURIComponent(svg)))
      : Buffer.from(svg).toString('base64');
    return 'data:image/svg+xml;base64,' + base64;
  }
}

export const cameraService = new CameraService();