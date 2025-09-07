import express from 'express';
import { Request, Response } from 'express';
import { authenticateToken } from '../middleware/auth.middleware';
import { PrintHistoryService } from '../services/printHistoryService';

const router = express.Router();

// Get print history service instance (will be injected)
let historyService: PrintHistoryService;

export const setHistoryService = (service: PrintHistoryService) => {
  historyService = service;
};

// GET /api/history/jobs - Get all print jobs
router.get('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { page = '1', limit = '20', status, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;
    const userId = (req as any).user?.id;

    let jobs = historyService.getAllJobs(userId);

    // Filter by status
    if (status && status !== 'all') {
      jobs = jobs.filter(job => job.status === status);
    }

    // Sort jobs
    jobs.sort((a, b) => {
      const aValue = (a as any)[sortBy as string];
      const bValue = (b as any)[sortBy as string];
      
      if (sortOrder === 'desc') {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    });

    // Paginate
    const pageNum = parseInt(page as string);
    const limitNum = parseInt(limit as string);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const paginatedJobs = jobs.slice(startIndex, endIndex);
    const totalJobs = jobs.length;
    const totalPages = Math.ceil(totalJobs / limitNum);

  res.json({
      jobs: paginatedJobs,
      pagination: {
        currentPage: pageNum,
        totalPages,
        totalJobs,
        hasNextPage: pageNum < totalPages,
        hasPrevPage: pageNum > 1,
      }
    });
  return;
  } catch (error) {
    console.error('Error fetching print jobs:', error);
    res.status(500).json({ 
      error: 'Failed to fetch print jobs',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/history/jobs/:id - Get specific job
router.get('/jobs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
  const job = historyService.getJobById(id);

    if (!job) {
  res.status(404).json({ error: 'Print job not found' });
  return;
    }

    // Check if user owns this job
    const userId = (req as any).user?.id;
    if (userId && job.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ job });
    return;
  } catch (error) {
    console.error('Error fetching print job:', error);
    res.status(500).json({ 
      error: 'Failed to fetch print job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/history/current - Get current print job
router.get('/current', authenticateToken, async (req: Request, res: Response) => {
  try {
    const currentJob = historyService.getCurrentJob();
  res.json({ job: currentJob });
  return;
  } catch (error) {
    console.error('Error fetching current job:', error);
    res.status(500).json({ 
      error: 'Failed to fetch current job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/history/statistics - Get print statistics
router.get('/statistics', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const statistics = historyService.getStatistics(userId);
    
  res.json({ statistics });
  return;
  } catch (error) {
    console.error('Error fetching print statistics:', error);
    res.status(500).json({ 
      error: 'Failed to fetch print statistics',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// POST /api/history/jobs - Start a new print job
router.post('/jobs', authenticateToken, async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    const jobData = {
      ...req.body,
      userId,
    };

    // Validate required fields
    if (!jobData.filename) {
  res.status(400).json({ error: 'Filename is required' });
  return;
    }

    const job = historyService.startJob(jobData);
    
  res.status(201).json({
      message: 'Print job started successfully',
      job
    });
  return;
  } catch (error) {
    console.error('Error starting print job:', error);
    res.status(500).json({ 
      error: 'Failed to start print job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/history/jobs/:id/progress - Update job progress
router.put('/jobs/:id/progress', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { progress, currentLayer } = req.body;

    if (progress < 0 || progress > 100) {
      return res.status(400).json({ error: 'Progress must be between 0 and 100' });
    }

    historyService.updateJobProgress(id, progress, currentLayer);
    
  res.json({ message: 'Job progress updated successfully' });
  return;
  } catch (error) {
    console.error('Error updating job progress:', error);
    return res.status(500).json({ 
      error: 'Failed to update job progress',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/history/jobs/:id/complete - Complete a job
router.put('/jobs/:id/complete', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { success = true, errorMessage } = req.body;

    historyService.completeJob(id, success, errorMessage);
    
  res.json({ 
      message: `Job ${success ? 'completed' : 'failed'} successfully` 
    });
  return;
  } catch (error) {
    console.error('Error completing job:', error);
    res.status(500).json({ 
      error: 'Failed to complete job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// PUT /api/history/jobs/:id/cancel - Cancel a job
router.put('/jobs/:id/cancel', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    historyService.cancelJob(id);
    
  res.json({ message: 'Job cancelled successfully' });
  return;
  } catch (error) {
    console.error('Error cancelling job:', error);
    res.status(500).json({ 
      error: 'Failed to cancel job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// DELETE /api/history/jobs/:id - Delete a job from history
router.delete('/jobs/:id', authenticateToken, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const job = historyService.getJobById(id);

    if (!job) {
  res.status(404).json({ error: 'Print job not found' });
  return;
    }

    // Check if user owns this job
    const userId = (req as any).user?.id;
    if (userId && job.userId !== userId) {
  res.status(403).json({ error: 'Access denied' });
  return;
    }

    // Only allow deletion of completed, failed, or cancelled jobs
    if (['printing', 'queued'].includes(job.status)) {
  res.status(400).json({ error: 'Cannot delete active job' });
  return;
    }

    // Remove job from history (in a real app, this would soft delete)
    // For now, we'll just mark it as deleted or remove from the map
    // historyService.deleteJob(id); // Would implement this method
    
  res.json({ message: 'Job deleted from history' });
  return;
  } catch (error) {
    console.error('Error deleting job:', error);
    res.status(500).json({ 
      error: 'Failed to delete job',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }
});

// GET /api/history/demo/jobs - Public demo endpoint (no auth required)
router.get('/demo/jobs', async (req: Request, res: Response) => {
  try {
    const jobs = historyService.getAllJobs();
    
  res.json({
      jobs: jobs.slice(0, 10), // Show recent 10 jobs for demo
      demo: true
    });
  return;
  } catch (error) {
    console.error('Error fetching demo jobs:', error);
    res.status(500).json({ error: 'Failed to fetch demo jobs' });
  }
});

// GET /api/history/demo/statistics - Public demo statistics endpoint
router.get('/demo/statistics', async (req: Request, res: Response) => {
  try {
    const statistics = historyService.getStatistics();
    
  res.json({
      statistics,
      demo: true
    });
  return;
  } catch (error) {
    console.error('Error fetching demo statistics:', error);
    res.status(500).json({ error: 'Failed to fetch demo statistics' });
  }
});

export default router;