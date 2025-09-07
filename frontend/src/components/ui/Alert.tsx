'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  message: string;
  icon?: LucideIcon;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

export default function Alert({
  type = 'info',
  title,
  message,
  icon: Icon,
  dismissible = false,
  onDismiss,
  className = '',
}: AlertProps) {
  const typeStyles = {
    info: {
      container: 'bg-blue-50 border-blue-200 text-blue-800',
      icon: 'text-blue-500',
      title: 'text-blue-900',
    },
    success: {
      container: 'bg-green-50 border-green-200 text-green-800',
      icon: 'text-green-500',
      title: 'text-green-900',
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
      icon: 'text-yellow-500',
      title: 'text-yellow-900',
    },
    error: {
      container: 'bg-red-50 border-red-200 text-red-800',
      icon: 'text-red-500',
      title: 'text-red-900',
    },
  };

  const styles = typeStyles[type];

  return (
    <motion.div
      initial={{ opacity: 0, y: -10, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.2 }}
      className={`rounded-lg border p-4 ${styles.container} ${className}`}
    >
      <div className="flex items-start">
        {Icon && (
          <div className="flex-shrink-0">
            <Icon className={`h-5 w-5 ${styles.icon}`} />
          </div>
        )}
        <div className={Icon ? 'ml-3' : ''}>
          {title && (
            <h3 className={`text-sm font-medium ${styles.title}`}>
              {title}
            </h3>
          )}
          <div className={`text-sm ${title ? 'mt-1' : ''}`}>
            {message}
          </div>
        </div>
        {dismissible && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                onClick={onDismiss}
                className={`inline-flex rounded-md p-1.5 hover:bg-opacity-20 focus:outline-none focus:ring-2 focus:ring-offset-2 ${styles.icon}`}
              >
                <span className="sr-only">Dismiss</span>
                <svg className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
}

interface ToastProps {
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error';
  duration?: number;
  onClose?: () => void;
}

export function Toast({ message, type = 'info', duration = 5000, onClose }: ToastProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 100 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className="fixed top-4 right-4 z-50"
    >
      <Alert
        type={type}
        message={message}
        dismissible
        onDismiss={onClose}
        className="min-w-80 shadow-lg"
      />
    </motion.div>
  );
}
