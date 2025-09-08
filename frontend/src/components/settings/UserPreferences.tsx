'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Bell, 
  Camera, 
  Palette, 
  Globe, 
  Shield, 
  Wifi,
  AlertTriangle 
} from 'lucide-react';

interface UserPreferencesProps {
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
  profiles: Array<{ id: string; name: string }>;
  onPreferencesChange: (preferences: UserPreferencesProps['preferences']) => void;
}

export default function UserPreferences({ 
  preferences, 
  profiles, 
  onPreferencesChange 
}: UserPreferencesProps) {
  const updatePreference = (key: string, value: any) => {
    onPreferencesChange({
      ...preferences,
      [key]: value,
    });
  };

  const ToggleSwitch = ({ 
    checked, 
    onChange, 
    label, 
    description 
  }: { 
    checked: boolean; 
    onChange: (checked: boolean) => void;
    label: string;
    description?: string;
  }) => (
    <div className="flex items-center justify-between py-3">
      <div>
        <div className="text-sm font-medium text-gray-900">{label}</div>
        {description && (
          <div className="text-sm text-gray-500">{description}</div>
        )}
      </div>
      <motion.button
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
          checked ? 'bg-blue-600' : 'bg-gray-200'
        }`}
        whileTap={{ scale: 0.95 }}
      >
        <motion.span
          className="inline-block h-4 w-4 transform rounded-full bg-white shadow-lg"
          animate={{ x: checked ? 6 : 2 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      </motion.button>
    </div>
  );

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'de', label: 'Deutsch' },
  ];

  const themes = [
    { value: 'light', label: 'Light' },
    { value: 'dark', label: 'Dark' },
    { value: 'auto', label: 'Auto' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Default Profile */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Shield className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Default Settings</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Default Temperature Profile
            </label>
            <select
              value={preferences.defaultProfile}
              onChange={(e) => updatePreference('defaultProfile', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.name}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              This profile will be selected by default for new print jobs
            </p>
          </div>
        </div>
      </div>

      {/* Connection Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Wifi className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Connection Settings</h3>
        </div>
        
        <div className="space-y-1">
          <ToggleSwitch
            checked={preferences.autoConnect}
            onChange={(checked) => updatePreference('autoConnect', checked)}
            label="Auto-connect to printer"
            description="Automatically connect to the printer when the application starts"
          />
          
          <ToggleSwitch
            checked={preferences.emergencyStopOnDisconnect}
            onChange={(checked) => updatePreference('emergencyStopOnDisconnect', checked)}
            label="Emergency stop on disconnect"
            description="Automatically stop printing if connection to printer is lost"
          />
        </div>
      </div>

      {/* Notification Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Bell className="w-5 h-5 text-purple-600" />
          <h3 className="text-lg font-medium text-gray-900">Notifications</h3>
        </div>
        
        <div className="space-y-1">
          <ToggleSwitch
            checked={preferences.alertsEnabled}
            onChange={(checked) => updatePreference('alertsEnabled', checked)}
            label="Enable alerts"
            description="Show alerts for print completion, errors, and other events"
          />
          
          <ToggleSwitch
            checked={preferences.emailNotifications}
            onChange={(checked) => updatePreference('emailNotifications', checked)}
            label="Email notifications"
            description="Receive email notifications for important events"
          />
          
          <ToggleSwitch
            checked={preferences.pushNotifications}
            onChange={(checked) => updatePreference('pushNotifications', checked)}
            label="Push notifications"
            description="Receive push notifications in your browser"
          />
        </div>
      </div>

      {/* Camera Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Camera className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900">Camera Settings</h3>
        </div>
        
        <div className="space-y-1">
          <ToggleSwitch
            checked={preferences.cameraEnabled}
            onChange={(checked) => updatePreference('cameraEnabled', checked)}
            label="Enable camera"
            description="Enable camera feed for monitoring prints"
          />
          
          <ToggleSwitch
            checked={preferences.timelapseEnabled}
            onChange={(checked) => updatePreference('timelapseEnabled', checked)}
            label="Enable timelapse"
            description="Automatically record timelapses of your prints"
          />
        </div>
      </div>

      {/* Appearance Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Palette className="w-5 h-5 text-indigo-600" />
          <h3 className="text-lg font-medium text-gray-900">Appearance</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Theme
            </label>
            <select
              value={preferences.theme}
              onChange={(e) => updatePreference('theme', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {themes.map((theme) => (
                <option key={theme.value} value={theme.value}>
                  {theme.label}
                </option>
              ))}
            </select>
            <p className="text-sm text-gray-500 mt-1">
              Auto theme follows your system preferences
            </p>
          </div>
        </div>
      </div>

      {/* Language Settings */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Globe className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Language & Region</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Language
            </label>
            <select
              value={preferences.language}
              onChange={(e) => updatePreference('language', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {languages.map((language) => (
                <option key={language.value} value={language.value}>
                  {language.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Safety Notice */}
      <motion.div 
        className="bg-amber-50 border border-amber-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-amber-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-amber-800">Safety Reminder</h4>
            <p className="text-sm text-amber-700 mt-1">
              Some settings may affect printer safety. Emergency stop on disconnect is recommended 
              for safe operation when printing remotely.
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}