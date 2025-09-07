'use client';

import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function LoadingSpinner({ size = 'md', className = '' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  };

  return (
    <motion.div
      className={`inline-block border-2 border-gray-300 border-t-blue-600 rounded-full ${sizeClasses[size]} ${className}`}
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
    />
  );
}

interface SkeletonProps {
  className?: string;
  loading?: boolean;
  children?: React.ReactNode;
}

export function Skeleton({ className = '', loading = true, children }: SkeletonProps) {
  if (!loading) {
    return <>{children}</>;
  }

  return (
    <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
  );
}

interface ProgressBarProps {
  value: number;
  max?: number;
  className?: string;
  showValue?: boolean;
  color?: 'blue' | 'green' | 'red' | 'yellow';
  animated?: boolean;
}

export function ProgressBar({ 
  value, 
  max = 100, 
  className = '', 
  showValue = false,
  color = 'blue',
  animated = false 
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100);
  
  const colorClasses = {
    blue: 'bg-blue-600',
    green: 'bg-green-600',
    red: 'bg-red-600',
    yellow: 'bg-yellow-600',
  };

  return (
    <div className={`w-full bg-gray-200 rounded-full h-2 ${className}`}>
      <motion.div
        className={`h-full rounded-full ${colorClasses[color]} ${animated ? 'bg-gradient-to-r from-blue-400 to-blue-600' : ''}`}
        initial={{ width: 0 }}
        animate={{ width: `${percentage}%` }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        {animated && (
          <motion.div
            className="h-full w-full bg-gradient-to-r from-transparent via-white to-transparent opacity-30 rounded-full"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          />
        )}
      </motion.div>
      {showValue && (
        <div className="text-xs text-gray-600 mt-1 text-center">
          {percentage.toFixed(1)}%
        </div>
      )}
    </div>
  );
}
