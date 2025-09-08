'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { LineChart, Line, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine } from 'recharts';
import Card, { CardContent } from '@/components/ui/Card';
import { Star, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface QualityScore {
  date: string;
  score: number;
}

interface QualityScoreChartProps {
  qualityScores: QualityScore[];
}

export default function QualityScoreChart({ qualityScores }: QualityScoreChartProps) {
  const averageScore = qualityScores.reduce((sum, item) => sum + item.score, 0) / qualityScores.length;
  const latestScore = qualityScores[qualityScores.length - 1]?.score || 0;
  const previousScore = qualityScores[qualityScores.length - 2]?.score || 0;
  const trend = latestScore - previousScore;

  const getTrendIcon = () => {
    if (trend > 0.1) return TrendingUp;
    if (trend < -0.1) return TrendingDown;
    return Minus;
  };

  const getTrendColor = () => {
    if (trend > 0.1) return 'text-green-600';
    if (trend < -0.1) return 'text-red-600';
    return 'text-gray-600';
  };

  const getScoreColor = (score: number) => {
    if (score >= 9) return '#10B981'; // green
    if (score >= 8) return '#F59E0B'; // yellow
    if (score >= 7) return '#F97316'; // orange
    return '#EF4444'; // red
  };

  const getScoreLabel = (score: number) => {
    if (score >= 9) return 'Excellent';
    if (score >= 8) return 'Good';
    if (score >= 7) return 'Fair';
    return 'Needs Improvement';
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const score = payload[0].value;
      const date = new Date(label).toLocaleDateString();
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{date}</p>
          <div className="flex items-center space-x-2 mt-1">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-yellow-600">
              Quality: {score}/10
            </span>
          </div>
          <p className="text-xs text-gray-600 mt-1">
            {getScoreLabel(score)}
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomDot = (props: any) => {
    const { cx, cy, payload } = props;
    const color = getScoreColor(payload.score);
    
    return (
      <motion.circle
        cx={cx}
        cy={cy}
        r={4}
        fill={color}
        stroke="#fff"
        strokeWidth={2}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: props.index * 0.1 }}
      />
    );
  };

  const TrendIcon = getTrendIcon();

  return (
    <motion.div
      variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}
    >
      <Card variant="elevated" hoverable>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Star className="w-5 h-5 mr-2 text-yellow-600" />
              Quality Score Trend
            </h3>
            <div className="flex items-center space-x-2">
              <TrendIcon className={`w-4 h-4 ${getTrendColor()}`} />
              <span className={`text-sm font-medium ${getTrendColor()}`}>
                {trend > 0 ? '+' : ''}{trend.toFixed(1)}
              </span>
            </div>
          </div>
          
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={qualityScores} margin={{ top: 10, right: 30, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.05}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                  tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { 
                    month: 'short', 
                    day: 'numeric' 
                  })}
                />
                <YAxis 
                  domain={[6, 10]} 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12, fill: '#6B7280' }}
                />
                
                {/* Reference lines for quality thresholds */}
                <ReferenceLine y={9} stroke="#10B981" strokeDasharray="5 5" opacity={0.5} />
                <ReferenceLine y={8} stroke="#F59E0B" strokeDasharray="5 5" opacity={0.5} />
                <ReferenceLine y={7} stroke="#F97316" strokeDasharray="5 5" opacity={0.5} />
                
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="score" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  dot={<CustomDot />}
                  activeDot={{ 
                    r: 6, 
                    fill: '#F59E0B',
                    stroke: '#fff',
                    strokeWidth: 2
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Quality Insights */}
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <Star className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Current</span>
                </div>
                <p className="text-lg font-semibold" style={{ color: getScoreColor(latestScore) }}>
                  {latestScore.toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-600">
                  {getScoreLabel(latestScore)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Average</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {averageScore.toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-600">
                  {getScoreLabel(averageScore)}
                </p>
              </div>
              
              <div className="text-center">
                <div className="flex items-center justify-center mb-1">
                  <span className="text-xs text-gray-500 uppercase tracking-wide">Best</span>
                </div>
                <p className="text-lg font-semibold text-green-600">
                  {Math.max(...qualityScores.map(s => s.score)).toFixed(1)}/10
                </p>
                <p className="text-xs text-gray-600">Peak performance</p>
              </div>
            </div>

            {/* Quality Tips */}
            <motion.div 
              className="mt-4 p-3 bg-yellow-50 rounded-lg"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <h4 className="text-sm font-medium text-yellow-800 mb-2">Quality Tips</h4>
              <ul className="text-xs text-yellow-700 space-y-1">
                <li>• Maintain consistent bed temperature for better adhesion</li>
                <li>• Regular nozzle cleaning improves print quality</li>
                <li>• Check filament quality and storage conditions</li>
                <li>• Calibrate your printer settings periodically</li>
              </ul>
            </motion.div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}