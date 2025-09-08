'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Zap, Home, Thermometer, Target, Wrench } from 'lucide-react';

export interface GCodeMacro {
  id: string;
  name: string;
  description: string;
  commands: string[];
  category: 'movement' | 'temperature' | 'calibration' | 'maintenance' | 'custom';
}

interface MacroPanelProps {
  isVisible: boolean;
  macros: GCodeMacro[];
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  onExecuteMacro: (macro: GCodeMacro) => void;
  readOnly?: boolean;
}

export default function MacroPanel({
  isVisible,
  macros,
  selectedCategory,
  onCategoryChange,
  onExecuteMacro,
  readOnly = false
}: MacroPanelProps) {
  const categories = [
    { value: 'all', label: 'All Macros', icon: Zap },
    { value: 'movement', label: 'Movement', icon: Home },
    { value: 'temperature', label: 'Temperature', icon: Thermometer },
    { value: 'calibration', label: 'Calibration', icon: Target },
    { value: 'maintenance', label: 'Maintenance', icon: Wrench },
  ];

  const filteredMacros = selectedCategory === 'all' 
    ? macros 
    : macros.filter(m => m.category === selectedCategory);

  const getCategoryIcon = (category: string) => {
    const categoryData = categories.find(c => c.value === category);
    return categoryData?.icon || Zap;
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      movement: 'text-blue-600 bg-blue-100 border-blue-200',
      temperature: 'text-red-600 bg-red-100 border-red-200',
      calibration: 'text-green-600 bg-green-100 border-green-200',
      maintenance: 'text-orange-600 bg-orange-100 border-orange-200',
      custom: 'text-purple-600 bg-purple-100 border-purple-200',
    };
    return colors[category as keyof typeof colors] || 'text-gray-600 bg-gray-100 border-gray-200';
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50 overflow-hidden"
        >
          <div className="p-4">
            {/* Category Filter */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <h4 className="text-sm font-semibold text-gray-900">Quick Macros</h4>
                <div className="flex items-center space-x-1">
                  {categories.map(category => {
                    const IconComponent = category.icon;
                    return (
                      <motion.button
                        key={category.value}
                        onClick={() => onCategoryChange(category.value)}
                        className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                          selectedCategory === category.value
                            ? 'bg-blue-600 text-white'
                            : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
                        }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <div className="flex items-center space-x-1">
                          <IconComponent className="w-3 h-3" />
                          <span>{category.label}</span>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
              
              <div className="text-xs text-gray-500">
                {filteredMacros.length} macro{filteredMacros.length !== 1 ? 's' : ''} available
              </div>
            </div>
            
            {/* Macro Grid */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
              layout
            >
              {filteredMacros.map((macro, index) => {
                const IconComponent = getCategoryIcon(macro.category);
                const colorClass = getCategoryColor(macro.category);
                
                return (
                  <motion.button
                    key={macro.id}
                    onClick={() => onExecuteMacro(macro)}
                    disabled={readOnly}
                    className={`p-3 text-left bg-white border rounded-lg hover:shadow-md transition-all duration-200 group ${
                      readOnly ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    layout
                    whileHover={{ y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    title={macro.description}
                  >
                    {/* Macro Header */}
                    <div className="flex items-center justify-between mb-2">
                      <div className={`p-1.5 rounded-md ${colorClass.split(' ')[1]} ${colorClass.split(' ')[2]}`}>
                        <IconComponent className={`w-3 h-3 ${colorClass.split(' ')[0]}`} />
                      </div>
                      <motion.div
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        whileHover={{ scale: 1.2 }}
                      >
                        <Play className="w-3 h-3 text-green-600" />
                      </motion.div>
                    </div>
                    
                    {/* Macro Content */}
                    <div className="space-y-1">
                      <h5 className="text-sm font-medium text-gray-900 group-hover:text-blue-700 transition-colors">
                        {macro.name}
                      </h5>
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {macro.description}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {macro.commands.slice(0, 3).map((cmd, cmdIndex) => (
                          <span 
                            key={cmdIndex}
                            className="px-1.5 py-0.5 bg-gray-100 text-gray-600 text-xs font-mono rounded"
                          >
                            {cmd}
                          </span>
                        ))}
                        {macro.commands.length > 3 && (
                          <span className="text-xs text-gray-400">
                            +{macro.commands.length - 3} more
                          </span>
                        )}
                      </div>
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
            
            {/* Empty State */}
            {filteredMacros.length === 0 && (
              <motion.div 
                className="text-center py-8"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Zap className="w-8 h-8 text-gray-400" />
                </div>
                <p className="text-sm text-gray-500">No macros found in this category</p>
                <p className="text-xs text-gray-400 mt-1">Try selecting a different category</p>
              </motion.div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}