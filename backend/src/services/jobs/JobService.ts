import { prisma } from '../../lib/prisma';

export interface CreateJobData {
  userId: string;
  fileId: string;
  settings?: {
    temperature?: {
      hotend?: number;
      bed?: number;
    };
  };
}

export interface UpdateJobData {
  status?: 'QUEUED' | 'PREPARING' | 'PRINTING' | 'PAUSED' | 'COMPLETED' | 'FAILED' | 'CANCELLED';
  progress?: number;
  notes?: string;
  errorMessage?: string;
}

export class JobService {
  async createJob(data: CreateJobData) {
    try {
      // Verify file exists and belongs to user
      const file = await prisma.file.findFirst({
        where: {
          id: data.fileId,
          userId: data.userId,
        },
      });

      if (!file) {
        throw new Error('File not found or access denied');
      }

      const job = await prisma.printJob.create({
        data: {
          userId: data.userId,
          fileId: data.fileId,
          status: 'QUEUED',
          progress: 0,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          file: {
            select: {
              id: true,
              originalName: true,
              fileType: true,
              fileSize: true,
            },
          },
        },
      });

      return job;
    } catch (error) {
      console.error('Create job error:', error);
      throw error;
    }
  }

  async getJob(jobId: string, userId?: string) {
    const where: any = { id: jobId };
    if (userId) {
      where.userId = userId;
    }

    const job = await prisma.printJob.findFirst({
      where,
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        file: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
            fileSize: true,
          },
        },
      },
    });

    return job;
  }

  async getUserJobs(
    userId: string,
    options: {
      status?: string;
      page?: number;
      limit?: number;
    } = {}
  ) {
    const { status, page = 1, limit = 20 } = options;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [jobs, total] = await Promise.all([
      prisma.printJob.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          file: {
            select: {
              id: true,
              originalName: true,
              fileType: true,
              fileSize: true,
            },
          },
        },
      }),
      prisma.printJob.count({ where }),
    ]);

    return {
      jobs,
      total,
      page,
      pages: Math.ceil(total / limit),
    };
  }

  async getCurrentJob(): Promise<any> {
    const currentJob = await prisma.printJob.findFirst({
      where: {
        status: {
          in: ['PRINTING', 'PAUSED', 'PREPARING'],
        },
      },
      orderBy: { startedAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            username: true,
          },
        },
        file: {
          select: {
            id: true,
            originalName: true,
            fileType: true,
          },
        },
      },
    });

    return currentJob;
  }

  async updateJob(jobId: string, userId: string, data: UpdateJobData) {
    try {
      // Verify job exists and belongs to user
      const existingJob = await prisma.printJob.findFirst({
        where: {
          id: jobId,
          userId,
        },
      });

      if (!existingJob) {
        throw new Error('Job not found or access denied');
      }

      const updateData: any = {};

      if (data.status !== undefined) {
        updateData.status = data.status;
        
        // Set timestamps based on status
        if (data.status === 'PRINTING' && !existingJob.startedAt) {
          updateData.startedAt = new Date();
        } else if (['COMPLETED', 'FAILED', 'CANCELLED'].includes(data.status)) {
          updateData.completedAt = new Date();
        }
      }

      if (data.progress !== undefined) {
        updateData.progress = Math.max(0, Math.min(100, data.progress));
      }

      const updatedJob = await prisma.printJob.update({
        where: { id: jobId },
        data: updateData,
        include: {
          user: {
            select: {
              id: true,
              username: true,
            },
          },
          file: {
            select: {
              id: true,
              originalName: true,
              fileType: true,
            },
          },
        },
      });

      return updatedJob;
    } catch (error) {
      console.error('Update job error:', error);
      throw error;
    }
  }

  async pauseJob(jobId: string, userId: string) {
    return this.updateJob(jobId, userId, { status: 'PAUSED' });
  }

  async resumeJob(jobId: string, userId: string) {
    return this.updateJob(jobId, userId, { status: 'PRINTING' });
  }

  async cancelJob(jobId: string, userId: string) {
    return this.updateJob(jobId, userId, { 
      status: 'CANCELLED'
    });
  }

  async getJobStatistics(userId?: string) {
    const where: any = {};
    if (userId) {
      where.userId = userId;
    }

    const [
      totalJobs,
      completedJobs,
      failedJobs,
    ] = await Promise.all([
      prisma.printJob.count({ where }),
      prisma.printJob.count({ where: { ...where, status: 'COMPLETED' } }),
      prisma.printJob.count({ where: { ...where, status: 'FAILED' } }),
    ]);

    const successRate = totalJobs > 0 ? (completedJobs / totalJobs) * 100 : 0;

    return {
      totalJobs,
      completedJobs,
      failedJobs,
      successRate: Math.round(successRate * 100) / 100,
    };
  }

  async deleteJob(jobId: string, userId: string) {
    try {
      const job = await prisma.printJob.findFirst({
        where: {
          id: jobId,
          userId,
        },
      });

      if (!job) {
        throw new Error('Job not found or access denied');
      }

      // Only allow deletion of completed, failed, or cancelled jobs
      if (!['COMPLETED', 'FAILED', 'CANCELLED'].includes(job.status)) {
        throw new Error('Cannot delete active job');
      }

      await prisma.printJob.delete({
        where: { id: jobId },
      });

      return true;
    } catch (error) {
      console.error('Delete job error:', error);
      throw error;
    }
  }
}

export const jobService = new JobService();
