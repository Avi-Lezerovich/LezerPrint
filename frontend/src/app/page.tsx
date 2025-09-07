import Link from 'next/link'
import { PlayCircle, Settings, BarChart3, Monitor, FileText, Clock, Github, ExternalLink } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100">
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between p-6 max-w-7xl mx-auto">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">L</span>
          </div>
          <span className="text-xl font-bold text-gray-900">LezerPrint</span>
        </div>
        <div className="flex items-center space-x-4">
          <Link
            href="https://github.com/Avi-Lezerovich/LezerPrint"
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900 transition-colors"
            target="_blank"
          >
            <Github className="w-5 h-5" />
            <span className="hidden sm:inline">GitHub</span>
          </Link>
          <Link
            href="/login"
            className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors border border-gray-200"
          >
            Login
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-6 pt-16 pb-24">
        <div className="text-center">
          <div className="flex justify-center mb-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center mx-auto">
                <Monitor className="w-8 h-8 text-white" />
              </div>
            </div>
          </div>
          
          <h1 className="text-6xl md:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
            Lezer<span className="text-blue-600">Print</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto leading-relaxed">
            Advanced 3D Printer Management System
          </p>
          
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            Real-time monitoring, intelligent file management, and comprehensive analytics 
            for your 3D printing workflow. Built with modern web technologies.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link
              href="/demo"
              className="group bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <PlayCircle className="w-5 h-5" />
              <span>View Live Demo</span>
              <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
            </Link>
            <Link
              href="#features"
              className="bg-white/80 backdrop-blur-sm hover:bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold transition-all duration-200 border border-gray-200 hover:border-gray-300"
            >
              Explore Features
            </Link>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div id="features" className="max-w-7xl mx-auto px-6 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Everything you need for 3D printing
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            From real-time monitoring to advanced analytics, LezerPrint provides 
            a complete solution for managing your 3D printing workflow.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Real-time Monitoring */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center mb-6">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Real-time Monitoring</h3>
            <p className="text-gray-600 leading-relaxed">
              Monitor your 3D printer in real-time with live temperature data, progress tracking, 
              and webcam feed integration for complete visibility.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              Live status updates via WebSocket
            </div>
          </div>

          {/* File Management */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-xl flex items-center justify-center mb-6">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Smart File Management</h3>
            <p className="text-gray-600 leading-relaxed">
              Upload, organize, and manage your STL and G-code files with 3D preview, 
              automatic thumbnails, and intelligent file organization.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              3D preview with Three.js
            </div>
          </div>

          {/* Print History */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-violet-600 rounded-xl flex items-center justify-center mb-6">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Print History & Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Track your print jobs with detailed history, success rates, material usage, 
              and performance analytics to optimize your workflow.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Comprehensive analytics dashboard
            </div>
          </div>

          {/* Advanced Controls */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center mb-6">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Advanced Controls</h3>
            <p className="text-gray-600 leading-relaxed">
              Complete printer control with G-code terminal, custom macros, temperature profiles, 
              and emergency stop functionality for safety.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              G-code terminal with macro support
            </div>
          </div>

          {/* Camera Integration */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-pink-500 to-rose-600 rounded-xl flex items-center justify-center mb-6">
              <Monitor className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Camera Integration</h3>
            <p className="text-gray-600 leading-relaxed">
              Live webcam streaming, automatic time-lapse generation, and print monitoring 
              with snapshot capture for documentation.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-pink-500 rounded-full mr-2"></div>
              MJPEG streaming support
            </div>
          </div>

          {/* Analytics */}
          <div className="group bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 hover:scale-105">
            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl flex items-center justify-center mb-6">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-xl font-semibold mb-3 text-gray-900">Performance Analytics</h3>
            <p className="text-gray-600 leading-relaxed">
              Detailed insights into print success rates, material costs, energy consumption, 
              and productivity metrics with beautiful visualizations.
            </p>
            <div className="mt-4 flex items-center text-sm text-gray-500">
              <div className="w-2 h-2 bg-indigo-500 rounded-full mr-2"></div>
              Interactive charts with Recharts
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">L</span>
              </div>
              <span className="text-xl font-bold text-gray-900">LezerPrint</span>
            </div>
            <p className="text-gray-600 mb-4">
              Open source 3D printer management system built with modern web technologies.
            </p>
            <div className="flex justify-center space-x-6">
              <Link
                href="https://github.com/Avi-Lezerovich/LezerPrint"
                className="text-gray-500 hover:text-gray-900 transition-colors"
                target="_blank"
              >
                <Github className="w-6 h-6" />
              </Link>
            </div>
            <div className="mt-8 pt-8 border-t border-gray-200">
              <p className="text-sm text-gray-500">
                Built by Avi Lezerovich • {new Date().getFullYear()} • Open Source Portfolio Project
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}