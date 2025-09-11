'use client';

import Link from 'next/link'
import { motion } from 'framer-motion'
import { 
  PlayCircle, 
  Settings, 
  BarChart3, 
  Monitor, 
  FileText, 
  Clock, 
  Github, 
  ExternalLink,
  Printer,
  Thermometer,
  Camera,
  TrendingUp,
  Shield,
  Zap,
  Layers,
  Cloud,
  Smartphone,
  Globe
} from 'lucide-react'
import { Navigation } from '@/components/ui/Navigation'

export default function HomePage() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const features = [
    {
      icon: Printer,
      title: "Real-time Monitoring",
      description: "Monitor your 3D printer status, temperatures, and progress in real-time with live updates.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: Camera,
      title: "Live Camera Feed",
      description: "Watch your prints in progress with integrated camera streaming and time-lapse recording.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Track print history, failure rates, filament usage, and performance metrics.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Cloud,
      title: "File Management",
      description: "Upload, organize, and manage your STL and G-code files with cloud synchronization.",
      color: "from-orange-500 to-red-500"
    },
    {
      icon: Smartphone,
      title: "Mobile Responsive",
      description: "Access your printer from anywhere with our fully responsive mobile interface.",
      color: "from-indigo-500 to-blue-500"
    },
    {
      icon: Shield,
      title: "Secure & Reliable",
      description: "Enterprise-grade security with encrypted communications and reliable uptime.",
      color: "from-gray-600 to-gray-800"
    }
  ];

  const stats = [
    { value: "99.9%", label: "Uptime", icon: TrendingUp },
    { value: "24/7", label: "Monitoring", icon: Monitor },
    { value: "Real-time", label: "Updates", icon: Zap },
    { value: "Cloud", label: "Sync", icon: Cloud }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Navigation */}
      <Navigation />

      {/* Hero Section */}
      <motion.div 
        className="max-w-7xl mx-auto px-6 pt-24 pb-24"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          {/* Floating 3D Printer Icon */}
          <motion.div 
            className="flex justify-center mb-12"
            variants={itemVariants}
          >
            <motion.div 
              className="glass-card p-8 shadow-2xl border border-white/20"
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                <Printer className="w-10 h-10 text-white" />
              </div>
            </motion.div>
          </motion.div>
          
          <motion.h1 
            className="text-6xl md:text-8xl font-bold text-gray-900 mb-8 tracking-tight"
            variants={itemVariants}
          >
            Lezer<span className="text-gradient">Print</span>
          </motion.h1>
          
          <motion.p 
            className="text-xl md:text-2xl text-gray-600 mb-6 max-w-4xl mx-auto leading-relaxed"
            variants={itemVariants}
          >
            The ultimate 3D printer management system with real-time monitoring, 
            analytics, and cloud integration.
          </motion.p>
          
          <motion.p 
            className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto"
            variants={itemVariants}
          >
            Monitor temperature, track progress, manage files, and control your 3D printer 
            from anywhere in the world.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div 
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
            variants={itemVariants}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="/demo" className="btn-primary btn-lg flex items-center gap-3">
                <PlayCircle className="w-5 h-5" />
                View Live Demo
              </Link>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link href="#features" className="btn-secondary btn-lg flex items-center gap-3">
                <Monitor className="w-5 h-5" />
                Explore Features
              </Link>
            </motion.div>
          </motion.div>

          {/* Stats */}
          <motion.div 
            className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto"
            variants={itemVariants}
          >
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="card-glass text-center p-6"
                whileHover={{ scale: 1.05, y: -5 }}
                transition={{ duration: 0.2 }}
              >
                <stat.icon className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
                <div className="text-sm text-gray-600 font-medium">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.div>

      {/* Features Section */}
      <motion.div 
        id="features" 
        className="max-w-7xl mx-auto px-6 pb-24"
        variants={containerVariants}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
      >
        <motion.div className="text-center mb-16" variants={itemVariants}>
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Everything you need for 3D printing
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Professional-grade monitoring and management tools designed for makers, 
            professionals, and enterprises.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              className="card-hover p-8 group"
              variants={itemVariants}
              whileHover={{ y: -8 }}
              transition={{ duration: 0.3 }}
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                <feature.icon className="w-7 h-7 text-white" />
              </div>
              
              <h3 className="text-xl font-bold text-gray-900 mb-4 group-hover:text-blue-600 transition-colors">
                {feature.title}
              </h3>
              
              <p className="text-gray-600 leading-relaxed">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Live Demo Section */}
        <motion.div 
          className="mt-24 text-center"
          variants={itemVariants}
        >
          <div className="card-glass p-12 max-w-4xl mx-auto">
            <h3 className="text-3xl font-bold text-gray-900 mb-6">
              See LezerPrint in Action
            </h3>
            <p className="text-lg text-gray-600 mb-8 max-w-2xl mx-auto">
              Experience the full power of our 3D printer management system with our 
              interactive demo featuring real printer data.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link href="/demo" className="btn-primary btn-lg flex items-center gap-3">
                  <PlayCircle className="w-5 h-5" />
                  Launch Demo
                </Link>
              </motion.div>
              
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link 
                  href="https://github.com/Avi-Lezerovich/LezerPrint" 
                  className="btn-secondary btn-lg flex items-center gap-3"
                  target="_blank"
                >
                  <Github className="w-5 h-5" />
                  View Source
                  <ExternalLink className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-white/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
                <Layers className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-gradient">LezerPrint</span>
            </div>
            
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Open-source 3D printer management system built for the future of manufacturing.
            </p>
            
            <div className="flex items-center justify-center space-x-6">
              <Link 
                href="https://github.com/Avi-Lezerovich/LezerPrint" 
                className="text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-2"
                target="_blank"
              >
                <Github className="w-5 h-5" />
                GitHub
              </Link>
              <span className="text-gray-300">•</span>
              <span className="text-gray-500">
                Built with ❤️ by Avi Lezerovich
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}