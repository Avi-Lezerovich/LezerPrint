'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import Card, { CardContent } from '@/components/ui/Card';
import { Zap } from 'lucide-react';

interface MaterialUsage {
  material: string;
  weight: number;
  cost: number;
  color: string;
}

interface MaterialUsageChartProps {
  materialUsage: MaterialUsage[];
}

export default function MaterialUsageChart({ materialUsage }: MaterialUsageChartProps) {
  const total = materialUsage.reduce((sum, item) => sum + item.weight, 0);
  
  // Add percentage to data
  const dataWithPercentage = materialUsage.map(item => ({
    ...item,
    percentage: ((item.weight / total) * 100).toFixed(1)
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.material}</p>
          <div className="space-y-1">
            <p className="text-xs text-gray-600">Weight: {data.weight}g</p>
            <p className="text-xs text-gray-600">Cost: ${data.cost}</p>
            <p className="text-xs text-gray-600">Share: {data.percentage}%</p>
          </div>
        </div>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show label if slice is too small
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize="12"
        fontWeight="500"
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  const CustomLegend = ({ payload }: any) => (
    <div className="flex flex-wrap justify-center gap-4 mt-4">
      {payload?.map((entry: any, index: number) => (
        <motion.div
          key={index}
          className="flex items-center space-x-2"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: index * 0.1 }}
        >
          <div 
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-700">{entry.value}</span>
        </motion.div>
      ))}
    </div>
  );

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
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
                  data={dataWithPercentage}
                  cx="50%"
                  cy="40%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="weight"
                  animationBegin={0}
                  animationDuration={800}
                >
                  {dataWithPercentage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend content={<CustomLegend />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Material Details */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="space-y-3">
              {dataWithPercentage.map((material, index) => (
                <motion.div
                  key={material.material}
                  className="flex items-center justify-between"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 + index * 0.1 }}
                >
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-4 h-4 rounded-full"
                      style={{ backgroundColor: material.color }}
                    />
                    <span className="text-sm font-medium text-gray-900">
                      {material.material}
                    </span>
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-900">
                      {material.weight}g ({material.percentage}%)
                    </div>
                    <div className="text-xs text-gray-500">
                      ${material.cost}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
            
            {/* Totals */}
            <motion.div
              className="mt-4 pt-3 border-t border-gray-100 flex justify-between items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
            >
              <span className="text-sm font-medium text-gray-900">Total</span>
              <div className="text-right">
                <div className="text-sm font-semibold text-gray-900">
                  {total}g
                </div>
                <div className="text-xs text-gray-500">
                  ${materialUsage.reduce((sum, item) => sum + item.cost, 0).toFixed(2)}
                </div>
              </div>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}