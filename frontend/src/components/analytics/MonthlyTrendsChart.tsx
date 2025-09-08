'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { AreaChart, Area, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from '@/components/ui/Card';
import { TrendingUp } from 'lucide-react';

interface MonthlyData {
  month: string;
  prints: number;
  successful: number;
  failed: number;
  filament: number;
  time: number;
}

interface MonthlyTrendsChartProps {
  monthlyData: MonthlyData[];
  selectedMetric: 'prints' | 'time' | 'filament';
  onMetricChange: (metric: 'prints' | 'time' | 'filament') => void;
}

export default function MonthlyTrendsChart({ 
  monthlyData, 
  selectedMetric, 
  onMetricChange 
}: MonthlyTrendsChartProps) {
  const metricOptions = [
    { value: 'prints', label: 'Prints', unit: '' },
    { value: 'time', label: 'Time (hours)', unit: 'h' },
    { value: 'filament', label: 'Filament (g)', unit: 'g' },
  ];

  const currentMetric = metricOptions.find(m => m.value === selectedMetric);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const value = payload[0].value;
      const unit = currentMetric?.unit || '';
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{`${label}`}</p>
          <p className="text-sm text-blue-600">
            {`${currentMetric?.label}: ${value}${unit}`}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <Card variant="elevated" hoverable>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-600" />
              Monthly Trends
            </h3>
            <motion.select 
              value={selectedMetric} 
              onChange={(e) => onMetricChange(e.target.value as 'prints' | 'time' | 'filament')}
              className="text-sm border border-gray-300 rounded-md px-3 py-1 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              whileHover={{ scale: 1.02 }}
              whileFocus={{ scale: 1.02 }}
            >
              {metricOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </motion.select>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey={selectedMetric} 
                  stroke="#3B82F6" 
                  fill="url(#colorGradient)"
                  strokeWidth={2}
                  dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                  activeDot={{ 
                    r: 6, 
                    fill: '#3B82F6',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Summary Stats */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">This Month</p>
                <p className="text-sm font-semibold text-gray-900">
                  {monthlyData[monthlyData.length - 1]?.[selectedMetric] || 0}
                  {currentMetric?.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Average</p>
                <p className="text-sm font-semibold text-gray-900">
                  {(monthlyData.reduce((sum, item) => sum + item[selectedMetric], 0) / monthlyData.length).toFixed(1)}
                  {currentMetric?.unit}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 uppercase tracking-wide">Total</p>
                <p className="text-sm font-semibold text-gray-900">
                  {monthlyData.reduce((sum, item) => sum + item[selectedMetric], 0)}
                  {currentMetric?.unit}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}