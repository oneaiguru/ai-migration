// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/ForecastTemplates.tsx
import React, { useState } from 'react';
import { Template, Play, Settings, Star, Clock, Users, TrendingUp, BarChart3 } from 'lucide-react';

interface ForecastTemplate {
  id: string;
  name: string;
  description: string;
  category: 'call-center' | 'retail' | 'support' | 'custom';
  icon: React.ComponentType<{ className?: string }>;
  algorithms: string[];
  parameters: Record<string, any>;
  timeHorizon: string;
  granularity: string;
  popularity: number;
  estimatedTime: string;
  accuracy: number;
  complexity: 'simple' | 'intermediate' | 'advanced';
}

interface ForecastTemplatesProps {
  onTemplateSelect: (template: ForecastTemplate) => void;
  onCreateCustom: () => void;
  className?: string;
}

const templates: ForecastTemplate[] = [
  {
    id: 'call-center-daily',
    name: 'Прогноз звонков (ежедневно)',
    description: 'Оптимизирован для прогнозирования ежедневного объема звонков в контакт-центре',
    category: 'call-center',
    icon: Users,
    algorithms: ['arima', 'seasonal_naive', 'exponential_smoothing'],
    parameters: {
      seasonality: 'weekly',
      trend: 'linear',
      holidays: true,
      weekendAdjustment: true
    },
    timeHorizon: '30 дней',
    granularity: 'день',
    popularity: 95,
    estimatedTime: '5-10 мин',
    accuracy: 87,
    complexity: 'simple'
  },
  {
    id: 'call-center-hourly',
    name: 'Прогноз звонков (почасово)',
    description: 'Детальный прогноз почасового распределения звонков с учетом пиковых нагрузок',
    category: 'call-center',
    icon: Clock,
    algorithms: ['arima', 'neural_network', 'ensemble'],
    parameters: {
      seasonality: 'daily',
      trend: 'polynomial',
      holidays: true,
      peakHours: [9, 10, 11, 14, 15, 16],
      lunchBreak: true
    },
    timeHorizon: '7 дней',
    granularity: 'час',
    popularity: 88,
    estimatedTime: '10-15 мин',
    accuracy: 82,
    complexity: 'intermediate'
  },
  {
    id: 'support-tickets',
    name: 'Заявки службы поддержки',
    description: 'Прогнозирование количества заявок с учетом приоритета и категории',
    category: 'support',
    icon: TrendingUp,
    algorithms: ['linear_regression', 'random_forest', 'arima'],
    parameters: {
      seasonality: 'weekly',
      priorityWeights: { high: 2.0, medium: 1.0, low: 0.5 },
      categoryFactors: true,
      workingDays: true
    },
    timeHorizon: '14 дней',
    granularity: 'день',
    popularity: 76,
    estimatedTime: '8-12 мин',
    accuracy: 84,
    complexity: 'intermediate'
  },
  {
    id: 'retail-sales',
    name: 'Продажи (розничная торговля)',
    description: 'Прогноз продаж с учетом сезонности, промо-акций и внешних факторов',
    category: 'retail',
    icon: BarChart3,
    algorithms: ['prophet', 'ensemble', 'arima'],
    parameters: {
      seasonality: 'yearly',
      promotions: true,
      weatherImpact: true,
      competitorEffect: false,
      economicIndicators: true
    },
    timeHorizon: '90 дней',
    granularity: 'день',
    popularity: 72,
    estimatedTime: '15-20 мин',
    accuracy: 89,
    complexity: 'advanced'
  },
  {
    id: 'quick-start',
    name: 'Быстрый старт',
    description: 'Простой шаблон для быстрого создания базового прогноза',
    category: 'custom',
    icon: Play,
    algorithms: ['linear_regression', 'exponential_smoothing'],
    parameters: {
      seasonality: 'auto',
      trend: 'auto',
      holidays: false
    },
    timeHorizon: '30 дней',
    granularity: 'день',
    popularity: 65,
    estimatedTime: '2-5 мин',
    accuracy: 75,
    complexity: 'simple'
  }
];

const categoryNames = {
  'call-center': 'Контакт-центр',
  'retail': 'Розничная торговля',
  'support': 'Служба поддержки',
  'custom': 'Пользовательские'
};

const complexityColors = {
  simple: 'bg-green-100 text-green-800',
  intermediate: 'bg-yellow-100 text-yellow-800',
  advanced: 'bg-red-100 text-red-800'
};

const complexityLabels = {
  simple: 'Простой',
  intermediate: 'Средний',
  advanced: 'Сложный'
};

const ForecastTemplates: React.FC<ForecastTemplatesProps> = ({
  onTemplateSelect,
  onCreateCustom,
  className = ''
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  const categories = ['all', ...Object.keys(categoryNames)];
  
  const filteredTemplates = selectedCategory === 'all' 
    ? templates 
    : templates.filter(t => t.category === selectedCategory);

  const handleTemplateClick = (template: ForecastTemplate) => {
    setSelectedTemplate(template.id);
    setShowDetails(template.id === showDetails ? null : template.id);
  };

  const handleUseTemplate = (template: ForecastTemplate) => {
    onTemplateSelect(template);
  };

  return (
    <div className={`bg-white rounded-lg border ${className}`}>
      <div className="p-6 border-b">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Шаблоны прогнозов</h3>
            <p className="text-sm text-gray-600">
              Выберите готовый шаблон или создайте собственный
            </p>
          </div>
          <button
            onClick={onCreateCustom}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Settings className="w-4 h-4 mr-2" />
            Создать свой
          </button>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`
                px-3 py-1 rounded-full text-sm font-medium transition-colors
                ${selectedCategory === category
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }
              `}
            >
              {category === 'all' ? 'Все' : categoryNames[category as keyof typeof categoryNames]}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTemplates.map(template => {
            const IconComponent = template.icon;
            const isSelected = selectedTemplate === template.id;
            const showTemplateDetails = showDetails === template.id;

            return (
              <div key={template.id} className="space-y-4">
                <div
                  className={`
                    border rounded-lg p-4 cursor-pointer transition-all hover:shadow-md
                    ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}
                  `}
                  onClick={() => handleTemplateClick(template)}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <IconComponent className={`
                        w-6 h-6 mr-3
                        ${isSelected ? 'text-blue-600' : 'text-gray-500'}
                      `} />
                      <div>
                        <h4 className="font-medium text-gray-900">{template.name}</h4>
                        <span className={`
                          inline-block px-2 py-1 rounded-full text-xs font-medium mt-1
                          ${complexityColors[template.complexity]}
                        `}>
                          {complexityLabels[template.complexity]}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center text-yellow-500">
                      <Star className="w-4 h-4 mr-1" fill="currentColor" />
                      <span className="text-xs font-medium">{template.popularity}</span>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3">
                    {template.description}
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-500">
                    <div>
                      <span className="font-medium">Период:</span> {template.timeHorizon}
                    </div>
                    <div>
                      <span className="font-medium">Время:</span> {template.estimatedTime}
                    </div>
                    <div>
                      <span className="font-medium">Точность:</span> {template.accuracy}%
                    </div>
                    <div>
                      <span className="font-medium">Детализация:</span> {template.granularity}
                    </div>
                  </div>

                  {isSelected && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template);
                      }}
                      className="w-full mt-3 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      Использовать шаблон
                    </button>
                  )}
                </div>

                {/* Detailed Information */}
                {showTemplateDetails && (
                  <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                    <h5 className="font-medium text-gray-900 mb-3">Детали шаблона</h5>
                    
                    <div className="space-y-3">
                      <div>
                        <h6 className="text-sm font-medium text-gray-700">Алгоритмы:</h6>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {template.algorithms.map(algo => (
                            <span
                              key={algo}
                              className="inline-block px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded"
                            >
                              {algo}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h6 className="text-sm font-medium text-gray-700">Параметры:</h6>
                        <div className="text-xs text-gray-600 mt-1 space-y-1">
                          {Object.entries(template.parameters).map(([key, value]) => (
                            <div key={key} className="flex justify-between">
                              <span>{key}:</span>
                              <span className="font-medium">
                                {typeof value === 'boolean' ? (value ? 'Да' : 'Нет') : String(value)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredTemplates.length === 0 && (
          <div className="text-center py-8">
            <Template className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h4 className="text-lg font-medium text-gray-900 mb-2">
              Шаблоны не найдены
            </h4>
            <p className="text-gray-600 mb-4">
              В выбранной категории нет доступных шаблонов
            </p>
            <button
              onClick={() => setSelectedCategory('all')}
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Показать все шаблоны
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ForecastTemplates;
