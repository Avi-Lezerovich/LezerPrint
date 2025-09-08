'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import { AlertTriangle, Lightbulb } from 'lucide-react';

interface ErrorType {
  type: string;
  count: number;
  percentage: number;
}

interface FailureAnalysisProps {
  errorTypes: ErrorType[];
}

export default function FailureAnalysis({ errorTypes }: FailureAnalysisProps) {
  const totalErrors = errorTypes.reduce((sum, error) => sum + error.count, 0);
  
  const recommendations = [
    {
      id: 'bed-leveling',
      text: 'Review bed leveling procedure',
      color: 'blue',
      applicable: errorTypes.some(e => e.type.toLowerCase().includes('bed')),
    },
    {
      id: 'filament-path',
      text: 'Clean and maintain filament path',
      color: 'green',
      applicable: errorTypes.some(e => e.type.toLowerCase().includes('filament') || e.type.toLowerCase().includes('jam')),
    },
    {
      id: 'temperature',
      text: 'Check temperature sensor calibration',
      color: 'orange',
      applicable: errorTypes.some(e => e.type.toLowerCase().includes('temperature')),
    },
    {
      id: 'power',
      text: 'Consider UPS for power stability',
      color: 'purple',
      applicable: errorTypes.some(e => e.type.toLowerCase().includes('power')),
    },
    {
      id: 'maintenance',
      text: 'Schedule regular maintenance checks',
      color: 'indigo',
      applicable: true,
    },
  ];

  const getRecommendationColor = (color: string) => {
    const colors = {
      blue: 'bg-blue-500',
      green: 'bg-green-500',
      orange: 'bg-orange-500',
      purple: 'bg-purple-500',
      indigo: 'bg-indigo-500',
    };
    return colors[color as keyof typeof colors] || 'bg-gray-500';
  };

  const getErrorSeverity = (percentage: number) => {
    if (percentage > 40) return { color: 'bg-red-500', label: 'Critical' };
    if (percentage > 20) return { color: 'bg-orange-500', label: 'High' };
    if (percentage > 10) return { color: 'bg-yellow-500', label: 'Medium' };
    return { color: 'bg-gray-500', label: 'Low' };
  };

  const applicableRecommendations = recommendations.filter(rec => rec.applicable);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.6 }}
    >
      <Card variant="elevated" hoverable>
        <CardContent>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-red-600" />
              Failure Analysis
            </h3>
            <div className="text-sm text-gray-600">
              Total Failures: <span className="font-semibold text-red-600">{totalErrors}</span>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Error Types */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <div className="w-4 h-4 bg-red-100 rounded mr-2" />
                Error Types & Frequency
              </h4>
              
              {errorTypes.length > 0 ? (
                <div className="space-y-3">
                  {errorTypes.map((error, index) => {
                    const severity = getErrorSeverity(error.percentage);
                    return (
                      <motion.div 
                        key={error.type} 
                        className="relative"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.9 + index * 0.1 }}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${severity.color}`} />
                            <span className="text-sm font-medium text-gray-900">
                              {error.type}
                            </span>
                            <span className={`text-xs px-2 py-1 rounded-full ${severity.color} text-white`}>
                              {severity.label}
                            </span>
                          </div>
                          <span className="text-sm text-gray-600">
                            {error.count} ({error.percentage.toFixed(1)}%)
                          </span>
                        </div>
                        
                        <div className="w-full bg-gray-200 rounded-full h-2 relative overflow-hidden">
                          <motion.div 
                            className={`h-2 rounded-full ${severity.color}`}
                            initial={{ width: 0 }}
                            animate={{ width: `${error.percentage}%` }}
                            transition={{ delay: 1 + index * 0.1, duration: 0.8, ease: "easeOut" }}
                          />
                        </div>
                      </motion.div>
                    );
                  })}
                </div>
              ) : (
                <motion.div 
                  className="text-center py-8"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-sm text-gray-500">No failures recorded</p>
                  <p className="text-xs text-green-600 mt-1">Excellent reliability!</p>
                </motion.div>
              )}
            </motion.div>

            {/* Recommendations */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 }}
            >
              <h4 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                <Lightbulb className="w-4 h-4 text-yellow-500 mr-2" />
                Recommendations
              </h4>
              
              <motion.div 
                className="space-y-3"
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
                {applicableRecommendations.map((recommendation, index) => (
                  <motion.div 
                    key={recommendation.id}
                    variants={{ 
                      hidden: { opacity: 0, x: 20 }, 
                      visible: { opacity: 1, x: 0 } 
                    }}
                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <div className={`w-2 h-2 ${getRecommendationColor(recommendation.color)} rounded-full mt-2 flex-shrink-0`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-800">
                        {recommendation.text}
                      </p>
                    </div>
                  </motion.div>
                ))}
                
                {/* Additional Tips */}
                <motion.div
                  variants={{ 
                    hidden: { opacity: 0, x: 20 }, 
                    visible: { opacity: 1, x: 0 } 
                  }}
                  className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200"
                >
                  <h5 className="text-sm font-medium text-blue-800 mb-2">Pro Tips</h5>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• Keep a maintenance log to track recurring issues</li>
                    <li>• Monitor environmental conditions (temperature, humidity)</li>
                    <li>• Use quality filament from trusted suppliers</li>
                    <li>• Update firmware regularly for optimal performance</li>
                  </ul>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>

          {/* Failure Rate Trend */}
          {totalErrors > 0 && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-200"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
            >
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium text-gray-700">Overall Reliability</h4>
                <div className="text-right">
                  <div className="text-sm font-semibold text-gray-900">
                    Failure Rate: {((totalErrors / (totalErrors + 147)) * 100).toFixed(2)}%
                  </div>
                  <div className="text-xs text-gray-500">
                    {totalErrors} failures out of {totalErrors + 147} prints
                  </div>
                </div>
              </div>
              
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <motion.div 
                  className="bg-green-500 h-2 rounded-full"
                  initial={{ width: 0 }}
                  animate={{ width: `${100 - ((totalErrors / (totalErrors + 147)) * 100)}%` }}
                  transition={{ delay: 1.4, duration: 0.8 }}
                />
              </div>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}