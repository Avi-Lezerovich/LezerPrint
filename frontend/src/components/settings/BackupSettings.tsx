'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Download, 
  Upload, 
  FileText, 
  Shield, 
  Clock,
  CheckCircle,
  AlertTriangle 
} from 'lucide-react';
import Button from '@/components/ui/Button';

interface BackupSettingsProps {
  onExportSettings: () => void;
  onImportSettings: (file: File) => void;
  demoMode?: boolean;
}

export default function BackupSettings({ 
  onExportSettings, 
  onImportSettings,
  demoMode = false 
}: BackupSettingsProps) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    onExportSettings();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      if (!file.name.endsWith('.json')) {
        throw new Error('Please select a JSON file');
      }

      if (file.size > 1024 * 1024) { // 1MB limit
        throw new Error('File is too large. Maximum size is 1MB');
      }

      await onImportSettings(file);
      setImportResult({
        type: 'success',
        message: 'Settings imported successfully!'
      });
    } catch (error) {
      setImportResult({
        type: 'error',
        message: error instanceof Error ? error.message : 'Failed to import settings'
      });
    } finally {
      setImporting(false);
      // Clear the input so the same file can be selected again
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Clear import result after 5 seconds
  React.useEffect(() => {
    if (importResult) {
      const timer = setTimeout(() => {
        setImportResult(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [importResult]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-6"
    >
      {/* Header */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">Backup & Restore</h3>
        <p className="text-sm text-gray-500">
          Keep your settings safe by creating backups and restoring from previous configurations
        </p>
      </div>

      {/* Import Result Notification */}
      {importResult && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className={`p-4 rounded-lg border ${
            importResult.type === 'success'
              ? 'bg-green-50 border-green-200 text-green-800'
              : 'bg-red-50 border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {importResult.type === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{importResult.message}</span>
          </div>
        </motion.div>
      )}

      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Export Settings */}
        <motion.div 
          className="bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-green-600 rounded-lg">
              <Download className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900">Export Settings</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Download all your printer settings, profiles, and preferences as a JSON file. 
            This creates a complete backup of your configuration.
          </p>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-2 mb-1">
                <FileText className="w-3 h-3" />
                <span>Includes:</span>
              </div>
              <ul className="ml-5 space-y-1">
                <li>• Printer specifications</li>
                <li>• Temperature profiles</li>
                <li>• User preferences</li>
                <li>• Calibration data</li>
              </ul>
            </div>
            
            <Button
              variant="primary"
              onClick={handleExport}
              className="w-full bg-green-600 hover:bg-green-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Export Settings
            </Button>
          </div>
        </motion.div>

        {/* Import Settings */}
        <motion.div 
          className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-6"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-blue-600 rounded-lg">
              <Upload className="w-6 h-6 text-white" />
            </div>
            <h4 className="font-medium text-gray-900">Import Settings</h4>
          </div>
          
          <p className="text-sm text-gray-600 mb-4">
            Restore settings from a previously exported JSON file. This will replace 
            your current configuration with the imported settings.
          </p>
          
          <div className="space-y-3">
            <div className="text-xs text-gray-500">
              <div className="flex items-center space-x-2 mb-1">
                <Shield className="w-3 h-3" />
                <span>Safety notes:</span>
              </div>
              <ul className="ml-5 space-y-1">
                <li>• Only import trusted files</li>
                <li>• Verify printer compatibility</li>
                <li>• Check calibration values</li>
              </ul>
            </div>
            
            <Button
              variant="secondary"
              onClick={handleImportClick}
              disabled={importing}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              {importing ? 'Importing...' : 'Import Settings'}
            </Button>
            
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />
          </div>
        </motion.div>
      </div>

      {/* Best Practices */}
      <motion.div 
        className="bg-amber-50 border border-amber-200 rounded-lg p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center space-x-2 mb-3">
          <Clock className="w-5 h-5 text-amber-600" />
          <h4 className="font-medium text-amber-800">Backup Best Practices</h4>
        </div>
        
        <div className="text-sm text-amber-700 space-y-2">
          <p>
            <strong>Regular backups:</strong> Export your settings after making significant 
            changes or successful calibrations.
          </p>
          <p>
            <strong>Version your backups:</strong> Include dates in filenames 
            (e.g., "lezerprint-settings-2024-01-15.json").
          </p>
          <p>
            <strong>Safe storage:</strong> Store backup files in multiple locations 
            (cloud storage, external drives).
          </p>
          <p>
            <strong>Before importing:</strong> Always export your current settings first 
            as a safety backup.
          </p>
        </div>
      </motion.div>

      {/* File Format Information */}
      <motion.div 
        className="bg-gray-50 border border-gray-200 rounded-lg p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4 }}
      >
        <h5 className="text-sm font-medium text-gray-900 mb-2">File Format</h5>
        <p className="text-xs text-gray-600">
          Settings are exported as human-readable JSON files. You can open them in any text 
          editor to view or manually edit configuration values. Always validate JSON syntax 
          before importing modified files.
        </p>
      </motion.div>
    </motion.div>
  );
}