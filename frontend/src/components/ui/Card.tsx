'use client';

import { motion } from 'framer-motion';
import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface CardProps {
  children?: ReactNode;
  className?: string;
  variant?: 'default' | 'glass' | 'elevated';
  hoverable?: boolean;
  loading?: boolean;
  title?: string;
  description?: string;
  icon?: ReactNode;
}

export default function Card({ 
  children, 
  className = '', 
  variant = 'default',
  hoverable = false,
  loading = false,
  title,
  description,
  icon,
}: CardProps) {
  const baseClasses = 'rounded-2xl border overflow-hidden transition-all duration-300';
  
  const variantClasses = {
    default: 'bg-white border-gray-200 shadow-lg',
    glass: 'bg-white/80 backdrop-blur-sm border-white/20 shadow-lg',
    elevated: 'bg-white border-gray-200 shadow-xl',
  };
  
  const hoverClasses = hoverable ? 'hover:shadow-xl hover:scale-105 cursor-pointer' : '';
  
  const classes = cn(
    baseClasses,
    variantClasses[variant],
    hoverClasses,
    className
  );

  if (loading) {
    return (
      <div className={classes}>
        <div className="animate-pulse p-6">
          <div className="flex items-start space-x-4">
            <div className="w-12 h-12 bg-gray-200 rounded-xl"></div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      className={classes}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hoverable ? { scale: 1.02 } : {}}
    >
      {(title || description || icon) && (
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-start space-x-4">
            {icon && (
              <div className="flex-shrink-0">
                {icon}
              </div>
            )}
            <div className="flex-1 min-w-0">
              {title && (
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      {children && (
        <div className="p-6">
          {children}
        </div>
      )}
    </motion.div>
  );
}

interface CardHeaderProps {
  children: ReactNode;
  className?: string;
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}

interface CardContentProps {
  children: ReactNode;
  className?: string;
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={`p-6 ${className}`}>
      {children}
    </div>
  );
}

interface CardFooterProps {
  children: ReactNode;
  className?: string;
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`px-6 py-4 border-t border-gray-200 bg-gray-50 ${className}`}>
      {children}
    </div>
  );
}
