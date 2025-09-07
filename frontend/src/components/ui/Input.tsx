'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  className = '',
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  variant = 'default',
  size = 'md',
  type = 'text',
  ...props
}, ref) => {
  const baseClasses = `
    w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 
    font-medium placeholder:text-gray-400 disabled:opacity-50 disabled:cursor-not-allowed
  `;

  const variantClasses = {
    default: `
      border border-gray-200 bg-white text-gray-900 
      focus:border-primary-500 focus:ring-primary-100
      hover:border-gray-300
    `,
    outlined: `
      border-2 border-gray-200 bg-transparent text-gray-900
      focus:border-primary-500 focus:ring-primary-100
      hover:border-gray-300
    `,
    filled: `
      border-0 bg-gray-100 text-gray-900
      focus:bg-white focus:ring-primary-100 focus:shadow-md
      hover:bg-gray-50
    `
  };

  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-5 py-4 text-lg'
  };

  const errorClasses = error ? `
    border-red-300 focus:border-red-500 focus:ring-red-100
    text-red-900 placeholder:text-red-300
  ` : '';

  const inputClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${errorClasses}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon ? 'pr-10' : ''}
    ${className}
  `;

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={ref}
          type={type}
          className={inputClasses}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
            {rightIcon}
          </div>
        )}
      </div>
      
      {(error || helperText) && (
        <motion.p 
          className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error || helperText}
        </motion.p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
