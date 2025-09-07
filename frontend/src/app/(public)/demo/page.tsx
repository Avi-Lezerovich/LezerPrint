'use client';

export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Monitor, Thermometer, Clock, Play, Pause, Square, AlertTriangle, Printer, FileText, BarChart3, Settings } from 'lucide-react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import CameraViewer from '@/components/camera/CameraViewer';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import GCodeTerminal from '@/components/printer/GCodeTerminal';
import { formatDuration, formatTemperature, formatPercentage, getTemperatureColor } from '@/lib/utils';

// Mock data for demo mode
const mockPrinterStatus = {
  status: 'printing',
  currentFile: 'phone_stand_v2.gcode',
  progress: 67,
  timeElapsed: 4320, // 1h 12m
  timeRemaining: 2280, // 38m
  hotendTemp: 210,
  hotendTarget: 210,
  bedTemp: 60,
  bedTarget: 60,
  fanSpeed: 100,
  printSpeed: 100,
  layer: 45,
  totalLayers: 67,
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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Home</span>
              </Link>
              <div className="w-px h-6 bg-gray-300"></div>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                  <Printer className="w-4 h-4 text-white" />
                </div>
                <span className="text-xl font-bold text-gray-900">Demo Mode</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 px-3 py-1.5 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Demo</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Status Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
          <Card 
            variant="glass" 
            hoverable
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center">
                <Monitor className="w-6 h-6 text-white" />
              </div>
            }
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Status</p>
              <p className="text-lg font-semibold text-green-600 capitalize">{printerData.status}</p>
            </div>
          </Card>

          <Card 
            variant="glass" 
            hoverable
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
            }
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Progress</p>
              <p className="text-lg font-semibold text-blue-600">{Math.round(printerData.progress)}%</p>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-500" 
                  style={{ width: `${printerData.progress}%` }}
                ></div>
              </div>
            </div>
          </Card>

          <Card 
            variant="glass" 
            hoverable
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center">
                <Thermometer className="w-6 h-6 text-white" />
              </div>
            }
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Hotend Temp</p>
              <p className={`text-lg font-semibold ${getTemperatureColor(printerData.hotendTemp)}`}>
                {formatTemperature(printerData.hotendTemp)}
              </p>
            </div>
          </Card>

          <Card 
            variant="glass" 
            hoverable
            icon={
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center">
                <Clock className="w-6 h-6 text-white" />
              </div>
            }
          >
            <div className="text-center">
              <p className="text-sm text-gray-600 mb-1">Time Remaining</p>
              <p className="text-lg font-semibold text-purple-600">
                {formatDuration(printerData.timeRemaining)}
              </p>
            </div>
          </Card>
        </div>

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Current Print Details */}
          <div className="lg:col-span-2">
            <Card 
              variant="glass"
              title="Current Print Job"
              description="Real-time printing status and controls"
              icon={
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
              }
            >
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-1">{printerData.currentFile}</h4>
                    <p className="text-sm text-gray-600">Layer {printerData.layer} of {printerData.totalLayers}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-blue-600">{Math.round(printerData.progress)}%</p>
                    <p className="text-sm text-gray-500">Complete</p>
                  </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-3 rounded-full transition-all duration-500" 
                    style={{ width: `${printerData.progress}%` }}
                  ></div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Time Elapsed</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDuration(printerData.timeElapsed)}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl">
                    <p className="text-sm text-gray-600 mb-1">Estimated Remaining</p>
                    <p className="text-lg font-semibold text-gray-900">{formatDuration(printerData.timeRemaining)}</p>
                  </div>
                </div>

                <div className="flex space-x-3">
                  <Button 
                    variant="warning" 
                    size="sm"
                    icon={<Pause className="w-4 h-4" />}
                    onClick={() => setSnapshotStatus('Pausing print...')}
                  >
                    Pause
                  </Button>
                  <Button 
                    variant="danger" 
                    size="sm"
                    icon={<Square className="w-4 h-4" />}
                    onClick={() => setSnapshotStatus('Stopping print...')}
                  >
                    Stop
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    icon={<Settings className="w-4 h-4" />}
                  >
                    Settings
                  </Button>
                </div>

                {snapshotStatus && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-blue-800 text-sm font-medium">{snapshotStatus}</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Temperature Monitoring */}
          <div>
            <Card 
              variant="glass"
              title="Temperature Monitor"
              description="Real-time temperature tracking"
              icon={
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                  <Thermometer className="w-5 h-5 text-white" />
                </div>
              }
            >
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Hotend</p>
                    <p className={`text-lg font-bold ${getTemperatureColor(printerData.hotendTemp)}`}>
                      {formatTemperature(printerData.hotendTemp)}
                    </p>
                    <p className="text-xs text-gray-500">Target: {formatTemperature(printerData.hotendTarget)}</p>
                  </div>
                  <div className="text-center p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Bed</p>
                    <p className={`text-lg font-bold ${getTemperatureColor(printerData.bedTemp)}`}>
                      {formatTemperature(printerData.bedTemp)}
                    </p>
                    <p className="text-xs text-gray-500">Target: {formatTemperature(printerData.bedTarget)}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Fan Speed</span>
                    <span className="text-sm font-semibold text-gray-900">{printerData.fanSpeed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full" 
                      style={{ width: `${printerData.fanSpeed}%` }}
                    ></div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Print Speed</span>
                    <span className="text-sm font-semibold text-gray-900">{printerData.printSpeed}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-600 h-2 rounded-full" 
                      style={{ width: `${printerData.printSpeed}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Camera and Recent Prints */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Camera Viewer */}
          <Card 
            variant="glass"
            title="Live Camera Feed"
            description="Monitor your print in real-time"
            icon={
              <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Monitor className="w-5 h-5 text-white" />
              </div>
            }
          >
            <div className="bg-gray-900 rounded-lg aspect-video flex items-center justify-center">
              <div className="text-center text-gray-400">
                <Monitor className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">Camera feed simulation</p>
                <p className="text-xs">In production: Live MJPEG stream</p>
              </div>
            </div>
          </Card>

          {/* Recent Prints */}
          <Card 
            variant="glass"
            title="Recent Print Jobs"
            description="Your printing history"
            icon={
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-white" />
              </div>
            }
          >
            <div className="space-y-3">
              {mockRecentPrints.map((print) => (
                <div key={print.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{print.filename}</p>
                    <p className="text-xs text-gray-500">{print.completedAt} • {print.duration}</p>
                  </div>
                  <div className="ml-3">
                    {print.success ? (
                      <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full font-medium">
                        Success
                      </div>
                    ) : (
                      <div className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full font-medium">
                        Failed
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Bottom Notice */}
        <Card variant="glass" className="border-l-4 border-l-blue-500">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900 mb-1">Demo Mode Active</h3>
              <p className="text-sm text-gray-600">
                This is a demonstration of the LezerPrint interface with simulated data. 
                In a real deployment, this would connect to your actual 3D printer hardware 
                and show live status updates, camera feeds, and control capabilities.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}