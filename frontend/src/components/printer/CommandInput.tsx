'use client';

import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, Keyboard } from 'lucide-react';

interface CommandInputProps {
  currentCommand: string;
  onCommandChange: (command: string) => void;
  onSendCommand: (command: string) => void;
  commandHistory: string[];
  historyIndex: number;
  onHistoryChange: (index: number, command: string) => void;
  isConnected: boolean;
  readOnly?: boolean;
  className?: string;
}

export default function CommandInput({
  currentCommand,
  onCommandChange,
  onSendCommand,
  commandHistory,
  historyIndex,
  onHistoryChange,
  isConnected,
  readOnly = false,
  className = ""
}: CommandInputProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current && !readOnly) {
      inputRef.current.focus();
    }
  }, [readOnly]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (currentCommand.trim()) {
        onSendCommand(currentCommand);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        const command = commandHistory[newIndex] || '';
        onHistoryChange(newIndex, command);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        const command = commandHistory[newIndex] || '';
        onHistoryChange(newIndex, command);
      } else if (historyIndex === 0) {
        onHistoryChange(-1, '');
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCommandChange('');
      onHistoryChange(-1, '');
    }
  };

  if (readOnly) {
    return null;
  }

  return (
    <motion.div 
      className={`p-4 border-t border-gray-200 bg-gray-50 ${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex space-x-2">
        <div className="flex-1 relative">
          <input
            ref={inputRef}
            type="text"
            value={currentCommand}
            onChange={(e) => onCommandChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter G-code command (e.g., M105, G28, G1 X10 Y10)"
            className={`w-full px-3 py-2 pr-24 border rounded-md font-mono text-sm transition-colors ${
              isConnected 
                ? 'border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500' 
                : 'border-red-300 bg-red-50'
            }`}
            disabled={!isConnected}
            autoComplete="off"
            spellCheck={false}
          />
          
          {/* Input Hint */}
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 flex items-center space-x-1 text-gray-400 text-xs">
            <Keyboard className="w-3 h-3" />
            <span>Enter</span>
          </div>
        </div>
        
        <motion.button
          onClick={() => onSendCommand(currentCommand)}
          disabled={!isConnected || !currentCommand.trim()}
          className={`px-4 py-2 rounded-md font-medium transition-colors flex items-center space-x-2 ${
            isConnected && currentCommand.trim()
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
          whileHover={{ scale: isConnected && currentCommand.trim() ? 1.02 : 1 }}
          whileTap={{ scale: isConnected && currentCommand.trim() ? 0.98 : 1 }}
        >
          <Send className="w-4 h-4" />
          <span>Send</span>
        </motion.button>
      </div>
      
      {/* Status and History Info */}
      <div className="mt-2 flex items-center justify-between">
        <div className="flex items-center space-x-4 text-xs">
          {/* Connection Status */}
          <div className={`flex items-center space-x-1 ${
            isConnected ? 'text-green-600' : 'text-red-600'
          }`}>
            <div className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`} />
            <span>{isConnected ? 'Connected' : 'Disconnected'}</span>
          </div>
          
          {/* Command History Info */}
          {commandHistory.length > 0 && (
            <div className="text-gray-500">
              History: {commandHistory.length} commands
            </div>
          )}
        </div>
        
        {/* Keyboard Shortcuts */}
        <div className="text-xs text-gray-400 flex items-center space-x-3">
          <span>↑/↓ History</span>
          <span>Esc Clear</span>
          <span>Enter Send</span>
        </div>
      </div>
      
      {/* Current History Position */}
      {historyIndex >= 0 && (
        <motion.div 
          className="mt-1 text-xs text-blue-600"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          History: {historyIndex + 1} of {commandHistory.length}
        </motion.div>
      )}
    </motion.div>
  );
}