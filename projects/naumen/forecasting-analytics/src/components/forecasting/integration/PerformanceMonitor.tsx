// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/PerformanceMonitor.tsx
import React, { useState, useEffect, useRef } from 'react';
import { Activity, Zap, Clock, MemoryStick, AlertTriangle, CheckCircle } from 'lucide-react';

interface PerformanceMetrics {
  renderTime: number;
  memoryUsage: number;
  componentCount: number;
  bundleSize: number;
  fps: number;
  loadTime: number;
  networkRequests: number;
  cacheHitRate: number;
}

interface PerformanceAlert {
  id: string;
  type: 'warning' | 'error' | 'info';
  message: string;
  metric: keyof PerformanceMetrics;
  threshold: number;
  currentValue: number;
  timestamp: Date;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showAlerts?: boolean;
  onAlert?: (alert: PerformanceAlert) => void;
  className?: string;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({
  enabled = true,
  showAlerts = true,
  onAlert,
  className = ''
}) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    renderTime: 0,
    memoryUsage: 0,
    componentCount: 0,
    bundleSize: 0,
    fps: 60,
    loadTime: 0,
    networkRequests: 0,
    cacheHitRate: 0.85
  });

  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [isMonitoring, setIsMonitoring] = useState(enabled);
  const intervalRef = useRef<NodeJS.Timeout>();
  const frameRef = useRef<number>();
  const lastFrameTime = useRef<number>(performance.now());
  const frameCount = useRef<number>(0);

  // Performance thresholds
  const thresholds = {
    renderTime: 16, // 16ms for 60fps
    memoryUsage: 100, // 100MB
    fps: 30, // minimum FPS
    loadTime: 3000, // 3 seconds
    networkRequests: 10, // max concurrent requests
    cacheHitRate: 0.7 // 70% minimum cache hit rate
  };

  // Measure render performance
  const measureRenderTime = () => {
    const start = performance.now();
    
    // Force a reflow to measure render time
    document.body.offsetHeight;
    
    const end = performance.now();
    return end - start;
  };

  // Measure memory usage
  const measureMemoryUsage = () => {
    if ('memory' in performance) {
      const memory = (performance as any).memory;
      return memory.usedJSHeapSize / (1024 * 1024); // Convert to MB
    }
    return 0;
  };

  // Measure FPS
  const measureFPS = () => {
    const now = performance.now();
    frameCount.current++;
    
    if (now - lastFrameTime.current >= 1000) {
      const fps = frameCount.current;
      frameCount.current = 0;
      lastFrameTime.current = now;
      return fps;
    }
    
    frameRef.current = requestAnimationFrame(measureFPS);
    return metrics.fps;
  };

  // Count React components in the DOM
  const countComponents = () => {
    const reactElements = document.querySelectorAll('[data-reactroot], [data-react-*]');
    return reactElements.length;
  };

  // Generate performance alert
  const createAlert = (metric: keyof PerformanceMetrics, value: number): PerformanceAlert | null => {
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return null;

    let shouldAlert = false;
    let type: 'warning' | 'error' | 'info' = 'info';
    let message = '';

    switch (metric) {
      case 'renderTime':
        shouldAlert = value > threshold;
        type = value > threshold * 2 ? 'error' : 'warning';
        message = `Медленная отрисовка: ${value.toFixed(1)}ms (норма: <${threshold}ms)`;
        break;
      case 'memoryUsage':
        shouldAlert = value > threshold;
        type = value > threshold * 1.5 ? 'error' : 'warning';
        message = `Высокое потребление памяти: ${value.toFixed(1)}MB (норма: <${threshold}MB)`;
        break;
      case 'fps':
        shouldAlert = value < threshold;
        type = value < threshold / 2 ? 'error' : 'warning';
        message = `Низкий FPS: ${value} (норма: >${threshold})`;
        break;
      case 'loadTime':
        shouldAlert = value > threshold;
        type = value > threshold * 2 ? 'error' : 'warning';
        message = `Медленная загрузка: ${value}ms (норма: <${threshold}ms)`;
        break;
    }

    if (!shouldAlert) return null;

    return {
      id: `${metric}_${Date.now()}`,
      type,
      message,
      metric,
      threshold,
      currentValue: value,
      timestamp: new Date()
    };
  };

  // Update all metrics
  const updateMetrics = () => {
    if (!isMonitoring) return;

    const newMetrics: PerformanceMetrics = {
      renderTime: measureRenderTime(),
      memoryUsage: measureMemoryUsage(),
      componentCount: countComponents(),
      bundleSize: metrics.bundleSize, // This would be set during build
      fps: measureFPS(),
      loadTime: performance.now(),
      networkRequests: Math.floor(Math.random() * 5) + 1, // Simulated
      cacheHitRate: 0.8 + Math.random() * 0.15 // Simulated
    };

    setMetrics(newMetrics);

    // Check for performance issues and create alerts
    Object.entries(newMetrics).forEach(([key, value]) => {
      if (typeof value === 'number') {
        const alert = createAlert(key as keyof PerformanceMetrics, value);
        if (alert) {
          setAlerts(prev => [...prev.slice(-4), alert]); // Keep last 5 alerts
          if (onAlert) {
            onAlert(alert);
          }
        }
      }
    });
  };

  // Start/stop monitoring
  useEffect(() => {
    if (isMonitoring) {
      intervalRef.current = setInterval(updateMetrics, 1000);
      frameRef.current = requestAnimationFrame(measureFPS);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [isMonitoring]);

  // Initial metrics
  useEffect(() => {
    if (enabled) {
      updateMetrics();
    }
  }, [enabled]);

  const getMetricColor = (metric: keyof PerformanceMetrics, value: number) => {
    const threshold = thresholds[metric as keyof typeof thresholds];
    if (!threshold) return 'text-gray-600';

    switch (metric) {
      case 'fps':
      case 'cacheHitRate':
        return value >= threshold ? 'text-green-600' : value >= threshold * 0.8 ? 'text-yellow-600' : 'text-red-600';
      default:
        return value <= threshold ? 'text-green-600' : value <= threshold * 1.5 ? 'text-yellow-600' : 'text-red-600';
    }
  };

  const formatValue = (metric: keyof PerformanceMetrics, value: number) => {
    switch (metric) {
      case 'renderTime':
        return `${value.toFixed(1)}ms`;
      case 'memoryUsage':
        return `${value.toFixed(1)}MB`;
      case 'bundleSize':
        return `${(value / 1024).toFixed(1)}KB`;
      case 'loadTime':
        return `${value.toFixed(0)}ms`;
      case 'cacheHitRate':
        return `${(value * 100).toFixed(1)}%`;
      default:
        return value.toString();
    }
  };

  const metricIcons = {
    renderTime: Clock,
    memoryUsage: MemoryStick,
    componentCount: Activity,
    bundleSize: Zap,
    fps: Activity,
    loadTime: Clock,
    networkRequests: Activity,
    cacheHitRate: CheckCircle
  };

  const metricLabels = {
    renderTime: 'Время отрисовки',
    memoryUsage: 'Память',
    componentCount: 'Компоненты',
    bundleSize: 'Размер бандла',
    fps: 'FPS',
    loadTime: 'Время загрузки',
    networkRequests: 'Сетевые запросы',
    cacheHitRate: 'Попадания в кэш'
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Мониторинг производительности</h3>
          </div>
          <button
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`
              px-3 py-1 rounded text-sm font-medium transition-colors
              ${isMonitoring 
                ? 'bg-green-100 text-green-800 hover:bg-green-200' 
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }
            `}
          >
            {isMonitoring ? 'Активен' : 'Остановлен'}
          </button>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          {Object.entries(metrics).map(([key, value]) => {
            const IconComponent = metricIcons[key as keyof PerformanceMetrics];
            const color = getMetricColor(key as keyof PerformanceMetrics, value);
            
            return (
              <div key={key} className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center justify-between mb-2">
                  <IconComponent className={`w-4 h-4 ${color}`} />
                  <span className={`text-lg font-semibold ${color}`}>
                    {formatValue(key as keyof PerformanceMetrics, value)}
                  </span>
                </div>
                <p className="text-xs text-gray-600">
                  {metricLabels[key as keyof PerformanceMetrics]}
                </p>
              </div>
            );
          })}
        </div>

        {/* Performance Alerts */}
        {showAlerts && alerts.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Предупреждения производительности</h4>
            {alerts.slice(-3).map(alert => {
              const iconColor = alert.type === 'error' ? 'text-red-600' : 
                              alert.type === 'warning' ? 'text-yellow-600' : 'text-blue-600';
              const bgColor = alert.type === 'error' ? 'bg-red-50 border-red-200' : 
                             alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' : 'bg-blue-50 border-blue-200';

              return (
                <div key={alert.id} className={`p-3 rounded border ${bgColor}`}>
                  <div className="flex items-start">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 mr-2 ${iconColor}`} />
                    <div className="flex-1">
                      <p className="text-sm text-gray-900">{alert.message}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        {alert.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Performance Tips */}
        {alerts.length > 0 && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
            <h4 className="text-sm font-medium text-blue-900 mb-2">Рекомендации по оптимизации</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              {alerts.some(a => a.metric === 'renderTime') && (
                <li>• Используйте React.memo для тяжелых компонентов</li>
              )}
              {alerts.some(a => a.metric === 'memoryUsage') && (
                <li>• Проверьте утечки памяти в useEffect</li>
              )}
              {alerts.some(a => a.metric === 'fps') && (
                <li>• Оптимизируйте анимации с помощью CSS transforms</li>
              )}
              <li>• Включите ленивую загрузку для больших компонентов</li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerformanceMonitor;
