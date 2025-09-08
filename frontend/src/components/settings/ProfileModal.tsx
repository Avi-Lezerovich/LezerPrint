'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Save } from 'lucide-react';
import Button from '@/components/ui/Button';
import type { TemperatureProfile } from './TemperatureProfiles';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (profile: TemperatureProfile) => void;
  editingProfile?: TemperatureProfile | null;
}

export default function ProfileModal({ 
  isOpen, 
  onClose, 
  onSave, 
  editingProfile 
}: ProfileModalProps) {
  const [formData, setFormData] = useState<Omit<TemperatureProfile, 'id'>>({
    name: '',
    material: '',
    hotendTemp: 200,
    bedTemp: 60,
    fanSpeed: 100,
    printSpeed: 60,
    retraction: {
      distance: 1.0,
      speed: 25,
    },
    notes: '',
    isDefault: false,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  // Reset form when modal opens/closes or editing profile changes
  useEffect(() => {
    if (isOpen) {
      if (editingProfile) {
        setFormData({
          name: editingProfile.name,
          material: editingProfile.material,
          hotendTemp: editingProfile.hotendTemp,
          bedTemp: editingProfile.bedTemp,
          fanSpeed: editingProfile.fanSpeed,
          printSpeed: editingProfile.printSpeed,
          retraction: { ...editingProfile.retraction },
          notes: editingProfile.notes || '',
          isDefault: editingProfile.isDefault || false,
        });
      } else {
        setFormData({
          name: '',
          material: '',
          hotendTemp: 200,
          bedTemp: 60,
          fanSpeed: 100,
          printSpeed: 60,
          retraction: {
            distance: 1.0,
            speed: 25,
          },
          notes: '',
          isDefault: false,
        });
      }
      setErrors({});
    }
  }, [isOpen, editingProfile]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Profile name is required';
    }

    if (!formData.material.trim()) {
      newErrors.material = 'Material type is required';
    }

    if (formData.hotendTemp < 150 || formData.hotendTemp > 400) {
      newErrors.hotendTemp = 'Hotend temperature must be between 150-400°C';
    }

    if (formData.bedTemp < 0 || formData.bedTemp > 150) {
      newErrors.bedTemp = 'Bed temperature must be between 0-150°C';
    }

    if (formData.fanSpeed < 0 || formData.fanSpeed > 100) {
      newErrors.fanSpeed = 'Fan speed must be between 0-100%';
    }

    if (formData.printSpeed < 10 || formData.printSpeed > 200) {
      newErrors.printSpeed = 'Print speed must be between 10-200 mm/s';
    }

    if (formData.retraction.distance < 0 || formData.retraction.distance > 10) {
      newErrors.retractionDistance = 'Retraction distance must be between 0-10 mm';
    }

    if (formData.retraction.speed < 10 || formData.retraction.speed > 100) {
      newErrors.retractionSpeed = 'Retraction speed must be between 10-100 mm/s';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    setSaving(true);
    
    try {
      const profileToSave: TemperatureProfile = {
        id: editingProfile?.id || Date.now().toString(),
        ...formData,
      };

      await onSave(profileToSave);
      onClose();
    } catch (error) {
      console.error('Failed to save profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error for this field
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const updateRetraction = (field: 'distance' | 'speed', value: number) => {
    setFormData(prev => ({
      ...prev,
      retraction: { ...prev.retraction, [field]: value }
    }));
    // Clear error for retraction fields
    if (errors[`retraction${field.charAt(0).toUpperCase() + field.slice(1)}`]) {
      setErrors(prev => ({ 
        ...prev, 
        [`retraction${field.charAt(0).toUpperCase() + field.slice(1)}`]: '' 
      }));
    }
  };

  const materialOptions = [
    'PLA', 'ABS', 'PETG', 'TPU', 'HIPS', 'ASA', 
    'Wood', 'Metal', 'Carbon Fiber', 'Other'
  ];

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div 
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        <motion.div 
          className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 300 }}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">
              {editingProfile ? 'Edit Profile' : 'Add New Profile'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Form */}
          <div className="p-6 space-y-6">
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Profile Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.name ? 'border-red-300' : 'border-gray-300'
                  }`}
                  placeholder="e.g., PLA High Quality"
                />
                {errors.name && (
                  <p className="text-red-600 text-sm mt-1">{errors.name}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Material Type *
                </label>
                <select
                  value={formData.material}
                  onChange={(e) => updateField('material', e.target.value)}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.material ? 'border-red-300' : 'border-gray-300'
                  }`}
                >
                  <option value="">Select material</option>
                  {materialOptions.map(material => (
                    <option key={material} value={material}>{material}</option>
                  ))}
                </select>
                {errors.material && (
                  <p className="text-red-600 text-sm mt-1">{errors.material}</p>
                )}
              </div>
            </div>

            {/* Temperatures */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Hotend Temperature (°C) *
                </label>
                <input
                  type="number"
                  value={formData.hotendTemp}
                  onChange={(e) => updateField('hotendTemp', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.hotendTemp ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="150"
                  max="400"
                />
                {errors.hotendTemp && (
                  <p className="text-red-600 text-sm mt-1">{errors.hotendTemp}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bed Temperature (°C) *
                </label>
                <input
                  type="number"
                  value={formData.bedTemp}
                  onChange={(e) => updateField('bedTemp', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.bedTemp ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  max="150"
                />
                {errors.bedTemp && (
                  <p className="text-red-600 text-sm mt-1">{errors.bedTemp}</p>
                )}
              </div>
            </div>

            {/* Speed Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fan Speed (%) *
                </label>
                <input
                  type="number"
                  value={formData.fanSpeed}
                  onChange={(e) => updateField('fanSpeed', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.fanSpeed ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="0"
                  max="100"
                />
                {errors.fanSpeed && (
                  <p className="text-red-600 text-sm mt-1">{errors.fanSpeed}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Print Speed (mm/s) *
                </label>
                <input
                  type="number"
                  value={formData.printSpeed}
                  onChange={(e) => updateField('printSpeed', Number(e.target.value))}
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.printSpeed ? 'border-red-300' : 'border-gray-300'
                  }`}
                  min="10"
                  max="200"
                />
                {errors.printSpeed && (
                  <p className="text-red-600 text-sm mt-1">{errors.printSpeed}</p>
                )}
              </div>
            </div>

            {/* Retraction Settings */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-3">Retraction Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Distance (mm) *
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    value={formData.retraction.distance}
                    onChange={(e) => updateRetraction('distance', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.retractionDistance ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="0"
                    max="10"
                  />
                  {errors.retractionDistance && (
                    <p className="text-red-600 text-sm mt-1">{errors.retractionDistance}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Speed (mm/s) *
                  </label>
                  <input
                    type="number"
                    value={formData.retraction.speed}
                    onChange={(e) => updateRetraction('speed', Number(e.target.value))}
                    className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                      errors.retractionSpeed ? 'border-red-300' : 'border-gray-300'
                    }`}
                    min="10"
                    max="100"
                  />
                  {errors.retractionSpeed && (
                    <p className="text-red-600 text-sm mt-1">{errors.retractionSpeed}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (Optional)
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => updateField('notes', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
                placeholder="Add any additional notes about this profile..."
              />
            </div>

            {/* Default Profile Checkbox */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isDefault"
                checked={formData.isDefault}
                onChange={(e) => updateField('isDefault', e.target.checked)}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label htmlFor="isDefault" className="text-sm text-gray-700">
                Set as default profile
              </label>
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end space-x-3 px-6 py-4 bg-gray-50 rounded-b-lg">
            <Button
              variant="secondary"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              disabled={saving}
            >
              <Save className="w-4 h-4 mr-2" />
              {saving ? 'Saving...' : 'Save Profile'}
            </Button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}