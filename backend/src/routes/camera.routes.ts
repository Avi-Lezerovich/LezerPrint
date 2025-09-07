import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { CameraService } from '../services/cameraService';

const router = express.Router();

// Get camera service instance (will be injected)
let cameraService: CameraService;

export const setCameraService = (service: CameraService) => {
  cameraService = service;
};

// GET /api/camera/status - Get camera status and settings
router.get('/status', authenticateToken, async (req: Request, res: Response) => {
  try {
    const status = cameraService.getStreamStatus();
    res.json(status);
  } catch (error) {
    console.error('Error getting camera status:', error);
    res.status(500).json({ 
      error: 'Failed to get camera status',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/camera/start - Start camera stream
router.post('/start', authenticateToken, async (req: Request, res: Response) => {
  try {
    const success = cameraService.startStream();
    
    if (success) {
      res.json({ 
        message: 'Camera stream started successfully',
        status: cameraService.getStreamStatus()
      });
    } else {
      res.status(500).json({ error: 'Failed to start camera stream' });
    }
  } catch (error) {
    console.error('Error starting camera stream:', error);
    res.status(500).json({ 
      error: 'Failed to start camera stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/camera/stop - Stop camera stream
router.post('/stop', authenticateToken, async (req: Request, res: Response) => {
  try {
    cameraService.stopStream();
    res.json({ 
      message: 'Camera stream stopped successfully',
      status: cameraService.getStreamStatus()
    });
  } catch (error) {
    console.error('Error stopping camera stream:', error);
    res.status(500).json({ 
      error: 'Failed to stop camera stream',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/camera/snapshot - Take a snapshot
router.post('/snapshot', authenticateToken, async (req: Request, res: Response) => {
  try {
    const result = await cameraService.takeSnapshot();
    
    if (result.success) {
      res.json({
        message: 'Snapshot taken successfully',
        filename: result.filename,
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({ 
        error: 'Failed to take snapshot',
        details: result.error 
      });
    }
  } catch (error) {
    console.error('Error taking snapshot:', error);
    res.status(500).json({ 
      error: 'Failed to take snapshot',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/camera/settings - Update camera settings
router.put('/settings', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { enabled, streamUrl, resolution, framerate, rotation } = req.body;
    
    // Validate settings
    const validResolutions = ['720p', '1080p', '480p'];
    const validRotations = [0, 90, 180, 270];
    
    if (resolution && !validResolutions.includes(resolution)) {
      res.status(400).json({ 
        error: 'Invalid resolution. Must be one of: 720p, 1080p, 480p' 
      });
      return;
    }
    
    if (rotation !== undefined && !validRotations.includes(rotation)) {
      res.status(400).json({ 
        error: 'Invalid rotation. Must be one of: 0, 90, 180, 270' 
      });
      return;
    }
    
    if (framerate !== undefined && (framerate < 1 || framerate > 30)) {
      res.status(400).json({ 
        error: 'Invalid framerate. Must be between 1 and 30 fps' 
      });
      return;
    }

    const settings = {
      ...(enabled !== undefined && { enabled }),
      ...(streamUrl !== undefined && { streamUrl }),
      ...(resolution !== undefined && { resolution }),
      ...(framerate !== undefined && { framerate }),
      ...(rotation !== undefined && { rotation }),
    };

    cameraService.updateSettings(settings);
    
  res.json({
      message: 'Camera settings updated successfully',
      settings: cameraService.getSettings()
    });
  return;
  } catch (error) {
    console.error('Error updating camera settings:', error);
  res.status(500).json({ 
      error: 'Failed to update camera settings',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  return;
  }
});

// GET /api/camera/demo/status - Public demo endpoint (no auth required)
router.get('/demo/status', async (req: Request, res: Response) => {
  try {
    // Return demo camera status
    res.json({
      isStreaming: true,
      settings: {
        enabled: true,
        resolution: '720p',
        framerate: 15,
        rotation: 0,
      },
      demo: true
    });
  } catch (error) {
    console.error('Error getting demo camera status:', error);
    res.status(500).json({ error: 'Failed to get camera status' });
  }
});

export default router;