'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';

interface CardProps {
  children?: ReactNode;
  className?: string;
  elevated?: boolean;
  hoverable?: boolean;
  loading?: boolean;
}

export default function Card({ 
  children, 
  className = '', 
  elevated = false,
  hoverable = false,
  loading = false,
}: CardProps) {
  const baseClasses = 'bg-white rounded-xl border border-gray-200 overflow-hidden';
  const elevatedClasses = elevated ? 'shadow-lg' : 'shadow-sm';
  const hoverClasses = hoverable ? 'hover:shadow-md transition-shadow duration-200' : '';
  
  const classes = `${baseClasses} ${elevatedClasses} ${hoverClasses} ${className}`;

  if (loading) {
    return (
      <div className={classes}>
        <div className="animate-pulse p-6">
          <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            <div className="h-3 bg-gray-200 rounded"></div>
            <div className="h-3 bg-gray-200 rounded w-5/6"></div>
            <div className="h-3 bg-gray-200 rounded w-4/6"></div>
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
      whileHover={hoverable ? { y: -2 } : undefined}
    >
      {children}
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
