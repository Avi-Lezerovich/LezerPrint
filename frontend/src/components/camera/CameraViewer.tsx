'use client';

import { useState, useEffect, useCallback } from 'react';
import { cameraService, CameraFrame, CameraStatus } from '@/services/cameraService';

interface CameraViewerProps {
  className?: string;
  showControls?: boolean;
  demoMode?: boolean;
  onSnapshot?: (result: { success: boolean; filename?: string; error?: string }) => void;
}

export default function CameraViewer({ 
  className = '', 
  showControls = true, 
  demoMode = false,
  onSnapshot 
}: CameraViewerProps) {
  const [currentFrame, setCurrentFrame] = useState<string>('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [status, setStatus] = useState<CameraStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Demo mode frame generation
  useEffect(() => {
    if (demoMode) {
      setIsStreaming(true);
      const interval = setInterval(() => {
        const frame = cameraService.generateDemoFrame();
        setCurrentFrame(frame.data);
      }, 1000 / 15); // 15 fps

      return () => clearInterval(interval);
    }
  }, [demoMode]);

  // Load camera status
  useEffect(() => {
    if (!demoMode) {
      loadStatus();
    } else {
      setStatus({
        isStreaming: true,
        settings: {
          enabled: true,
          resolution: '720p',
          framerate: 15,
          rotation: 0,
        },
        demo: true,
      });
    }
  }, [demoMode]);

  const loadStatus = async () => {
    try {
      const cameraStatus = demoMode 
        ? await cameraService.getDemoStatus()
        : await cameraService.getStatus();
      setStatus(cameraStatus);
      setIsStreaming(cameraStatus.isStreaming);
    } catch (err) {
      console.error('Failed to load camera status:', err);
      setError('Failed to connect to camera');
    }
  };

  const handleStartStream = async () => {
    if (demoMode) return; // Demo mode is always streaming
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await cameraService.startStream();
      setStatus(result.status);
      setIsStreaming(true);
    } catch (err) {
      console.error('Failed to start camera stream:', err);
      setError('Failed to start camera stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleStopStream = async () => {
    if (demoMode) return; // Can't stop demo mode
    
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await cameraService.stopStream();
      setStatus(result.status);
      setIsStreaming(false);
      setCurrentFrame('');
    } catch (err) {
      console.error('Failed to stop camera stream:', err);
      setError('Failed to stop camera stream');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSnapshot = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = demoMode 
        ? await cameraService.takeDemoSnapshot()
        : await cameraService.takeSnapshot();
        
      if (result.success) {
        onSnapshot?.(result);
        // Flash effect for snapshot
        const flashElement = document.createElement('div');
        flashElement.style.cssText = `
          position: fixed;
          top: 0;
          left: 0;
          width: 100vw;
          height: 100vh;
          background: white;
          opacity: 0.8;
          pointer-events: none;
          z-index: 10000;
        `;
        document.body.appendChild(flashElement);
        setTimeout(() => document.body.removeChild(flashElement), 100);
      } else {
        setError(result.error || 'Failed to take snapshot');
      }
    } catch (err) {
      console.error('Failed to take snapshot:', err);
      setError('Failed to take snapshot');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleFullscreen = useCallback(() => {
    setIsFullscreen(prev => !prev);
  }, []);

  // Close fullscreen on escape key
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    if (isFullscreen) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [isFullscreen]);

  if (error && !demoMode) {
    return (
      <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
        <div className="text-center">
          <svg className="w-12 h-12 mx-auto mb-2 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 15.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-red-700 font-medium">Camera Error</p>
          <p className="text-red-600 text-sm mt-1">{error}</p>
          <button 
            onClick={loadStatus}
            className="mt-3 px-4 py-2 bg-red-600 text-white rounded-md text-sm hover:bg-red-700"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className={`relative bg-gray-900 rounded-lg overflow-hidden ${className}`}>
        {/* Camera Display */}
        <div className="aspect-video bg-gray-900 relative">
          {isStreaming && currentFrame ? (
            <>
              <img 
                src={currentFrame} 
                alt="Camera Stream" 
                className="w-full h-full object-cover"
                style={{ 
                  transform: status?.settings.rotation ? `rotate(${status.settings.rotation}deg)` : undefined 
                }}
              />
              <button
                onClick={toggleFullscreen}
                className="absolute top-2 right-2 p-2 bg-black bg-opacity-50 text-white rounded-md hover:bg-opacity-70 transition-opacity"
                title="Toggle Fullscreen"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              </button>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-400">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">
                  {isLoading ? 'Loading...' : 'Camera Stream Offline'}
                </p>
              </div>
            </div>
          )}
          
          {/* Status Indicator */}
          <div className="absolute top-2 left-2 flex items-center space-x-2">
            <div className={`w-2 h-2 rounded-full ${isStreaming ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {isStreaming ? 'LIVE' : 'OFFLINE'}
            </span>
            {demoMode && (
              <span className="text-xs text-yellow-400 bg-black bg-opacity-50 px-2 py-1 rounded">
                DEMO
              </span>
            )}
          </div>

          {/* Settings Display */}
          {status && (
            <div className="absolute bottom-2 left-2 text-xs text-white bg-black bg-opacity-50 px-2 py-1 rounded">
              {status.settings.resolution} @ {status.settings.framerate}fps
            </div>
          )}
        </div>

        {/* Controls */}
        {showControls && (
          <div className="p-3 bg-gray-800 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {!demoMode ? (
                <>
                  <button
                    onClick={isStreaming ? handleStopStream : handleStartStream}
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded ${
                      isStreaming 
                        ? 'bg-red-600 hover:bg-red-700 text-white' 
                        : 'bg-green-600 hover:bg-green-700 text-white'
                    } disabled:opacity-50`}
                  >
                    {isLoading ? '...' : isStreaming ? 'Stop' : 'Start'}
                  </button>
                </>
              ) : (
                <span className="text-gray-400 text-sm">Demo Mode</span>
              )}
            </div>
            
            <div className="flex items-center space-x-2">
              <button
                onClick={handleSnapshot}
                disabled={isLoading || !isStreaming}
                className="px-3 py-1 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded disabled:opacity-50"
                title="Take Snapshot"
              >
                📸 Snapshot
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && currentFrame && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-95 flex items-center justify-center z-50"
          onClick={toggleFullscreen}
        >
          <div className="relative max-w-full max-h-full">
            <img 
              src={currentFrame} 
              alt="Camera Stream Fullscreen" 
              className="max-w-full max-h-full object-contain"
              style={{ 
                transform: status?.settings.rotation ? `rotate(${status.settings.rotation}deg)` : undefined 
              }}
            />
            <button
              onClick={toggleFullscreen}
              className="absolute top-4 right-4 p-2 bg-black bg-opacity-50 text-white rounded-full hover:bg-opacity-70"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}
    </>
  );
}