'use client';

import { useState, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

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
  const [selectedMetric, setSelectedMetric] = useState<'prints' | 'time' | 'filament' | 'quality'>('prints');

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
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        ))}
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
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Total Prints</p>
              <p className="text-2xl font-bold text-gray-900">{printStats.totalPrints}</p>
            </div>
            <div className="p-2 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Success Rate</p>
              <p className="text-2xl font-bold text-green-600">{printStats.successRate}%</p>
            </div>
            <div className="p-2 bg-green-100 rounded-lg">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Print Time</p>
              <p className="text-2xl font-bold text-purple-600">{printStats.totalPrintTime.toFixed(1)}h</p>
            </div>
            <div className="p-2 bg-purple-100 rounded-lg">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-500">Filament Used</p>
              <p className="text-2xl font-bold text-orange-600">{(printStats.totalFilamentUsed / 1000).toFixed(1)}kg</p>
            </div>
            <div className="p-2 bg-orange-100 rounded-lg">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.79 4 8.5 4s8.5-1.79 8.5-4V7M4 7c0 2.21 3.79 4 8.5 4s8.5-1.79 8.5-4M4 7c0-2.21 3.79-4 8.5-4s8.5 1.79 8.5 4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Trends */}
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Monthly Trends</h3>
            <select 
              value={selectedMetric} 
              onChange={(e) => setSelectedMetric(e.target.value as any)}
              className="text-sm border border-gray-300 rounded-md px-3 py-1"
            >
              <option value="prints">Prints</option>
              <option value="time">Time (hours)</option>
              <option value="filament">Filament (g)</option>
            </select>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Area 
                type="monotone" 
                dataKey={selectedMetric} 
                stroke="#3B82F6" 
                fill="#3B82F6" 
                fillOpacity={0.3}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Material Usage */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Material Usage</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={materialUsage}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ material, percentage }) => `${material} ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="weight"
              >
                {materialUsage.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: any, name) => [`${value}g`, 'Weight']} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Print Duration Distribution */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Print Duration Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={printTimes}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="duration" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#10B981" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Quality Score Trend */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quality Score Trend</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qualityScores}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="score" 
                stroke="#F59E0B" 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Error Analysis */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Failure Analysis</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Error Types</h4>
            <div className="space-y-3">
              {errorTypes.map((error, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">{error.type}</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-red-500 h-2 rounded-full" 
                        style={{ width: `${error.percentage}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-500 w-8">{error.count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>• Review bed leveling procedure</li>
              <li>• Clean and maintain filament path</li>
              <li>• Check temperature sensor calibration</li>
              <li>• Consider UPS for power stability</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
