import { Server } from 'socket.io';

export interface PrintJob {
  id: string;
  userId: string;
  filename: string;
  filepath: string;
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: Date;
  completedAt?: Date;
  estimatedDuration?: number; // seconds
  actualDuration?: number; // seconds
  filamentUsed?: number; // grams
  layerHeight: number;
  totalLayers?: number;
  currentLayer?: number;
  printSpeed: number;
  temperatures: {
    hotend: number;
    bed: number;
  };
  successRate?: number;
  errorMessage?: string;
  thumbnailUrl?: string;
  gcodePreviewUrl?: string;
  timelapseUrl?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PrintStatistics {
  totalPrints: number;
  successfulPrints: number;
  failedPrints: number;
  cancelledPrints: number;
  successRate: number;
  totalPrintTime: number; // hours
  totalFilamentUsed: number; // grams
  averagePrintTime: number; // hours
  longestPrint: number; // hours
  shortestPrint: number; // hours
  mostPrintedFile: string;
  monthlyStats: MonthlyStats[];
  recentActivity: ActivityItem[];
}

export interface MonthlyStats {
  month: string; // YYYY-MM
  prints: number;
  successRate: number;
  printTime: number; // hours
  filamentUsed: number; // grams
}

export interface ActivityItem {
  id: string;
  type: 'print_started' | 'print_completed' | 'print_failed' | 'print_cancelled';
  filename: string;
  timestamp: Date;
  duration?: number;
  success?: boolean;
  message?: string;
}

export class PrintHistoryService {
  private io: Server;
  private printJobs: Map<string, PrintJob> = new Map();
  private currentJob: PrintJob | null = null;

  constructor(io: Server) {
    this.io = io;
    this.loadMockData();
  }

  private loadMockData(): void {
    // Generate mock print history for demonstration
    const mockJobs: PrintJob[] = [
      {
        id: '1',
        userId: 'user1',
        filename: 'miniature_castle.stl',
        filepath: '/uploads/miniature_castle.stl',
        status: 'completed',
        progress: 100,
        startedAt: new Date('2024-01-15T10:30:00Z'),
        completedAt: new Date('2024-01-15T14:32:00Z'),
        estimatedDuration: 14400, // 4 hours
        actualDuration: 14520, // 4h 2m
        filamentUsed: 45.2,
        layerHeight: 0.2,
        totalLayers: 420,
        currentLayer: 420,
        printSpeed: 50,
        temperatures: { hotend: 210, bed: 60 },
        successRate: 100,
        thumbnailUrl: '/thumbnails/miniature_castle.jpg',
        gcodePreviewUrl: '/previews/miniature_castle.gcode',
        notes: 'Perfect quality print, excellent detail reproduction',
        createdAt: new Date('2024-01-15T10:30:00Z'),
        updatedAt: new Date('2024-01-15T14:32:00Z'),
      },
      {
        id: '2',
        userId: 'user1',
        filename: 'desk_organizer.stl',
        filepath: '/uploads/desk_organizer.stl',
        status: 'completed',
        progress: 100,
        startedAt: new Date('2024-01-14T08:15:00Z'),
        completedAt: new Date('2024-01-14T10:30:00Z'),
        estimatedDuration: 8100, // 2h 15m
        actualDuration: 8100,
        filamentUsed: 32.8,
        layerHeight: 0.3,
        totalLayers: 180,
        currentLayer: 180,
        printSpeed: 60,
        temperatures: { hotend: 215, bed: 65 },
        successRate: 100,
        thumbnailUrl: '/thumbnails/desk_organizer.jpg',
        notes: 'Used for office organization, fits perfectly',
        createdAt: new Date('2024-01-14T08:15:00Z'),
        updatedAt: new Date('2024-01-14T10:30:00Z'),
      },
      {
        id: '3',
        userId: 'user1',
        filename: 'prototype_bracket.stl',
        filepath: '/uploads/prototype_bracket.stl',
        status: 'failed',
        progress: 23,
        startedAt: new Date('2024-01-13T16:20:00Z'),
        completedAt: new Date('2024-01-13T17:05:00Z'),
        estimatedDuration: 5400, // 1.5 hours
        actualDuration: 2700, // 45 minutes
        filamentUsed: 8.5,
        layerHeight: 0.2,
        totalLayers: 125,
        currentLayer: 29,
        printSpeed: 40,
        temperatures: { hotend: 200, bed: 55 },
        successRate: 0,
        errorMessage: 'Extruder clog detected, print stopped automatically',
        thumbnailUrl: '/thumbnails/prototype_bracket.jpg',
        notes: 'Need to clean extruder and retry',
        createdAt: new Date('2024-01-13T16:20:00Z'),
        updatedAt: new Date('2024-01-13T17:05:00Z'),
      },
      {
        id: '4',
        userId: 'user1',
        filename: 'phone_stand_v2.stl',
        filepath: '/uploads/phone_stand_v2.stl',
        status: 'printing',
        progress: 67.3,
        startedAt: new Date(),
        estimatedDuration: 7200, // 2 hours
        filamentUsed: 28.1,
        layerHeight: 0.2,
        totalLayers: 280,
        currentLayer: 188,
        printSpeed: 55,
        temperatures: { hotend: 210, bed: 60 },
        thumbnailUrl: '/thumbnails/phone_stand_v2.jpg',
        notes: 'Version 2 with improved stability',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    mockJobs.forEach(job => {
      this.printJobs.set(job.id, job);
      if (job.status === 'printing') {
        this.currentJob = job;
      }
    });
  }

  public getAllJobs(userId?: string): PrintJob[] {
    const jobs = Array.from(this.printJobs.values());
    if (userId) {
      return jobs.filter(job => job.userId === userId);
    }
    return jobs.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  public getJobById(jobId: string): PrintJob | null {
    return this.printJobs.get(jobId) || null;
  }

  public getCurrentJob(): PrintJob | null {
    return this.currentJob;
  }

  public startJob(jobData: Partial<PrintJob>): PrintJob {
    const job: PrintJob = {
      id: Date.now().toString(),
      userId: jobData.userId || 'demo',
      filename: jobData.filename || 'unknown.stl',
      filepath: jobData.filepath || '/uploads/unknown.stl',
      status: 'printing',
      progress: 0,
      startedAt: new Date(),
      layerHeight: jobData.layerHeight || 0.2,
      printSpeed: jobData.printSpeed || 50,
      temperatures: jobData.temperatures || { hotend: 210, bed: 60 },
      createdAt: new Date(),
      updatedAt: new Date(),
      ...jobData,
    };

    this.printJobs.set(job.id, job);
    this.currentJob = job;

    // Broadcast job started
    this.io.emit('print:started', job);
    
    return job;
  }

  public updateJobProgress(jobId: string, progress: number, currentLayer?: number): void {
    const job = this.printJobs.get(jobId);
    if (!job) return;

    job.progress = progress;
    job.updatedAt = new Date();
    
    if (currentLayer !== undefined) {
      job.currentLayer = currentLayer;
    }

    // Calculate estimated time remaining
    if (job.startedAt && progress > 0) {
      const elapsed = (Date.now() - job.startedAt.getTime()) / 1000;
      const estimatedTotal = (elapsed / progress) * 100;
      job.estimatedDuration = Math.round(estimatedTotal);
    }

    this.printJobs.set(jobId, job);
    
    // Broadcast progress update
    this.io.emit('print:progress', {
      jobId,
      progress,
      currentLayer,
      estimatedTimeRemaining: job.estimatedDuration ? job.estimatedDuration - ((Date.now() - job.startedAt!.getTime()) / 1000) : undefined
    });
  }

  public completeJob(jobId: string, success: boolean, errorMessage?: string): void {
    const job = this.printJobs.get(jobId);
    if (!job) return;

    job.status = success ? 'completed' : 'failed';
    job.progress = success ? 100 : job.progress;
    job.completedAt = new Date();
    job.updatedAt = new Date();
    
    if (job.startedAt) {
      job.actualDuration = Math.round((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
    }
    
    if (errorMessage) {
      job.errorMessage = errorMessage;
    }
    
    job.successRate = success ? 100 : 0;

    this.printJobs.set(jobId, job);
    
    if (this.currentJob?.id === jobId) {
      this.currentJob = null;
    }

    // Broadcast job completion
    this.io.emit('print:completed', {
      jobId,
      success,
      job
    });
  }

  public cancelJob(jobId: string): void {
    const job = this.printJobs.get(jobId);
    if (!job) return;

    job.status = 'cancelled';
    job.completedAt = new Date();
    job.updatedAt = new Date();
    
    if (job.startedAt) {
      job.actualDuration = Math.round((job.completedAt.getTime() - job.startedAt.getTime()) / 1000);
    }

    this.printJobs.set(jobId, job);
    
    if (this.currentJob?.id === jobId) {
      this.currentJob = null;
    }

    // Broadcast job cancellation
    this.io.emit('print:cancelled', { jobId, job });
  }

  public getStatistics(userId?: string): PrintStatistics {
    const jobs = this.getAllJobs(userId);
    
    const totalPrints = jobs.length;
    const successfulPrints = jobs.filter(j => j.status === 'completed').length;
    const failedPrints = jobs.filter(j => j.status === 'failed').length;
    const cancelledPrints = jobs.filter(j => j.status === 'cancelled').length;
    const successRate = totalPrints > 0 ? (successfulPrints / totalPrints) * 100 : 0;
    
    const completedJobs = jobs.filter(j => j.actualDuration);
    const totalPrintTime = completedJobs.reduce((sum, j) => sum + (j.actualDuration || 0), 0) / 3600; // hours
    const totalFilamentUsed = jobs.reduce((sum, j) => sum + (j.filamentUsed || 0), 0);
    const averagePrintTime = completedJobs.length > 0 ? totalPrintTime / completedJobs.length : 0;
    
    const sortedByDuration = completedJobs.sort((a, b) => (a.actualDuration || 0) - (b.actualDuration || 0));
    const longestPrint = sortedByDuration.length > 0 ? (sortedByDuration[sortedByDuration.length - 1].actualDuration || 0) / 3600 : 0;
    const shortestPrint = sortedByDuration.length > 0 ? (sortedByDuration[0].actualDuration || 0) / 3600 : 0;
    
    // Find most printed file
    const fileCount = new Map<string, number>();
    jobs.forEach(j => {
      fileCount.set(j.filename, (fileCount.get(j.filename) || 0) + 1);
    });
    const mostPrintedFile = Array.from(fileCount.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || '';

    // Generate monthly stats (last 6 months)
    const monthlyStats: MonthlyStats[] = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      const monthJobs = jobs.filter(j => {
        const jobMonth = `${j.createdAt.getFullYear()}-${String(j.createdAt.getMonth() + 1).padStart(2, '0')}`;
        return jobMonth === monthKey;
      });
      
      const monthCompleted = monthJobs.filter(j => j.status === 'completed');
      
      monthlyStats.push({
        month: monthKey,
        prints: monthJobs.length,
        successRate: monthJobs.length > 0 ? (monthCompleted.length / monthJobs.length) * 100 : 0,
        printTime: monthCompleted.reduce((sum, j) => sum + (j.actualDuration || 0), 0) / 3600,
        filamentUsed: monthJobs.reduce((sum, j) => sum + (j.filamentUsed || 0), 0),
      });
    }

    // Generate recent activity
    const recentActivity: ActivityItem[] = jobs
      .slice(0, 20)
      .map(j => ({
        id: j.id,
        type: (j.status === 'completed'
          ? 'print_completed'
          : j.status === 'failed'
          ? 'print_failed'
          : j.status === 'cancelled'
          ? 'print_cancelled'
          : 'print_started') as 'print_started' | 'print_completed' | 'print_failed' | 'print_cancelled',
        filename: j.filename,
        timestamp: j.completedAt || j.startedAt || j.createdAt,
        duration: j.actualDuration,
        success: j.status === 'completed',
        message: j.errorMessage,
      }))
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    return {
      totalPrints,
      successfulPrints,
      failedPrints,
      cancelledPrints,
      successRate,
      totalPrintTime,
      totalFilamentUsed,
      averagePrintTime,
      longestPrint,
      shortestPrint,
      mostPrintedFile,
      monthlyStats,
      recentActivity,
    };
  }

  // Demo mode methods
  public simulateProgress(): void {
    if (!this.currentJob || this.currentJob.status !== 'printing') return;

    const job = this.currentJob;
    const progressIncrement = Math.random() * 2; // 0-2% progress per update
    const newProgress = Math.min(job.progress + progressIncrement, 100);
    
    this.updateJobProgress(job.id, newProgress, Math.floor((newProgress / 100) * (job.totalLayers || 280)));
    
    // Complete job when 100%
    if (newProgress >= 100) {
      this.completeJob(job.id, Math.random() > 0.1); // 90% success rate
    }
  }
}