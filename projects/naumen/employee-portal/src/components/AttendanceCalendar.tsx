import React, { useState, useEffect } from 'react';

interface AttendanceCalendarProps {
  currentMonth: Date;
  onDateClick?: (date: Date, attendance: AttendanceRecord) => void;
  compact?: boolean;
}

interface AttendanceRecord {
  date: Date;
  status: 'present' | 'absent' | 'late' | 'early_departure' | 'overtime' | 'time_off' | 'holiday' | 'weekend';
  scheduledStart?: string;
  scheduledEnd?: string;
  actualStart?: string;
  actualEnd?: string;
  hoursWorked?: number;
  notes?: string;
  shift?: {
    type: 'regular' | 'overtime' | 'training' | 'night';
    location: string;
  };
}

interface MonthSummary {
  totalDays: number;
  workingDays: number;
  presentDays: number;
  absentDays: number;
  lateDays: number;
  overtimeDays: number;
  attendanceRate: number;
  totalHours: number;
  averageHoursPerDay: number;
}

const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({
  currentMonth,
  onDateClick,
  compact = false
}) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceRecord[]>([]);
  const [summary, setSummary] = useState<MonthSummary | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLegend, setShowLegend] = useState(!compact);

  // Load attendance data for the month
  useEffect(() => {
    const loadAttendanceData = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      // Generate mock attendance data for the month
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
      const mockData: AttendanceRecord[] = [];
      
      let presentDays = 0;
      let absentDays = 0;
      let lateDays = 0;
      let overtimeDays = 0;
      let totalHours = 0;
      let workingDays = 0;
      
      for (let day = 1; day <= endOfMonth.getDate(); day++) {
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
        const dayOfWeek = date.getDay();
        
        let record: AttendanceRecord;
        
        // Weekend
        if (dayOfWeek === 0 || dayOfWeek === 6) {
          // Occasionally work on weekends
          if (Math.random() > 0.85) {
            record = {
              date,
              status: 'overtime',
              scheduledStart: '10:00',
              scheduledEnd: '16:00',
              actualStart: '10:15',
              actualEnd: '16:30',
              hoursWorked: 6.25,
              shift: { type: 'overtime', location: 'Офис центр' },
              notes: 'Дополнительная смена'
            };
            overtimeDays++;
            totalHours += 6.25;
          } else {
            record = {
              date,
              status: 'weekend'
            };
          }
        }
        // Holidays (mock some holidays)
        else if (day === 1 || day === 9) {
          record = {
            date,
            status: 'holiday',
            notes: day === 1 ? 'День Труда' : 'День Победы'
          };
        }
        // Regular working days
        else {
          workingDays++;
          const random = Math.random();
          
          if (random > 0.95) {
            // Absent
            record = {
              date,
              status: 'absent',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              notes: 'Больничный'
            };
            absentDays++;
          } else if (random > 0.90) {
            // Time off
            record = {
              date,
              status: 'time_off',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              notes: 'Личный отпуск'
            };
          } else if (random > 0.80) {
            // Late arrival
            record = {
              date,
              status: 'late',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              actualStart: '08:25',
              actualEnd: '17:00',
              hoursWorked: 7.42,
              shift: { type: 'regular', location: 'Офис центр' },
              notes: 'Опоздание на 25 минут'
            };
            lateDays++;
            presentDays++;
            totalHours += 7.42;
          } else if (random > 0.75) {
            // Early departure
            record = {
              date,
              status: 'early_departure',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              actualStart: '08:00',
              actualEnd: '16:30',
              hoursWorked: 7.5,
              shift: { type: 'regular', location: 'Офис центр' },
              notes: 'Ранний уход'
            };
            presentDays++;
            totalHours += 7.5;
          } else if (random > 0.70) {
            // Overtime
            record = {
              date,
              status: 'overtime',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              actualStart: '08:00',
              actualEnd: '19:00',
              hoursWorked: 10,
              shift: { type: 'overtime', location: 'Офис центр' },
              notes: 'Сверхурочная работа'
            };
            overtimeDays++;
            presentDays++;
            totalHours += 10;
          } else {
            // Regular attendance
            const startVariation = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 10) - 5;
            const endVariation = Math.random() > 0.5 ? 0 : Math.floor(Math.random() * 10) - 5;
            
            record = {
              date,
              status: 'present',
              scheduledStart: '08:00',
              scheduledEnd: '17:00',
              actualStart: `08:${Math.max(0, startVariation).toString().padStart(2, '0')}`,
              actualEnd: `17:${Math.max(0, endVariation).toString().padStart(2, '0')}`,
              hoursWorked: 8 + (endVariation - startVariation) / 60,
              shift: { type: 'regular', location: 'Офис центр' }
            };
            presentDays++;
            totalHours += record.hoursWorked!;
          }
        }
        
        mockData.push(record);
      }
      
      const attendanceRate = workingDays > 0 ? (presentDays / workingDays) * 100 : 0;
      const averageHoursPerDay = presentDays > 0 ? totalHours / presentDays : 0;
      
      const mockSummary: MonthSummary = {
        totalDays: endOfMonth.getDate(),
        workingDays,
        presentDays,
        absentDays,
        lateDays,
        overtimeDays,
        attendanceRate,
        totalHours,
        averageHoursPerDay
      };
      
      setAttendanceData(mockData);
      setSummary(mockSummary);
      setLoading(false);
    };
    
    loadAttendanceData();
  }, [currentMonth]);

  const getStatusColor = (status: string) => {
    const colors = {
      present: 'bg-green-500',
      absent: 'bg-red-500',
      late: 'bg-yellow-500',
      early_departure: 'bg-orange-500',
      overtime: 'bg-blue-500',
      time_off: 'bg-purple-500',
      holiday: 'bg-gray-400',
      weekend: 'bg-gray-200'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-200';
  };

  const getStatusText = (status: string) => {
    const texts = {
      present: 'Присутствовал',
      absent: 'Отсутствовал',
      late: 'Опоздание',
      early_departure: 'Ранний уход',
      overtime: 'Сверхурочные',
      time_off: 'Отгул',
      holiday: 'Праздник',
      weekend: 'Выходной'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const getStatusIcon = (status: string) => {
    const icons = {
      present: '✅',
      absent: '❌',
      late: '⏰',
      early_departure: '🏃',
      overtime: '💪',
      time_off: '🏖️',
      holiday: '🎉',
      weekend: '🏠'
    };
    return icons[status as keyof typeof icons] || '📅';
  };

  const getAttendanceForDate = (date: Date) => {
    return attendanceData.find(record => 
      record.date.toDateString() === date.toDateString()
    );
  };

  const handleDateClick = (date: Date) => {
    const attendance = getAttendanceForDate(date);
    if (attendance) {
      setSelectedDate(date);
      onDateClick?.(date, attendance);
    }
  };

  const renderCalendarDay = (date: Date, isCurrentMonth: boolean) => {
    const attendance = getAttendanceForDate(date);
    const isToday = date.toDateString() === new Date().toDateString();
    const isSelected = selectedDate?.toDateString() === date.toDateString();
    
    return (
      <button
        key={date.toISOString()}
        onClick={() => handleDateClick(date)}
        disabled={!isCurrentMonth || !attendance}
        className={`
          relative w-full aspect-square flex flex-col items-center justify-center text-sm border border-gray-100 transition-all
          ${isCurrentMonth ? 'hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'}
          ${isToday ? 'ring-2 ring-blue-500' : ''}
          ${isSelected ? 'bg-blue-100 border-blue-300' : ''}
          ${compact ? 'text-xs' : ''}
        `}
      >
        <span className={`font-medium ${isToday ? 'text-blue-600' : ''}`}>
          {date.getDate()}
        </span>
        
        {attendance && isCurrentMonth && (
          <div className={`
            w-2 h-2 rounded-full mt-0.5 ${getStatusColor(attendance.status)}
            ${compact ? 'w-1.5 h-1.5' : ''}
          `} />
        )}
        
        {attendance?.hoursWorked && !compact && (
          <span className="text-xs text-gray-500 mt-0.5">
            {attendance.hoursWorked.toFixed(1)}ч
          </span>
        )}
      </button>
    );
  };

  const renderCalendar = () => {
    const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
    const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0);
    const startDate = new Date(startOfMonth);
    startDate.setDate(startDate.getDate() - startOfMonth.getDay());
    
    const days = [];
    const current = new Date(startDate);
    
    // Generate 6 weeks (42 days) to ensure full calendar
    for (let i = 0; i < 42; i++) {
      const isCurrentMonth = current.getMonth() === currentMonth.getMonth();
      days.push(renderCalendarDay(new Date(current), isCurrentMonth));
      current.setDate(current.getDate() + 1);
    }
    
    return days;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-4">
          <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 text-sm">Загрузка календаря...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Calendar Grid */}
      <div>
        {/* Month Header */}
        <div className="flex items-center justify-between mb-4">
          <h4 className={`font-medium text-gray-900 ${compact ? 'text-sm' : 'text-base'}`}>
            {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </h4>
          {summary && (
            <span className={`text-gray-600 ${compact ? 'text-xs' : 'text-sm'}`}>
              {summary.attendanceRate.toFixed(1)}% посещаемость
            </span>
          )}
        </div>
        
        {/* Weekday Headers */}
        <div className="grid grid-cols-7 gap-0 mb-2">
          {['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'].map(day => (
            <div key={day} className={`text-center font-medium text-gray-500 py-2 ${compact ? 'text-xs' : 'text-sm'}`}>
              {day}
            </div>
          ))}
        </div>
        
        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-0 border border-gray-200 rounded-lg overflow-hidden">
          {renderCalendar()}
        </div>
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="flex flex-wrap gap-3 text-xs">
          {[
            { status: 'present', label: 'Присутствовал' },
            { status: 'late', label: 'Опоздание' },
            { status: 'overtime', label: 'Сверхурочные' },
            { status: 'absent', label: 'Отсутствовал' },
            { status: 'time_off', label: 'Отгул' },
            { status: 'holiday', label: 'Праздник' }
          ].map(({ status, label }) => (
            <div key={status} className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${getStatusColor(status)}`} />
              <span className="text-gray-600">{label}</span>
            </div>
          ))}
        </div>
      )}

      {/* Summary Stats */}
      {summary && !compact && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="text-green-800 font-medium">{summary.presentDays}</div>
            <div className="text-green-600">Рабочих дней</div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="text-blue-800 font-medium">{summary.totalHours.toFixed(1)}ч</div>
            <div className="text-blue-600">Всего часов</div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <div className="text-yellow-800 font-medium">{summary.lateDays}</div>
            <div className="text-yellow-600">Опозданий</div>
          </div>
          
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
            <div className="text-purple-800 font-medium">{summary.overtimeDays}</div>
            <div className="text-purple-600">Сверхурочных</div>
          </div>
        </div>
      )}

      {/* Selected Date Details */}
      {selectedDate && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          {(() => {
            const attendance = getAttendanceForDate(selectedDate);
            if (!attendance) return null;
            
            return (
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-lg">{getStatusIcon(attendance.status)}</span>
                  <div>
                    <h5 className="font-medium text-blue-900">
                      {selectedDate.toLocaleDateString('ru-RU', { 
                        weekday: 'long', 
                        day: 'numeric', 
                        month: 'long' 
                      })}
                    </h5>
                    <p className="text-sm text-blue-700">{getStatusText(attendance.status)}</p>
                  </div>
                </div>
                
                {attendance.scheduledStart && (
                  <div className="text-sm text-blue-800 space-y-1">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <strong>Запланировано:</strong> {attendance.scheduledStart} - {attendance.scheduledEnd}
                      </div>
                      {attendance.actualStart && (
                        <div>
                          <strong>Фактически:</strong> {attendance.actualStart} - {attendance.actualEnd}
                        </div>
                      )}
                    </div>
                    
                    {attendance.hoursWorked && (
                      <div><strong>Отработано:</strong> {attendance.hoursWorked.toFixed(2)} часов</div>
                    )}
                    
                    {attendance.notes && (
                      <div><strong>Заметки:</strong> {attendance.notes}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })()}
        </div>
      )}
    </div>
  );
};

export default AttendanceCalendar;