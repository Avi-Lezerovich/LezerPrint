'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Settings, 
  Zap, 
  Thermometer, 
  Target, 
  Play, 
  AlertTriangle,
  CheckCircle 
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface CalibrationSettingsProps {
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
  onCalibrationChange: (calibration: CalibrationSettingsProps['calibration']) => void;
  onRunCalibration?: (type: 'bed-leveling' | 'pid-hotend' | 'pid-bed' | 'esteps') => void;
  demoMode?: boolean;
}

export default function CalibrationSettings({ 
  calibration, 
  onCalibrationChange, 
  onRunCalibration,
  demoMode = false 
}: CalibrationSettingsProps) {
  const [runningCalibration, setRunningCalibration] = useState<string | null>(null);

  const updateCalibration = (field: string, value: any) => {
    onCalibrationChange({
      ...calibration,
      [field]: value,
    });
  };

  const updatePidHotend = (param: 'p' | 'i' | 'd', value: number) => {
    onCalibrationChange({
      ...calibration,
      pidHotend: {
        ...calibration.pidHotend,
        [param]: value,
      },
    });
  };

  const updatePidBed = (param: 'p' | 'i' | 'd', value: number) => {
    onCalibrationChange({
      ...calibration,
      pidBed: {
        ...calibration.pidBed,
        [param]: value,
      },
    });
  };

  const updateStepsPerMm = (axis: 'x' | 'y' | 'z' | 'e', value: number) => {
    onCalibrationChange({
      ...calibration,
      stepsPerMm: {
        ...calibration.stepsPerMm,
        [axis]: value,
      },
    });
  };

  const handleRunCalibration = async (type: 'bed-leveling' | 'pid-hotend' | 'pid-bed' | 'esteps') => {
    setRunningCalibration(type);
    
    if (demoMode) {
      // Simulate calibration process
      setTimeout(() => {
        setRunningCalibration(null);
      }, 3000);
      return;
    }
    
    try {
      await onRunCalibration?.(type);
    } finally {
      setRunningCalibration(null);
    }
  };

  const bedLevelingOptions = [
    { value: 'manual', label: 'Manual', description: 'Manual bed leveling with knobs' },
    { value: 'auto', label: 'Auto', description: 'Automatic bed leveling (ABL)' },
    { value: 'ubl', label: 'UBL', description: 'Unified Bed Leveling' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8"
    >
      {/* Safety Warning */}
      <motion.div 
        className="bg-red-50 border border-red-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <div className="flex items-start space-x-2">
          <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
          <div>
            <h4 className="text-sm font-medium text-red-800">Calibration Safety</h4>
            <p className="text-sm text-red-700 mt-1">
              Calibration procedures may heat the printer and move axes. Ensure the printer is 
              clear of obstacles and monitor the process carefully.
            </p>
          </div>
        </div>
      </motion.div>

      {/* Bed Leveling */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Target className="w-5 h-5 text-blue-600" />
          <h3 className="text-lg font-medium text-gray-900">Bed Leveling</h3>
        </div>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bed Leveling Type
            </label>
            <div className="space-y-2">
              {bedLevelingOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    value={option.value}
                    checked={calibration.bedLevelingType === option.value}
                    onChange={(e) => updateCalibration('bedLevelingType', e.target.value)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300"
                  />
                  <div>
                    <div className="text-sm font-medium text-gray-900">{option.label}</div>
                    <div className="text-sm text-gray-500">{option.description}</div>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Z-Offset (mm)
            </label>
            <input
              type="number"
              step="0.01"
              value={calibration.zOffset}
              onChange={(e) => updateCalibration('zOffset', Number(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="-0.2"
            />
            <p className="text-sm text-gray-500 mt-1">
              Fine-tune first layer height (negative values bring nozzle closer to bed)
            </p>
          </div>

          <Button
            variant="secondary"
            onClick={() => handleRunCalibration('bed-leveling')}
            disabled={runningCalibration !== null}
            className="w-full"
          >
            <Play className="w-4 h-4 mr-2" />
            {runningCalibration === 'bed-leveling' ? 'Running Bed Leveling...' : 'Run Bed Leveling'}
          </Button>
        </div>
      </div>

      {/* PID Tuning */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Thermometer className="w-5 h-5 text-red-600" />
          <h3 className="text-lg font-medium text-gray-900">PID Tuning</h3>
        </div>
        
        <div className="space-y-6">
          {/* Hotend PID */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Hotend PID</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              {(['p', 'i', 'd'] as const).map((param) => (
                <div key={param}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calibration.pidHotend[param]}
                    onChange={(e) => updatePidHotend(param, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={() => handleRunCalibration('pid-hotend')}
              disabled={runningCalibration !== null}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              {runningCalibration === 'pid-hotend' ? 'Tuning Hotend PID...' : 'Auto-tune Hotend PID'}
            </Button>
          </div>

          {/* Bed PID */}
          <div>
            <h4 className="text-md font-medium text-gray-900 mb-3">Bed PID</h4>
            <div className="grid grid-cols-3 gap-4 mb-3">
              {(['p', 'i', 'd'] as const).map((param) => (
                <div key={param}>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {param.toUpperCase()}
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={calibration.pidBed[param]}
                    onChange={(e) => updatePidBed(param, Number(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              ))}
            </div>
            <Button
              variant="secondary"
              onClick={() => handleRunCalibration('pid-bed')}
              disabled={runningCalibration !== null}
              className="w-full"
            >
              <Zap className="w-4 h-4 mr-2" />
              {runningCalibration === 'pid-bed' ? 'Tuning Bed PID...' : 'Auto-tune Bed PID'}
            </Button>
          </div>
        </div>
      </div>

      {/* Steps per mm */}
      <div className="bg-white border border-gray-200 rounded-lg p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Settings className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-medium text-gray-900">Steps per Millimeter</h3>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(['x', 'y', 'z', 'e'] as const).map((axis) => (
              <div key={axis}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {axis.toUpperCase()} Axis
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={calibration.stepsPerMm[axis]}
                  onChange={(e) => updateStepsPerMm(axis, Number(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            ))}
          </div>

          <Button
            variant="secondary"
            onClick={() => handleRunCalibration('esteps')}
            disabled={runningCalibration !== null}
            className="w-full"
          >
            <CheckCircle className="w-4 h-4 mr-2" />
            {runningCalibration === 'esteps' ? 'Calibrating E-Steps...' : 'Calibrate E-Steps'}
          </Button>
          
          <p className="text-sm text-gray-500">
            E-steps calibration will extrude filament to measure accuracy. 
            Ensure filament is loaded and hotend is heated.
          </p>
        </div>
      </div>

      {/* Calibration Status */}
      {runningCalibration && (
        <motion.div 
          className="bg-blue-50 border border-blue-200 rounded-lg p-4"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
        >
          <div className="flex items-center space-x-2">
            <motion.div
              className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full"
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            />
            <div>
              <h4 className="text-sm font-medium text-blue-800">Calibration in Progress</h4>
              <p className="text-sm text-blue-700 mt-1">
                {runningCalibration === 'bed-leveling' && 'Running bed leveling procedure...'}
                {runningCalibration === 'pid-hotend' && 'Tuning hotend PID parameters...'}
                {runningCalibration === 'pid-bed' && 'Tuning bed PID parameters...'}
                {runningCalibration === 'esteps' && 'Calibrating extruder steps...'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}