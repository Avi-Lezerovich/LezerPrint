'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { 
  Settings, 
  Printer, 
  Thermometer, 
  Save, 
  Download, 
  Shield
} from 'lucide-react';

// Import new component modules
import PrinterSettings from './PrinterSettings';
import TemperatureProfiles, { type TemperatureProfile } from './TemperatureProfiles';
import UserPreferences from './UserPreferences';
import CalibrationSettings from './CalibrationSettings';
import BackupSettings from './BackupSettings';
import ProfileModal from './ProfileModal';

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
      <Card variant="elevated" hoverable>
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
          <PrinterSettings
            settings={settings.printer}
            onSettingsChange={(printerSettings) => 
              setSettings({ ...settings, printer: printerSettings })
            }
          />
        )}

        {/* Temperature Profiles Tab */}
        {activeTab === 'profiles' && (
          <TemperatureProfiles
            profiles={settings.profiles}
            onEditProfile={(profile) => {
              setEditingProfile(profile);
              setShowProfileModal(true);
            }}
            onDeleteProfile={handleDeleteProfile}
            onAddProfile={() => {
              setEditingProfile(null);
              setShowProfileModal(true);
            }}
          />
        )}

        {/* User Preferences Tab */}
        {activeTab === 'preferences' && (
          <UserPreferences
            preferences={settings.preferences}
            profiles={settings.profiles.map(p => ({ id: p.id, name: p.name }))}
            onPreferencesChange={(preferences) => 
              setSettings({ ...settings, preferences })
            }
          />
        )}

        {/* Calibration Settings Tab */}
        {activeTab === 'calibration' && (
          <CalibrationSettings
            calibration={settings.calibration}
            onCalibrationChange={(calibration) => 
              setSettings({ ...settings, calibration })
            }
            demoMode={demoMode}
          />
        )}

        {/* Backup Tab */}
        {activeTab === 'backup' && (
          <BackupSettings
            onExportSettings={exportSettings}
            onImportSettings={(file) => {
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
            }}
            demoMode={demoMode}
          />
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
          <ProfileModal
            isOpen={showProfileModal}
            onClose={() => setShowProfileModal(false)}
            onSave={handleSaveProfile}
            editingProfile={editingProfile}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
