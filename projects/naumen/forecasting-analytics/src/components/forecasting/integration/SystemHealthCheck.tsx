// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/SystemHealthCheck.tsx
import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, XCircle, Clock, Database, Zap, Wifi } from 'lucide-react';

interface HealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  message: string;
  lastChecked: Date;
  responseTime?: number;
  details?: Record<string, any>;
}

interface SystemHealth {
  overall: 'healthy' | 'warning' | 'critical';
  checks: HealthCheck[];
  uptime: number;
  lastUpdate: Date;
}

interface SystemHealthCheckProps {
  autoRefresh?: boolean;
  refreshInterval?: number;
  onHealthChange?: (health: SystemHealth) => void;
  className?: string;
}

const SystemHealthCheck: React.FC<SystemHealthCheckProps> = ({
  autoRefresh = true,
  refreshInterval = 30000,
  onHealthChange,
  className = ''
}) => {
  const [health, setHealth] = useState<SystemHealth>({
    overall: 'unknown',
    checks: [],
    uptime: 0,
    lastUpdate: new Date()
  });

  const [isChecking, setIsChecking] = useState(false);

  // Mock health checks
  const performHealthChecks = async (): Promise<HealthCheck[]> => {
    const checks: HealthCheck[] = [];
    
    // API Connectivity
    const apiStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 200 + 50));
    const apiTime = performance.now() - apiStart;
    
    checks.push({
      id: 'api',
      name: 'API Сервис',
      status: apiTime < 100 ? 'healthy' : apiTime < 200 ? 'warning' : 'critical',
      message: apiTime < 100 ? 'Отличная производительность' : 
               apiTime < 200 ? 'Медленный ответ' : 'Критически медленно',
      lastChecked: new Date(),
      responseTime: apiTime,
      details: {
        endpoint: '/api/health',
        version: '1.0.0'
      }
    });

    // Database Connection
    const dbStart = performance.now();
    await new Promise(resolve => setTimeout(resolve, Math.random() * 150 + 30));
    const dbTime = performance.now() - dbStart;
    
    checks.push({
      id: 'database',
      name: 'База данных',
      status: Math.random() > 0.1 ? 'healthy' : 'warning',
      message: Math.random() > 0.1 ? 'Соединение активно' : 'Высокая нагрузка',
      lastChecked: new Date(),
      responseTime: dbTime,
      details: {
        connections: Math.floor(Math.random() * 50) + 10,
        maxConnections: 100,
        queries: Math.floor(Math.random() * 1000) + 100
      }
    });

    // Memory Usage
    const memoryUsage = Math.random() * 100;
    checks.push({
      id: 'memory',
      name: 'Память',
      status: memoryUsage < 70 ? 'healthy' : memoryUsage < 85 ? 'warning' : 'critical',
      message: `Использовано ${memoryUsage.toFixed(1)}%`,
      lastChecked: new Date(),
      details: {
        used: `${(memoryUsage * 8 / 100).toFixed(1)} GB`,
        total: '8 GB',
        percentage: memoryUsage
      }
    });

    // CPU Usage
    const cpuUsage = Math.random() * 100;
    checks.push({
      id: 'cpu',
      name: 'Процессор',
      status: cpuUsage < 60 ? 'healthy' : cpuUsage < 80 ? 'warning' : 'critical',
      message: `Загрузка ${cpuUsage.toFixed(1)}%`,
      lastChecked: new Date(),
      details: {
        cores: 4,
        usage: cpuUsage,
        temperature: Math.floor(Math.random() * 30) + 45
      }
    });

    // Network Connectivity
    const networkLatency = Math.random() * 100 + 10;
    checks.push({
      id: 'network',
      name: 'Сеть',
      status: networkLatency < 50 ? 'healthy' : networkLatency < 100 ? 'warning' : 'critical',
      message: `Задержка ${networkLatency.toFixed(0)}ms`,
      lastChecked: new Date(),
      responseTime: networkLatency,
      details: {
        latency: networkLatency,
        bandwidth: '100 Mbps',
        packetLoss: Math.random() * 2
      }
    });

    // Cache System
    const cacheHitRate = Math.random() * 100;
    checks.push({
      id: 'cache',
      name: 'Кэш',
      status: cacheHitRate > 80 ? 'healthy' : cacheHitRate > 60 ? 'warning' : 'critical',
      message: `Попаданий ${cacheHitRate.toFixed(1)}%`,
      lastChecked: new Date(),
      details: {
        hitRate: cacheHitRate,
        size: '512 MB',
        entries: Math.floor(Math.random() * 10000) + 1000
      }
    });

    return checks;
  };

  const calculateOverallHealth = (checks: HealthCheck[]): SystemHealth['overall'] => {
    const criticalCount = checks.filter(c => c.status === 'critical').length;
    const warningCount = checks.filter(c => c.status === 'warning').length;
    
    if (criticalCount > 0) return 'critical';
    if (warningCount > 0) return 'warning';
    return 'healthy';
  };

  const runHealthCheck = async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    
    try {
      const checks = await performHealthChecks();
      const overall = calculateOverallHealth(checks);
      
      const newHealth: SystemHealth = {
        overall,
        checks,
        uptime: Date.now() - (window as any).appStartTime || 0,
        lastUpdate: new Date()
      };
      
      setHealth(newHealth);
      
      if (onHealthChange) {
        onHealthChange(newHealth);
      }
    } catch (error) {
      console.error('Health check failed:', error);
    } finally {
      setIsChecking(false);
    }
  };

  // Auto refresh
  useEffect(() => {
    if (!autoRefresh) return;
    
    runHealthCheck(); // Initial check
    
    const interval = setInterval(runHealthCheck, refreshInterval);
    
    return () => clearInterval(interval);
  }, [autoRefresh, refreshInterval]);

  const getStatusIcon = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />;
      case 'critical':
        return <XCircle className="w-5 h-5 text-red-600" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: HealthCheck['status']) => {
    switch (status) {
      case 'healthy':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'critical':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getCheckIcon = (id: string) => {
    const iconMap = {
      api: Wifi,
      database: Database,
      memory: Activity,
      cpu: Zap,
      network: Wifi,
      cache: Database
    };
    
    const IconComponent = iconMap[id as keyof typeof iconMap] || Activity;
    return <IconComponent className="w-4 h-4" />;
  };

  const formatUptime = (ms: number) => {
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}д ${hours % 24}ч`;
    if (hours > 0) return `${hours}ч ${minutes % 60}м`;
    if (minutes > 0) return `${minutes}м ${seconds % 60}с`;
    return `${seconds}с`;
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center">
            <Activity className="w-5 h-5 text-gray-600 mr-2" />
            <h3 className="text-lg font-semibold text-gray-900">Состояние системы</h3>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(health.overall)}`}>
              {getStatusIcon(health.overall)}
              <span className="ml-1">
                {health.overall === 'healthy' ? 'Исправно' :
                 health.overall === 'warning' ? 'Предупреждения' :
                 health.overall === 'critical' ? 'Критично' : 'Неизвестно'}
              </span>
            </div>
            
            <button
              onClick={runHealthCheck}
              disabled={isChecking}
              className={`px-3 py-1 border rounded text-sm font-medium transition-colors ${
                isChecking 
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                  : 'text-gray-700 hover:bg-gray-50'
              }`}
            >
              {isChecking ? 'Проверка...' : 'Обновить'}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {/* System Overview */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {health.checks.filter(c => c.status === 'healthy').length}
            </div>
            <div className="text-sm text-gray-600">Исправно</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {health.checks.filter(c => c.status === 'warning').length}
            </div>
            <div className="text-sm text-gray-600">Предупреждения</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-red-600">
              {health.checks.filter(c => c.status === 'critical').length}
            </div>
            <div className="text-sm text-gray-600">Критично</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900">
              {formatUptime(health.uptime)}
            </div>
            <div className="text-sm text-gray-600">Время работы</div>
          </div>
        </div>

        {/* Health Checks */}
        <div className="space-y-3">
          {health.checks.map(check => (
            <div
              key={check.id}
              className={`p-4 border rounded-lg ${getStatusColor(check.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getCheckIcon(check.id)}
                  <span className="ml-2 font-medium">{check.name}</span>
                  {getStatusIcon(check.status)}
                </div>
                <div className="text-sm">
                  {check.responseTime && (
                    <span className="mr-3">{check.responseTime.toFixed(0)}ms</span>
                  )}
                  <span className="text-gray-500">
                    {check.lastChecked.toLocaleTimeString()}
                  </span>
                </div>
              </div>
              
              <div className="mt-2">
                <p className="text-sm">{check.message}</p>
                
                {check.details && (
                  <details className="mt-2">
                    <summary className="text-xs cursor-pointer hover:underline">
                      Подробности
                    </summary>
                    <div className="mt-1 text-xs space-y-1">
                      {Object.entries(check.details).map(([key, value]) => (
                        <div key={key} className="flex justify-between">
                          <span className="capitalize">{key}:</span>
                          <span className="font-mono">{String(value)}</span>
                        </div>
                      ))}
                    </div>
                  </details>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Last Update */}
        <div className="mt-4 pt-4 border-t text-sm text-gray-500 text-center">
          Последнее обновление: {health.lastUpdate.toLocaleString()}
          {autoRefresh && (
            <span className="ml-2">
              (автообновление каждые {refreshInterval / 1000}с)
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

export default SystemHealthCheck;
