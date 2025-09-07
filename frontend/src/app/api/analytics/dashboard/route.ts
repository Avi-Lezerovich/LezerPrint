import { NextRequest, NextResponse } from 'next/server';

interface AnalyticsData {
  printStats: {
    totalPrints: number;
    successRate: number;
    totalPrintTime: number;
    totalFilamentUsed: number;
    averagePrintTime: number;
    costSavings: number;
  };
  monthlyData: Array<{
    month: string;
    prints: number;
    successful: number;
    failed: number;
    filament: number;
    time: number;
  }>;
  materialUsage: Array<{
    material: string;
    weight: number;
    cost: number;
    color: string;
  }>;
  errorTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const timeRange = searchParams.get('range') || '30d';
    const metric = searchParams.get('metric') || 'all';

    // In a real implementation, this would fetch from database
    // For demo/development, return mock data
    const analyticsData: AnalyticsData = {
      printStats: {
        totalPrints: 147,
        successRate: 94.6,
        totalPrintTime: 234.5,
        totalFilamentUsed: 2840,
        averagePrintTime: 1.6,
        costSavings: 1250,
      },
      monthlyData: [
        { month: 'Jan', prints: 23, successful: 22, failed: 1, filament: 420, time: 38.5 },
        { month: 'Feb', prints: 19, successful: 18, failed: 1, filament: 380, time: 32.2 },
        { month: 'Mar', prints: 31, successful: 29, failed: 2, filament: 590, time: 51.3 },
        { month: 'Apr', prints: 27, successful: 26, failed: 1, filament: 510, time: 44.1 },
        { month: 'May', prints: 25, successful: 24, failed: 1, filament: 470, time: 41.8 },
        { month: 'Jun', prints: 22, successful: 20, failed: 2, filament: 470, time: 26.6 },
      ],
      materialUsage: [
        { material: 'PLA', weight: 1580, cost: 47.4, color: '#3B82F6' },
        { material: 'PETG', weight: 890, cost: 31.15, color: '#10B981' },
        { material: 'ABS', weight: 370, cost: 12.95, color: '#F59E0B' },
      ],
      errorTypes: [
        { type: 'Bed Adhesion', count: 4, percentage: 50 },
        { type: 'Filament Jam', count: 2, percentage: 25 },
        { type: 'Temperature', count: 1, percentage: 12.5 },
        { type: 'Power Loss', count: 1, percentage: 12.5 },
      ],
    };

    return NextResponse.json({
      success: true,
      data: analyticsData,
      timeRange,
      generatedAt: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Analytics API Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch analytics data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'export':
        // Generate analytics export
        return NextResponse.json({
          success: true,
          exportUrl: '/api/analytics/export',
          message: 'Analytics data export prepared'
        });

      case 'recalculate':
        // Trigger analytics recalculation
        return NextResponse.json({
          success: true,
          message: 'Analytics recalculation started'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Analytics POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process analytics request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
