import { Server } from 'socket.io';

export interface AnalyticsMetrics {
  totalPrints: number;
  successfulPrints: number;
  failedPrints: number;
  cancelledPrints: number;
  successRate: number;
  totalPrintTime: number; // hours
  totalFilamentUsed: number; // grams
  averagePrintTime: number; // hours
  totalCost: number;
  costSavings: number;
}

export interface MonthlyAnalytics {
  month: string; // YYYY-MM
  prints: number;
  successful: number;
  failed: number;
  cancelled: number;
  filamentUsed: number; // grams
  printTime: number; // hours
  cost: number;
}

export interface MaterialUsage {
  material: string;
  totalWeight: number; // grams
  totalCost: number;
  printCount: number;
  averagePerPrint: number;
  successRate: number;
}

export interface ErrorAnalysis {
  errorType: string;
  count: number;
  percentage: number;
  description: string;
  recommendations: string[];
}

export interface QualityMetrics {
  date: string;
  score: number; // 0-10
  printId: string;
  factors: {
    surfaceQuality: number;
    dimensionalAccuracy: number;
    layerAdhesion: number;
    overallRating: number;
  };
}

export class AnalyticsService {
  private io: Server;

  constructor(io: Server) {
    this.io = io;
  }

  /**
   * Calculate comprehensive analytics metrics
   */
  public async calculateMetrics(timeRange: string = '30d'): Promise<AnalyticsMetrics> {
    try {
      // In real implementation, fetch from database
      // For now, return demo data
      return {
        totalPrints: 147,
        successfulPrints: 139,
        failedPrints: 6,
        cancelledPrints: 2,
        successRate: 94.6,
        totalPrintTime: 234.5,
        totalFilamentUsed: 2840,
        averagePrintTime: 1.6,
        totalCost: 91.5,
        costSavings: 1250,
      };
    } catch (error) {
      console.error('Error calculating analytics metrics:', error);
      throw error;
    }
  }

  /**
   * Get monthly analytics breakdown
   */
  public async getMonthlyAnalytics(timeRange: string = '12m'): Promise<MonthlyAnalytics[]> {
    try {
      // Demo data for last 6 months
      return [
        {
          month: '2024-01',
          prints: 23,
          successful: 22,
          failed: 1,
          cancelled: 0,
          filamentUsed: 420,
          printTime: 38.5,
          cost: 12.6,
        },
        {
          month: '2024-02',
          prints: 19,
          successful: 18,
          failed: 1,
          cancelled: 0,
          filamentUsed: 380,
          printTime: 32.2,
          cost: 11.4,
        },
        {
          month: '2024-03',
          prints: 31,
          successful: 29,
          failed: 2,
          cancelled: 0,
          filamentUsed: 590,
          printTime: 51.3,
          cost: 17.7,
        },
        {
          month: '2024-04',
          prints: 27,
          successful: 26,
          failed: 0,
          cancelled: 1,
          filamentUsed: 510,
          printTime: 44.1,
          cost: 15.3,
        },
        {
          month: '2024-05',
          prints: 25,
          successful: 24,
          failed: 1,
          cancelled: 0,
          filamentUsed: 470,
          printTime: 41.8,
          cost: 14.1,
        },
        {
          month: '2024-06',
          prints: 22,
          successful: 20,
          failed: 1,
          cancelled: 1,
          filamentUsed: 470,
          printTime: 26.6,
          cost: 14.1,
        },
      ];
    } catch (error) {
      console.error('Error getting monthly analytics:', error);
      throw error;
    }
  }

  /**
   * Analyze material usage patterns
   */
  public async getMaterialUsage(): Promise<MaterialUsage[]> {
    try {
      return [
        {
          material: 'PLA',
          totalWeight: 1580,
          totalCost: 47.4,
          printCount: 89,
          averagePerPrint: 17.8,
          successRate: 96.6,
        },
        {
          material: 'PETG',
          totalWeight: 890,
          totalCost: 31.15,
          printCount: 38,
          averagePerPrint: 23.4,
          successRate: 92.1,
        },
        {
          material: 'ABS',
          totalWeight: 370,
          totalCost: 12.95,
          printCount: 20,
          averagePerPrint: 18.5,
          successRate: 90.0,
        },
      ];
    } catch (error) {
      console.error('Error getting material usage:', error);
      throw error;
    }
  }

  /**
   * Analyze print failures and errors
   */
  public async getErrorAnalysis(): Promise<ErrorAnalysis[]> {
    try {
      return [
        {
          errorType: 'Bed Adhesion',
          count: 4,
          percentage: 50.0,
          description: 'Print not sticking to build plate',
          recommendations: [
            'Clean build surface thoroughly',
            'Adjust bed temperature (+5°C)',
            'Use adhesion aids (hairspray, glue stick)',
            'Re-level the bed',
          ],
        },
        {
          errorType: 'Filament Jam',
          count: 2,
          percentage: 25.0,
          description: 'Filament stuck in extruder',
          recommendations: [
            'Check filament quality',
            'Clean extruder gear',
            'Reduce print speed by 10%',
            'Check for tangles in filament spool',
          ],
        },
        {
          errorType: 'Temperature Fluctuation',
          count: 1,
          percentage: 12.5,
          description: 'Hotend temperature instability',
          recommendations: [
            'PID tune the hotend',
            'Check thermistor connection',
            'Improve part cooling',
            'Check ambient temperature',
          ],
        },
        {
          errorType: 'Power Loss',
          count: 1,
          percentage: 12.5,
          description: 'Print interrupted by power outage',
          recommendations: [
            'Install UPS (Uninterruptible Power Supply)',
            'Enable power loss recovery feature',
            'Check electrical connections',
            'Consider shorter print times',
          ],
        },
      ];
    } catch (error) {
      console.error('Error getting error analysis:', error);
      throw error;
    }
  }

  /**
   * Track print quality metrics over time
   */
  public async getQualityMetrics(timeRange: string = '30d'): Promise<QualityMetrics[]> {
    try {
      // Generate sample quality data
      const metrics: QualityMetrics[] = [];
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - 30);

      for (let i = 0; i < 6; i++) {
        const date = new Date(startDate);
        date.setDate(date.getDate() + i * 5);
        
        const surfaceQuality = 7.5 + Math.random() * 2;
        const dimensionalAccuracy = 8.0 + Math.random() * 1.5;
        const layerAdhesion = 8.5 + Math.random() * 1;
        const overallRating = (surfaceQuality + dimensionalAccuracy + layerAdhesion) / 3;

        metrics.push({
          date: date.toISOString().split('T')[0],
          score: overallRating,
          printId: `print_${i + 1}`,
          factors: {
            surfaceQuality,
            dimensionalAccuracy,
            layerAdhesion,
            overallRating,
          },
        });
      }

      return metrics;
    } catch (error) {
      console.error('Error getting quality metrics:', error);
      throw error;
    }
  }

  /**
   * Generate comprehensive analytics report
   */
  public async generateReport(timeRange: string = '30d'): Promise<{
    metrics: AnalyticsMetrics;
    monthly: MonthlyAnalytics[];
    materials: MaterialUsage[];
    errors: ErrorAnalysis[];
    quality: QualityMetrics[];
    generatedAt: Date;
  }> {
    try {
      const [metrics, monthly, materials, errors, quality] = await Promise.all([
        this.calculateMetrics(timeRange),
        this.getMonthlyAnalytics(),
        this.getMaterialUsage(),
        this.getErrorAnalysis(),
        this.getQualityMetrics(timeRange),
      ]);

      return {
        metrics,
        monthly,
        materials,
        errors,
        quality,
        generatedAt: new Date(),
      };
    } catch (error) {
      console.error('Error generating analytics report:', error);
      throw error;
    }
  }

  /**
   * Calculate cost analysis
   */
  public calculateCostAnalysis(prints: any[]): {
    totalMaterialCost: number;
    averageCostPerPrint: number;
    costPerGram: number;
    estimatedSavings: number;
  } {
    // Mock calculation - in real implementation, use actual print data
    return {
      totalMaterialCost: 91.5,
      averageCostPerPrint: 0.62,
      costPerGram: 0.032,
      estimatedSavings: 1250,
    };
  }

  /**
   * Predict maintenance needs based on usage patterns
   */
  public predictMaintenance(): {
    hotendReplacement: number; // days
    bedLeveling: number; // days
    beltTension: number; // days
    generalMaintenance: number; // days
  } {
    // Mock predictions based on usage patterns
    return {
      hotendReplacement: 45,
      bedLeveling: 7,
      beltTension: 30,
      generalMaintenance: 14,
    };
  }

  /**
   * Real-time analytics updates via WebSocket
   */
  public broadcastAnalyticsUpdate(data: any): void {
    this.io.emit('analytics:update', {
      timestamp: new Date(),
      data,
    });
  }

  /**
   * Export analytics data to various formats
   */
  public async exportData(format: 'json' | 'csv' | 'pdf' = 'json'): Promise<{
    data: any;
    filename: string;
    contentType: string;
  }> {
    try {
      const report = await this.generateReport();
      const timestamp = new Date().toISOString().split('T')[0];

      switch (format) {
        case 'json':
          return {
            data: JSON.stringify(report, null, 2),
            filename: `analytics_${timestamp}.json`,
            contentType: 'application/json',
          };

        case 'csv':
          // Convert to CSV format
          const csvData = this.convertToCSV(report);
          return {
            data: csvData,
            filename: `analytics_${timestamp}.csv`,
            contentType: 'text/csv',
          };

        default:
          throw new Error(`Unsupported export format: ${format}`);
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error);
      throw error;
    }
  }

  private convertToCSV(report: any): string {
    // Simple CSV conversion for monthly data
    const headers = ['Month', 'Prints', 'Successful', 'Failed', 'Filament (g)', 'Time (h)', 'Cost ($)'];
    const rows = report.monthly.map((month: MonthlyAnalytics) => [
      month.month,
      month.prints,
      month.successful,
      month.failed,
      month.filamentUsed,
      month.printTime.toFixed(1),
      month.cost.toFixed(2),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }
}
