'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Edit2, Trash2, Plus } from 'lucide-react';

export interface TemperatureProfile {
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

interface TemperatureProfilesProps {
  profiles: TemperatureProfile[];
  onEditProfile: (profile: TemperatureProfile) => void;
  onDeleteProfile: (profileId: string) => void;
  onAddProfile: () => void;
}

export default function TemperatureProfiles({ 
  profiles, 
  onEditProfile, 
  onDeleteProfile, 
  onAddProfile 
}: TemperatureProfilesProps) {
  const handleDeleteProfile = (profileId: string, profileName: string) => {
    if (window.confirm(`Are you sure you want to delete the profile "${profileName}"?`)) {
      onDeleteProfile(profileId);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium text-gray-900">Temperature Profiles</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage your material-specific temperature and speed profiles
          </p>
        </div>
        <motion.button
          onClick={onAddProfile}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Plus className="w-4 h-4" />
          <span>Add Profile</span>
        </motion.button>
      </div>

      {/* Profiles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            {/* Profile Header */}
            <div className="flex justify-between items-start mb-3">
              <div>
                <h4 className="font-medium text-gray-900 flex items-center">
                  {profile.name}
                  {profile.isDefault && (
                    <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                      Default
                    </span>
                  )}
                </h4>
                <p className="text-sm text-gray-500">{profile.material}</p>
              </div>
              <div className="flex space-x-1">
                <motion.button
                  onClick={() => onEditProfile(profile)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Edit profile"
                >
                  <Edit2 className="w-4 h-4" />
                </motion.button>
                <motion.button
                  onClick={() => handleDeleteProfile(profile.id, profile.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 rounded transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  title="Delete profile"
                  disabled={profile.isDefault}
                >
                  <Trash2 className="w-4 h-4" />
                </motion.button>
              </div>
            </div>
            
            {/* Profile Details */}
            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Hotend:</span>
                  <span className="font-medium">{profile.hotendTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Bed:</span>
                  <span className="font-medium">{profile.bedTemp}°C</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Fan:</span>
                  <span className="font-medium">{profile.fanSpeed}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Speed:</span>
                  <span className="font-medium">{profile.printSpeed}mm/s</span>
                </div>
              </div>
              
              {/* Retraction Settings */}
              <div className="pt-2 border-t border-gray-100">
                <div className="text-xs text-gray-500 mb-1">Retraction</div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Distance:</span>
                    <span className="font-medium">{profile.retraction.distance}mm</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Speed:</span>
                    <span className="font-medium">{profile.retraction.speed}mm/s</span>
                  </div>
                </div>
              </div>

              {/* Notes */}
              {profile.notes && (
                <div className="pt-2 border-t border-gray-100">
                  <div className="text-xs text-gray-500 mb-1">Notes</div>
                  <p className="text-sm text-gray-700 truncate" title={profile.notes}>
                    {profile.notes}
                  </p>
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Empty State */}
      {profiles.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-12"
        >
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Plus className="w-8 h-8 text-gray-400" />
          </div>
          <h4 className="text-lg font-medium text-gray-900 mb-2">No profiles yet</h4>
          <p className="text-gray-500 mb-4">Create your first temperature profile to get started</p>
          <motion.button
            onClick={onAddProfile}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Add Your First Profile
          </motion.button>
        </motion.div>
      )}
    </motion.div>
  );
}