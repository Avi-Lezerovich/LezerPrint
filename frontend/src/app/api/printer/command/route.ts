import { NextRequest, NextResponse } from 'next/server';

interface GCodeCommand {
  command: string;
  priority?: 'low' | 'normal' | 'high' | 'emergency';
  requiresResponse?: boolean;
}

interface CommandResponse {
  success: boolean;
  response: string;
  executionTime: number;
  command: string;
}

// Mock printer responses for demo mode
const mockResponses: { [key: string]: string } = {
  'M105': 'ok T:210.0 /210.0 B:60.0 /60.0 @:127 B@:127',
  'M114': 'ok X:100.0 Y:100.0 Z:10.0 E:0.0',
  'G28': 'ok',
  'G29': 'ok Bed leveling completed',
  'M104': 'ok',
  'M140': 'ok',
  'M84': 'ok',
  'M107': 'ok',
  'M106': 'ok',
  'G1': 'ok',
  'G0': 'ok',
  'M503': `Configuration stored to EEPROM
M92 X80.00 Y80.00 Z400.00 E93.00
M203 X500.00 Y500.00 Z5.00 E25.00
M201 X500 Y500 Z100 E5000
M205 X8.00 Y8.00 Z0.40 E5.00
M206 X0.00 Y0.00 Z0.00
ok`,
};

// Simulate command queue and execution
class CommandQueue {
  private queue: Array<GCodeCommand & { id: string; timestamp: Date }> = [];
  private isProcessing = false;

  public addCommand(command: GCodeCommand): string {
    const id = Date.now().toString() + Math.random().toString(36).substr(2, 9);
    this.queue.push({
      ...command,
      id,
      timestamp: new Date(),
    });
    this.processQueue();
    return id;
  }

  private async processQueue(): Promise<void> {
    if (this.isProcessing) return;
    this.isProcessing = true;

    while (this.queue.length > 0) {
      const command = this.queue.shift()!;
      await this.executeCommand(command);
      
      // Small delay between commands
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    this.isProcessing = false;
  }

  private async executeCommand(command: GCodeCommand & { id: string; timestamp: Date }): Promise<void> {
    // Simulate command execution time
    const executionTime = Math.random() * 500 + 100;
    await new Promise(resolve => setTimeout(resolve, executionTime));

    // Log command execution
    console.log(`Executed G-code: ${command.command}`);
  }
}

const commandQueue = new CommandQueue();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { command, priority = 'normal', demoMode = false } = body as GCodeCommand & { demoMode?: boolean };

    if (!command || typeof command !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Command is required and must be a string' },
        { status: 400 }
      );
    }

    const cleanCommand = command.trim().toUpperCase();
    const startTime = Date.now();

    // Handle emergency stop immediately
    if (cleanCommand === 'M112' || cleanCommand === 'EMERGENCY_STOP') {
      return NextResponse.json({
        success: true,
        response: 'Emergency stop executed',
        executionTime: Date.now() - startTime,
        command: cleanCommand,
        priority: 'emergency',
      });
    }

    if (demoMode) {
      // Demo mode: return mock responses
      const mockResponse = generateMockResponse(cleanCommand);
      const executionTime = Math.random() * 300 + 100;

      return NextResponse.json({
        success: mockResponse !== 'Error: Unknown command',
        response: mockResponse,
        executionTime,
        command: cleanCommand,
        demoMode: true,
      });
    }

    // In real implementation, this would communicate with the printer
    // For now, we'll simulate the process
    
    // Add command to queue
    const commandId = commandQueue.addCommand({
      command: cleanCommand,
      priority,
      requiresResponse: true,
    });

    // Simulate command execution
    const mockResponse = generateMockResponse(cleanCommand);
    const executionTime = Date.now() - startTime;

    const response: CommandResponse = {
      success: mockResponse !== 'Error: Unknown command',
      response: mockResponse,
      executionTime,
      command: cleanCommand,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('G-code command error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to execute command',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function generateMockResponse(command: string): string {
  // Check for exact matches first
  if (mockResponses[command]) {
    return mockResponses[command];
  }

  // Check for command prefixes
  for (const [cmd, response] of Object.entries(mockResponses)) {
    if (command.startsWith(cmd)) {
      return response;
    }
  }

  // Handle specific command patterns
  if (command.startsWith('M104 S')) {
    const temp = command.split('S')[1];
    return `ok Target hotend temperature set to ${temp}°C`;
  }

  if (command.startsWith('M140 S')) {
    const temp = command.split('S')[1];
    return `ok Target bed temperature set to ${temp}°C`;
  }

  if (command.startsWith('G1 ') || command.startsWith('G0 ')) {
    return 'ok';
  }

  if (command.startsWith('M106 S')) {
    const speed = command.split('S')[1];
    return `ok Fan speed set to ${speed}`;
  }

  // Default response for unknown commands
  return Math.random() > 0.1 ? 'ok' : 'Error: Unknown command';
}

// GET endpoint for command history or status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'history':
        // Return command history
        return NextResponse.json({
          success: true,
          history: [], // In real implementation, fetch from database
          message: 'Command history retrieved'
        });

      case 'queue':
        // Return current queue status
        return NextResponse.json({
          success: true,
          queueLength: 0, // Mock queue length
          isProcessing: false,
          message: 'Queue status retrieved'
        });

      case 'macros':
        // Return available macros
        const macros = [
          { id: 'home-all', name: 'Home All Axes', commands: ['G28'] },
          { id: 'bed-level', name: 'Auto Bed Level', commands: ['G29'] },
          { id: 'preheat-pla', name: 'Preheat for PLA', commands: ['M104 S200', 'M140 S60'] },
          { id: 'cooldown', name: 'Cooldown', commands: ['M104 S0', 'M140 S0'] },
        ];
        
        return NextResponse.json({
          success: true,
          macros,
          message: 'Macros retrieved'
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action parameter' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('G-code GET error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
