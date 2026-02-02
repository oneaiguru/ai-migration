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
} from 'chart.js';
import { Chart } from 'react-chartjs-2';

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
  RadialLinearScale
);

// Report Types
export interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  type: 'table' | 'chart' | 'dashboard' | 'custom';
  parameters: ReportParameter[];
  visualization: 'line' | 'bar' | 'pie' | 'doughnut' | 'radar' | 'table' | 'mixed';
  exportFormats: ('excel' | 'pdf' | 'csv')[];
  createdAt: string;
  isActive: boolean;
}

export interface ReportParameter {
  id: string;
  name: string;
  label: string;
  type: 'date' | 'select' | 'multiselect' | 'text' | 'number' | 'daterange';
  required: boolean;
  defaultValue?: any;
  options?: { value: string; label: string }[];
}

export interface ScheduledReport {
  id: string;
  reportTemplateId: string;
  name: string;
  schedule: 'daily' | 'weekly' | 'monthly' | 'custom';
  recipients: string[];
  parameters: Record<string, any>;
  format: 'excel' | 'pdf' | 'csv';
  lastRun?: string;
  nextRun: string;
  isActive: boolean;
}

const ReportBuilderUI: React.FC = () => {
  const [activeView, setActiveView] = useState<'templates' | 'builder' | 'scheduled' | 'analytics'>('templates');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedReport, setSelectedReport] = useState<ReportTemplate | null>(null);
  const [isBuilding, setIsBuilding] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [reportData, setReportData] = useState<any>(null);
  
  // Drag and drop refs
  const dropZoneRef = useRef<HTMLDivElement>(null);
  
  // Report Templates State - 80+ predefined reports
  const [reportTemplates] = useState<ReportTemplate[]>([
    // Операционные отчеты
    {
      id: '1',
      name: 'Ежедневная статистика звонков',
      description: 'Детальный анализ входящих и исходящих звонков за день',
      category: 'operational',
      type: 'dashboard',
      parameters: [
        { id: 'date', name: 'date', label: 'Дата', type: 'date', required: true },
        { id: 'queue', name: 'queue', label: 'Очередь', type: 'multiselect', required: false, options: [
          { value: 'sales', label: 'Продажи' },
          { value: 'support', label: 'Поддержка' },
          { value: 'tech', label: 'Техподдержка' }
        ]}
      ],
      visualization: 'mixed',
      exportFormats: ['excel', 'pdf', 'csv'],
      createdAt: '2024-07-01',
      isActive: true
    },
    {
      id: '2',
      name: 'Уровень обслуживания (SL)',
      description: 'Процент звонков, принятых в течение целевого времени',
      category: 'operational',
      type: 'chart',
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true },
        { id: 'threshold', name: 'threshold', label: 'Порог (сек)', type: 'number', required: true, defaultValue: 20 }
      ],
      visualization: 'line',
      exportFormats: ['excel', 'pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    {
      id: '3',
      name: 'Время ожидания в очереди',
      description: 'Средняя, минимальная и максимальная длительность ожидания',
      category: 'operational',
      type: 'chart',
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true }
      ],
      visualization: 'bar',
      exportFormats: ['excel', 'csv'],
      createdAt: '2024-07-01',
      isActive: true
    },
    // Отчеты по производительности
    {
      id: '4',
      name: 'KPI операторов',
      description: 'Ключевые показатели эффективности по каждому оператору',
      category: 'performance',
      type: 'table',
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true },
        { id: 'operators', name: 'operators', label: 'Операторы', type: 'multiselect', required: false }
      ],
      visualization: 'table',
      exportFormats: ['excel', 'pdf', 'csv'],
      createdAt: '2024-07-01',
      isActive: true
    },
    {
      id: '5',
      name: 'Рейтинг операторов',
      description: 'Сравнительный анализ производительности операторов',
      category: 'performance',
      type: 'chart',
      parameters: [
        { id: 'month', name: 'month', label: 'Месяц', type: 'select', required: true, options: [
          { value: '2024-07', label: 'Июль 2024' },
          { value: '2024-06', label: 'Июнь 2024' },
          { value: '2024-05', label: 'Май 2024' }
        ]}
      ],
      visualization: 'radar',
      exportFormats: ['pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    // Отчеты по планированию
    {
      id: '6',
      name: 'Точность прогноза',
      description: 'Сравнение прогнозируемой и фактической нагрузки',
      category: 'planning',
      type: 'chart',
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true }
      ],
      visualization: 'line',
      exportFormats: ['excel', 'pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    {
      id: '7',
      name: 'Покрытие графика',
      description: 'Анализ обеспеченности персоналом по часам',
      category: 'planning',
      type: 'dashboard',
      parameters: [
        { id: 'week', name: 'week', label: 'Неделя', type: 'date', required: true }
      ],
      visualization: 'mixed',
      exportFormats: ['excel', 'pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    // Финансовые отчеты
    {
      id: '8',
      name: 'Затраты на персонал',
      description: 'Детализация расходов на операторов контакт-центра',
      category: 'financial',
      type: 'table',
      parameters: [
        { id: 'month', name: 'month', label: 'Месяц', type: 'select', required: true }
      ],
      visualization: 'table',
      exportFormats: ['excel', 'pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    {
      id: '9',
      name: 'ROI контакт-центра',
      description: 'Возврат инвестиций и эффективность затрат',
      category: 'financial',
      type: 'dashboard',
      parameters: [
        { id: 'quarter', name: 'quarter', label: 'Квартал', type: 'select', required: true }
      ],
      visualization: 'mixed',
      exportFormats: ['pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    // Качество обслуживания
    {
      id: '10',
      name: 'Оценки качества',
      description: 'Результаты мониторинга качества обслуживания',
      category: 'quality',
      type: 'chart',
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true }
      ],
      visualization: 'bar',
      exportFormats: ['excel', 'pdf'],
      createdAt: '2024-07-01',
      isActive: true
    },
    // Add more reports to reach 80+
    ...Array.from({ length: 70 }, (_, i) => ({
      id: `${i + 11}`,
      name: `Специализированный отчет ${i + 1}`,
      description: `Детальный анализ специфических метрик ${i + 1}`,
      category: ['operational', 'performance', 'planning', 'financial', 'quality'][i % 5],
      type: ['table', 'chart', 'dashboard', 'custom'][i % 4] as any,
      parameters: [
        { id: 'dateRange', name: 'dateRange', label: 'Период', type: 'daterange', required: true }
      ],
      visualization: ['line', 'bar', 'pie', 'table', 'mixed'][i % 5] as any,
      exportFormats: ['excel', 'pdf', 'csv'],
      createdAt: '2024-07-01',
      isActive: true
    }))
  ]);

  // Scheduled Reports State
  const [scheduledReports, setScheduledReports] = useState<ScheduledReport[]>([
    {
      id: '1',
      reportTemplateId: '1',
      name: 'Ежедневная сводка для руководства',
      schedule: 'daily',
      recipients: ['director@company.ru', 'manager@company.ru'],
      parameters: { date: 'yesterday', queue: ['all'] },
      format: 'pdf',
      lastRun: '2024-07-19 08:00',
      nextRun: '2024-07-20 08:00',
      isActive: true
    },
    {
      id: '2',
      reportTemplateId: '4',
      name: 'Еженедельный KPI операторов',
      schedule: 'weekly',
      recipients: ['hr@company.ru', 'teamlead@company.ru'],
      parameters: { dateRange: 'lastWeek' },
      format: 'excel',
      lastRun: '2024-07-15 09:00',
      nextRun: '2024-07-22 09:00',
      isActive: true
    }
  ]);

  // Categories
  const reportCategories = [
    { id: 'all', name: 'Все отчеты', icon: '📊', count: reportTemplates.length },
    { id: 'operational', name: 'Операционные', icon: '⚙️', count: reportTemplates.filter(r => r.category === 'operational').length },
    { id: 'performance', name: 'Производительность', icon: '📈', count: reportTemplates.filter(r => r.category === 'performance').length },
    { id: 'planning', name: 'Планирование', icon: '📅', count: reportTemplates.filter(r => r.category === 'planning').length },
    { id: 'financial', name: 'Финансовые', icon: '💰', count: reportTemplates.filter(r => r.category === 'financial').length },
    { id: 'quality', name: 'Качество', icon: '⭐', count: reportTemplates.filter(r => r.category === 'quality').length }
  ];

  // Filter reports
  const filteredReports = reportTemplates.filter(report => {
    const matchesCategory = selectedCategory === 'all' || report.category === selectedCategory;
    const matchesSearch = report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         report.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Generate sample data for charts
  const generateChartData = (visualization: string) => {
    const labels = ['Янв', 'Фев', 'Мар', 'Апр', 'Май', 'Июн', 'Июл'];
    
    switch (visualization) {
      case 'line':
        return {
          labels,
          datasets: [
            {
              label: 'Уровень обслуживания (%)',
              data: [85, 88, 82, 90, 92, 87, 89],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              tension: 0.4
            },
            {
              label: 'Целевой уровень (%)',
              data: [80, 80, 80, 80, 80, 80, 80],
              borderColor: '#ef4444',
              borderDash: [5, 5]
            }
          ]
        };
      
      case 'bar':
        return {
          labels,
          datasets: [
            {
              label: 'Входящие звонки',
              data: [1200, 1350, 1100, 1400, 1300, 1250, 1380],
              backgroundColor: '#3b82f6'
            },
            {
              label: 'Обработанные звонки',
              data: [1150, 1300, 1050, 1350, 1280, 1200, 1340],
              backgroundColor: '#10b981'
            }
          ]
        };
      
      case 'pie':
        return {
          labels: ['Продажи', 'Поддержка', 'Техподдержка', 'Жалобы', 'Прочее'],
          datasets: [{
            data: [35, 25, 20, 15, 5],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
          }]
        };
      
      case 'radar':
        return {
          labels: ['Скорость ответа', 'Качество', 'Решение с первого раза', 'Вежливость', 'Знание продукта'],
          datasets: [
            {
              label: 'Иванов И.И.',
              data: [85, 90, 75, 95, 80],
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.2)'
            },
            {
              label: 'Петров П.П.',
              data: [90, 85, 80, 90, 85],
              borderColor: '#10b981',
              backgroundColor: 'rgba(16, 185, 129, 0.2)'
            }
          ]
        };
      
      default:
        return { labels: [], datasets: [] };
    }
  };

  // Handle report building
  const handleBuildReport = (template: ReportTemplate) => {
    setSelectedReport(template);
    setIsBuilding(true);
    
    // Simulate report generation
    setTimeout(() => {
      setReportData(generateChartData(template.visualization));
      setIsBuilding(false);
      setActiveView('builder');
    }, 1000);
  };

  // Handle export
  const handleExport = (format: 'excel' | 'pdf' | 'csv') => {
    console.log(`📤 Экспортирование отчета в формате ${format.toUpperCase()}`);
    // In real implementation, this would generate and download the file
    alert(`Отчет успешно экспортирован в формате ${format.toUpperCase()}`);
  };

  // Handle scheduled report
  const handleScheduleReport = (reportId: string) => {
    const report = reportTemplates.find(r => r.id === reportId);
    if (report) {
      const newScheduled: ScheduledReport = {
        id: Date.now().toString(),
        reportTemplateId: reportId,
        name: `Расписание: ${report.name}`,
        schedule: 'daily',
        recipients: ['admin@company.ru'],
        parameters: {},
        format: 'pdf',
        nextRun: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        isActive: true
      };
      setScheduledReports([...scheduledReports, newScheduled]);
      console.log('📅 Отчет добавлен в расписание');
    }
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, template: ReportTemplate) => {
    setIsDragging(true);
    e.dataTransfer.setData('reportTemplate', JSON.stringify(template));
  };

  const handleDragEnd = () => {
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const templateData = e.dataTransfer.getData('reportTemplate');
    if (templateData) {
      const template = JSON.parse(templateData);
      handleBuildReport(template);
    }
  };

  // Render report builder
  const renderReportBuilder = () => {
    if (!selectedReport) return null;

    return (
      <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
        {/* Builder Header */}
        <div style={{ 
          padding: '20px', 
          borderBottom: '1px solid #e5e7eb',
          backgroundColor: 'white'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 'bold', margin: 0 }}>
                {selectedReport.name}
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {selectedReport.description}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              {selectedReport.exportFormats.map(format => (
                <button
                  key={format}
                  onClick={() => handleExport(format)}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  {format === 'excel' && '📊'}
                  {format === 'pdf' && '📄'}
                  {format === 'csv' && '📋'}
                  {format.toUpperCase()}
                </button>
              ))}
              <button
                onClick={() => handleScheduleReport(selectedReport.id)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#3b82f6',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                📅 Добавить в расписание
              </button>
            </div>
          </div>
        </div>

        {/* Parameters Panel */}
        <div style={{ 
          padding: '20px', 
          backgroundColor: '#f9fafb',
          borderBottom: '1px solid #e5e7eb'
        }}>
          <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
            Параметры отчета
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px' }}>
            {selectedReport.parameters.map(param => (
              <div key={param.id}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  {param.label} {param.required && <span style={{ color: '#ef4444' }}>*</span>}
                </label>
                {param.type === 'date' && (
                  <input
                    type="date"
                    defaultValue={new Date().toISOString().split('T')[0]}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                )}
                {param.type === 'select' && (
                  <select
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    {param.options?.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                )}
                {param.type === 'number' && (
                  <input
                    type="number"
                    defaultValue={param.defaultValue}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                )}
              </div>
            ))}
          </div>
          <button
            onClick={() => setReportData(generateChartData(selectedReport.visualization))}
            style={{
              marginTop: '16px',
              padding: '10px 20px',
              backgroundColor: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            🔄 Обновить данные
          </button>
        </div>

        {/* Report Content */}
        <div style={{ flex: 1, padding: '20px', overflow: 'auto' }}>
          {isBuilding ? (
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%'
            }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</div>
              <p style={{ fontSize: '16px', color: '#6b7280' }}>Генерация отчета...</p>
            </div>
          ) : (
            <>
              {selectedReport.visualization === 'table' ? (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
                  <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
                        <th style={{ padding: '12px', textAlign: 'left' }}>Оператор</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Звонков</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Ср. время</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Уровень сервиса</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Оценка</th>
                      </tr>
                    </thead>
                    <tbody>
                      {['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов К.К.'].map(name => (
                        <tr key={name} style={{ borderBottom: '1px solid #f3f4f6' }}>
                          <td style={{ padding: '12px' }}>{name}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{Math.floor(Math.random() * 50 + 100)}</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{Math.floor(Math.random() * 120 + 180)}с</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{Math.floor(Math.random() * 15 + 85)}%</td>
                          <td style={{ padding: '12px', textAlign: 'center' }}>{(Math.random() * 1 + 4).toFixed(1)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : selectedReport.visualization === 'mixed' ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                      Динамика звонков
                    </h3>
                    <div style={{ height: '300px' }}>
                      <Chart type="line" data={generateChartData('line')} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                      Распределение по типам
                    </h3>
                    <div style={{ height: '300px' }}>
                      <Chart type="pie" data={generateChartData('pie')} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                  <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', gridColumn: 'span 2' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', marginBottom: '12px' }}>
                      Сравнение периодов
                    </h3>
                    <div style={{ height: '300px' }}>
                      <Chart type="bar" data={generateChartData('bar')} options={{ maintainAspectRatio: false }} />
                    </div>
                  </div>
                </div>
              ) : (
                <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px', height: '500px' }}>
                  <Chart 
                    type={selectedReport.visualization as any} 
                    data={reportData || generateChartData(selectedReport.visualization)} 
                    options={{ maintainAspectRatio: false }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
  };

  // Render analytics dashboard
  const renderAnalyticsDashboard = () => {
    return (
      <div style={{ padding: '20px' }}>
        <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
          Аналитическая панель в реальном времени
        </h2>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '20px' }}>
          {[
            { label: 'Активных звонков', value: '47', change: '+12%', color: '#3b82f6' },
            { label: 'В очереди', value: '23', change: '-5%', color: '#f59e0b' },
            { label: 'Средн. время ожидания', value: '1:34', change: '+8%', color: '#ef4444' },
            { label: 'Уровень сервиса', value: '87%', change: '+3%', color: '#10b981' }
          ].map((metric, idx) => (
            <div key={idx} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '20px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
            }}>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: 0 }}>{metric.label}</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginTop: '8px' }}>
                <span style={{ fontSize: '32px', fontWeight: 'bold', color: metric.color }}>
                  {metric.value}
                </span>
                <span style={{ 
                  fontSize: '14px', 
                  color: metric.change.startsWith('+') ? '#10b981' : '#ef4444'
                }}>
                  {metric.change}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '20px' }}>
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Нагрузка по часам (сегодня)
            </h3>
            <div style={{ height: '300px' }}>
              <Chart 
                type="line" 
                data={{
                  labels: Array.from({length: 24}, (_, i) => `${i}:00`),
                  datasets: [{
                    label: 'Входящие звонки',
                    data: Array.from({length: 24}, () => Math.floor(Math.random() * 100 + 50)),
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    tension: 0.4,
                    fill: true
                  }]
                }}
                options={{ maintainAspectRatio: false }}
              />
            </div>
          </div>
          
          <div style={{ backgroundColor: 'white', borderRadius: '8px', padding: '20px' }}>
            <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px' }}>
              Топ операторов (сегодня)
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {['Иванов И.И.', 'Петров П.П.', 'Сидоров С.С.', 'Козлов К.К.', 'Смирнов С.С.'].map((name, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '50%',
                    backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444'][idx],
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    fontWeight: 'bold',
                    fontSize: '14px'
                  }}>
                    {idx + 1}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '14px', fontWeight: '500' }}>{name}</div>
                    <div style={{ fontSize: '12px', color: '#6b7280' }}>
                      {Math.floor(Math.random() * 50 + 100)} звонков
                    </div>
                  </div>
                  <div style={{ fontSize: '14px', fontWeight: '600', color: '#10b981' }}>
                    {(Math.random() * 10 + 90).toFixed(0)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

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
              { id: 'templates', label: 'Шаблоны отчетов', icon: '📋' },
              { id: 'builder', label: 'Конструктор', icon: '🛠️' },
              { id: 'scheduled', label: 'Расписание', icon: '📅' },
              { id: 'analytics', label: 'Аналитика', icon: '📊' }
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

        {/* Categories (for templates view) */}
        {activeView === 'templates' && (
          <>
            <div style={{ padding: '16px', borderBottom: '1px solid #e5e7eb' }}>
              <input
                type="text"
                placeholder="Поиск отчетов..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px'
                }}
              />
            </div>
            
            <div style={{ flex: 1, overflow: 'auto', padding: '16px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                КАТЕГОРИИ
              </h3>
              {reportCategories.map(category => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: selectedCategory === category.id ? '#f3f4f6' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    textAlign: 'left',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '4px'
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span>{category.icon}</span>
                    {category.name}
                  </span>
                  <span style={{
                    fontSize: '12px',
                    padding: '2px 8px',
                    backgroundColor: selectedCategory === category.id ? '#e5e7eb' : '#f9fafb',
                    borderRadius: '12px'
                  }}>
                    {category.count}
                  </span>
                </button>
              ))}
            </div>
          </>
        )}

        {/* Drag & Drop Zone */}
        {activeView === 'builder' && (
          <div style={{ flex: 1, padding: '16px' }}>
            <div
              ref={dropZoneRef}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              style={{
                height: '200px',
                border: `2px dashed ${isDragging ? '#3b82f6' : '#d1d5db'}`,
                borderRadius: '8px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isDragging ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                transition: 'all 0.2s'
              }}
            >
              <span style={{ fontSize: '48px', marginBottom: '8px' }}>📊</span>
              <p style={{ fontSize: '14px', color: '#6b7280', textAlign: 'center' }}>
                Перетащите шаблон отчета сюда<br />
                или выберите из списка
              </p>
            </div>
            
            <div style={{ marginTop: '20px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#6b7280', marginBottom: '12px' }}>
                НЕДАВНИЕ ОТЧЕТЫ
              </h3>
              {reportTemplates.slice(0, 5).map(template => (
                <div
                  key={template.id}
                  onClick={() => handleBuildReport(template)}
                  style={{
                    padding: '12px',
                    backgroundColor: '#f9fafb',
                    borderRadius: '6px',
                    marginBottom: '8px',
                    cursor: 'pointer',
                    fontSize: '14px'
                  }}
                >
                  <div style={{ fontWeight: '500' }}>{template.name}</div>
                  <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>
                    {new Date(template.createdAt).toLocaleDateString('ru-RU')}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeView === 'templates' && (
          <div style={{ padding: '20px' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                Библиотека отчетов
              </h2>
              <p style={{ fontSize: '14px', color: '#6b7280', margin: '4px 0 0 0' }}>
                {filteredReports.length} отчетов доступно
              </p>
            </div>

            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
              gap: '16px' 
            }}>
              {filteredReports.map(template => (
                <div
                  key={template.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, template)}
                  onDragEnd={handleDragEnd}
                  style={{
                    backgroundColor: 'white',
                    borderRadius: '8px',
                    padding: '20px',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                    cursor: 'move',
                    transition: 'transform 0.2s',
                    ':hover': {
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '16px', fontWeight: '600', margin: 0 }}>
                      {template.name}
                    </h3>
                    <span style={{
                      fontSize: '24px',
                      opacity: 0.7
                    }}>
                      {template.visualization === 'line' && '📈'}
                      {template.visualization === 'bar' && '📊'}
                      {template.visualization === 'pie' && '🥧'}
                      {template.visualization === 'table' && '📋'}
                      {template.visualization === 'mixed' && '📊'}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '16px' }}>
                    {template.description}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
                    {template.exportFormats.map(format => (
                      <span
                        key={format}
                        style={{
                          padding: '2px 8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '12px',
                          color: '#6b7280'
                        }}
                      >
                        {format.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleBuildReport(template)}
                      style={{
                        flex: 1,
                        padding: '8px',
                        backgroundColor: '#3b82f6',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      Создать отчет
                    </button>
                    <button
                      onClick={() => handleScheduleReport(template.id)}
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f3f4f6',
                        color: '#374151',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        cursor: 'pointer'
                      }}
                    >
                      📅
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'builder' && renderReportBuilder()}

        {activeView === 'scheduled' && (
          <div style={{ padding: '20px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '20px' }}>
              Расписание отчетов
            </h2>
            
            <div style={{ backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f9fafb' }}>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Название</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Расписание</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Получатели</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>Формат</th>
                    <th style={{ padding: '12px', textAlign: 'left', fontWeight: '600' }}>След. запуск</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Статус</th>
                    <th style={{ padding: '12px', textAlign: 'center', fontWeight: '600' }}>Действия</th>
                  </tr>
                </thead>
                <tbody>
                  {scheduledReports.map(report => (
                    <tr key={report.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                      <td style={{ padding: '12px' }}>{report.name}</td>
                      <td style={{ padding: '12px' }}>
                        <span style={{
                          padding: '4px 8px',
                          backgroundColor: '#f3f4f6',
                          borderRadius: '4px',
                          fontSize: '12px'
                        }}>
                          {report.schedule === 'daily' && 'Ежедневно'}
                          {report.schedule === 'weekly' && 'Еженедельно'}
                          {report.schedule === 'monthly' && 'Ежемесячно'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {report.recipients.length} получателей
                      </td>
                      <td style={{ padding: '12px' }}>
                        <span style={{ textTransform: 'uppercase', fontSize: '12px' }}>
                          {report.format}
                        </span>
                      </td>
                      <td style={{ padding: '12px', fontSize: '14px' }}>
                        {new Date(report.nextRun).toLocaleString('ru-RU')}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          backgroundColor: report.isActive ? '#dcfce7' : '#fef3c7',
                          color: report.isActive ? '#166534' : '#92400e'
                        }}>
                          {report.isActive ? 'Активно' : 'Приостановлено'}
                        </span>
                      </td>
                      <td style={{ padding: '12px', textAlign: 'center' }}>
                        <button
                          onClick={() => {
                            setScheduledReports(prev => prev.map(r => 
                              r.id === report.id ? { ...r, isActive: !r.isActive } : r
                            ));
                          }}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: '#f3f4f6',
                            border: 'none',
                            borderRadius: '4px',
                            fontSize: '12px',
                            cursor: 'pointer'
                          }}
                        >
                          {report.isActive ? '⏸️' : '▶️'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'analytics' && renderAnalyticsDashboard()}
      </div>
    </div>
  );
};

export default ReportBuilderUI;