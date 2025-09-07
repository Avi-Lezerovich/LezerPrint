'use client';

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import CameraViewer from '@/components/camera/CameraViewer';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import GCodeTerminal from '@/components/printer/GCodeTerminal';

// Mock data for demo mode
const mockPrinterStatus = {
  status: 'printing',
  currentFile: 'phone_stand_v2.gcode',
  progress: 0,
  timeElapsed: 0,
  timeRemaining: 0,
  hotendTemp: 210,
  hotendTarget: 210,
  bedTemp: 60,
  bedTarget: 60,
  fanSpeed: 100,
  printSpeed: 100,
};

const mockRecentPrints = [
  {
    id: '1',
    filename: 'miniature_castle.stl',
    status: 'completed',
    duration: '4h 32m',
    completedAt: '2024-01-15 14:30',
    success: true,
  },
  {
    id: '2', 
    filename: 'desk_organizer.stl',
    status: 'completed',
    duration: '2h 15m',
    completedAt: '2024-01-14 10:45',
    success: true,
  },
  {
    id: '3',
    filename: 'prototype_bracket.stl',
    status: 'failed',
    duration: '0h 45m',
    completedAt: '2024-01-13 16:20',
    success: false,
  },
];

export default function DemoPage() {
  const [printerData, setPrinterData] = useState(mockPrinterStatus);
  const [temperatureHistory, setTemperatureHistory] = useState<Array<{time: string, hotend: number, bed: number}>>([]);
  const [snapshotStatus, setSnapshotStatus] = useState<string | null>(null);

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setPrinterData(prev => ({
        ...prev,
        progress: Math.min(prev.progress + Math.random() * 2, 100),
        timeElapsed: prev.timeElapsed + 1,
        timeRemaining: Math.max(prev.timeRemaining - 1, 0),
        hotendTemp: 210 + (Math.random() - 0.5) * 4, // Simulate temp fluctuation
        bedTemp: 60 + (Math.random() - 0.5) * 2,
      }));

      // Add temperature data point
      const now = new Date().toLocaleTimeString();
      setTemperatureHistory(prev => {
        const newHistory = [...prev.slice(-19), {
          time: now,
          hotend: 210 + (Math.random() - 0.5) * 4,
          bed: 60 + (Math.random() - 0.5) * 2,
        }];
        return newHistory;
      });
    }, 2000);

    // Initialize with some historical data
    const initialData = [];
    for (let i = 20; i > 0; i--) {
      const time = new Date(Date.now() - i * 2000).toLocaleTimeString();
      initialData.push({
        time,
        hotend: 210 + (Math.random() - 0.5) * 4,
        bed: 60 + (Math.random() - 0.5) * 2,
      });
    }
    setTemperatureHistory(initialData);
    
    // Set initial time remaining
    setPrinterData(prev => ({
      ...prev,
      timeRemaining: 7200, // 2 hours in seconds
    }));

    return () => clearInterval(interval);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${mins}m`;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'printing': return 'text-blue-600 bg-blue-100';
      case 'completed': return 'text-green-600 bg-green-100';
      case 'failed': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">LezerPrint Dashboard</h1>
              <p className="text-sm text-amber-600 bg-amber-50 px-2 py-1 rounded-md inline-block mt-1">
                🎯 Demo Mode - Live Preview
              </p>
            </div>
            <div className="flex space-x-4">
              <Link href="/" className="text-blue-600 hover:text-blue-700 font-medium">
                ← Back to Portfolio
              </Link>
              <Link href="/history" className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700">
                View Print History
              </Link>
              <Link href="/login" className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
                Login for Full Access
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <p className={`text-sm px-2 py-1 rounded ${getStatusColor(printerData.status)}`}>
                  {printerData.status.charAt(0).toUpperCase() + printerData.status.slice(1)}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Progress</h3>
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${printerData.progress}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600">{printerData.progress.toFixed(1)}% Complete</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Time Remaining</h3>
            <p className="text-2xl font-bold text-gray-900">{formatTime(printerData.timeRemaining)}</p>
            <p className="text-sm text-gray-600">Elapsed: {formatTime(printerData.timeElapsed)}</p>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-2">Current File</h3>
            <p className="text-sm font-medium text-blue-600">{printerData.currentFile}</p>
            <p className="text-xs text-gray-500 mt-1">STL → G-code processed</p>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Temperature Chart */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Temperature Monitoring</h3>
              <div className="h-64 flex items-end space-x-1 bg-gray-50 p-4 rounded">
                {temperatureHistory.slice(-10).map((data, index) => (
                  <div key={index} className="flex flex-col items-center space-y-1 flex-1">
                    <div className="w-full flex flex-col space-y-1">
                      <div 
                        className="bg-red-400 rounded-t"
                        style={{ height: `${(data.hotend / 250) * 150}px` }}
                        title={`Hotend: ${data.hotend.toFixed(1)}°C`}
                      ></div>
                      <div 
                        className="bg-blue-400 rounded-b"
                        style={{ height: `${(data.bed / 100) * 50}px` }}
                        title={`Bed: ${data.bed.toFixed(1)}°C`}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex justify-between mt-4">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-red-400 rounded"></div>
                    <span className="text-sm">Hotend: {printerData.hotendTemp.toFixed(1)}°C / {printerData.hotendTarget}°C</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-blue-400 rounded"></div>
                    <span className="text-sm">Bed: {printerData.bedTemp.toFixed(1)}°C / {printerData.bedTarget}°C</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Live Camera Feed */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Live Camera</h3>
            <CameraViewer 
              demoMode={true}
              onSnapshot={(result) => {
                if (result.success) {
                  setSnapshotStatus(`Snapshot saved: ${result.filename}`);
                  setTimeout(() => setSnapshotStatus(null), 3000);
                } else {
                  setSnapshotStatus(`Error: ${result.error}`);
                  setTimeout(() => setSnapshotStatus(null), 3000);
                }
              }}
            />
            {snapshotStatus && (
              <div className="mt-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
                {snapshotStatus}
              </div>
            )}
            <div className="mt-4 space-y-2">
              <button 
                className="w-full text-sm bg-gray-100 text-gray-600 py-2 rounded cursor-not-allowed"
                disabled
              >
                🎥 Time-lapse (Coming Soon)
              </button>
            </div>
          </div>
        </div>

        {/* Recent Prints */}
        <div className="mt-8">
          <div className="bg-white rounded-lg shadow">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Recent Prints</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">File</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Duration</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {mockRecentPrints.map((print) => (
                    <tr key={print.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {print.filename}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(print.status)}`}>
                          {print.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {print.duration}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {print.completedAt}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Demo Notice */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="w-5 h-5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Demo Mode Information</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>You're viewing a live demo of LezerPrint with simulated data. This demonstrates:</p>
                <ul className="list-disc ml-5 mt-1 space-y-1">
                  <li>Real-time temperature monitoring and graphing</li>
                  <li>Print progress tracking with live updates</li>
                  <li>Professional dashboard interface</li>
                  <li>Live camera feed with snapshot capability</li>
                  <li>Comprehensive print history and analytics</li>
                  <li>Job status tracking and management</li>
                  <li>Advanced analytics dashboard</li>
                  <li>G-code terminal interface</li>
                </ul>
                <p className="mt-2">
                  <Link href="/login" className="font-medium text-blue-800 hover:text-blue-900">
                    Login to access the full system →
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Advanced Features Showcase */}
        <div className="mt-8 space-y-8">
          {/* Analytics Dashboard */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">📈 Analytics Dashboard</h2>
            <AnalyticsDashboard demoMode={true} />
          </div>

          {/* G-code Terminal */}
          <div>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">💻 G-code Terminal</h2>
            <GCodeTerminal demoMode={true} readOnly={true} />
          </div>
        </div>
      </div>
    </div>
  );
}