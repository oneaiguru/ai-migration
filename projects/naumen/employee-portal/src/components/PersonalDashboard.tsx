import React, { useState, useEffect } from 'react';
import MetricCard from './MetricCard';
import HoursChart from './HoursChart';
import AttendanceCalendar from './AttendanceCalendar';

interface PersonalDashboardProps {
  employeeId: string;
}

interface DashboardMetrics {
  currentMonth: {
    hoursWorked: number;
    hoursScheduled: number;
    attendanceRate: number;
    overtimeHours: number;
    timeOffDays: number;
  };
  previousMonth: {
    hoursWorked: number;
    attendanceRate: number;
    overtimeHours: number;
  };
  yearToDate: {
    hoursWorked: number;
    vacationDaysUsed: number;
    vacationDaysRemaining: number;
    sickDaysUsed: number;
    averageHoursPerWeek: number;
  };
  goals: {
    monthlyHoursTarget: number;
    attendanceTarget: number;
    completedTrainings: number;
    totalTrainings: number;
  };
  upcomingEvents: UpcomingEvent[];
  recentAchievements: Achievement[];
}

interface UpcomingEvent {
  id: string;
  type: 'shift' | 'training' | 'meeting' | 'deadline' | 'review';
  title: string;
  date: Date;
  description?: string;
  priority: 'low' | 'normal' | 'high';
  actionRequired?: boolean;
}

interface Achievement {
  id: string;
  title: string;
  description: string;
  achievedAt: Date;
  type: 'attendance' | 'performance' | 'training' | 'teamwork';
  icon: string;
}

const PersonalDashboard: React.FC<PersonalDashboardProps> = ({ employeeId }) => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState<'week' | 'month' | 'quarter'>('month');
  const [showDetailedView, setShowDetailedView] = useState(false);

  // Load dashboard data
  useEffect(() => {
    const loadDashboardData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock dashboard data
      const mockMetrics: DashboardMetrics = {
        currentMonth: {
          hoursWorked: 167.5,
          hoursScheduled: 176,
          attendanceRate: 97.2,
          overtimeHours: 12.5,
          timeOffDays: 2
        },
        previousMonth: {
          hoursWorked: 182.0,
          attendanceRate: 98.5,
          overtimeHours: 8.0
        },
        yearToDate: {
          hoursWorked: 1847.5,
          vacationDaysUsed: 8,
          vacationDaysRemaining: 20,
          sickDaysUsed: 3,
          averageHoursPerWeek: 38.2
        },
        goals: {
          monthlyHoursTarget: 176,
          attendanceTarget: 95,
          completedTrainings: 4,
          totalTrainings: 6
        },
        upcomingEvents: [
          {
            id: '1',
            type: 'training',
            title: 'Тренинг по работе с конфликтными клиентами',
            date: new Date('2025-06-15T09:00:00'),
            description: 'Обязательное обучение для всех операторов',
            priority: 'high',
            actionRequired: true
          },
          {
            id: '2',
            type: 'shift',
            title: 'Утренняя смена',
            date: new Date('2025-06-05T08:00:00'),
            priority: 'normal'
          },
          {
            id: '3',
            type: 'review',
            title: 'Ежемесячная оценка производительности',
            date: new Date('2025-06-30T14:00:00'),
            description: 'Встреча с руководителем для обсуждения результатов',
            priority: 'normal',
            actionRequired: true
          },
          {
            id: '4',
            type: 'deadline',
            title: 'Срок подачи заявки на отпуск',
            date: new Date('2025-06-10T23:59:00'),
            description: 'Последний день подачи заявки на летний отпуск',
            priority: 'high',
            actionRequired: true
          }
        ],
        recentAchievements: [
          {
            id: '1',
            title: 'Месяц без опозданий',
            description: 'Приходили на работу вовремя весь май',
            achievedAt: new Date('2025-05-31'),
            type: 'attendance',
            icon: '⏰'
          },
          {
            id: '2',
            title: 'Высокий рейтинг клиентов',
            description: 'Средняя оценка 4.8/5 в мае',
            achievedAt: new Date('2025-05-28'),
            type: 'performance',
            icon: '⭐'
          },
          {
            id: '3',
            title: 'Сертификат завершен',
            description: 'Успешно прошли курс "Основы продаж"',
            achievedAt: new Date('2025-05-15'),
            type: 'training',
            icon: '🎓'
          }
        ]
      };
      
      setMetrics(mockMetrics);
      setLoading(false);
    };
    
    loadDashboardData();
  }, [employeeId]);

  const calculateProgress = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 100) return 'bg-green-500';
    if (progress >= 80) return 'bg-blue-500';
    if (progress >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getEventIcon = (type: string) => {
    const icons = {
      shift: '👥',
      training: '📚',
      meeting: '🤝',
      deadline: '⏰',
      review: '📊'
    };
    return icons[type as keyof typeof icons] || '📅';
  };

  const getEventPriorityColor = (priority: string) => {
    const colors = {
      high: 'border-l-red-400 bg-red-50',
      normal: 'border-l-blue-400 bg-blue-50',
      low: 'border-l-gray-400 bg-gray-50'
    };
    return colors[priority as keyof typeof colors] || colors.normal;
  };

  const formatDate = (date: Date) => {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(now.getDate() + 1);
    
    if (date.toDateString() === now.toDateString()) {
      return `Сегодня, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Завтра, ${date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}`;
    } else {
      return date.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      });
    }
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'вчера';
    if (diffDays < 7) return `${diffDays} дн. назад`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} нед. назад`;
    return `${Math.floor(diffDays / 30)} мес. назад`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Личный дашборд</h2>
          <p className="text-sm text-gray-500 mt-1">
            Обзор вашей производительности и ключевых метрик
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Period Selector */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['week', 'month', 'quarter'] as const).map((period) => (
              <button
                key={period}
                onClick={() => setSelectedPeriod(period)}
                className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                  selectedPeriod === period
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {period === 'week' ? 'Неделя' : period === 'month' ? 'Месяц' : 'Квартал'}
              </button>
            ))}
          </div>
          
          <button
            onClick={() => setShowDetailedView(!showDetailedView)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            {showDetailedView ? 'Упрощенный вид' : 'Детальный вид'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Загрузка дашборда...</p>
          </div>
        </div>
      ) : !metrics ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки</h3>
          <p className="text-gray-500">Не удалось загрузить данные дашборда</p>
        </div>
      ) : (
        <>
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Отработано часов"
              value={metrics.currentMonth.hoursWorked}
              target={metrics.currentMonth.hoursScheduled}
              unit="ч"
              trend="up"
              trendValue={
                ((metrics.currentMonth.hoursWorked - metrics.previousMonth.hoursWorked) / 
                 metrics.previousMonth.hoursWorked * 100)
              }
              icon="⏱️"
              color="blue"
            />
            
            <MetricCard
              title="Посещаемость"
              value={metrics.currentMonth.attendanceRate}
              target={metrics.goals.attendanceTarget}
              unit="%"
              trend="up"
              trendValue={metrics.currentMonth.attendanceRate - metrics.previousMonth.attendanceRate}
              icon="✅"
              color="green"
            />
            
            <MetricCard
              title="Сверхурочные"
              value={metrics.currentMonth.overtimeHours}
              unit="ч"
              trend={metrics.currentMonth.overtimeHours > metrics.previousMonth.overtimeHours ? "up" : "down"}
              trendValue={
                ((metrics.currentMonth.overtimeHours - metrics.previousMonth.overtimeHours) / 
                 metrics.previousMonth.overtimeHours * 100)
              }
              icon="🕐"
              color="orange"
            />
            
            <MetricCard
              title="Дней отпуска осталось"
              value={metrics.yearToDate.vacationDaysRemaining}
              unit="дн"
              icon="🏖️"
              color="purple"
              subtitle={`Использовано: ${metrics.yearToDate.vacationDaysUsed} дн`}
            />
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hours Chart */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Рабочие часы</h3>
                <span className="text-sm text-gray-500">За последние 8 недель</span>
              </div>
              <HoursChart period={selectedPeriod} />
            </div>

            {/* Attendance Calendar */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Календарь посещаемости</h3>
                <span className="text-sm text-gray-500">Текущий месяц</span>
              </div>
              <AttendanceCalendar currentMonth={new Date()} />
            </div>
          </div>

          {/* Goals Progress */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Прогресс по целям</h3>
            
            <div className="space-y-6">
              {/* Monthly Hours Goal */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Месячная норма часов</span>
                  <span className="text-sm text-gray-600">
                    {metrics.currentMonth.hoursWorked}/{metrics.goals.monthlyHoursTarget} ч
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      getProgressColor(calculateProgress(metrics.currentMonth.hoursWorked, metrics.goals.monthlyHoursTarget))
                    }`}
                    style={{ 
                      width: `${calculateProgress(metrics.currentMonth.hoursWorked, metrics.goals.monthlyHoursTarget)}%` 
                    }}
                  />
                </div>
              </div>

              {/* Training Progress */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Обучение</span>
                  <span className="text-sm text-gray-600">
                    {metrics.goals.completedTrainings}/{metrics.goals.totalTrainings} курсов
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className={`h-3 rounded-full transition-all duration-500 ${
                      getProgressColor(calculateProgress(metrics.goals.completedTrainings, metrics.goals.totalTrainings))
                    }`}
                    style={{ 
                      width: `${calculateProgress(metrics.goals.completedTrainings, metrics.goals.totalTrainings)}%` 
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Предстоящие события</h3>
                <span className="text-sm text-gray-500">{metrics.upcomingEvents.length} событий</span>
              </div>
              
              <div className="space-y-3">
                {metrics.upcomingEvents.slice(0, 4).map((event) => (
                  <div 
                    key={event.id} 
                    className={`border-l-4 pl-4 py-2 ${getEventPriorityColor(event.priority)}`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span>{getEventIcon(event.type)}</span>
                          <span className="font-medium text-gray-900 text-sm">{event.title}</span>
                          {event.actionRequired && (
                            <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs rounded-full">
                              Действие требуется
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-600 mb-1">
                          {formatDate(event.date)}
                        </div>
                        {event.description && (
                          <div className="text-xs text-gray-500">{event.description}</div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              {metrics.upcomingEvents.length > 4 && (
                <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 py-2">
                  Показать все события
                </button>
              )}
            </div>

            {/* Recent Achievements */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium text-gray-900">Недавние достижения</h3>
                <span className="text-sm text-gray-500">{metrics.recentAchievements.length} достижений</span>
              </div>
              
              <div className="space-y-4">
                {metrics.recentAchievements.map((achievement) => (
                  <div key={achievement.id} className="flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                    <span className="text-2xl">{achievement.icon}</span>
                    <div className="flex-1">
                      <h4 className="font-medium text-green-900 text-sm">{achievement.title}</h4>
                      <p className="text-sm text-green-800 mb-1">{achievement.description}</p>
                      <p className="text-xs text-green-600">
                        Получено {formatRelativeDate(achievement.achievedAt)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Export Options */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-medium text-gray-900">Экспорт отчетов</h4>
                <p className="text-sm text-gray-600">Скачайте ваши персональные отчеты</p>
              </div>
              <div className="flex gap-2">
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📊 Excel
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📄 PDF
                </button>
                <button className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm">
                  📧 Email
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PersonalDashboard;