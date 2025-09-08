'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import { 
  Package, 
  CheckCircle, 
  Clock, 
  TrendingUp, 
  DollarSign, 
  Zap
} from 'lucide-react';

interface PrintStats {
  totalPrints: number;
  successRate: number;
  totalPrintTime: number;
  totalFilamentUsed: number;
  averagePrintTime: number;
  costSavings: number;
}

interface MetricsOverviewProps {
  printStats: PrintStats;
}

export default function MetricsOverview({ printStats }: MetricsOverviewProps) {
  const metrics = [
    {
      id: 'totalPrints',
      title: 'Total Prints',
      value: printStats.totalPrints,
      color: 'blue',
      icon: Package,
      trend: '+12% from last month',
      trendIcon: TrendingUp,
      delay: 0.2,
    },
    {
      id: 'successRate',
      title: 'Success Rate',
      value: `${printStats.successRate}%`,
      color: 'green',
      icon: CheckCircle,
      trend: 'Excellent performance',
      trendIcon: CheckCircle,
      delay: 0.3,
    },
    {
      id: 'totalPrintTime',
      title: 'Print Time',
      value: `${printStats.totalPrintTime.toFixed(1)}h`,
      color: 'purple',
      icon: Clock,
      trend: `Avg: ${printStats.averagePrintTime.toFixed(1)}h`,
      trendIcon: Clock,
      delay: 0.4,
    },
    {
      id: 'filamentUsed',
      title: 'Filament Used',
      value: `${(printStats.totalFilamentUsed / 1000).toFixed(1)}kg`,
      color: 'orange',
      icon: Zap,
      trend: `Saved: $${printStats.costSavings}`,
      trendIcon: DollarSign,
      delay: 0.5,
    },
  ];

  const colorClasses = {
    blue: {
      text: 'text-blue-600',
      bg: 'bg-blue-100',
      trend: 'text-blue-600',
    },
    green: {
      text: 'text-green-600',
      bg: 'bg-green-100',
      trend: 'text-green-600',
    },
    purple: {
      text: 'text-purple-600',
      bg: 'bg-purple-100',
      trend: 'text-purple-600',
    },
    orange: {
      text: 'text-orange-600',
      bg: 'bg-orange-100',
      trend: 'text-orange-600',
    },
  };

  return (
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
      {metrics.map((metric) => {
        const colors = colorClasses[metric.color as keyof typeof colorClasses];
        const IconComponent = metric.icon;
        const TrendIcon = metric.trendIcon;

        return (
          <motion.div
            key={metric.id}
            variants={{ 
              hidden: { opacity: 0, y: 20 }, 
              visible: { opacity: 1, y: 0 } 
            }}
          >
            <Card variant="elevated" hoverable>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-500 mb-1">
                      {metric.title}
                    </p>
                    <motion.p 
                      className={`text-2xl font-bold ${colors.text}`}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: metric.delay, type: "spring" }}
                    >
                      {metric.value}
                    </motion.p>
                    <div className="flex items-center mt-1">
                      <TrendIcon className={`w-3 h-3 mr-1 ${colors.text}`} />
                      <span className={`text-xs ${colors.trend}`}>
                        {metric.trend}
                      </span>
                    </div>
                  </div>
                  <motion.div 
                    className={`p-3 ${colors.bg} rounded-full`}
                    whileHover={{ scale: 1.1 }}
                    transition={{ type: "spring", stiffness: 400 }}
                  >
                    <IconComponent className={`w-6 h-6 ${colors.text}`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </motion.div>
  );
}