'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import Card, { CardContent, CardHeader } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner, { Skeleton } from '@/components/ui/Loading';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Zap, 
  Star,
  AlertTriangle
} from 'lucide-react';

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
      {/* Enhanced Key Metrics */}
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
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Total Prints</p>
                  <motion.p 
                    className="text-2xl font-bold text-gray-900"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.2, type: "spring" }}
                  >
                    {printStats.totalPrints}
                  </motion.p>
                  <div className="flex items-center mt-1">
                    <TrendingUp className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">+12% from last month</span>
                  </div>
                </div>
                <motion.div 
                  className="p-3 bg-blue-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Package className="w-6 h-6 text-blue-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Success Rate</p>
                  <motion.p 
                    className="text-2xl font-bold text-green-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.3, type: "spring" }}
                  >
                    {printStats.successRate}%
                  </motion.p>
                  <div className="flex items-center mt-1">
                    <CheckCircle className="w-3 h-3 text-green-500 mr-1" />
                    <span className="text-xs text-green-600">Excellent performance</span>
                  </div>
                </div>
                <motion.div 
                  className="p-3 bg-green-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Print Time</p>
                  <motion.p 
                    className="text-2xl font-bold text-purple-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                  >
                    {printStats.totalPrintTime.toFixed(1)}h
                  </motion.p>
                  <div className="flex items-center mt-1">
                    <Clock className="w-3 h-3 text-purple-500 mr-1" />
                    <span className="text-xs text-purple-600">Avg: {printStats.averagePrintTime.toFixed(1)}h</span>
                  </div>
                </div>
                <motion.div 
                  className="p-3 bg-purple-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Clock className="w-6 h-6 text-purple-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-500">Filament Used</p>
                  <motion.p 
                    className="text-2xl font-bold text-orange-600"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring" }}
                  >
                    {(printStats.totalFilamentUsed / 1000).toFixed(1)}kg
                  </motion.p>
                  <div className="flex items-center mt-1">
                    <DollarSign className="w-3 h-3 text-orange-500 mr-1" />
                    <span className="text-xs text-orange-600">Saved: ${printStats.costSavings}</span>
                  </div>
                </div>
                <motion.div 
                  className="p-3 bg-orange-100 rounded-full"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <Zap className="w-6 h-6 text-orange-600" />
                </motion.div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Charts Row 1 */}
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
        {/* Monthly Trends */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
                  Monthly Trends
                </h3>
                <motion.select 
                  value={selectedMetric} 
                  onChange={(e) => setSelectedMetric(e.target.value as any)}
                  className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  whileHover={{ scale: 1.02 }}
                  whileFocus={{ scale: 1.02 }}
                >
                  <option value="prints">Prints</option>
                  <option value="time">Time (hours)</option>
                  <option value="filament">Filament (g)</option>
                </motion.select>
              </div>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={monthlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={selectedMetric} 
                      stroke="#3B82F6" 
                      fill="#3B82F6" 
                      fillOpacity={0.3}
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Material Usage */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Zap className="w-5 h-5 mr-2 text-orange-600" />
                Material Usage
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={materialUsage}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ material, percentage }) => `${material} ${percentage}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="weight"
                    >
                      {materialUsage.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any, name) => [`${value}g`, 'Weight']}
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Charts Row 2 */}
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
        {/* Print Duration Distribution */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Clock className="w-5 h-5 mr-2 text-green-600" />
                Print Duration Distribution
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={printTimes}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="duration" />
                    <YAxis />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Bar dataKey="count" fill="#10B981" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quality Score Trend */}
        <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
          <Card variant="elevated" hoverable>
            <CardContent>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Star className="w-5 h-5 mr-2 text-yellow-600" />
                Quality Score Trend
              </h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={qualityScores}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" />
                    <YAxis domain={[0, 10]} />
                    <Tooltip
                      contentStyle={{ 
                        backgroundColor: '#fff', 
                        border: '1px solid #e5e7eb',
                        borderRadius: '8px',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                      }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="score" 
                      stroke="#F59E0B" 
                      strokeWidth={3}
                      dot={{ fill: '#F59E0B', strokeWidth: 2, r: 4 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Enhanced Error Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <Card variant="elevated" hoverable>
          <CardContent>
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Failure Analysis
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-3">Error Types</h4>
                <div className="space-y-3">
                  {errorTypes.map((error, index) => (
                    <motion.div 
                      key={index} 
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.9 + index * 0.1 }}
                    >
                      <span className="text-sm text-gray-600">{error.type}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2 relative overflow-hidden">
                          <motion.div 
                            className="bg-red-500 h-2 rounded-full" 
                            initial={{ width: 0 }}
                            animate={{ width: `${error.percentage}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 0.5 }}
                          />
                        </div>
                        <span className="text-sm text-gray-500 w-8">{error.count}</span>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.8 }}
              >
                <h4 className="text-sm font-medium text-gray-700 mb-3">Recommendations</h4>
                <motion.ul 
                  className="text-sm text-gray-600 space-y-2"
                  initial="hidden"
                  animate="visible"
                  variants={{
                    hidden: { opacity: 0 },
                    visible: {
                      opacity: 1,
                      transition: {
                        staggerChildren: 0.1,
                        delayChildren: 1
                      }
                    }
                  }}
                >
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-blue-500 rounded-full mr-3" />
                    Review bed leveling procedure
                  </motion.li>
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3" />
                    Clean and maintain filament path
                  </motion.li>
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-orange-500 rounded-full mr-3" />
                    Check temperature sensor calibration
                  </motion.li>
                  <motion.li 
                    variants={{ hidden: { opacity: 0, x: 20 }, visible: { opacity: 1, x: 0 } }}
                    className="flex items-center"
                  >
                    <div className="w-2 h-2 bg-purple-500 rounded-full mr-3" />
                    Consider UPS for power stability
                  </motion.li>
                </motion.ul>
              </motion.div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}
