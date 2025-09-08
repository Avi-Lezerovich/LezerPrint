'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';

// Import new component modules
import TerminalHeader from './TerminalHeader';
import MacroPanel, { type GCodeMacro } from './MacroPanel';
import TerminalDisplay, { type GCodeCommand } from './TerminalDisplay';
import CommandInput from './CommandInput';


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

  return (
    <motion.div 
      className={`${className}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card variant="elevated" hoverable>
        <CardContent className="p-0">
          {/* Terminal Header */}
          <TerminalHeader
            isConnected={isConnected}
            demoMode={demoMode}
            showMacros={showMacros}
            onToggleMacros={() => setShowMacros(!showMacros)}
            autoScroll={autoScroll}
            onToggleAutoScroll={() => setAutoScroll(!autoScroll)}
            onClearTerminal={clearTerminal}
            commandCount={commands.length}
          />

          {/* Macros Panel */}
          <MacroPanel
            isVisible={showMacros}
            macros={predefinedMacros}
            selectedCategory={selectedMacroCategory}
            onCategoryChange={setSelectedMacroCategory}
            onExecuteMacro={executeMacro}
            readOnly={readOnly}
          />

          {/* Terminal Display */}
          <TerminalDisplay
            ref={terminalRef}
            commands={commands}
            readOnly={readOnly}
            className="h-96"
          />

          {/* Command Input */}
          <CommandInput
            currentCommand={currentCommand}
            onCommandChange={setCurrentCommand}
            onSendCommand={sendCommand}
            commandHistory={commandHistory}
            historyIndex={historyIndex}
            onHistoryChange={(index, command) => {
              setHistoryIndex(index);
              setCurrentCommand(command);
            }}
            isConnected={isConnected}
            readOnly={readOnly}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
