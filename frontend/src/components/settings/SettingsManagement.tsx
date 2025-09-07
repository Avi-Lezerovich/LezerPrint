'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Settings, 
  Printer, 
  Thermometer, 
  Bell, 
  Camera, 
  Save, 
  RotateCcw, 
  Download, 
  Upload,
  Wifi,
  Palette,
  Shield,
  Zap,
  Monitor
} from 'lucide-react';

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
  profiles: TemperatureProfile[];
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

interface TemperatureProfile {
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
}

const defaultProfiles: TemperatureProfile[] = [
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
];

interface SettingsManagementProps {
  demoMode?: boolean;
}

export default function SettingsManagement({ demoMode = false }: SettingsManagementProps) {
  const [settings, setSettings] = useState<PrinterSettings | null>(null);
  const [activeTab, setActiveTab] = useState<'printer' | 'profiles' | 'preferences' | 'calibration' | 'backup'>('printer');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingProfile, setEditingProfile] = useState<TemperatureProfile | null>(null);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, [demoMode]);

  const loadSettings = async () => {
    setLoading(true);
    
    if (demoMode) {
      // Demo settings
      setTimeout(() => {
        setSettings({
          printer: {
            name: 'Demo Printer',
            model: 'Ender 3 V2',
            buildVolume: { x: 220, y: 220, z: 250 },
            nozzleDiameter: 0.4,
            filamentDiameter: 1.75,
            maxHotendTemp: 260,
            maxBedTemp: 100,
            maxFeedrate: { x: 500, y: 500, z: 5, e: 25 },
          },
          profiles: defaultProfiles,
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
        });
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/settings');
      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Failed to load settings:', error);
      showMessage('error', 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (newSettings: PrinterSettings) => {
    setSaving(true);
    
    if (demoMode) {
      setTimeout(() => {
        setSettings(newSettings);
        setSaving(false);
        showMessage('success', 'Settings saved successfully (demo mode)');
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings),
      });
      
      if (response.ok) {
        setSettings(newSettings);
        showMessage('success', 'Settings saved successfully');
      } else {
        throw new Error('Failed to save settings');
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
      showMessage('error', 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  const handleSaveProfile = (profile: TemperatureProfile) => {
    if (!settings) return;

    const newProfiles = editingProfile
      ? settings.profiles.map(p => p.id === profile.id ? profile : p)
      : [...settings.profiles, { ...profile, id: Date.now().toString() }];

    const newSettings = {
      ...settings,
      profiles: newProfiles,
    };

    saveSettings(newSettings);
    setEditingProfile(null);
    setShowProfileModal(false);
  };

  const handleDeleteProfile = (profileId: string) => {
    if (!settings) return;

    const newSettings = {
      ...settings,
      profiles: settings.profiles.filter(p => p.id !== profileId),
    };

    saveSettings(newSettings);
  };

  const exportSettings = () => {
    if (!settings) return;

    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `lezerprint-settings-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  };

  const importSettings = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target?.result as string);
        saveSettings(importedSettings);
        showMessage('success', 'Settings imported successfully');
      } catch (error) {
        showMessage('error', 'Invalid settings file');
      }
    };
    reader.readAsText(file);
  };

  if (loading) {
    return (
      <motion.div 
        className="flex items-center justify-center h-64"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <motion.div 
          className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
      </motion.div>
    );
  }

  if (!settings) {
    return (
      <motion.div 
        className="text-center py-12"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
      >
        <p className="text-gray-500">Failed to load settings</p>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card elevated hoverable>
        <CardContent className="p-0">
          {/* Enhanced Notification */}
          <AnimatePresence>
            {message && (
              <motion.div 
                className={`p-4 m-4 rounded-lg ${
                  message.type === 'success' 
                    ? 'bg-green-100 text-green-800 border border-green-200' 
                    : 'bg-red-100 text-red-800 border border-red-200'
                }`}
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ duration: 0.3 }}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Enhanced Tabs */}
          <motion.div 
            className="border-b border-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <nav className="flex space-x-1 px-6">
              {[
                { id: 'printer', label: 'Printer', icon: Printer },
                { id: 'profiles', label: 'Profiles', icon: Thermometer },
                { id: 'preferences', label: 'Preferences', icon: Settings },
                { id: 'calibration', label: 'Calibration', icon: Shield },
                { id: 'backup', label: 'Backup', icon: Download },
              ].map((tab, index) => {
                const IconComponent = tab.icon;
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                      activeTab === tab.id
                        ? 'text-blue-600 border-blue-600'
                        : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                    }`}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ y: -2 }}
                    whileTap={{ y: 0 }}
                  >
                    <IconComponent className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </motion.button>
                );
              })}
            </nav>
          </motion.div>

          {/* Enhanced Content */}
          <motion.div 
            className="p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
        {/* Printer Settings Tab */}
        {activeTab === 'printer' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Name
                </label>
                <input
                  type="text"
                  value={settings.printer.name}
                  onChange={(e) => setSettings({
                    ...settings,
                    printer: { ...settings.printer, name: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Printer Model
                </label>
                <input
                  type="text"
                  value={settings.printer.model}
                  onChange={(e) => setSettings({
                    ...settings,
                    printer: { ...settings.printer, model: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Build Volume (mm)</h3>
              <div className="grid grid-cols-3 gap-4">
                {['x', 'y', 'z'].map((axis) => (
                  <div key={axis}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {axis.toUpperCase()} Axis
                    </label>
                    <input
                      type="number"
                      value={settings.printer.buildVolume[axis as keyof typeof settings.printer.buildVolume]}
                      onChange={(e) => setSettings({
                        ...settings,
                        printer: {
                          ...settings.printer,
                          buildVolume: {
                            ...settings.printer.buildVolume,
                            [axis]: Number(e.target.value)
                          }
                        }
                      })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Temperature Profiles Tab */}
        {activeTab === 'profiles' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-gray-900">Temperature Profiles</h3>
              <button
                onClick={() => {
                  setEditingProfile(null);
                  setShowProfileModal(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Add Profile
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {settings.profiles.map((profile) => (
                <div key={profile.id} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h4 className="font-medium text-gray-900">{profile.name}</h4>
                      <p className="text-sm text-gray-500">{profile.material}</p>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setEditingProfile(profile);
                          setShowProfileModal(true);
                        }}
                        className="p-1 text-gray-400 hover:text-blue-600"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => handleDeleteProfile(profile.id)}
                        className="p-1 text-gray-400 hover:text-red-600"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Hotend:</span>
                      <span>{profile.hotendTemp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Bed:</span>
                      <span>{profile.bedTemp}°C</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Fan:</span>
                      <span>{profile.fanSpeed}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{profile.printSpeed}mm/s</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Backup & Restore</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Export Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Download all your printer settings, profiles, and preferences as a JSON file.
                  </p>
                  <button
                    onClick={exportSettings}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                  >
                    Export Settings
                  </button>
                </div>

                <div className="bg-gray-50 rounded-lg p-6">
                  <h4 className="font-medium text-gray-900 mb-3">Import Settings</h4>
                  <p className="text-sm text-gray-600 mb-4">
                    Restore settings from a previously exported JSON file.
                  </p>
                  <input
                    type="file"
                    accept=".json"
                    onChange={importSettings}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
          </motion.div>

          {/* Enhanced Save Button */}
          <motion.div 
            className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className="flex justify-end">
              <Button
                variant="primary"
                onClick={() => settings && saveSettings(settings)}
                disabled={saving}
                className="flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? 'Saving...' : 'Save Settings'}</span>
              </Button>
            </div>
          </motion.div>

          {/* Profile Modal */}
          <AnimatePresence>
            {showProfileModal && (
              <motion.div 
                className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <motion.div 
                  className="bg-white rounded-lg p-6 w-full max-w-md"
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  transition={{ type: "spring", damping: 25, stiffness: 300 }}
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {editingProfile ? 'Edit Profile' : 'Add Profile'}
                  </h3>
            
            {/* Profile form would go here */}
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Profile Name"
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
              {/* More form fields... */}
            </div>
            
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowProfileModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle save
                  setShowProfileModal(false);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Save
              </button>
            </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>
    </motion.div>
  );
}
