'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import Card, { CardContent } from '@/components/ui/Card';
import { Clock } from 'lucide-react';

interface PrintDurationData {
  duration: string;
  count: number;
}

interface PrintDurationChartProps {
  printTimes: PrintDurationData[];
}

export default function PrintDurationChart({ printTimes }: PrintDurationChartProps) {
  const totalPrints = printTimes.reduce((sum, item) => sum + item.count, 0);
  
  // Add percentage to data
  const dataWithPercentage = printTimes.map(item => ({
    ...item,
    percentage: ((item.count / totalPrints) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <div className="space-y-1">
            <p className="text-sm text-green-600">Prints: {data.count}</p>
            <p className="text-xs text-gray-600">Share: {data.percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomBar = (props: any) => {
    const { fill, ...rest } = props;
    return (
      <motion.rect
        {...rest}
        fill={fill}
        initial={{ height: 0, y: props.y + props.height }}
        animate={{ height: props.height, y: props.y }}
        transition={{ duration: 0.8, delay: props.index * 0.1 }}
      />
    );
  };

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <Card variant="elevated" hoverable>
        <CardContent>
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Clock className="w-5 h-5 mr-2 text-green-600" />
            Print Duration Distribution
          </h3>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dataWithPercentage} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.6}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="duration" 
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
                <Bar 
                  dataKey="count" 
                  fill="url(#barGradient)" 
                  radius={[4, 4, 0, 0]}
                  shape={<CustomBar />}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Duration Insights */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Most Common</h4>
                {(() => {
                  const mostCommon = dataWithPercentage.reduce((max, item) => 
                    item.count > max.count ? item : max
                  );
                  return (
                    <div className="text-center p-3 bg-green-50 rounded-lg">
                      <p className="text-lg font-semibold text-green-700">
                        {mostCommon.duration}
                      </p>
                      <p className="text-xs text-green-600">
                        {mostCommon.count} prints ({mostCommon.percentage}%)
                      </p>
                    </div>
                  );
                })()}
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-700 mb-2">Quick Prints</h4>
                {(() => {
                  const quickPrints = dataWithPercentage
                    .filter(item => ['< 1h', '1-3h'].includes(item.duration))
                    .reduce((sum, item) => sum + item.count, 0);
                  const percentage = ((quickPrints / totalPrints) * 100).toFixed(1);
                  
                  return (
                    <div className="text-center p-3 bg-blue-50 rounded-lg">
                      <p className="text-lg font-semibold text-blue-700">
                        {quickPrints}
                      </p>
                      <p className="text-xs text-blue-600">
                        Under 3h ({percentage}%)
                      </p>
                    </div>
                  );
                })()}
              </div>
            </div>
            
            {/* Duration Breakdown */}
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Duration Breakdown</h4>
              {dataWithPercentage.map((item, index) => (
                <motion.div
                  key={item.duration}
                  className="flex items-center justify-between py-1"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full" />
                    <span className="text-sm text-gray-700">{item.duration}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-20 bg-gray-200 rounded-full h-2">
                      <motion.div
                        className="bg-green-500 h-2 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${item.percentage}%` }}
                        transition={{ delay: 0.5 + index * 0.1, duration: 0.5 }}
                      />
                    </div>
                    <span className="text-sm text-gray-600 w-12 text-right">
                      {item.count}
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}