'use client';

import React, { forwardRef } from 'react';
import { ChevronDown } from 'lucide-react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  placeholder?: string;
  variant?: 'default' | 'outlined' | 'filled';
  size?: 'sm' | 'md' | 'lg';
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(({
  className = '',
  label,
  error,
  helperText,
  options,
  placeholder = 'Select an option...',
  variant = 'default',
  size = 'md',
  ...props
}, ref) => {
  const baseClasses = `
    w-full rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 
    font-medium appearance-none cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed
    bg-white
  `;

  const variantClasses = {
    default: `
      border border-gray-200 text-gray-900 
      focus:border-primary-500 focus:ring-primary-100
      hover:border-gray-300
    `,
    outlined: `
      border-2 border-gray-200 text-gray-900
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
    sm: 'px-3 py-2 pr-8 text-sm',
    md: 'px-4 py-3 pr-10 text-base',
    lg: 'px-5 py-4 pr-12 text-lg'
  };

  const errorClasses = error ? `
    border-red-300 focus:border-red-500 focus:ring-red-100
    text-red-900
  ` : '';

  const selectClasses = `
    ${baseClasses}
    ${variantClasses[variant]}
    ${sizeClasses[size]}
    ${errorClasses}
    ${className}
  `;

  const iconSize = {
    sm: 16,
    md: 20,
    lg: 24
  };

  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-semibold text-gray-700">
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={selectClasses}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option
              key={option.value}
              value={option.value}
              disabled={option.disabled}
            >
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
          <ChevronDown 
            size={iconSize[size]} 
            className={`text-gray-400 ${error ? 'text-red-400' : ''}`}
          />
        </div>
      </div>
      
      {(error || helperText) && (
        <p className={`text-sm ${error ? 'text-red-600' : 'text-gray-500'}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
