import { api } from '@/services/api';

export interface PrintJob {
  id: string;
  userId: string;
  filename: string;
  filepath: string;
  status: 'queued' | 'printing' | 'completed' | 'failed' | 'cancelled';
  progress: number;
  startedAt?: string;
  completedAt?: string;
  estimatedDuration?: number;
  actualDuration?: number;
  filamentUsed?: number;
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
  createdAt: string;
  updatedAt: string;
}

export interface PrintStatistics {
  totalPrints: number;
  successfulPrints: number;
  failedPrints: number;
  cancelledPrints: number;
  successRate: number;
  totalPrintTime: number;
  totalFilamentUsed: number;
  averagePrintTime: number;
  longestPrint: number;
  shortestPrint: number;
  mostPrintedFile: string;
  monthlyStats: MonthlyStats[];
  recentActivity: ActivityItem[];
}

export interface MonthlyStats {
  month: string;
  prints: number;
  successRate: number;
  printTime: number;
  filamentUsed: number;
}

export interface ActivityItem {
  id: string;
  type: 'print_started' | 'print_completed' | 'print_failed' | 'print_cancelled';
  filename: string;
  timestamp: string;
  duration?: number;
  success?: boolean;
  message?: string;
}

export interface JobsResponse {
  jobs: PrintJob[];
  pagination: {
    currentPage: number;
    totalPages: number;
    totalJobs: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

class HistoryService {
  private mapStatusToActivityType(status: PrintJob['status']): ActivityItem['type'] {
    switch (status) {
      case 'completed':
        return 'print_completed';
      case 'failed':
        return 'print_failed';
      case 'cancelled':
        return 'print_cancelled';
      case 'queued':
      case 'printing':
      default:
        return 'print_started';
    }
  }
  async getJobs(params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<JobsResponse> {
    const searchParams = new URLSearchParams();
    if (params?.page) searchParams.set('page', params.page.toString());
    if (params?.limit) searchParams.set('limit', params.limit.toString());
    if (params?.status) searchParams.set('status', params.status);
    if (params?.sortBy) searchParams.set('sortBy', params.sortBy);
    if (params?.sortOrder) searchParams.set('sortOrder', params.sortOrder);

    const response = await api.get(`/history/jobs?${searchParams.toString()}`);
    return response.data;
  }

  async getJob(jobId: string): Promise<{ job: PrintJob }> {
    const response = await api.get(`/history/jobs/${jobId}`);
    return response.data;
  }

  async getCurrentJob(): Promise<{ job: PrintJob | null }> {
    const response = await api.get('/history/current');
    return response.data;
  }

  async getStatistics(): Promise<{ statistics: PrintStatistics }> {
    const response = await api.get('/history/statistics');
    return response.data;
  }

  async startJob(jobData: {
    filename: string;
    filepath?: string;
    layerHeight?: number;
    printSpeed?: number;
    temperatures?: { hotend: number; bed: number };
    totalLayers?: number;
    estimatedDuration?: number;
    notes?: string;
  }): Promise<{ message: string; job: PrintJob }> {
    const response = await api.post('/history/jobs', jobData);
    return response.data;
  }

  async updateProgress(jobId: string, progress: number, currentLayer?: number): Promise<{ message: string }> {
    const response = await api.put(`/history/jobs/${jobId}/progress`, {
      progress,
      currentLayer,
    });
    return response.data;
  }

  async completeJob(jobId: string, success: boolean, errorMessage?: string): Promise<{ message: string }> {
    const response = await api.put(`/history/jobs/${jobId}/complete`, {
      success,
      errorMessage,
    });
    return response.data;
  }

  async cancelJob(jobId: string): Promise<{ message: string }> {
    const response = await api.put(`/history/jobs/${jobId}/cancel`);
    return response.data;
  }

  async deleteJob(jobId: string): Promise<{ message: string }> {
    const response = await api.delete(`/history/jobs/${jobId}`);
    return response.data;
  }

  // Demo methods
  async getDemoJobs(): Promise<{ jobs: PrintJob[]; demo: boolean }> {
    const response = await api.get('/history/demo/jobs');
    return response.data;
  }

  async getDemoStatistics(): Promise<{ statistics: PrintStatistics; demo: boolean }> {
    const response = await api.get('/history/demo/statistics');
    return response.data;
  }

  // Utility methods
  formatDuration(seconds: number): string {
    if (!seconds || seconds < 0) return '0m';
    
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  formatFileSize(bytes: number): string {
    if (!bytes || bytes < 0) return '0 B';
    
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    const size = (bytes / Math.pow(1024, i)).toFixed(1);
    
    return `${size} ${sizes[i]}`;
  }

  formatTemperature(temp: number): string {
    return `${Math.round(temp)}°C`;
  }

  getStatusColor(status: PrintJob['status']): string {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-100';
      case 'printing':
        return 'text-blue-600 bg-blue-100';
      case 'failed':
        return 'text-red-600 bg-red-100';
      case 'cancelled':
        return 'text-gray-600 bg-gray-100';
      case 'queued':
        return 'text-yellow-600 bg-yellow-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  }

  getStatusIcon(status: PrintJob['status']): string {
    switch (status) {
      case 'completed':
        return '✅';
      case 'printing':
        return '🖨️';
      case 'failed':
        return '❌';
      case 'cancelled':
        return '⏹️';
      case 'queued':
        return '⏳';
      default:
        return '❓';
    }
  }

  calculateSuccessRate(jobs: PrintJob[]): number {
    if (jobs.length === 0) return 0;
    const successful = jobs.filter(job => job.status === 'completed').length;
    return Math.round((successful / jobs.length) * 100);
  }

  getTotalPrintTime(jobs: PrintJob[]): number {
    return jobs.reduce((total, job) => {
      return total + (job.actualDuration || 0);
    }, 0);
  }

  getTotalFilamentUsed(jobs: PrintJob[]): number {
    return jobs.reduce((total, job) => {
      return total + (job.filamentUsed || 0);
    }, 0);
  }

  groupJobsByMonth(jobs: PrintJob[]): Record<string, PrintJob[]> {
    return jobs.reduce((groups, job) => {
      const date = new Date(job.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(job);
      
      return groups;
    }, {} as Record<string, PrintJob[]>);
  }

  getMostPrintedFiles(jobs: PrintJob[], limit: number = 5): Array<{ filename: string; count: number }> {
    const fileCount = new Map<string, number>();
    
    jobs.forEach(job => {
      fileCount.set(job.filename, (fileCount.get(job.filename) || 0) + 1);
    });
    
    return Array.from(fileCount.entries())
      .map(([filename, count]) => ({ filename, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  getRecentActivity(jobs: PrintJob[], limit: number = 10): ActivityItem[] {
    return jobs
      .slice(0, limit)
      .map(job => ({
        id: job.id,
  type: this.mapStatusToActivityType(job.status),
        filename: job.filename,
        timestamp: job.completedAt || job.startedAt || job.createdAt,
        duration: job.actualDuration,
        success: job.status === 'completed',
        message: job.errorMessage,
      }))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }
}

export const historyService = new HistoryService();