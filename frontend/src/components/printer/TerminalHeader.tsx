'use client';

import React from 'react';
import { motion } from 'framer-motion';
import Button from '@/components/ui/Button';
import { 
  Terminal, 
  Settings, 
  History, 
  Trash2,
  Wifi,
  WifiOff 
} from 'lucide-react';

interface TerminalHeaderProps {
  isConnected: boolean;
  demoMode: boolean;
  showMacros: boolean;
  onToggleMacros: () => void;
  autoScroll: boolean;
  onToggleAutoScroll: () => void;
  onClearTerminal: () => void;
  commandCount: number;
}

export default function TerminalHeader({
  isConnected,
  demoMode,
  showMacros,
  onToggleMacros,
  autoScroll,
  onToggleAutoScroll,
  onClearTerminal,
  commandCount
}: TerminalHeaderProps) {
  return (
    <motion.div 
      className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-white to-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
    >
      {/* Left Side - Title and Status */}
      <div className="flex items-center space-x-3">
        <motion.div
          initial={{ rotate: 0 }}
          animate={{ rotate: 360 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <Terminal className="w-6 h-6 text-blue-600" />
        </motion.div>
        
        <h3 className="text-lg font-semibold text-gray-900">G-code Terminal</h3>
        
        {/* Connection Status */}
        <motion.div 
          className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium ${
            isConnected 
              ? 'bg-green-100 text-green-800' 
              : 'bg-red-100 text-red-800'
          }`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring" }}
        >
          {isConnected ? (
            <Wifi className="w-3 h-3" />
          ) : (
            <WifiOff className="w-3 h-3" />
          )}
          <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </motion.div>
        
        {/* Demo Mode Badge */}
        {demoMode && (
          <motion.div 
            className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
          >
            Demo Mode
          </motion.div>
        )}
        
        {/* Command Count */}
        {commandCount > 0 && (
          <motion.div 
            className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.6 }}
          >
            {commandCount} commands
          </motion.div>
        )}
      </div>
      
      {/* Right Side - Controls */}
      <motion.div 
        className="flex items-center space-x-2"
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.3 }}
      >
        {/* Macros Toggle */}
        <Button
          variant={showMacros ? "primary" : "secondary"}
          size="sm"
          onClick={onToggleMacros}
          className="flex items-center space-x-1"
        >
          <Settings className="w-4 h-4" />
          <span>Macros</span>
        </Button>
        
        {/* Auto-scroll Toggle */}
        <Button
          variant={autoScroll ? "success" : "secondary"}
          size="sm"
          onClick={onToggleAutoScroll}
          className="flex items-center space-x-1"
          title={autoScroll ? "Auto-scroll enabled" : "Auto-scroll disabled"}
        >
          <History className="w-4 h-4" />
          <span className="hidden sm:inline">Auto-scroll</span>
        </Button>
        
        {/* Clear Terminal */}
        <Button
          variant="danger"
          size="sm"
          onClick={onClearTerminal}
          className="flex items-center space-x-1"
          disabled={commandCount === 0}
          title={commandCount > 0 ? "Clear all commands" : "No commands to clear"}
        >
          <Trash2 className="w-4 h-4" />
          <span className="hidden sm:inline">Clear</span>
        </Button>
      </motion.div>
    </motion.div>
  );
}