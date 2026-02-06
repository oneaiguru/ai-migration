// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/MobileOptimizer.tsx
import React, { useState, useEffect } from 'react';
import { Smartphone, Tablet, Monitor, RotateCcw, Wifi, Battery } from 'lucide-react';

interface DeviceInfo {
  type: 'mobile' | 'tablet' | 'desktop';
  orientation: 'portrait' | 'landscape';
  screenWidth: number;
  screenHeight: number;
  pixelRatio: number;
  touchSupport: boolean;
  connectionType?: string;
  batteryLevel?: number;
}

interface MobileOptimizerProps {
  children: React.ReactNode;
  enableTouchOptimizations?: boolean;
  enablePerformanceMode?: boolean;
  showDeviceIndicator?: boolean;
  className?: string;
}

const MobileOptimizer: React.FC<MobileOptimizerProps> = ({
  children,
  enableTouchOptimizations = true,
  enablePerformanceMode = true,
  showDeviceIndicator = false,
  className = ''
}) => {
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo>({
    type: 'desktop',
    orientation: 'landscape',
    screenWidth: window.innerWidth,
    screenHeight: window.innerHeight,
    pixelRatio: window.devicePixelRatio || 1,
    touchSupport: 'ontouchstart' in window
  });

  const [isLowPerformance, setIsLowPerformance] = useState(false);
  const [connectionSpeed, setConnectionSpeed] = useState<'slow' | 'fast' | 'unknown'>('unknown');

  // Detect device type and capabilities
  useEffect(() => {
    const updateDeviceInfo = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      let type: DeviceInfo['type'] = 'desktop';
      if (width <= 768) {
        type = 'mobile';
      } else if (width <= 1024) {
        type = 'tablet';
      }

      const orientation: DeviceInfo['orientation'] = width > height ? 'landscape' : 'portrait';

      // Check connection speed
      const connection = (navigator as any).connection;
      let connectionType = 'unknown';
      if (connection) {
        connectionType = connection.effectiveType || connection.type;
        setConnectionSpeed(
          ['slow-2g', '2g', '3g'].includes(connection.effectiveType) ? 'slow' : 'fast'
        );
      }

      // Check battery
      let batteryLevel: number | undefined;
      if ('getBattery' in navigator) {
        (navigator as any).getBattery().then((battery: any) => {
          batteryLevel = battery.level * 100;
          setDeviceInfo(prev => ({ ...prev, batteryLevel }));
        });
      }

      setDeviceInfo({
        type,
        orientation,
        screenWidth: width,
        screenHeight: height,
        pixelRatio: window.devicePixelRatio || 1,
        touchSupport: 'ontouchstart' in window,
        connectionType,
        batteryLevel
      });
    };

    updateDeviceInfo();
    window.addEventListener('resize', updateDeviceInfo);
    window.addEventListener('orientationchange', updateDeviceInfo);

    return () => {
      window.removeEventListener('resize', updateDeviceInfo);
      window.removeEventListener('orientationchange', updateDeviceInfo);
    };
  }, []);

  // Performance detection
  useEffect(() => {
    if (!enablePerformanceMode) return;

    // Simple performance detection based on hardware concurrency and memory
    const hardwareConcurrency = navigator.hardwareConcurrency || 2;
    const memory = (navigator as any).deviceMemory;
    const isSlowDevice = hardwareConcurrency <= 2 || memory <= 2;
    const isSlowConnection = connectionSpeed === 'slow';
    
    setIsLowPerformance(isSlowDevice || isSlowConnection);
  }, [enablePerformanceMode, connectionSpeed]);

  // Apply mobile optimizations
  useEffect(() => {
    const root = document.documentElement;
    
    // Add device classes
    root.classList.remove('mobile-device', 'tablet-device', 'desktop-device');
    root.classList.add(`${deviceInfo.type}-device`);
    
    root.classList.remove('portrait-orientation', 'landscape-orientation');
    root.classList.add(`${deviceInfo.orientation}-orientation`);

    // Touch optimizations
    if (enableTouchOptimizations && deviceInfo.touchSupport) {
      root.classList.add('touch-device');
    } else {
      root.classList.remove('touch-device');
    }

    // Performance optimizations
    if (isLowPerformance) {
      root.classList.add('low-performance');
    } else {
      root.classList.remove('low-performance');
    }

    // High DPI optimizations
    if (deviceInfo.pixelRatio > 1.5) {
      root.classList.add('high-dpi');
    } else {
      root.classList.remove('high-dpi');
    }
  }, [deviceInfo, enableTouchOptimizations, isLowPerformance]);

  const getDeviceIcon = () => {
    switch (deviceInfo.type) {
      case 'mobile':
        return Smartphone;
      case 'tablet':
        return Tablet;
      default:
        return Monitor;
    }
  };

  const getConnectionIcon = () => {
    return Wifi;
  };

  const DeviceIcon = getDeviceIcon();
  const ConnectionIcon = getConnectionIcon();

  return (
    <div className={`mobile-optimized-container ${className}`}>
      {/* Device Indicator */}
      {showDeviceIndicator && (
        <div className="fixed top-4 left-4 z-50 bg-black bg-opacity-75 text-white px-3 py-2 rounded-lg text-sm">
          <div className="flex items-center space-x-2">
            <DeviceIcon className="w-4 h-4" />
            <span>{deviceInfo.type}</span>
            <RotateCcw className="w-4 h-4" />
            <span>{deviceInfo.orientation}</span>
            {deviceInfo.connectionType && (
              <>
                <ConnectionIcon className="w-4 h-4" />
                <span>{deviceInfo.connectionType}</span>
              </>
            )}
            {deviceInfo.batteryLevel && (
              <>
                <Battery className="w-4 h-4" />
                <span>{Math.round(deviceInfo.batteryLevel)}%</span>
              </>
            )}
          </div>
        </div>
      )}

      {/* Optimized Content */}
      <div className={`
        ${deviceInfo.type === 'mobile' ? 'mobile-layout' : ''}
        ${deviceInfo.type === 'tablet' ? 'tablet-layout' : ''}
        ${isLowPerformance ? 'performance-optimized' : ''}
      `}>
        {children}
      </div>

      {/* Mobile Optimization Styles */}
      <style jsx global>{`
        /* Touch Device Optimizations */
        .touch-device button,
        .touch-device [role="button"],
        .touch-device input,
        .touch-device select {
          min-height: 44px;
          min-width: 44px;
          touch-action: manipulation;
        }

        .touch-device .chart-container {
          touch-action: pan-x pan-y;
        }

        /* Mobile Layout */
        .mobile-device .grid {
          grid-template-columns: 1fr !important;
        }

        .mobile-device .flex {
          flex-direction: column !important;
        }

        .mobile-device .table-container {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        .mobile-device .sidebar {
          position: fixed;
          top: 0;
          left: -100%;
          width: 80%;
          height: 100vh;
          transition: left 0.3s ease;
          z-index: 1000;
        }

        .mobile-device .sidebar.open {
          left: 0;
        }

        /* Tablet Layout */
        .tablet-device .grid-cols-3 {
          grid-template-columns: repeat(2, 1fr) !important;
        }

        .tablet-device .grid-cols-4 {
          grid-template-columns: repeat(2, 1fr) !important;
        }

        /* Portrait Orientation */
        .portrait-orientation .chart-container {
          height: 250px;
        }

        .portrait-orientation .data-table {
          font-size: 0.875rem;
        }

        /* Landscape Orientation */
        .landscape-orientation .mobile-device .chart-container {
          height: 200px;
        }

        /* Performance Optimizations */
        .low-performance * {
          animation-duration: 0.2s !important;
          transition-duration: 0.2s !important;
        }

        .low-performance .chart-container {
          --chart-animation: none;
        }

        .low-performance img {
          image-rendering: optimizeSpeed;
        }

        /* High DPI Optimizations */
        .high-dpi .icon {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Mobile Navigation */
        .mobile-device .navigation {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          background: white;
          border-top: 1px solid #e5e7eb;
          padding: 0.5rem;
          z-index: 100;
        }

        .mobile-device .navigation ul {
          display: flex;
          justify-content: space-around;
          margin: 0;
          padding: 0;
          list-style: none;
        }

        .mobile-device .navigation button {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 0.5rem;
          min-height: 44px;
          border: none;
          background: none;
          color: #6b7280;
        }

        .mobile-device .navigation button.active {
          color: #2563eb;
        }

        /* Mobile Form Optimizations */
        .mobile-device input,
        .mobile-device select,
        .mobile-device textarea {
          font-size: 16px; /* Prevents zoom on iOS */
          border-radius: 0; /* iOS style consistency */
        }

        /* Safe Area Insets for notched devices */
        .mobile-device .header {
          padding-top: env(safe-area-inset-top);
        }

        .mobile-device .footer {
          padding-bottom: env(safe-area-inset-bottom);
        }

        /* Scroll Optimization */
        .mobile-device .scrollable {
          -webkit-overflow-scrolling: touch;
          overscroll-behavior: contain;
        }

        /* Tap Highlight Removal */
        .touch-device * {
          -webkit-tap-highlight-color: transparent;
        }

        /* Improved touch targets */
        .touch-device .clickable {
          cursor: pointer;
          user-select: none;
          -webkit-user-select: none;
        }

        /* Battery saving mode */
        .low-performance .auto-refresh {
          animation-play-state: paused;
        }

        /* Responsive text */
        .mobile-device h1 { font-size: 1.5rem; }
        .mobile-device h2 { font-size: 1.25rem; }
        .mobile-device h3 { font-size: 1.125rem; }
        
        .tablet-device h1 { font-size: 1.75rem; }
        .tablet-device h2 { font-size: 1.5rem; }
        .tablet-device h3 { font-size: 1.25rem; }

        /* Improved spacing for touch */
        .touch-device .button-group button + button {
          margin-left: 0.75rem;
        }

        .touch-device .form-group {
          margin-bottom: 1.5rem;
        }

        /* Loading states for slow connections */
        .slow-connection .image-placeholder {
          background: #f3f4f6;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9ca3af;
        }
      `}</style>
    </div>
  );
};

export default MobileOptimizer;
