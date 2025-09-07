import { NextRequest, NextResponse } from 'next/server';

interface PrinterSettings {
  printer: {
    name: string;
    model: string;
    buildVolume: {
      x: number;
      y: number;
      z: number;
    };
    nozzleDiameter: number;
    filamentDiameter: number;
    maxHotendTemp: number;
    maxBedTemp: number;
    maxFeedrate: {
      x: number;
      y: number;
      z: number;
      e: number;
    };
  };
  profiles: Array<{
    id: string;
    name: string;
    material: string;
    hotendTemp: number;
    bedTemp: number;
    fanSpeed: number;
    printSpeed: number;
    retraction: {
      distance: number;
      speed: number;
    };
    notes?: string;
    isDefault?: boolean;
  }>;
  preferences: {
    defaultProfile: string;
    autoConnect: boolean;
    emergencyStopOnDisconnect: boolean;
    alertsEnabled: boolean;
    emailNotifications: boolean;
    pushNotifications: boolean;
    cameraEnabled: boolean;
    timelapseEnabled: boolean;
    theme: 'light' | 'dark' | 'auto';
    language: 'en' | 'es' | 'fr' | 'de';
  };
  calibration: {
    bedLevelingType: 'manual' | 'auto' | 'ubl';
    zOffset: number;
    pidHotend: {
      p: number;
      i: number;
      d: number;
    };
    pidBed: {
      p: number;
      i: number;
      d: number;
    };
    stepsPerMm: {
      x: number;
      y: number;
      z: number;
      e: number;
    };
  };
}

// Default settings
const defaultSettings: PrinterSettings = {
  printer: {
    name: 'My 3D Printer',
    model: 'Ender 3 V2',
    buildVolume: { x: 220, y: 220, z: 250 },
    nozzleDiameter: 0.4,
    filamentDiameter: 1.75,
    maxHotendTemp: 260,
    maxBedTemp: 100,
    maxFeedrate: { x: 500, y: 500, z: 5, e: 25 },
  },
  profiles: [
    {
      id: 'pla-standard',
      name: 'PLA Standard',
      material: 'PLA',
      hotendTemp: 200,
      bedTemp: 60,
      fanSpeed: 100,
      printSpeed: 60,
      retraction: { distance: 1.0, speed: 25 },
      isDefault: true,
    },
    {
      id: 'petg-standard',
      name: 'PETG Standard',
      material: 'PETG',
      hotendTemp: 240,
      bedTemp: 80,
      fanSpeed: 50,
      printSpeed: 45,
      retraction: { distance: 1.5, speed: 30 },
    },
    {
      id: 'abs-standard',
      name: 'ABS Standard',
      material: 'ABS',
      hotendTemp: 250,
      bedTemp: 100,
      fanSpeed: 30,
      printSpeed: 50,
      retraction: { distance: 0.8, speed: 35 },
    },
  ],
  preferences: {
    defaultProfile: 'pla-standard',
    autoConnect: true,
    emergencyStopOnDisconnect: true,
    alertsEnabled: true,
    emailNotifications: false,
    pushNotifications: true,
    cameraEnabled: true,
    timelapseEnabled: true,
    theme: 'auto',
    language: 'en',
  },
  calibration: {
    bedLevelingType: 'auto',
    zOffset: -0.2,
    pidHotend: { p: 22.2, i: 1.08, d: 114.0 },
    pidBed: { p: 54.0, i: 0.14, d: 127.0 },
    stepsPerMm: { x: 80, y: 80, z: 400, e: 93 },
  },
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');

    // In real implementation, fetch from database
    let settings = { ...defaultSettings };

    if (section) {
      // Return specific section
      if (section in settings) {
        return NextResponse.json({
          success: true,
          data: { [section]: settings[section as keyof PrinterSettings] },
          section,
        });
      } else {
        return NextResponse.json(
          { success: false, error: `Invalid section: ${section}` },
          { status: 400 }
        );
      }
    }

    // Return all settings
    return NextResponse.json({
      success: true,
      data: settings,
      lastModified: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Settings GET Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { section, data: sectionData } = body;

    // Validate input
    if (!body || typeof body !== 'object') {
      return NextResponse.json(
        { success: false, error: 'Invalid request body' },
        { status: 400 }
      );
    }

    // In real implementation, save to database
    // For now, we'll just validate and return success

    if (section) {
      // Update specific section
      if (!(section in defaultSettings)) {
        return NextResponse.json(
          { success: false, error: `Invalid section: ${section}` },
          { status: 400 }
        );
      }

      // Validate section data structure
      if (!validateSettingsSection(section, sectionData)) {
        return NextResponse.json(
          { success: false, error: `Invalid data for section: ${section}` },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: `Settings section '${section}' updated successfully`,
        updatedAt: new Date().toISOString(),
      });
    } else {
      // Update all settings
      if (!validateSettings(body)) {
        return NextResponse.json(
          { success: false, error: 'Invalid settings data structure' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'All settings updated successfully',
        updatedAt: new Date().toISOString(),
      });
    }

  } catch (error) {
    console.error('Settings PUT Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'reset':
        // Reset to default settings
        return NextResponse.json({
          success: true,
          data: defaultSettings,
          message: 'Settings reset to defaults',
        });

      case 'backup':
        // Create settings backup
        const backupData = {
          ...defaultSettings,
          exportedAt: new Date().toISOString(),
          version: '1.0',
        };
        
        return NextResponse.json({
          success: true,
          backup: backupData,
          message: 'Settings backup created',
        });

      case 'restore':
        // Restore from backup
        if (!data || !validateSettings(data)) {
          return NextResponse.json(
            { success: false, error: 'Invalid backup data' },
            { status: 400 }
          );
        }

        return NextResponse.json({
          success: true,
          message: 'Settings restored from backup',
          restoredAt: new Date().toISOString(),
        });

      case 'validate':
        // Validate settings
        const isValid = validateSettings(data || defaultSettings);
        return NextResponse.json({
          success: true,
          valid: isValid,
          message: isValid ? 'Settings are valid' : 'Settings validation failed',
        });

      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Settings POST Error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to process settings request',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

function validateSettings(settings: any): boolean {
  try {
    // Basic structure validation
    const requiredSections = ['printer', 'profiles', 'preferences', 'calibration'];
    
    for (const section of requiredSections) {
      if (!(section in settings)) {
        console.error(`Missing section: ${section}`);
        return false;
      }
    }

    // Validate printer section
    const { printer } = settings;
    if (!printer.name || !printer.model || !printer.buildVolume) {
      return false;
    }

    // Validate build volume
    const { buildVolume } = printer;
    if (typeof buildVolume.x !== 'number' || 
        typeof buildVolume.y !== 'number' || 
        typeof buildVolume.z !== 'number') {
      return false;
    }

    // Validate profiles
    if (!Array.isArray(settings.profiles)) {
      return false;
    }

    // Validate each profile
    for (const profile of settings.profiles) {
      if (!profile.id || !profile.name || !profile.material) {
        return false;
      }
      if (typeof profile.hotendTemp !== 'number' || 
          typeof profile.bedTemp !== 'number') {
        return false;
      }
    }

    return true;
  } catch (error) {
    console.error('Settings validation error:', error);
    return false;
  }
}

function validateSettingsSection(section: string, data: any): boolean {
  try {
    switch (section) {
      case 'printer':
        return data.name && data.model && data.buildVolume;
      
      case 'profiles':
        return Array.isArray(data) && data.every((p: any) => 
          p.id && p.name && p.material && 
          typeof p.hotendTemp === 'number' && 
          typeof p.bedTemp === 'number'
        );
      
      case 'preferences':
        return typeof data === 'object' && data.theme && data.language;
      
      case 'calibration':
        return data.bedLevelingType && 
               typeof data.zOffset === 'number' &&
               data.pidHotend && data.pidBed && data.stepsPerMm;
      
      default:
        return false;
    }
  } catch (error) {
    console.error(`Section validation error for ${section}:`, error);
    return false;
  }
}
