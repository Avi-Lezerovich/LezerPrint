'use client';

import React, { forwardRef } from 'react';
import { motion } from 'framer-motion';

export interface GCodeCommand {
  id: string;
  command: string;
  response?: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'error' | 'system';
  status?: 'pending' | 'success' | 'error';
}

interface TerminalDisplayProps {
  commands: GCodeCommand[];
  readOnly?: boolean;
  className?: string;
}

const TerminalDisplay = forwardRef<HTMLDivElement, TerminalDisplayProps>(({
  commands,
  readOnly = false,
  className = "h-96"
}, ref) => {
  return (
    <div 
      ref={ref}
      className={`${className} overflow-y-auto p-4 bg-black text-green-400 font-mono text-sm`}
    >
      {commands.length === 0 ? (
        <motion.div 
          className="text-gray-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          Terminal ready. Type G-code commands below.
          {!readOnly && (
            <>
              <br />Use arrow keys to navigate command history.
              <br />Click "Macros" for quick commands.
            </>
          )}
        </motion.div>
      ) : (
        <div className="space-y-1">
          {commands.map((cmd, index) => (
            <motion.div 
              key={cmd.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              {/* Sent Commands */}
              {cmd.type === 'sent' && (
                <div className="text-white flex items-center">
                  <span className="text-blue-400 mr-2 select-none">{'>'}</span>
                  <span className="font-medium">{cmd.command}</span>
                  {cmd.status === 'pending' && (
                    <motion.span 
                      className="text-yellow-400 ml-2"
                      animate={{ rotate: 360 }}
                      transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                    >
                      ⟳
                    </motion.span>
                  )}
                  <span className="text-xs text-gray-500 ml-auto opacity-0 group-hover:opacity-100 transition-opacity">
                    {cmd.timestamp.toLocaleTimeString()}
                  </span>
                </div>
              )}
              
              {/* Received Responses */}
              {cmd.type === 'received' && cmd.response && (
                <div className={`ml-4 ${cmd.status === 'error' ? 'text-red-400' : 'text-green-400'}`}>
                  {cmd.response}
                </div>
              )}
              
              {/* Error Messages */}
              {cmd.type === 'error' && (
                <div className="text-red-400 ml-4 flex items-center">
                  <span className="mr-2">❌</span>
                  <span>Error: {cmd.response}</span>
                </div>
              )}
              
              {/* System Messages */}
              {cmd.type === 'system' && (
                <div className="text-yellow-400 ml-4 flex items-center">
                  <span className="mr-2">ℹ️</span>
                  <span>{cmd.response}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
});

TerminalDisplay.displayName = 'TerminalDisplay';

export default TerminalDisplay;