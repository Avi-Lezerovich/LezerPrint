'use client';

import { motion } from 'framer-motion';
import { useState } from 'react';
import Card, { CardContent } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import AnalyticsDashboard from '@/components/analytics/AnalyticsDashboard';
import GCodeTerminal from '@/components/printer/GCodeTerminal';
import SettingsManagement from '@/components/settings/SettingsManagement';
import CameraViewer from '@/components/camera/CameraViewer';
import { 
  Activity, 
  BarChart3, 
  Terminal, 
  Settings, 
  Camera,
  Play,
  Pause,
  Square,
  Thermometer,
  Gauge
} from 'lucide-react';

export default function PrinterMainDashboardPage() {
  const [activeView, setActiveView] = useState<'overview' | 'analytics' | 'terminal' | 'settings' | 'camera'>('overview');
  const [printerStatus] = useState({
    status: 'printing',
    progress: 65,
    hotend: 210,
    bed: 60,
    fan: 85,
    currentFile: 'demo_model.gcode',
    timeRemaining: '2h 15m'
  });

  const views = [
    { id: 'overview', label: 'Overview', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'terminal', label: 'Terminal', icon: Terminal },
    { id: 'camera', label: 'Camera', icon: Camera },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <motion.main 
      className="min-h-screen bg-gray-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Enhanced Header */}
        <motion.div 
          className="mb-8"
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <motion.div
              initial={{ rotate: 0 }}
              animate={{ rotate: 360 }}
              transition={{ duration: 1, delay: 0.2 }}
            >
              <Activity className="w-8 h-8 mr-3 text-blue-600" />
            </motion.div>
            LezerPrint Dashboard
          </h1>
          <p className="mt-2 text-gray-600">
            Professional 3D printing management with real-time monitoring and analytics
          </p>
        </motion.div>

        {/* Enhanced Navigation */}
        <motion.div 
          className="mb-6"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <nav className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            {views.map((view, index) => {
              const IconComponent = view.icon;
              return (
                <motion.button
                  key={view.id}
                  onClick={() => setActiveView(view.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-colors font-medium ${
                    activeView === view.id
                      ? 'bg-blue-600 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <IconComponent className="w-4 h-4" />
                  <span>{view.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </motion.div>

        {/* Enhanced Content */}
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeView === 'overview' && (
            <div className="space-y-6">
              {/* Status Cards */}
              <motion.div 
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
                initial="hidden"
                animate="visible"
                variants={{
                  hidden: { opacity: 0 },
                  visible: {
                    opacity: 1,
                    transition: {
                      staggerChildren: 0.1
                    }
                  }
                }}
              >
                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card variant="elevated" hoverable>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Status</p>
                          <p className="text-2xl font-bold text-green-600 capitalize">{printerStatus.status}</p>
                          <p className="text-xs text-gray-500">{printerStatus.currentFile}</p>
                        </div>
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Play className="w-8 h-8 text-green-600" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card variant="elevated" hoverable>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Progress</p>
                          <p className="text-2xl font-bold text-blue-600">{printerStatus.progress}%</p>
                          <p className="text-xs text-gray-500">{printerStatus.timeRemaining} left</p>
                        </div>
                        <div className="relative w-12 h-12">
                          <svg className="w-12 h-12 transform -rotate-90" viewBox="0 0 36 36">
                            <path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#e5e7eb"
                              strokeWidth="2"
                            />
                            <motion.path
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="#3b82f6"
                              strokeWidth="2"
                              strokeDasharray={`${printerStatus.progress}, 100`}
                              initial={{ strokeDasharray: "0, 100" }}
                              animate={{ strokeDasharray: `${printerStatus.progress}, 100` }}
                              transition={{ duration: 1, delay: 0.5 }}
                            />
                          </svg>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card variant="elevated" hoverable>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Hotend</p>
                          <p className="text-2xl font-bold text-red-600">{printerStatus.hotend}°C</p>
                          <p className="text-xs text-gray-500">Target: 210°C</p>
                        </div>
                        <motion.div
                          animate={{ y: [0, -5, 0] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <Thermometer className="w-8 h-8 text-red-600" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
                  <Card variant="elevated" hoverable>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-500">Bed Temp</p>
                          <p className="text-2xl font-bold text-orange-600">{printerStatus.bed}°C</p>
                          <p className="text-xs text-gray-500">Fan: {printerStatus.fan}%</p>
                        </div>
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        >
                          <Gauge className="w-8 h-8 text-orange-600" />
                        </motion.div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <Card variant="elevated">
                  <CardContent>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="flex flex-wrap gap-3">
                      <Button variant="primary" className="flex items-center space-x-2">
                        <Pause className="w-4 h-4" />
                        <span>Pause Print</span>
                      </Button>
                      <Button variant="danger" className="flex items-center space-x-2">
                        <Square className="w-4 h-4" />
                        <span>Stop Print</span>
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveView('terminal')}>
                        <Terminal className="w-4 h-4 mr-2" />
                        Open Terminal
                      </Button>
                      <Button variant="secondary" onClick={() => setActiveView('camera')}>
                        <Camera className="w-4 h-4 mr-2" />
                        View Camera
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>
          )}

          {activeView === 'analytics' && (
            <AnalyticsDashboard demoMode={true} />
          )}

          {activeView === 'terminal' && (
            <GCodeTerminal demoMode={true} />
          )}

          {activeView === 'camera' && (
            <CameraViewer demoMode={true} />
          )}

          {activeView === 'settings' && (
            <SettingsManagement demoMode={true} />
          )}
        </motion.div>
      </div>
    </motion.main>
  );
}
