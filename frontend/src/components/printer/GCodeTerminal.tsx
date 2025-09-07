'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Send, 
  Terminal, 
  Play, 
  Pause, 
  RotateCcw, 
  Home, 
  Thermometer,
  Settings,
  History,
  Download,
  Upload,
  Trash2
} from 'lucide-react';

interface GCodeCommand {
  id: string;
  command: string;
  response?: string;
  timestamp: Date;
  type: 'sent' | 'received' | 'error' | 'system';
  status?: 'pending' | 'success' | 'error';
}

interface GCodeMacro {
  id: string;
  name: string;
  description: string;
  commands: string[];
  category: 'movement' | 'temperature' | 'calibration' | 'maintenance' | 'custom';
}

interface GCodeTerminalProps {
  demoMode?: boolean;
  readOnly?: boolean;
  className?: string;
}

const predefinedMacros: GCodeMacro[] = [
  {
    id: 'home-all',
    name: 'Home All Axes',
    description: 'Home X, Y, and Z axes',
    commands: ['G28'],
    category: 'movement',
  },
  {
    id: 'bed-level',
    name: 'Auto Bed Level',
    description: 'Perform automatic bed leveling',
    commands: ['G29'],
    category: 'calibration',
  },
  {
    id: 'preheat-pla',
    name: 'Preheat for PLA',
    description: 'Heat hotend to 200°C and bed to 60°C',
    commands: ['M104 S200', 'M140 S60'],
    category: 'temperature',
  },
  {
    id: 'preheat-petg',
    name: 'Preheat for PETG',
    description: 'Heat hotend to 240°C and bed to 80°C',
    commands: ['M104 S240', 'M140 S80'],
    category: 'temperature',
  },
  {
    id: 'cooldown',
    name: 'Cooldown',
    description: 'Turn off all heaters',
    commands: ['M104 S0', 'M140 S0'],
    category: 'temperature',
  },
  {
    id: 'disable-steppers',
    name: 'Disable Steppers',
    description: 'Turn off stepper motors',
    commands: ['M84'],
    category: 'movement',
  },
  {
    id: 'get-temps',
    name: 'Get Temperatures',
    description: 'Report current temperatures',
    commands: ['M105'],
    category: 'temperature',
  },
  {
    id: 'get-position',
    name: 'Get Position',
    description: 'Report current position',
    commands: ['M114'],
    category: 'movement',
  },
];

export default function GCodeTerminal({ 
  demoMode = false, 
  readOnly = false,
  className = '' 
}: GCodeTerminalProps) {
  const [commands, setCommands] = useState<GCodeCommand[]>([]);
  const [currentCommand, setCurrentCommand] = useState('');
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [isConnected, setIsConnected] = useState(demoMode);
  const [autoScroll, setAutoScroll] = useState(true);
  const [showMacros, setShowMacros] = useState(false);
  const [selectedMacroCategory, setSelectedMacroCategory] = useState<string>('all');
  
  const terminalRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (demoMode) {
      // Add some demo commands to show functionality
      setCommands([
        {
          id: '1',
          command: 'M105',
          response: 'ok T:210.0 /210.0 B:60.0 /60.0 @:127 B@:127',
          timestamp: new Date(Date.now() - 5000),
          type: 'received',
          status: 'success',
        },
        {
          id: '2',
          command: 'G28',
          response: 'ok',
          timestamp: new Date(Date.now() - 3000),
          type: 'received',
          status: 'success',
        },
      ]);
    }
  }, [demoMode]);

  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [commands, autoScroll]);

  const addCommand = useCallback((command: Omit<GCodeCommand, 'id' | 'timestamp'>) => {
    const newCommand: GCodeCommand = {
      ...command,
      id: Date.now().toString(),
      timestamp: new Date(),
    };
    setCommands(prev => [...prev, newCommand]);
  }, []);

  const sendCommand = async (command: string) => {
    if (!command.trim() || readOnly) return;

    const trimmedCommand = command.trim().toUpperCase();
    
    // Add to history
    setCommandHistory(prev => [trimmedCommand, ...prev.slice(0, 49)]); // Keep last 50
    setHistoryIndex(-1);
    
    // Add sent command
    addCommand({
      command: trimmedCommand,
      type: 'sent',
      status: 'pending',
    });

    if (demoMode) {
      // Simulate response in demo mode
      setTimeout(() => {
        const response = generateDemoResponse(trimmedCommand);
        addCommand({
          command: trimmedCommand,
          response,
          type: 'received',
          status: response.includes('Error') ? 'error' : 'success',
        });
      }, Math.random() * 1000 + 500);
    } else {
      try {
        // In real implementation, send to backend
        const response = await fetch('/api/printer/command', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ command: trimmedCommand }),
        });
        
        const data = await response.json();
        
        addCommand({
          command: trimmedCommand,
          response: data.response,
          type: 'received',
          status: data.success ? 'success' : 'error',
        });
      } catch (error) {
        addCommand({
          command: trimmedCommand,
          response: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
          status: 'error',
        });
      }
    }
    
    setCurrentCommand('');
  };

  const generateDemoResponse = (command: string): string => {
    const responses: { [key: string]: string } = {
      'M105': 'ok T:210.0 /210.0 B:60.0 /60.0 @:127 B@:127',
      'M114': 'ok X:100.0 Y:100.0 Z:10.0 E:0.0',
      'G28': 'ok',
      'G29': 'ok Bed leveling completed',
      'M104': 'ok',
      'M140': 'ok',
      'M84': 'ok',
    };

    for (const [cmd, response] of Object.entries(responses)) {
      if (command.startsWith(cmd)) {
        return response;
      }
    }
    
    return Math.random() > 0.1 ? 'ok' : 'Error: Unknown command';
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      sendCommand(currentCommand);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (historyIndex < commandHistory.length - 1) {
        const newIndex = historyIndex + 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex] || '');
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex > 0) {
        const newIndex = historyIndex - 1;
        setHistoryIndex(newIndex);
        setCurrentCommand(commandHistory[newIndex] || '');
      } else if (historyIndex === 0) {
        setHistoryIndex(-1);
        setCurrentCommand('');
      }
    }
  };

  const executeMacro = (macro: GCodeMacro) => {
    macro.commands.forEach((command, index) => {
      setTimeout(() => {
        sendCommand(command);
      }, index * 100); // Small delay between commands
    });
    setShowMacros(false);
  };

  const clearTerminal = () => {
    setCommands([]);
  };

  const filteredMacros = selectedMacroCategory === 'all' 
    ? predefinedMacros 
    : predefinedMacros.filter(m => m.category === selectedMacroCategory);

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card elevated hoverable>
        <CardContent className="p-0">
          {/* Enhanced Header */}
          <motion.div 
            className="flex items-center justify-between p-4 border-b border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <div className="flex items-center space-x-3">
              <motion.div
                initial={{ rotate: 0 }}
                animate={{ rotate: 360 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                <Terminal className="w-6 h-6 text-blue-600" />
              </motion.div>
              <h3 className="text-lg font-semibold text-gray-900">G-code Terminal</h3>
              <motion.div 
                className={`px-3 py-1 rounded-full text-xs font-medium ${
                  isConnected 
                    ? 'bg-green-100 text-green-800' 
                    : 'bg-red-100 text-red-800'
                }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.4, type: "spring" }}
              >
                {isConnected ? 'Connected' : 'Disconnected'}
              </motion.div>
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
            </div>
            
            <motion.div 
              className="flex items-center space-x-2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Button
                variant="primary"
                size="sm"
                onClick={() => setShowMacros(!showMacros)}
                className="flex items-center space-x-1"
              >
                <Settings className="w-4 h-4" />
                <span>Macros</span>
              </Button>
              <Button
                variant={autoScroll ? "success" : "secondary"}
                size="sm"
                onClick={() => setAutoScroll(!autoScroll)}
                className="flex items-center space-x-1"
              >
                <History className="w-4 h-4" />
                <span>Auto-scroll</span>
              </Button>
              <Button
                variant="danger"
                size="sm"
                onClick={clearTerminal}
                className="flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>Clear</span>
              </Button>
            </motion.div>
          </motion.div>

      {/* Macros Panel */}
      {showMacros && (
        <div className="border-b border-gray-200 p-4 bg-gray-50">
          <div className="flex items-center space-x-4 mb-3">
            <span className="text-sm font-medium text-gray-700">Quick Macros:</span>
            <select 
              value={selectedMacroCategory}
              onChange={(e) => setSelectedMacroCategory(e.target.value)}
              className="text-sm border border-gray-300 rounded-md px-2 py-1"
            >
              <option value="all">All</option>
              <option value="movement">Movement</option>
              <option value="temperature">Temperature</option>
              <option value="calibration">Calibration</option>
              <option value="maintenance">Maintenance</option>
            </select>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
            {filteredMacros.map((macro) => (
              <button
                key={macro.id}
                onClick={() => executeMacro(macro)}
                disabled={readOnly}
                className="p-2 text-left bg-white border border-gray-200 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                title={macro.description}
              >
                <div className="text-sm font-medium text-gray-900">{macro.name}</div>
                <div className="text-xs text-gray-500">{macro.commands.join(', ')}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Terminal Output */}
      <div 
        ref={terminalRef}
        className="h-96 overflow-y-auto p-4 bg-black text-green-400 font-mono text-sm"
      >
        {commands.length === 0 ? (
          <div className="text-gray-500">
            Terminal ready. Type G-code commands below.
            {!readOnly && (
              <>
                <br />Use arrow keys to navigate command history.
                <br />Click "Macros" for quick commands.
              </>
            )}
          </div>
        ) : (
          commands.map((cmd) => (
            <div key={cmd.id} className="mb-1">
              {cmd.type === 'sent' && (
                <div className="text-white">
                  <span className="text-blue-400">{'>'}</span> {cmd.command}
                  {cmd.status === 'pending' && (
                    <span className="text-yellow-400 ml-2">⟳</span>
                  )}
                </div>
              )}
              {cmd.type === 'received' && cmd.response && (
                <div className={cmd.status === 'error' ? 'text-red-400' : 'text-green-400'}>
                  {cmd.response}
                </div>
              )}
              {cmd.type === 'error' && (
                <div className="text-red-400">
                  Error: {cmd.response}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Command Input */}
      {!readOnly && (
        <div className="p-4 border-t border-gray-200 bg-gray-50">
          <div className="flex space-x-2">
            <div className="flex-1 relative">
              <input
                ref={inputRef}
                type="text"
                value={currentCommand}
                onChange={(e) => setCurrentCommand(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter G-code command (e.g., M105, G28, G1 X10 Y10)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                disabled={!isConnected}
              />
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-sm">
                Enter to send
              </div>
            </div>
            <button
              onClick={() => sendCommand(currentCommand)}
              disabled={!isConnected || !currentCommand.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
          
          {commandHistory.length > 0 && (
            <div className="mt-2 text-xs text-gray-500">
              Use ↑/↓ arrows for command history ({commandHistory.length} commands)
            </div>
          )}
        </div>
      )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
