'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface PrinterSettingsProps {
  settings: {
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
  onSettingsChange: (settings: PrinterSettingsProps['settings']) => void;
}

export default function PrinterSettings({ settings, onSettingsChange }: PrinterSettingsProps) {
  const updateSetting = (field: string, value: any) => {
    onSettingsChange({
      ...settings,
      [field]: value,
    });
  };

  const updateBuildVolume = (axis: 'x' | 'y' | 'z', value: number) => {
    onSettingsChange({
      ...settings,
      buildVolume: {
        ...settings.buildVolume,
        [axis]: value,
      },
    });
  };

  const updateMaxFeedrate = (axis: 'x' | 'y' | 'z' | 'e', value: number) => {
    onSettingsChange({
      ...settings,
      maxFeedrate: {
        ...settings.maxFeedrate,
        [axis]: value,
      },
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Printer Name
          </label>
          <input
            type="text"
            value={settings.name}
            onChange={(e) => updateSetting('name', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Enter printer name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Printer Model
          </label>
          <input
            type="text"
            value={settings.model}
            onChange={(e) => updateSetting('model', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Ender 3 V2"
          />
        </div>
      </div>

      {/* Build Volume */}
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
                value={settings.buildVolume[axis as keyof typeof settings.buildVolume]}
                onChange={(e) => updateBuildVolume(axis as 'x' | 'y' | 'z', Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder="200"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Extruder Settings */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Extruder Settings</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nozzle Diameter (mm)
            </label>
            <input
              type="number"
              step="0.1"
              value={settings.nozzleDiameter}
              onChange={(e) => updateSetting('nozzleDiameter', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="0.1"
              max="2.0"
              placeholder="0.4"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filament Diameter (mm)
            </label>
            <input
              type="number"
              step="0.05"
              value={settings.filamentDiameter}
              onChange={(e) => updateSetting('filamentDiameter', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="1.0"
              max="3.0"
              placeholder="1.75"
            />
          </div>
        </div>
      </div>

      {/* Temperature Limits */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Temperature Limits (°C)</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Hotend Temperature
            </label>
            <input
              type="number"
              value={settings.maxHotendTemp}
              onChange={(e) => updateSetting('maxHotendTemp', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="150"
              max="400"
              placeholder="260"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Max Bed Temperature
            </label>
            <input
              type="number"
              value={settings.maxBedTemp}
              onChange={(e) => updateSetting('maxBedTemp', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="40"
              max="150"
              placeholder="100"
            />
          </div>
        </div>
      </div>

      {/* Max Feedrates */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-3">Maximum Feedrates (mm/s)</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {(['x', 'y', 'z', 'e'] as const).map((axis) => (
            <div key={axis}>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {axis.toUpperCase()} Axis
              </label>
              <input
                type="number"
                value={settings.maxFeedrate[axis]}
                onChange={(e) => updateMaxFeedrate(axis, Number(e.target.value))}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="1"
                placeholder={axis === 'z' ? '5' : axis === 'e' ? '25' : '500'}
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}