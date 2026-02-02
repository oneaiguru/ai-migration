import React, { useState, useEffect } from 'react';

// PersonalSchedule - Main schedule container component
// Replicates the main schedule interface from График.html with modern improvements

interface PersonalScheduleProps {
  employeeId: string;
}

interface PersonalShift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  duration: number; // hours
  type: 'regular' | 'overtime' | 'training' | 'meeting';
  status: 'scheduled' | 'confirmed' | 'modified' | 'cancelled';
  location?: string;
  description?: string;
  breaks: { start: string; end: string; type: string }[];
}

interface QuickStats {
  hoursThisWeek: number;
  nextShift: PersonalShift | null;
  totalHoursMonth: number;
  shiftsRemaining: number;
}

interface ScheduleFilter {
  showOvertime: boolean;
  showTraining: boolean;
  showMeetings: boolean;
  shiftType?: string;
}

const PersonalSchedule: React.FC<PersonalScheduleProps> = ({ employeeId }) => {
  const [viewMode, setViewMode] = useState<'week' | 'month'>('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [shifts, setShifts] = useState<PersonalShift[]>([]);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<ScheduleFilter>({
    showOvertime: true,
    showTraining: true,
    showMeetings: true
  });
  const [showFilters, setShowFilters] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Mock data - in real app this would come from API
  useEffect(() => {
    const loadScheduleData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Generate mock shifts for current month
      const mockShifts: PersonalShift[] = [];
      const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
      const endOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
      
      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const shiftDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayOfWeek = shiftDate.getDay();
        
        // Skip some weekends and add variety
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          if (Math.random() > 0.7) {
            mockShifts.push({
              id: `shift-${day}`,
              date: shiftDate,
              startTime: '10:00',
              endTime: '18:00',
              duration: 8,
              type: 'regular',
              status: 'confirmed',
              breaks: [
                { start: '14:00', end: '14:30', type: 'lunch' },
                { start: '16:00', end: '16:15', type: 'break' }
              ]
            });
          }
        } else {
          // Weekday shifts with variety
          const shiftTypes: PersonalShift['type'][] = ['regular', 'regular', 'regular', 'training', 'overtime'];
          const randomType = shiftTypes[Math.floor(Math.random() * shiftTypes.length)];
          
          let startTime = '08:00';
          let endTime = '17:00';
          let duration = 8;
          
          if (randomType === 'training') {
            startTime = '09:00';
            endTime = '13:00';
            duration = 4;
          } else if (randomType === 'overtime') {
            startTime = '08:00';
            endTime = '19:00';
            duration = 10;
          }
          
          mockShifts.push({
            id: `shift-${day}`,
            date: shiftDate,
            startTime,
            endTime,
            duration,
            type: randomType,
            status: Math.random() > 0.9 ? 'modified' : 'confirmed',
            breaks: [
              { start: '12:00', end: '12:30', type: 'lunch' },
              { start: '15:00', end: '15:15', type: 'break' }
            ]
          });
        }
      }
      
      setShifts(mockShifts);
      
      // Calculate quick stats
      const now = new Date();
      const weekStart = new Date(now.setDate(now.getDate() - now.getDay()));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      
      const thisWeekShifts = mockShifts.filter(shift => 
        shift.date >= weekStart && shift.date <= weekEnd
      );
      
      const hoursThisWeek = thisWeekShifts.reduce((sum, shift) => sum + shift.duration, 0);
      const nextShift = mockShifts.find(shift => shift.date > new Date()) || null;
      const totalHoursMonth = mockShifts.reduce((sum, shift) => sum + shift.duration, 0);
      const shiftsRemaining = mockShifts.filter(shift => shift.date > new Date()).length;
      
      setQuickStats({
        hoursThisWeek,
        nextShift,
        totalHoursMonth,
        shiftsRemaining
      });
      
      setLoading(false);
    };
    
    loadScheduleData();
  }, [currentDate, employeeId]);

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + (direction === 'next' ? 7 : -7));
    } else {
      newDate.setMonth(currentDate.getMonth() + (direction === 'next' ? 1 : -1));
    }
    
    setCurrentDate(newDate);
  };

  const getDateRangeTitle = () => {
    if (viewMode === 'week') {
      const weekStart = new Date(currentDate);
      weekStart.setDate(currentDate.getDate() - currentDate.getDay() + 1); // Monday
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // Sunday
      
      return `${weekStart.getDate()}.${(weekStart.getMonth() + 1).toString().padStart(2, '0')} - ${weekEnd.getDate()}.${(weekEnd.getMonth() + 1).toString().padStart(2, '0')}.${weekEnd.getFullYear()}`;
    } else {
      return currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' });
    }
  };

  const getFilteredShifts = () => {
    return shifts.filter(shift => {
      if (!filter.showOvertime && shift.type === 'overtime') return false;
      if (!filter.showTraining && shift.type === 'training') return false;
      if (!filter.showMeetings && shift.type === 'meeting') return false;
      if (filter.shiftType && shift.type !== filter.shiftType) return false;
      return true;
    });
  };

  const handleExport = (format: string) => {
    console.log(`Exporting schedule in ${format} format`);
    setShowExport(false);
    // Implementation would go here
  };

  return (
    <div className="bg-white rounded-lg shadow-sm">
      
      {/* Header Controls */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          
          {/* Title and View Toggle */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <h2 className="text-2xl font-semibold text-gray-900">Мой график</h2>
            
            {/* View Mode Toggle */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('week')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'week' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📅 Неделя
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  viewMode === 'month' 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                📊 Месяц
              </button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`px-3 py-2 text-sm border rounded-lg transition-colors ${
                showFilters ? 'bg-blue-50 border-blue-200 text-blue-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              🔍 Фильтры
            </button>
            
            <div className="relative">
              <button
                onClick={() => setShowExport(!showExport)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                📤 Экспорт
              </button>
              
              {showExport && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowExport(false)} />
                  <div className="absolute right-0 top-12 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-20">
                    <div className="py-2">
                      <button
                        onClick={() => handleExport('ical')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        📅 Экспорт в календарь
                      </button>
                      <button
                        onClick={() => handleExport('pdf')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        📄 PDF версия
                      </button>
                      <button
                        onClick={() => handleExport('print')}
                        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        🖨️ Печать
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Date Navigation */}
        <div className="flex items-center justify-between mt-6">
          <button
            onClick={() => navigateDate('prev')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            ← Назад
          </button>
          
          <h3 className="text-lg font-medium text-gray-900">
            {getDateRangeTitle()}
          </h3>
          
          <button
            onClick={() => navigateDate('next')}
            className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
          >
            Вперед →
          </button>
        </div>

        {/* Filters */}
        {showFilters && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
            <div className="flex flex-wrap items-center gap-4">
              <span className="text-sm font-medium text-gray-700">Показать:</span>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filter.showOvertime}
                  onChange={(e) => setFilter(prev => ({ ...prev, showOvertime: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Сверхурочные</span>
              </label>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filter.showTraining}
                  onChange={(e) => setFilter(prev => ({ ...prev, showTraining: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Обучение</span>
              </label>
              
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={filter.showMeetings}
                  onChange={(e) => setFilter(prev => ({ ...prev, showMeetings: e.target.checked }))}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span>Совещания</span>
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      {quickStats && !loading && (
        <div className="p-6 border-b border-gray-200">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm text-blue-600 font-medium">Часов на этой неделе</p>
              <p className="text-2xl font-bold text-blue-900">{quickStats.hoursThisWeek}</p>
            </div>
            
            <div className="bg-green-50 rounded-lg p-4">
              <p className="text-sm text-green-600 font-medium">Следующая смена</p>
              <p className="text-lg font-bold text-green-900">
                {quickStats.nextShift 
                  ? `${quickStats.nextShift.date.getDate()}.${(quickStats.nextShift.date.getMonth() + 1).toString().padStart(2, '0')}`
                  : 'Нет'
                }
              </p>
              {quickStats.nextShift && (
                <p className="text-xs text-green-700">
                  {quickStats.nextShift.startTime} - {quickStats.nextShift.endTime}
                </p>
              )}
            </div>
            
            <div className="bg-purple-50 rounded-lg p-4">
              <p className="text-sm text-purple-600 font-medium">Часов в месяце</p>
              <p className="text-2xl font-bold text-purple-900">{quickStats.totalHoursMonth}</p>
            </div>
            
            <div className="bg-orange-50 rounded-lg p-4">
              <p className="text-sm text-orange-600 font-medium">Смен осталось</p>
              <p className="text-2xl font-bold text-orange-900">{quickStats.shiftsRemaining}</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendar Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="flex flex-col items-center gap-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Загрузка графика...</p>
            </div>
          </div>
        ) : viewMode === 'week' ? (
          <WeeklyCalendar 
            currentDate={currentDate}
            shifts={getFilteredShifts()}
          />
        ) : (
          <MonthlyCalendar 
            currentDate={currentDate}
            shifts={getFilteredShifts()}
          />
        )}
      </div>
    </div>
  );
};

// Placeholder components - will be implemented next
const WeeklyCalendar: React.FC<{ currentDate: Date; shifts: PersonalShift[] }> = ({ currentDate, shifts }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-center text-gray-500">Недельный календарь будет здесь</p>
      <p className="text-center text-sm text-gray-400 mt-2">
        Дата: {currentDate.toLocaleDateString('ru-RU')} | Смен: {shifts.length}
      </p>
    </div>
  );
};

const MonthlyCalendar: React.FC<{ currentDate: Date; shifts: PersonalShift[] }> = ({ currentDate, shifts }) => {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-center text-gray-500">Месячный календарь будет здесь</p>
      <p className="text-center text-sm text-gray-400 mt-2">
        Месяц: {currentDate.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })} | Смен: {shifts.length}
      </p>
    </div>
  );
};

export default PersonalSchedule;