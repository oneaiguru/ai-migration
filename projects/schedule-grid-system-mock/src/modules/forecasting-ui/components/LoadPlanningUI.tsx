import React, { useState, useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler,
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  RadialLinearScale,
  Filler
);

// Types for Load Planning
export interface ForecastModel {
  id: string;
  name: string;
  description: string;
  accuracy: number;
  algorithm: 'arima' | 'lstm' | 'prophet' | 'exponential' | 'regression';
  isActive: boolean;
}

export interface LoadScenario {
  id: string;
  name: string;
  description: string;
  parameters: {
    growthRate: number;
    seasonalityFactor: number;
    specialEvents: string[];
    confidence: number;
  };
  createdAt: string;
  createdBy: string;
}

export interface HistoricalData {
  date: string;
  actualLoad: number;
  forecastedLoad: number;
  accuracy: number;
  serviceLevel: number;
}

const LoadPlanningUI: React.FC = () => {
  // State management - adapted from ForecastChart & ReportBuilderUI
  const [activeView, setActiveView] = useState<'historical' | 'forecast' | 'scenarios' | 'accuracy'>('historical');
  const [selectedTimeRange, setSelectedTimeRange] = useState<'day' | 'week' | 'month' | 'quarter' | 'year'>('month');
  const [selectedModel, setSelectedModel] = useState<string>('arima');
  const [searchQuery, setSearchQuery] = useState('');
  const [isForecasting, setIsForecasting] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Refs for drag and drop
  const dropZoneRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Forecasting Models - BDD Feature 08 requirement
  const [forecastModels] = useState<ForecastModel[]>([
    {
      id: 'arima',
      name: 'ARIMA (Авторегрессия)',
      description: 'Модель авторегрессии и скользящего среднего для временных рядов',
      accuracy: 92.5,
      algorithm: 'arima',
      isActive: true
    },
    {
      id: 'lstm',
      name: 'LSTM (Нейронная сеть)',
      description: 'Долгая краткосрочная память для сложных паттернов',
      accuracy: 94.2,
      algorithm: 'lstm',
      isActive: true
    },
    {
      id: 'prophet',
      name: 'Prophet (Facebook)',
      description: 'Модель для прогнозирования с учетом праздников и событий',
      accuracy: 91.8,
      algorithm: 'prophet',
      isActive: true
    },
    {
      id: 'exponential',
      name: 'Экспоненциальное сглаживание',
      description: 'Классический метод с учетом тренда и сезонности',
      accuracy: 88.5,
      algorithm: 'exponential',
      isActive: false
    },
    {
      id: 'regression',
      name: 'Множественная регрессия',
      description: 'Линейная модель с множественными факторами',
      accuracy: 87.3,
      algorithm: 'regression',
      isActive: false
    }
  ]);

  // Load Scenarios - BDD Feature 08 requirement
  const [loadScenarios, setLoadScenarios] = useState<LoadScenario[]>([
    {
      id: '1',
      name: 'Оптимистичный сценарий',
      description: 'Рост нагрузки 15% с учетом новых клиентов',
      parameters: {
        growthRate: 15,
        seasonalityFactor: 1.2,
        specialEvents: ['Черная пятница', 'Новый год'],
        confidence: 85
      },
      createdAt: '2024-07-15',
      createdBy: 'Иванов И.И.'
    },
    {
      id: '2',
      name: 'Реалистичный сценарий',
      description: 'Умеренный рост 7% на основе исторических данных',
      parameters: {
        growthRate: 7,
        seasonalityFactor: 1.1,
        specialEvents: ['Новый год'],
        confidence: 92
      },
      createdAt: '2024-07-14',
      createdBy: 'Петрова П.П.'
    },
    {
      id: '3',
      name: 'Пессимистичный сценарий',
      description: 'Стагнация с небольшим снижением нагрузки',
      parameters: {
        growthRate: -2,
        seasonalityFactor: 0.95,
        specialEvents: [],
        confidence: 78
      },
      createdAt: '2024-07-13',
      createdBy: 'Сидоров С.С.'
    }
  ]);

  // Generate historical data - adapted from ForecastChart
  const generateHistoricalData = (): HistoricalData[] => {
    const data: HistoricalData[] = [];
    const today = new Date();
    
    for (let i = 90; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      
      const dayOfWeek = date.getDay();
      const baseLoad = 1000 + (dayOfWeek === 0 || dayOfWeek === 6 ? -200 : 100);
      const actualLoad = baseLoad + Math.sin(i * 0.1) * 100 + Math.random() * 50;
      const forecastedLoad = actualLoad + (Math.random() - 0.5) * 100;
      const accuracy = 100 - Math.abs(actualLoad - forecastedLoad) / actualLoad * 100;
      const serviceLevel = 85 + Math.random() * 15;
      
      data.push({
        date: date.toISOString().split('T')[0],
        actualLoad,
        forecastedLoad: Math.round(forecastedLoad),
        accuracy: Math.round(accuracy * 10) / 10,
        serviceLevel: Math.round(serviceLevel)
      });
    }
    
    return data;
  };

  const [historicalData] = useState<HistoricalData[]>(generateHistoricalData());

  // Generate forecast data with confidence intervals - BDD requirement
  const generateForecastData = () => {
    const labels: string[] = [];
    const forecast: number[] = [];
    const lowerBound: number[] = [];
    const upperBound: number[] = [];
    const today = new Date();
    
    for (let i = 1; i <= 30; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);
      labels.push(date.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' }));
      
      const dayOfWeek = date.getDay();
      const baseLoad = 1100 + (dayOfWeek === 0 || dayOfWeek === 6 ? -200 : 150);
      const forecastValue = baseLoad + Math.sin(i * 0.15) * 120 + Math.random() * 60;
      
      forecast.push(Math.round(forecastValue));
      lowerBound.push(Math.round(forecastValue * 0.85));
      upperBound.push(Math.round(forecastValue * 1.15));
    }
    
    return { labels, forecast, lowerBound, upperBound };
  };

  // Chart data configurations - adapted from existing components
  const getChartData = () => {
    switch (activeView) {
      case 'historical': {
        const recentData = historicalData.slice(-30);
        return {
          labels: recentData.map(d => new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
          datasets: [
            {
              label: 'Фактическая нагрузка',
              data: recentData.map(d => d.actualLoad),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4,
              fill: true
            },
            {
              label: 'Прогнозированная нагрузка',
              data: recentData.map(d => d.forecastedLoad),
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.1)',
              tension: 0.4,
              fill: true
            }
          ]
        };
      }
      
      case 'forecast': {
        const { labels, forecast, lowerBound, upperBound } = generateForecastData();
        return {
          labels,
          datasets: [
            {
              label: 'Прогноз нагрузки',
              data: forecast,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)',
              tension: 0.4,
              fill: false
            },
            {
              label: 'Верхняя граница (95%)',
              data: upperBound,
              borderColor: '#f59e0b',
              borderDash: [5, 5],
              fill: false
            },
            {
              label: 'Нижняя граница (95%)',
              data: lowerBound,
              borderColor: '#f59e0b',
              borderDash: [5, 5],
              fill: '-1',
              backgroundColor: 'rgba(245, 158, 11, 0.1)'
            }
          ]
        };
      }
      
      case 'scenarios': {
        const labels = Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setMonth(date.getMonth() + i);
          return date.toLocaleDateString('ru-RU', { month: 'short', year: '2-digit' });
        });
        
        return {
          labels,
          datasets: loadScenarios.map((scenario, idx) => ({
            label: scenario.name,
            data: labels.map((_, i) => {
              const baseLoad = 1200;
              const growth = 1 + (scenario.parameters.growthRate / 100) * (i / 12);
              const seasonal = scenario.parameters.seasonalityFactor * Math.sin(i * Math.PI / 6) * 100;
              return Math.round(baseLoad * growth + seasonal);
            }),
            borderColor: ['#3b82f6', '#10b981', '#ef4444'][idx],
            backgroundColor: [`rgba(59, 130, 246, 0.1)`, `rgba(16, 185, 129, 0.1)`, `rgba(239, 68, 68, 0.1)`][idx],
            tension: 0.4,
            fill: false
          }))
        };
      }
      
      case 'accuracy': {
        const recentData = historicalData.slice(-30);
        return {
          labels: recentData.map(d => new Date(d.date).toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' })),
          datasets: [
            {
              type: 'line' as const,
              label: 'Точность прогноза (%)',
              data: recentData.map(d => d.accuracy),
              borderColor: '#8b5cf6',
              backgroundColor: 'rgba(139, 92, 246, 0.1)',
              yAxisID: 'y1',
              tension: 0.4
            },
            {
              type: 'bar' as const,
              label: 'Отклонение (звонков)',
              data: recentData.map(d => Math.abs(d.actualLoad - d.forecastedLoad)),
              backgroundColor: 'rgba(239, 68, 68, 0.5)',
              yAxisID: 'y'
            }
          ]
        };
      }
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Chart options - adapted from existing components
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        mode: 'index' as const,
        intersect: false,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: 'white',
        bodyColor: 'white'
      }
    },
    scales: activeView === 'accuracy' ? {
      y: {
        type: 'linear' as const,
        display: true,
        position: 'left' as const,
        title: {
          display: true,
          text: 'Отклонение (звонков)'
        }
      },
      y1: {
        type: 'linear' as const,
        display: true,
        position: 'right' as const,
        title: {
          display: true,
          text: 'Точность (%)'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    } : {
      x: {
        display: true,
        grid: { display: false }
      },
      y: {
        display: true,
        grid: { color: 'rgba(0, 0, 0, 0.1)' }
      }
    }
  };

  // Handle forecast generation
  const handleGenerateForecast = () => {
    setIsForecasting(true);
    console.log('🔮 Генерация прогноза с моделью:', selectedModel);
    
    setTimeout(() => {
      setIsForecasting(false);
      setActiveView('forecast');
    }, 1500);
  };

  // Handle scenario creation
  const handleCreateScenario = () => {
    const newScenario: LoadScenario = {
      id: Date.now().toString(),
      name: 'Новый сценарий',
      description: 'Пользовательский сценарий планирования',
      parameters: {
        growthRate: 10,
        seasonalityFactor: 1.1,
        specialEvents: [],
        confidence: 80
      },
      createdAt: new Date().toISOString().split('T')[0],
      createdBy: 'Текущий пользователь'
    };
    
    setLoadScenarios([...loadScenarios, newScenario]);
    console.log('📊 Создан новый сценарий');
  };

  // Handle import/export - BDD requirement
  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      console.log('📥 Импорт данных из файла:', file.name);
      // In real implementation, parse CSV/Excel file
      alert(`Данные успешно импортированы из ${file.name}`);
    }
  };

  const handleExport = (format: 'excel' | 'csv') => {
    console.log(`📤 Экспорт данных в формате ${format.toUpperCase()}`);
    // In real implementation, generate and download file
    alert(`Данные успешно экспортированы в формате ${format.toUpperCase()}`);
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      console.log('📥 Импорт данных через drag & drop:', files[0].name);
      alert(`Данные успешно импортированы из ${files[0].name}`);
    }
  };

  // Render model selection panel
  const renderModelSelection = () => (
    <div style={{ padding: '20px', backgroundColor: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
        Выбор модели прогнозирования
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
        {forecastModels.filter(m => m.isActive).map(model => (
          <div
            key={model.id}
            onClick={() => setSelectedModel(model.id)}
            style={{
              padding: '16px',
              backgroundColor: selectedModel === model.id ? 'white' : '#f3f4f6',
              borderRadius: '8px',
              border: selectedModel === model.id ? '2px solid #3b82f6' : '1px solid #e5e7eb',
              cursor: 'pointer',
              transition: 'all 0.2s'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{model.name}</h4>
              <span style={{
                fontSize: '12px',
                padding: '2px 8px',
                backgroundColor: model.accuracy >= 90 ? '#dcfce7' : '#fef3c7',
                color: model.accuracy >= 90 ? '#166534' : '#92400e',
                borderRadius: '12px'
              }}>
                {model.accuracy}% точность
              </span>
            </div>
            <p style={{ fontSize: '12px', color: '#6b7280', margin: 0 }}>{model.description}</p>
          </div>
        ))}
      </div>
      <button
        onClick={handleGenerateForecast}
        disabled={isForecasting}
        style={{
          marginTop: '16px',
          padding: '10px 20px',
          backgroundColor: isForecasting ? '#9ca3af' : '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '6px',
          fontSize: '14px',
          cursor: isForecasting ? 'default' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {isForecasting ? '⏳ Генерация...' : '🔮 Сгенерировать прогноз'}
      </button>
    </div>
  );

  // Render metrics dashboard
  const renderMetricsDashboard = () => (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '20px' }}>
        {[
          { label: 'Средняя точность', value: '92.5%', trend: '+2.3%', icon: '🎯' },
          { label: 'MAPE', value: '7.8%', trend: '-0.5%', icon: '📊' },
          { label: 'MAE', value: '45.2', trend: '-3.1', icon: '📈' },
          { label: 'RMSE', value: '62.8', trend: '-1.2', icon: '📉' }
        ].map((metric, idx) => (
          <div key={idx} style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontSize: '24px' }}>{metric.icon}</span>
              <span style={{
                fontSize: '12px',
                color: metric.trend.startsWith('+') ? '#10b981' : '#ef4444'
              }}>
                {metric.trend}
              </span>
            </div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '4px' }}>{metric.value}</div>
            <div style={{ fontSize: '12px', color: '#6b7280' }}>{metric.label}</div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex', backgroundColor: '#f9fafb' }}>
      {/* Sidebar */}
      <div style={{
        width: '280px',
        backgroundColor: 'white',
        borderRight: '1px solid #e5e7eb',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* View Switcher */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {[
              { id: 'historical', label: 'Исторические данные', icon: '📜' },
              { id: 'forecast', label: 'Прогнозирование', icon: '🔮' },
              { id: 'scenarios', label: 'Сценарии', icon: '🎭' },
              { id: 'accuracy', label: 'Точность', icon: '🎯' }
            ].map(view => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id as any)}
                style={{
                  padding: '12px 16px',
                  backgroundColor: activeView === view.id ? '#3b82f6' : 'transparent',
                  color: activeView === view.id ? 'white' : '#374151',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '14px',
                  fontWeight: '500',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>{view.icon}</span>
                {view.label}
              </button>
            ))}
          </div>
        </div>

        {/* Time Range Selector */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
            ВРЕМЕННОЙ ПЕРИОД
          </h3>
          <select
            value={selectedTimeRange}
            onChange={(e) => setSelectedTimeRange(e.target.value as any)}
            style={{
              width: '100%',
              padding: '8px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              fontSize: '14px'
            }}
          >
            <option value="day">День</option>
            <option value="week">Неделя</option>
            <option value="month">Месяц</option>
            <option value="quarter">Квартал</option>
            <option value="year">Год</option>
          </select>
        </div>

        {/* Import/Export Section */}
        <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
            ИМПОРТ/ЭКСПОРТ
          </h3>
          <div
            ref={dropZoneRef}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{
              padding: '20px',
              border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
              borderRadius: '8px',
              textAlign: 'center',
              backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
              cursor: 'pointer',
              marginBottom: '12px'
            }}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx,.xls"
              onChange={handleImport}
              style={{ display: 'none' }}
            />
            <div style={{ fontSize: '24px', marginBottom: '8px' }}>📁</div>
            <p style={{ fontSize: '12px', color: '#6b7280' }}>
              Перетащите файл сюда<br />
              или нажмите для выбора
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => handleExport('excel')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📊 Excel
            </button>
            <button
              onClick={() => handleExport('csv')}
              style={{
                flex: 1,
                padding: '8px',
                backgroundColor: '#f3f4f6',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                cursor: 'pointer'
              }}
            >
              📋 CSV
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div style={{ flex: 1, padding: '16px', overflow: 'auto' }}>
          <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
            БЫСТРАЯ СТАТИСТИКА
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Средняя нагрузка</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>1,245 звонков/день</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Пиковая нагрузка</div>
              <div style={{ fontSize: '18px', fontWeight: '600' }}>185 звонков/час</div>
            </div>
            <div style={{ padding: '12px', backgroundColor: '#f9fafb', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', color: '#6b7280' }}>Тренд</div>
              <div style={{ fontSize: '18px', fontWeight: '600', color: '#10b981' }}>↑ +7.2%</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          padding: '20px',
          backgroundColor: 'white',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Планирование нагрузки
              </h1>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                Прогнозирование и анализ нагрузки контакт-центра
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {activeView === 'scenarios' && (
                <button
                  onClick={handleCreateScenario}
                  style={{
                    padding: '10px 16px',
                    backgroundColor: '#10b981',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  ➕ Создать сценарий
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '10px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                🔄 Обновить
              </button>
            </div>
          </div>
        </div>

        {/* Model Selection (for forecast view) */}
        {activeView === 'forecast' && renderModelSelection()}

        {/* Metrics Dashboard (for accuracy view) */}
        {activeView === 'accuracy' && renderMetricsDashboard()}

        {/* Chart Area */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '20px',
            height: '100%',
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
          }}>
            {isForecasting ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
                <p style={{ fontSize: '16px', color: '#6b7280' }}>Генерация прогноза...</p>
                <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px' }}>
                  Используется модель: {forecastModels.find(m => m.id === selectedModel)?.name}
                </p>
              </div>
            ) : (
              <div style={{ height: '100%' }}>
                <Chart
                  type={activeView === 'accuracy' ? 'bar' : 'line'}
                  data={getChartData()}
                  options={chartOptions}
                />
              </div>
            )}
          </div>
        </div>

        {/* Scenarios List (for scenarios view) */}
        {activeView === 'scenarios' && (
          <div style={{ padding: '20px', backgroundColor: 'white', borderTop: '1px solid #e5e7eb' }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
              Активные сценарии планирования
            </h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '12px' }}>
              {loadScenarios.map(scenario => (
                <div
                  key={scenario.id}
                  style={{
                    padding: '16px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px',
                    border: '1px solid #e5e7eb'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '8px' }}>
                    <h4 style={{ fontSize: '14px', fontWeight: '600', margin: 0 }}>{scenario.name}</h4>
                    <span style={{
                      fontSize: '12px',
                      padding: '2px 8px',
                      backgroundColor: scenario.parameters.confidence >= 85 ? '#dcfce7' : '#fef3c7',
                      color: scenario.parameters.confidence >= 85 ? '#166534' : '#92400e',
                      borderRadius: '12px'
                    }}>
                      {scenario.parameters.confidence}% уверенность
                    </span>
                  </div>
                  <p style={{ fontSize: '12px', color: '#6b7280', marginBottom: '8px' }}>{scenario.description}</p>
                  <div style={{ display: 'flex', gap: '8px', fontSize: '12px' }}>
                    <span style={{ color: '#6b7280' }}>Рост: {scenario.parameters.growthRate}%</span>
                    <span style={{ color: '#6b7280' }}>•</span>
                    <span style={{ color: '#6b7280' }}>Сезонность: {scenario.parameters.seasonalityFactor}x</span>
                  </div>
                  <div style={{ marginTop: '8px', fontSize: '11px', color: '#9ca3af' }}>
                    Создан: {new Date(scenario.createdAt).toLocaleDateString('ru-RU')} • {scenario.createdBy}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadPlanningUI;