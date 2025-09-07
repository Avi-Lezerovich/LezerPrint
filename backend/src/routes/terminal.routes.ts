import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { GCodeTerminalService } from '../services/gcodeTerminalService';
import { z } from 'zod';

const router = express.Router();

// Get terminal service instance (will be injected)
let terminalService: GCodeTerminalService;

export const setTerminalService = (service: GCodeTerminalService) => {
  terminalService = service;
};

// Validation schemas
const sendCommandSchema = z.object({
  command: z.string()
    .min(1, 'Command cannot be empty')
    .max(200, 'Command too long')
    .regex(/^[A-Z][0-9]*(\s+[A-Z][-\d.]+)*$/i, 'Invalid G-code format'),
  priority: z.boolean().optional().default(false),
  sessionId: z.string().optional(),
});

const createSessionSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
});

// POST /api/terminal/session - Create terminal session
router.post('/session', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const body = createSessionSchema.parse(req.body);
    
    const session = terminalService.createSession(userId);
    
  res.status(201).json({
      success: true,
      data: { session },
      message: 'Terminal session created successfully',
    });
  return;
  } catch (error) {
    console.error('Error creating terminal session:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_CREATION_FAILED',
        message: 'Failed to create terminal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// DELETE /api/terminal/session/:sessionId - Close terminal session
router.delete('/session/:sessionId', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const userId = (req as any).user?.id;
    
    // Verify session ownership
    const session = terminalService.getSessionInfo(sessionId);
    if (!session) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'SESSION_NOT_FOUND',
          message: 'Terminal session not found',
        }
      });
    }
    
    if (session.userId !== userId) {
      return res.status(403).json({
        success: false,
        error: {
          code: 'ACCESS_DENIED',
          message: 'You can only close your own sessions',
        }
      });
    }
    
    const closed = terminalService.closeSession(sessionId);
    
  res.json({
      success: true,
      data: { closed },
      message: 'Terminal session closed successfully',
    });
  return;
  } catch (error) {
    console.error('Error closing terminal session:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'SESSION_CLOSE_FAILED',
        message: 'Failed to close terminal session',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// POST /api/terminal/command - Send G-code command
router.post('/command', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const body = sendCommandSchema.parse(req.body);
    
    const command = await terminalService.sendCommand(
      body.command,
      userId,
      body.priority,
      body.sessionId
    );
    
    res.status(201).json({
      success: true,
      data: { command },
      message: 'Command queued successfully',
    });
    return;
  } catch (error) {
    console.error('Error sending command:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid command format',
          details: error.issues,
        }
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'COMMAND_FAILED',
        message: 'Failed to send command',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return;
  }
});

// GET /api/terminal/history - Get command history
router.get('/history', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const limit = parseInt(req.query.limit as string) || 50;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // Validate limits
    const safeLimit = Math.min(Math.max(limit, 1), 200);
    const safeOffset = Math.max(offset, 0);
    
    const history = terminalService.getCommandHistory(userId, safeLimit, safeOffset);
    
  res.json({
      success: true,
      data: { 
        history,
        pagination: {
          limit: safeLimit,
          offset: safeOffset,
          total: history.length,
        }
      },
    });
  return;
  } catch (error) {
    console.error('Error getting command history:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'HISTORY_FAILED',
        message: 'Failed to get command history',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// GET /api/terminal/queue - Get queue status
router.get('/queue', authenticateToken, async (req: Request, res: Response) => {
  try {
    const queueStatus = terminalService.getQueueStatus();
    
  res.json({
      success: true,
      data: { queueStatus },
    });
  return;
  } catch (error) {
    console.error('Error getting queue status:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'QUEUE_STATUS_FAILED',
        message: 'Failed to get queue status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// POST /api/terminal/queue/clear - Clear command queue
router.post('/queue/clear', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const clearedCount = terminalService.clearQueue(userId);
    
  res.json({
      success: true,
      data: { clearedCount },
      message: `Cleared ${clearedCount} commands from queue`,
    });
  return;
  } catch (error) {
    console.error('Error clearing queue:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'QUEUE_CLEAR_FAILED',
        message: 'Failed to clear command queue',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// POST /api/terminal/emergency-stop - Emergency stop
router.post('/emergency-stop', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    
    await terminalService.emergencyStop(userId);
    
  res.json({
      success: true,
      message: 'Emergency stop executed successfully',
    });
  return;
  } catch (error) {
    console.error('Error executing emergency stop:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'EMERGENCY_STOP_FAILED',
        message: 'Failed to execute emergency stop',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// GET /api/terminal/popular-commands - Get popular commands
router.get('/popular-commands', authenticateToken, async (req: Request, res: Response) => {
  try {
    const popularCommands = terminalService.getPopularCommands();
    
  res.json({
      success: true,
      data: { popularCommands },
    });
  return;
  } catch (error) {
    console.error('Error getting popular commands:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'POPULAR_COMMANDS_FAILED',
        message: 'Failed to get popular commands',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// Demo endpoints (no authentication required)

// POST /api/terminal/demo/command - Send demo command
router.post('/demo/command', async (req: Request, res: Response) => {
  try {
    const body = sendCommandSchema.parse(req.body);
    
    const command = await terminalService.sendCommand(
      body.command,
      'demo-user',
      body.priority,
      'demo-session'
    );
    
    res.status(201).json({
      success: true,
      data: { command },
      message: 'Demo command queued successfully',
      demo: true,
    });
    return;
  } catch (error) {
    console.error('Error sending demo command:', error);
    
    if (error instanceof z.ZodError) {
      res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid command format',
          details: error.issues,
        }
      });
      return;
    }
    
    res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_COMMAND_FAILED',
        message: 'Failed to send demo command',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
    return;
  }
});

// GET /api/terminal/demo/history - Get demo command history
router.get('/demo/history', async (req: Request, res: Response) => {
  try {
    const limit = Math.min(parseInt(req.query.limit as string) || 20, 50);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    
    const history = terminalService.getCommandHistory('demo-user', limit, offset);
    
  res.json({
      success: true,
      data: { 
        history,
        pagination: {
          limit,
          offset,
          total: history.length,
        }
      },
      demo: true,
    });
  return;
  } catch (error) {
    console.error('Error getting demo history:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_HISTORY_FAILED',
        message: 'Failed to get demo history',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// GET /api/terminal/demo/queue - Get demo queue status
router.get('/demo/queue', async (req: Request, res: Response) => {
  try {
    const queueStatus = terminalService.getQueueStatus();
    
  res.json({
      success: true,
      data: { queueStatus },
      demo: true,
    });
  return;
  } catch (error) {
    console.error('Error getting demo queue status:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_QUEUE_FAILED',
        message: 'Failed to get demo queue status',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

// GET /api/terminal/demo/popular-commands - Get demo popular commands
router.get('/demo/popular-commands', async (req: Request, res: Response) => {
  try {
    const popularCommands = terminalService.getPopularCommands();
    
  res.json({
      success: true,
      data: { popularCommands },
      demo: true,
    });
  return;
  } catch (error) {
    console.error('Error getting demo popular commands:', error);
  res.status(500).json({
      success: false,
      error: {
        code: 'DEMO_POPULAR_COMMANDS_FAILED',
        message: 'Failed to get demo popular commands',
        details: error instanceof Error ? error.message : 'Unknown error'
      }
    });
  return;
  }
});

export default router;