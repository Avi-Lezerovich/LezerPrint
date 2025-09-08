'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '@/components/ui/Card';

// Import new component modules
import MetricsOverview from './MetricsOverview';
import MonthlyTrendsChart from './MonthlyTrendsChart';
import MaterialUsageChart from './MaterialUsageChart';
import PrintDurationChart from './PrintDurationChart';
import QualityScoreChart from './QualityScoreChart';
import FailureAnalysis from './FailureAnalysis';

interface AnalyticsData {
  printStats: {
    totalPrints: number;
    successRate: number;
    totalPrintTime: number; // hours
    totalFilamentUsed: number; // grams
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
  printTimes: Array<{
    duration: string;
    count: number;
  }>;
  qualityScores: Array<{
    date: string;
    score: number;
  }>;
  errorTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
}

interface AnalyticsDashboardProps {
  demoMode?: boolean;
  timeRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

export default function AnalyticsDashboard({ 
  demoMode = false, 
  timeRange = '30d' 
}: AnalyticsDashboardProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedMetric, setSelectedMetric] = useState<'prints' | 'time' | 'filament'>('prints');

  useEffect(() => {
    loadAnalyticsData();
  }, [timeRange, demoMode]);

  const loadAnalyticsData = async () => {
    setLoading(true);
    
    // In demo mode, use mock data
    if (demoMode) {
      setTimeout(() => {
        setData(generateDemoData());
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      // In real implementation, fetch from API
      const response = await fetch(`/api/analytics/dashboard?range=${timeRange}`);
      const analyticsData = await response.json();
      setData(analyticsData);
    } catch (error) {
      console.error('Failed to load analytics:', error);
      // Fallback to demo data
      setData(generateDemoData());
    } finally {
      setLoading(false);
    }
  };

  const generateDemoData = (): AnalyticsData => ({
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
    printTimes: [
      { duration: '< 1h', count: 45 },
      { duration: '1-3h', count: 62 },
      { duration: '3-6h', count: 28 },
      { duration: '6-12h', count: 9 },
      { duration: '> 12h', count: 3 },
    ],
    qualityScores: [
      { date: '2024-01-01', score: 8.2 },
      { date: '2024-01-08', score: 8.7 },
      { date: '2024-01-15', score: 9.1 },
      { date: '2024-01-22', score: 8.9 },
      { date: '2024-01-29', score: 9.3 },
      { date: '2024-02-05', score: 9.0 },
    ],
    errorTypes: [
      { type: 'Bed Adhesion', count: 4, percentage: 50 },
      { type: 'Filament Jam', count: 2, percentage: 25 },
      { type: 'Temperature', count: 1, percentage: 12.5 },
      { type: 'Power Loss', count: 1, percentage: 12.5 },
    ],
  });

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading animation with staggered cards */}
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
          initial="hidden"
          animate="visible"
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1
              }
            }
          }}
        >
          {[...Array(4)].map((_, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 20 },
                visible: { opacity: 1, y: 0 }
              }}
            >
              <Card loading={true} />
            </motion.div>
          ))}
        </motion.div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i} loading={true} className="h-80" />
          ))}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Failed to load analytics data</p>
      </div>
    );
  }

  const { printStats, monthlyData, materialUsage, printTimes, qualityScores, errorTypes } = data;

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Key Metrics Overview */}
      <MetricsOverview printStats={printStats} />

      {/* Charts Row 1 */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2
            }
          }
        }}
      >
        <MonthlyTrendsChart 
          monthlyData={monthlyData}
          selectedMetric={selectedMetric}
          onMetricChange={setSelectedMetric}
        />
        <MaterialUsageChart materialUsage={materialUsage} />
      </motion.div>

      {/* Charts Row 2 */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.2,
              delayChildren: 0.3
            }
          }
        }}
      >
        <PrintDurationChart printTimes={printTimes} />
        <QualityScoreChart qualityScores={qualityScores} />
      </motion.div>

      {/* Failure Analysis */}
      <FailureAnalysis errorTypes={errorTypes} />
    </motion.div>
  );
}
