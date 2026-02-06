import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  ScheduleException 
} from '../../../types/schedule';

interface TimeRecord {
  id: string;
  employeeId: string;
  date: string;
  clockIn: string | null;
  clockOut: string | null;
  breakStart: string | null;
  breakEnd: string | null;
  status: 'present' | 'late' | 'early' | 'absent' | 'overtime';
  overtimeHours: number;
  isApproved: boolean;
  biometricVerified: boolean;
  exceptions: string[];
}

interface AttendanceStats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  absentToday: number;
  overtimeToday: number;
  avgHoursWorked: number;
}

const TimeAttendanceUI: React.FC = () => {
  // Состояния из ScheduleGridContainer (85% повторное использование)
  const [employees] = useState<Employee[]>([
    { 
      id: '1', employeeId: 'EMP001', firstName: 'Дарья', lastName: 'Абдуллаева', 
      fullName: 'Абдуллаева Д.', role: 'Оператор', scheduledHours: 187, plannedHours: 168, 
      photo: 'А', skills: ['Входящая линия_1'], isActive: true 
    },
    { 
      id: '2', employeeId: 'EMP002', firstName: 'Мария', lastName: 'Азикова', 
      fullName: 'Азикова М.', role: 'Оператор', scheduledHours: 165, plannedHours: 149, 
      photo: 'А', skills: ['Входящая линия_1'], isActive: true 
    },
    { 
      id: '3', employeeId: 'EMP003', firstName: 'Дарья', lastName: 'Акашева', 
      fullName: 'Акашева Д.', role: 'Оператор', scheduledHours: 183, plannedHours: 173, 
      photo: 'А', skills: ['Входящая линия_1'], isActive: true 
    },
    { 
      id: '4', employeeId: 'EMP004', firstName: 'Ольга', lastName: 'Акашева', 
      fullName: 'Акашева О.', role: 'Оператор', scheduledHours: 0, plannedHours: 100, 
      photo: 'А', skills: ['Входящая линия_1'], isActive: true 
    },
    { 
      id: '5', employeeId: 'EMP005', firstName: 'Лена', lastName: 'Акунова', 
      fullName: 'Акунова Л.', role: 'Оператор', scheduledHours: 169, plannedHours: 155, 
      photo: 'А', skills: ['Входящая линия_1'], isActive: true 
    },
  ]);

  const [timeRecords, setTimeRecords] = useState<Map<string, TimeRecord>>(new Map());
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [activeView, setActiveView] = useState<'clock' | 'calendar' | 'exceptions' | 'overtime' | 'payroll'>('clock');
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(null);
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [pendingClockAction, setPendingClockAction] = useState<{ employeeId: string; action: 'in' | 'out' } | null>(null);

  // Адаптированные функции из ExceptionManager (85% повторное использование)
  const [exceptions, setExceptions] = useState<ScheduleException[]>([
    {
      id: '1',
      date: selectedDate,
      type: 'special',
      description: 'Опоздание - пробки на дорогах',
      affectedEmployees: ['1'],
      isActive: true,
    },
    {
      id: '2',
      date: selectedDate,
      type: 'special',
      description: 'Ранний уход - семейные обстоятельства',
      affectedEmployees: ['3'],
      isActive: true,
    },
  ]);

  // Генерация календарных дат (из ScheduleGridContainer)
  const generateMonthDates = () => {
    const dates = [];
    const year = parseInt(selectedDate.split('-')[0]);
    const month = parseInt(selectedDate.split('-')[1]) - 1;
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push({
        day: i,
        dayName: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'][date.getDay()],
        isWeekend: date.getDay() === 0 || date.getDay() === 6,
        isToday: date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0],
        dateString: date.toISOString().split('T')[0]
      });
    }
    return dates;
  };

  const dates = generateMonthDates();

  // Инициализация записей времени
  useEffect(() => {
    const initialRecords = new Map<string, TimeRecord>();
    
    employees.forEach(employee => {
      const today = new Date().toISOString().split('T')[0];
      const recordKey = `${employee.id}-${today}`;
      
      // Симуляция данных о присутствии
      const randomStatus = Math.random();
      let status: TimeRecord['status'] = 'present';
      let clockIn = '08:00';
      let clockOut: string | null = null;
      
      if (randomStatus < 0.1) {
        status = 'absent';
        clockIn = null;
      } else if (randomStatus < 0.2) {
        status = 'late';
        clockIn = '08:35';
      } else if (randomStatus < 0.3) {
        status = 'overtime';
        clockOut = '19:30';
      }
      
      initialRecords.set(recordKey, {
        id: recordKey,
        employeeId: employee.id,
        date: today,
        clockIn,
        clockOut,
        breakStart: clockIn ? '12:00' : null,
        breakEnd: clockIn ? '13:00' : null,
        status,
        overtimeHours: status === 'overtime' ? 2.5 : 0,
        isApproved: false,
        biometricVerified: clockIn !== null,
        exceptions: []
      });
    });
    
    setTimeRecords(initialRecords);
  }, [employees]);

  // Расчет статистики
  const calculateStats = (): AttendanceStats => {
    const todayRecords = Array.from(timeRecords.values()).filter(
      record => record.date === new Date().toISOString().split('T')[0]
    );
    
    return {
      totalEmployees: employees.length,
      presentToday: todayRecords.filter(r => r.status === 'present' || r.status === 'overtime').length,
      lateToday: todayRecords.filter(r => r.status === 'late').length,
      absentToday: todayRecords.filter(r => r.status === 'absent').length,
      overtimeToday: todayRecords.filter(r => r.status === 'overtime').length,
      avgHoursWorked: 7.8
    };
  };

  const stats = calculateStats();

  // Обработка входа/выхода
  const handleClockAction = (employeeId: string, action: 'in' | 'out') => {
    setPendingClockAction({ employeeId, action });
    setShowBiometricModal(true);
  };

  const confirmBiometricAndClock = () => {
    if (!pendingClockAction) return;
    
    const { employeeId, action } = pendingClockAction;
    const recordKey = `${employeeId}-${selectedDate}`;
    const currentTime = new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    
    setTimeRecords(prev => {
      const newRecords = new Map(prev);
      const record = newRecords.get(recordKey) || {
        id: recordKey,
        employeeId,
        date: selectedDate,
        clockIn: null,
        clockOut: null,
        breakStart: null,
        breakEnd: null,
        status: 'present' as const,
        overtimeHours: 0,
        isApproved: false,
        biometricVerified: true,
        exceptions: []
      };
      
      if (action === 'in') {
        record.clockIn = currentTime;
        record.biometricVerified = true;
        // Проверка опоздания
        if (currentTime > '08:15') {
          record.status = 'late';
        }
      } else {
        record.clockOut = currentTime;
        // Проверка сверхурочных
        if (currentTime > '18:00') {
          record.status = 'overtime';
          const [hours, minutes] = currentTime.split(':').map(Number);
          record.overtimeHours = Math.max(0, hours - 18 + minutes / 60);
        }
      }
      
      newRecords.set(recordKey, record);
      return newRecords;
    });
    
    setShowBiometricModal(false);
    setPendingClockAction(null);
    console.log(`✅ ${action === 'in' ? 'Вход' : 'Выход'} зарегистрирован для сотрудника ${employeeId}`);
  };

  // Интерфейс отметки времени
  const renderClockInterface = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        🕐 Регистрация времени
      </h2>
      
      {/* Статистика в реальном времени */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '16px',
        marginBottom: '32px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#dcfce7',
          borderRadius: '8px',
          border: '1px solid #bbf7d0'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#166534' }}>
            {stats.presentToday}
          </div>
          <div style={{ fontSize: '14px', color: '#166534' }}>
            Присутствуют
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
            {stats.lateToday}
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            Опоздали
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#fee2e2',
          borderRadius: '8px',
          border: '1px solid #fecaca'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#dc2626' }}>
            {stats.absentToday}
          </div>
          <div style={{ fontSize: '14px', color: '#dc2626' }}>
            Отсутствуют
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#e0e7ff',
          borderRadius: '8px',
          border: '1px solid #c7d2fe'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#3730a3' }}>
            {stats.overtimeToday}
          </div>
          <div style={{ fontSize: '14px', color: '#3730a3' }}>
            Сверхурочно
          </div>
        </div>
      </div>
      
      {/* Список сотрудников с действиями */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Сотрудники на смене
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {employees.map(employee => {
            const recordKey = `${employee.id}-${selectedDate}`;
            const record = timeRecords.get(recordKey);
            
            return (
              <div key={employee.id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '48px', 
                    height: '48px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '20px', 
                    fontWeight: 'bold', 
                    color: '#1d4ed8' 
                  }}>
                    {employee.photo}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {employee.fullName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      {employee.role} • {employee.employeeId}
                    </div>
                    {record && (
                      <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                        {record.clockIn && `Вход: ${record.clockIn}`}
                        {record.clockOut && ` • Выход: ${record.clockOut}`}
                        {record.biometricVerified && ' ✓ Биометрия'}
                      </div>
                    )}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {!record?.clockIn ? (
                    <button
                      onClick={() => handleClockAction(employee.id, 'in')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#059669',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🟢 Вход
                    </button>
                  ) : !record?.clockOut ? (
                    <button
                      onClick={() => handleClockAction(employee.id, 'out')}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#dc2626',
                        color: 'white',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '14px',
                        fontWeight: '500',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px'
                      }}
                    >
                      🔴 Выход
                    </button>
                  ) : (
                    <span style={{
                      padding: '8px 16px',
                      backgroundColor: '#f3f4f6',
                      color: '#6b7280',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}>
                      ✓ Завершено
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  // Календарный вид посещаемости (адаптирован из ScheduleGridContainer)
  const renderAttendanceCalendar = () => (
    <div style={{ height: 'calc(100vh - 240px)', overflow: 'auto' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', margin: '24px', color: '#111827' }}>
        📅 Календарь посещаемости
      </h2>
      
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ 
              padding: '12px 16px', 
              backgroundColor: '#f9fafb', 
              borderRight: '2px solid #2d3e50',
              borderBottom: '1px solid #e5e7eb',
              textAlign: 'left',
              fontSize: '14px',
              fontWeight: '500',
              position: 'sticky',
              left: 0,
              zIndex: 10
            }}>
              Сотрудник
            </th>
            {dates.map((date, index) => (
              <th key={index} style={{ 
                width: '40px',
                padding: '4px',
                borderRight: '1px solid #e5e7eb',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: date.isWeekend ? '#f3f4f6' : '#f9fafb',
                textAlign: 'center',
                fontSize: '12px',
                fontWeight: date.isWeekend ? 'bold' : 'normal'
              }}>
                <div style={{ color: '#374151' }}>{date.day}</div>
              </th>
            ))}
          </tr>
        </thead>
        
        <tbody>
          {employees.map((employee, empIndex) => (
            <tr key={employee.id} style={{ 
              backgroundColor: empIndex % 2 === 0 ? 'white' : '#f9fafb'
            }}>
              <td style={{ 
                padding: '8px 16px', 
                borderRight: '2px solid #2d3e50',
                borderBottom: '1px solid #e5e7eb',
                backgroundColor: empIndex % 2 === 0 ? 'white' : '#f9fafb',
                position: 'sticky',
                left: 0
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ 
                    width: '24px', 
                    height: '24px', 
                    backgroundColor: '#dbeafe', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '10px', 
                    fontWeight: 'bold', 
                    color: '#1d4ed8' 
                  }}>
                    {employee.photo}
                  </div>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{employee.fullName}</span>
                </div>
              </td>
              
              {dates.map((date, dateIndex) => {
                const recordKey = `${employee.id}-${date.dateString}`;
                const record = timeRecords.get(recordKey);
                
                let cellColor = '#f3f4f6';
                let cellSymbol = '—';
                
                if (record) {
                  switch (record.status) {
                    case 'present':
                      cellColor = '#dcfce7';
                      cellSymbol = '✓';
                      break;
                    case 'late':
                      cellColor = '#fef3c7';
                      cellSymbol = 'О';
                      break;
                    case 'absent':
                      cellColor = '#fee2e2';
                      cellSymbol = 'Н';
                      break;
                    case 'overtime':
                      cellColor = '#e0e7ff';
                      cellSymbol = 'С';
                      break;
                  }
                }
                
                return (
                  <td key={dateIndex} style={{ 
                    width: '40px',
                    height: '40px',
                    padding: '4px',
                    borderRight: '1px solid #e5e7eb',
                    borderBottom: '1px solid #e5e7eb',
                    backgroundColor: date.isWeekend ? '#f9fafb' : cellColor,
                    textAlign: 'center',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}>
                    {cellSymbol}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      
      {/* Легенда */}
      <div style={{ 
        display: 'flex', 
        gap: '24px', 
        justifyContent: 'center', 
        marginTop: '24px',
        fontSize: '14px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#dcfce7', borderRadius: '4px' }}></div>
          <span>Присутствует</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#fef3c7', borderRadius: '4px' }}></div>
          <span>Опоздание</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#fee2e2', borderRadius: '4px' }}></div>
          <span>Отсутствует</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '20px', height: '20px', backgroundColor: '#e0e7ff', borderRadius: '4px' }}></div>
          <span>Сверхурочно</span>
        </div>
      </div>
    </div>
  );

  // Управление исключениями (адаптировано из ExceptionManager)
  const renderExceptionsView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        ⚠️ Управление исключениями
      </h2>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {exceptions.map(exception => (
          <div key={exception.id} style={{
            backgroundColor: 'white',
            borderRadius: '8px',
            padding: '16px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
              <div>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {exception.description}
                </h3>
                <div style={{ fontSize: '14px', color: '#6b7280' }}>
                  📅 {new Date(exception.date).toLocaleDateString('ru-RU')}
                </div>
                <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
                  👤 {exception.affectedEmployees.map(id => 
                    employees.find(emp => emp.id === id)?.fullName
                  ).join(', ')}
                </div>
              </div>
              
              <button style={{
                padding: '6px 12px',
                backgroundColor: exception.isActive ? '#dcfce7' : '#fee2e2',
                color: exception.isActive ? '#166534' : '#dc2626',
                border: 'none',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                {exception.isActive ? 'Одобрено' : 'На рассмотрении'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Управление сверхурочными
  const renderOvertimeView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        ⏰ Сверхурочные часы
      </h2>
      
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#3730a3' }}>
              {Array.from(timeRecords.values()).reduce((sum, r) => sum + r.overtimeHours, 0).toFixed(1)} ч
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Всего сверхурочных</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {Array.from(timeRecords.values()).filter(r => r.overtimeHours > 0 && r.isApproved).length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Одобрено</div>
          </div>
          <div>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#dc2626' }}>
              {Array.from(timeRecords.values()).filter(r => r.overtimeHours > 0 && !r.isApproved).length}
            </div>
            <div style={{ fontSize: '14px', color: '#6b7280' }}>Ожидает одобрения</div>
          </div>
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '12px' }}>
        {Array.from(timeRecords.values())
          .filter(record => record.overtimeHours > 0)
          .map(record => {
            const employee = employees.find(e => e.id === record.employeeId);
            
            return (
              <div key={record.id} style={{
                backgroundColor: 'white',
                borderRadius: '8px',
                padding: '16px',
                border: '1px solid #e5e7eb',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ 
                    width: '40px', 
                    height: '40px', 
                    backgroundColor: '#e0e7ff', 
                    borderRadius: '50%', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    fontSize: '16px', 
                    fontWeight: 'bold', 
                    color: '#3730a3' 
                  }}>
                    {employee?.photo}
                  </div>
                  
                  <div>
                    <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {employee?.fullName}
                    </div>
                    <div style={{ fontSize: '14px', color: '#6b7280' }}>
                      📅 {new Date(record.date).toLocaleDateString('ru-RU')} • 
                      ⏱️ {record.overtimeHours.toFixed(1)} часов сверхурочно
                    </div>
                  </div>
                </div>
                
                <button
                  onClick={() => {
                    setTimeRecords(prev => {
                      const newRecords = new Map(prev);
                      const updatedRecord = { ...record, isApproved: !record.isApproved };
                      newRecords.set(record.id, updatedRecord);
                      return newRecords;
                    });
                  }}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: record.isApproved ? '#dcfce7' : '#fef3c7',
                    color: record.isApproved ? '#166534' : '#92400e',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  {record.isApproved ? '✓ Одобрено' : 'Одобрить'}
                </button>
              </div>
            );
          })}
      </div>
    </div>
  );

  // Интеграция с расчетом зарплаты
  const renderPayrollView = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        💰 Интеграция с расчетом зарплаты
      </h2>
      
      <div style={{ 
        backgroundColor: '#e0e7ff', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '600', color: '#3730a3' }}>
            Период: {new Date().toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
          </div>
          <div style={{ fontSize: '14px', color: '#6b7280', marginTop: '4px' }}>
            Готово к экспорту: {employees.length} сотрудников
          </div>
        </div>
        
        <button style={{
          padding: '12px 24px',
          backgroundColor: '#3730a3',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          📤 Экспорт в систему расчета
        </button>
      </div>
      
      <table style={{ width: '100%', borderCollapse: 'collapse', backgroundColor: 'white', borderRadius: '8px', overflow: 'hidden' }}>
        <thead>
          <tr style={{ backgroundColor: '#f9fafb' }}>
            <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Сотрудник</th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Отработано часов</th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Сверхурочные</th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Опоздания</th>
            <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Прогулы</th>
            <th style={{ padding: '12px', textAlign: 'right', borderBottom: '1px solid #e5e7eb' }}>К выплате</th>
          </tr>
        </thead>
        <tbody>
          {employees.map((employee, index) => {
            const employeeRecords = Array.from(timeRecords.values()).filter(r => r.employeeId === employee.id);
            const totalHours = employee.scheduledHours;
            const overtimeHours = employeeRecords.reduce((sum, r) => sum + r.overtimeHours, 0);
            const lateCount = employeeRecords.filter(r => r.status === 'late').length;
            const absentCount = employeeRecords.filter(r => r.status === 'absent').length;
            
            return (
              <tr key={employee.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ 
                      width: '32px', 
                      height: '32px', 
                      backgroundColor: '#dbeafe', 
                      borderRadius: '50%', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      fontSize: '14px', 
                      fontWeight: 'bold', 
                      color: '#1d4ed8' 
                    }}>
                      {employee.photo}
                    </div>
                    <div>
                      <div style={{ fontSize: '14px', fontWeight: '600' }}>{employee.fullName}</div>
                      <div style={{ fontSize: '12px', color: '#6b7280' }}>{employee.employeeId}</div>
                    </div>
                  </div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{totalHours}</td>
                <td style={{ padding: '12px', textAlign: 'center', color: '#3730a3', fontWeight: '600' }}>
                  {overtimeHours.toFixed(1)}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: lateCount > 0 ? '#dc2626' : '#059669' }}>
                  {lateCount}
                </td>
                <td style={{ padding: '12px', textAlign: 'center', color: absentCount > 0 ? '#dc2626' : '#059669' }}>
                  {absentCount}
                </td>
                <td style={{ padding: '12px', textAlign: 'right', fontSize: '16px', fontWeight: '600', color: '#059669' }}>
                  ₽ {((totalHours + overtimeHours * 1.5) * 350).toLocaleString('ru-RU')}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );

  // Модальное окно биометрической верификации
  const renderBiometricModal = () => showBiometricModal && (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div style={{
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '32px',
        width: '400px',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👆</div>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '8px', color: '#111827' }}>
          Биометрическая верификация
        </h3>
        <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '24px' }}>
          Приложите палец к сканеру для подтверждения
        </p>
        
        <div style={{ 
          height: '4px', 
          backgroundColor: '#e5e7eb', 
          borderRadius: '2px', 
          marginBottom: '24px',
          overflow: 'hidden'
        }}>
          <div style={{
            height: '100%',
            backgroundColor: '#3b82f6',
            width: '60%',
            animation: 'progress 2s ease-in-out',
            borderRadius: '2px'
          }}></div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button
            onClick={() => {
              setShowBiometricModal(false);
              setPendingClockAction(null);
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#f3f4f6',
              color: '#374151',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              cursor: 'pointer'
            }}
          >
            Отмена
          </button>
          
          <button
            onClick={confirmBiometricAndClock}
            style={{
              padding: '10px 20px',
              backgroundColor: '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Подтвердить
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ height: 'calc(100vh - 180px)', display: 'flex', flexDirection: 'column', backgroundColor: 'white' }}>
      {/* Навигация по вкладкам */}
      <div style={{ 
        borderBottom: '2px solid #e5e7eb', 
        padding: '0 24px',
        backgroundColor: '#f9fafb'
      }}>
        <div style={{ display: 'flex', gap: '32px' }}>
          {[
            { id: 'clock', label: '🕐 Регистрация', icon: '🕐' },
            { id: 'calendar', label: '📅 Календарь', icon: '📅' },
            { id: 'exceptions', label: '⚠️ Исключения', icon: '⚠️' },
            { id: 'overtime', label: '⏰ Сверхурочные', icon: '⏰' },
            { id: 'payroll', label: '💰 Расчет ЗП', icon: '💰' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              style={{
                padding: '16px 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeView === tab.id ? '2px solid #ea580c' : '2px solid transparent',
                color: activeView === tab.id ? '#ea580c' : '#6b7280',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Контент */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {activeView === 'clock' && renderClockInterface()}
        {activeView === 'calendar' && renderAttendanceCalendar()}
        {activeView === 'exceptions' && renderExceptionsView()}
        {activeView === 'overtime' && renderOvertimeView()}
        {activeView === 'payroll' && renderPayrollView()}
      </div>
      
      {/* Модальные окна */}
      {renderBiometricModal()}
      
      {/* Футер со статистикой */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        padding: '12px 24px', 
        backgroundColor: '#f9fafb',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px'
      }}>
        <span style={{ color: '#6b7280' }}>
          Система учета рабочего времени • {new Date().toLocaleDateString('ru-RU')}
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: '#6b7280' }}>
            Присутствует: <span style={{ fontWeight: '500', color: '#059669' }}>{stats.presentToday}/{stats.totalEmployees}</span>
          </span>
          <span style={{ color: '#6b7280' }}>
            Ср. время работы: <span style={{ fontWeight: '500' }}>{stats.avgHoursWorked} ч</span>
          </span>
          <span style={{ color: '#6b7280' }}>
            Биометрия: <span style={{ fontWeight: '500', color: '#059669' }}>Активна</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default TimeAttendanceUI;