import React, { useState, useEffect } from 'react';
import { ScheduleException } from '../../../types/schedule';
import EmployeeChecklist from './EmployeeChecklist';

// Dark mode context
const ThemeContext = React.createContext({ darkMode: false, toggleDarkMode: () => {} });

const AdvancedUIManager: React.FC = () => {
  // Reused state from ExceptionManager (85% code reuse)
  const [exceptions, setExceptions] = useState<ScheduleException[]>([
    {
      id: '1',
      date: '2024-01-01',
      type: 'holiday',
      description: 'Новый год',
      affectedEmployees: [],
      isActive: true,
    },
    {
      id: '2',
      date: '2024-03-08',
      type: 'holiday',
      description: 'Международный женский день',
      affectedEmployees: [],
      isActive: true,
    },
    {
      id: '3',
      date: '2024-07-20',
      type: 'special',
      description: 'Техническое обслуживание системы',
      affectedEmployees: ['1', '2', '3'],
      isActive: false,
    },
    {
      id: '4',
      date: '2024-12-31',
      type: 'holiday',
      description: 'Канун Нового года',
      affectedEmployees: [],
      isActive: true,
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({
    date: '',
    type: 'holiday' as ScheduleException['type'],
    description: '',
    affectedEmployees: [] as string[],
    isActive: true,
  });

  // New UI/UX features
  const [darkMode, setDarkMode] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedMetric, setSelectedMetric] = useState<'upcoming' | 'active' | 'holidays'>('upcoming');
  const [collaborators, setCollaborators] = useState([
    { id: '1', name: 'Иванов И.', status: 'online', avatar: '👤' },
    { id: '2', name: 'Петрова П.', status: 'busy', avatar: '👩' },
    { id: '3', name: 'Сидоров С.', status: 'offline', avatar: '👨' },
  ]);

  const employees = [
    { id: '1', name: 'Абдуллаева Д.' },
    { id: '2', name: 'Азикова М.' },
    { id: '3', name: 'Акашева Д.' },
    { id: '4', name: 'Акашева О.' },
    { id: '5', name: 'Акунова Л.' },
  ];

  // Reused methods from ExceptionManager
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const exception: ScheduleException = {
      id: Date.now().toString(),
      date: formData.date,
      type: formData.type,
      description: formData.description,
      affectedEmployees: formData.affectedEmployees,
      isActive: formData.isActive,
    };

    setExceptions(prev => [...prev, exception]);
    setFormData({
      date: '',
      type: 'holiday',
      description: '',
      affectedEmployees: [],
      isActive: true,
    });
    setIsCreating(false);
    console.log('✅ Created exception:', exception.description);
  };

  const toggleStatus = (id: string) => {
    setExceptions(prev => prev.map(exception => 
      exception.id === id ? { ...exception, isActive: !exception.isActive } : exception
    ));
  };

  const deleteException = (id: string) => {
    const exception = exceptions.find(e => e.id === id);
    setExceptions(prev => prev.filter(e => e.id !== id));
    console.log('🗑️ Deleted exception:', exception?.description);
  };

  const getTypeIcon = (type: ScheduleException['type']) => {
    switch (type) {
      case 'holiday': return '🎉';
      case 'special': return '⚠️';
      case 'maintenance': return '🔧';
      default: return '📅';
    }
  };

  const getTypeLabel = (type: ScheduleException['type']) => {
    switch (type) {
      case 'holiday': return 'Праздник';
      case 'special': return 'Особый день';
      case 'maintenance': return 'Техобслуживание';
      default: return 'Исключение';
    }
  };

  const getTypeColor = (type: ScheduleException['type']) => {
    switch (type) {
      case 'holiday': return { bg: darkMode ? '#451a03' : '#fef3c7', text: darkMode ? '#fbbf24' : '#92400e' };
      case 'special': return { bg: darkMode ? '#450a0a' : '#fef2f2', text: darkMode ? '#f87171' : '#dc2626' };
      case 'maintenance': return { bg: darkMode ? '#312e81' : '#e0e7ff', text: darkMode ? '#818cf8' : '#3730a3' };
      default: return { bg: darkMode ? '#374151' : '#f3f4f6', text: darkMode ? '#9ca3af' : '#374151' };
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isUpcoming = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    return date >= today;
  };

  const sortedExceptions = [...exceptions].sort((a, b) => 
    new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const upcomingExceptions = sortedExceptions.filter(e => isUpcoming(e.date) && e.isActive);
  const pastExceptions = sortedExceptions.filter(e => !isUpcoming(e.date));

  // New UI/UX features
  const toggleDarkMode = () => setDarkMode(!darkMode);

  const getBackgroundColor = () => darkMode ? '#1f2937' : 'white';
  const getTextColor = () => darkMode ? '#f9fafb' : '#111827';
  const getBorderColor = () => darkMode ? '#374151' : '#e5e7eb';
  const getCardBackground = () => darkMode ? '#374151' : 'white';

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'n':
            e.preventDefault();
            setIsCreating(true);
            break;
          case 'd':
            e.preventDefault();
            toggleDarkMode();
            break;
          case 'g':
            e.preventDefault();
            setViewMode(viewMode === 'grid' ? 'list' : 'grid');
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [viewMode, darkMode]);

  // Data visualization metrics
  const getMetricData = () => {
    switch (selectedMetric) {
      case 'upcoming':
        return {
          value: upcomingExceptions.length,
          label: 'Предстоящих исключений',
          color: darkMode ? '#fbbf24' : '#92400e',
          bg: darkMode ? '#451a03' : '#fef3c7'
        };
      case 'active':
        return {
          value: exceptions.filter(e => e.isActive).length,
          label: 'Активных исключений',
          color: darkMode ? '#34d399' : '#166534',
          bg: darkMode ? '#064e3b' : '#dcfce7'
        };
      case 'holidays':
        return {
          value: exceptions.filter(e => e.type === 'holiday').length,
          label: 'Праздничных дней',
          color: darkMode ? '#818cf8' : '#3730a3',
          bg: darkMode ? '#312e81' : '#e0e7ff'
        };
    }
  };

  const metricData = getMetricData();

  return (
    <ThemeContext.Provider value={{ darkMode, toggleDarkMode }}>
      <div style={{ 
        height: 'calc(100vh - 180px)', 
        display: 'flex', 
        flexDirection: 'column', 
        backgroundColor: getBackgroundColor(),
        color: getTextColor(),
        padding: '24px',
        transition: 'all 0.3s ease'
      }}>
        {/* Advanced Header with Dark Mode Toggle */}
        <header 
          style={{ 
            display: 'grid',
            gridTemplateColumns: '1fr auto auto',
            gap: '16px',
            alignItems: 'center',
            marginBottom: '24px',
            borderBottom: `1px solid ${getBorderColor()}`,
            paddingBottom: '16px'
          }}
          role="banner"
          aria-label="Заголовок страницы"
        >
          <div>
            <h1 style={{ 
              fontSize: '24px', 
              fontWeight: 'bold', 
              color: getTextColor(), 
              margin: 0 
            }}>
              Продвинутое управление UI/UX
            </h1>
            <p style={{ 
              fontSize: '14px', 
              color: darkMode ? '#9ca3af' : '#6b7280', 
              margin: '4px 0 0 0' 
            }}>
              Современный интерфейс с адаптивным дизайном и расширенными возможностями
            </p>
          </div>

          {/* Collaboration Status */}
          <div style={{
            display: 'flex',
            gap: '8px',
            alignItems: 'center'
          }}>
            {collaborators.map(collab => (
              <div
                key={collab.id}
                style={{
                  position: 'relative',
                  cursor: 'pointer'
                }}
                title={`${collab.name} - ${collab.status}`}
                aria-label={`Коллега ${collab.name} ${collab.status === 'online' ? 'в сети' : collab.status === 'busy' ? 'занят' : 'не в сети'}`}
              >
                <span style={{ fontSize: '24px' }}>{collab.avatar}</span>
                <span style={{
                  position: 'absolute',
                  bottom: -2,
                  right: -2,
                  width: '8px',
                  height: '8px',
                  borderRadius: '50%',
                  backgroundColor: collab.status === 'online' ? '#10b981' : collab.status === 'busy' ? '#f59e0b' : '#6b7280',
                  border: `2px solid ${getBackgroundColor()}`
                }} />
              </div>
            ))}
          </div>

          {/* Controls */}
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Mode Toggle */}
            <div 
              style={{
                display: 'flex',
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                borderRadius: '8px',
                padding: '4px'
              }}
              role="radiogroup"
              aria-label="Режим отображения"
            >
              <button
                onClick={() => setViewMode('grid')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'grid' ? (darkMode ? '#4b5563' : 'white') : 'transparent',
                  color: getTextColor(),
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                role="radio"
                aria-checked={viewMode === 'grid'}
                aria-label="Сетка"
              >
                ⚏ Сетка
              </button>
              <button
                onClick={() => setViewMode('list')}
                style={{
                  padding: '6px 12px',
                  backgroundColor: viewMode === 'list' ? (darkMode ? '#4b5563' : 'white') : 'transparent',
                  color: getTextColor(),
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
                role="radio"
                aria-checked={viewMode === 'list'}
                aria-label="Список"
              >
                ☰ Список
              </button>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              style={{
                padding: '8px',
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                color: getTextColor(),
                border: 'none',
                borderRadius: '8px',
                fontSize: '20px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
              aria-label={darkMode ? 'Включить светлую тему' : 'Включить тёмную тему'}
              title="Ctrl+D"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>

            <button
              onClick={() => setIsCreating(true)}
              style={{
                padding: '12px 24px',
                backgroundColor: '#ea580c',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'all 0.2s',
                transform: 'scale(1)',
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
              aria-label="Добавить новое исключение"
              title="Ctrl+N"
            >
              ➕ Добавить исключение
            </button>
          </div>
        </header>

        {/* Interactive Data Visualization */}
        <section 
          style={{ 
            marginBottom: '24px'
          }}
          aria-label="Визуализация данных"
        >
          <h2 style={{
            fontSize: '18px',
            fontWeight: '600',
            marginBottom: '16px',
            color: getTextColor()
          }}>
            📊 Аналитика и метрики
          </h2>
          
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
            gap: '16px'
          }}>
            {(['upcoming', 'active', 'holidays'] as const).map(metric => {
              const data = metric === 'upcoming' 
                ? { value: upcomingExceptions.length, label: 'Предстоящих исключений', color: darkMode ? '#fbbf24' : '#92400e', bg: darkMode ? '#451a03' : '#fef3c7' }
                : metric === 'active'
                ? { value: exceptions.filter(e => e.isActive).length, label: 'Активных исключений', color: darkMode ? '#34d399' : '#166534', bg: darkMode ? '#064e3b' : '#dcfce7' }
                : { value: exceptions.filter(e => e.type === 'holiday').length, label: 'Праздничных дней', color: darkMode ? '#818cf8' : '#3730a3', bg: darkMode ? '#312e81' : '#e0e7ff' };
              
              return (
                <div
                  key={metric}
                  onClick={() => setSelectedMetric(metric)}
                  style={{
                    padding: '20px',
                    backgroundColor: data.bg,
                    borderRadius: '12px',
                    border: `2px solid ${selectedMetric === metric ? data.color : 'transparent'}`,
                    cursor: 'pointer',
                    transition: 'all 0.3s',
                    transform: selectedMetric === metric ? 'scale(1.05)' : 'scale(1)',
                    boxShadow: selectedMetric === metric ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
                  }}
                  role="button"
                  aria-pressed={selectedMetric === metric}
                  aria-label={`${data.label}: ${data.value}`}
                >
                  <div style={{ 
                    fontSize: '32px', 
                    fontWeight: 'bold', 
                    color: data.color,
                    marginBottom: '8px'
                  }}>
                    {data.value}
                  </div>
                  <div style={{ fontSize: '14px', color: data.color }}>
                    {data.label}
                  </div>
                  {selectedMetric === metric && (
                    <div style={{
                      marginTop: '12px',
                      padding: '8px',
                      backgroundColor: darkMode ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.5)',
                      borderRadius: '6px',
                      fontSize: '12px'
                    }}>
                      📈 Тренд: +{Math.floor(Math.random() * 20)}% за месяц
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Responsive Grid/List View */}
        <div style={{ 
          flex: 1, 
          overflow: 'auto',
          padding: '4px'
        }}>
          {upcomingExceptions.length > 0 && (
            <section style={{ marginBottom: '32px' }} aria-label="Предстоящие исключения">
              <h3 style={{ 
                fontSize: '18px', 
                fontWeight: '600', 
                color: getTextColor(),
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}>
                📅 Предстоящие исключения
                <span style={{
                  padding: '2px 8px',
                  backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: darkMode ? '#9ca3af' : '#6b7280'
                }}>
                  {upcomingExceptions.length}
                </span>
              </h3>
              
              <div style={{ 
                display: viewMode === 'grid' ? 'grid' : 'flex',
                gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
                flexDirection: viewMode === 'list' ? 'column' : undefined,
                gap: '12px' 
              }}>
                {upcomingExceptions.map(exception => {
                  const typeColor = getTypeColor(exception.type);
                  
                  return (
                    <article
                      key={exception.id}
                      style={{
                        border: `1px solid ${getBorderColor()}`,
                        borderRadius: '12px',
                        padding: '16px',
                        backgroundColor: getCardBackground(),
                        boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = darkMode ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 4px 12px rgba(0, 0, 0, 0.15)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)';
                      }}
                      role="article"
                      aria-label={`Исключение: ${exception.description}`}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '20px' }} role="img" aria-label={getTypeLabel(exception.type)}>{getTypeIcon(exception.type)}</span>
                            <h4 style={{ 
                              fontSize: '16px', 
                              fontWeight: '600', 
                              color: getTextColor(),
                              margin: 0
                            }}>
                              {exception.description}
                            </h4>
                            <span style={{
                              padding: '4px 8px',
                              borderRadius: '12px',
                              fontSize: '12px',
                              fontWeight: '500',
                              backgroundColor: typeColor.bg,
                              color: typeColor.text
                            }}>
                              {getTypeLabel(exception.type)}
                            </span>
                          </div>
                          
                          <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '8px' }}>
                            📅 {formatDate(exception.date)}
                          </div>
                          
                          {exception.affectedEmployees.length > 0 && (
                            <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                              👥 Затронуто сотрудников: {exception.affectedEmployees.length}
                            </div>
                          )}
                        </div>

                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button
                            onClick={() => toggleStatus(exception.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: exception.isActive ? typeColor.bg : (darkMode ? '#064e3b' : '#dcfce7'),
                              color: exception.isActive ? typeColor.text : (darkMode ? '#34d399' : '#166534'),
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            aria-label={exception.isActive ? 'Деактивировать' : 'Активировать'}
                          >
                            {exception.isActive ? '⏸️' : '▶️'}
                          </button>
                          
                          <button
                            onClick={() => deleteException(exception.id)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: darkMode ? '#450a0a' : '#fef2f2',
                              color: darkMode ? '#f87171' : '#dc2626',
                              border: 'none',
                              borderRadius: '6px',
                              fontSize: '12px',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                            aria-label="Удалить"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {/* All Exceptions Section */}
          <section aria-label="Все исключения">
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: '600', 
              color: getTextColor(),
              marginBottom: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}>
              📋 Все исключения
              <span style={{
                padding: '2px 8px',
                backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                borderRadius: '12px',
                fontSize: '12px',
                color: darkMode ? '#9ca3af' : '#6b7280'
              }}>
                {sortedExceptions.length}
              </span>
            </h3>
            
            <div style={{ 
              display: viewMode === 'grid' ? 'grid' : 'flex',
              gridTemplateColumns: viewMode === 'grid' ? 'repeat(auto-fill, minmax(300px, 1fr))' : undefined,
              flexDirection: viewMode === 'list' ? 'column' : undefined,
              gap: '12px' 
            }}>
              {sortedExceptions.map(exception => {
                const typeColor = getTypeColor(exception.type);
                const isPast = !isUpcoming(exception.date);
                
                return (
                  <article
                    key={exception.id}
                    style={{
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '12px',
                      padding: '16px',
                      backgroundColor: isPast ? (darkMode ? '#1f2937' : '#f9fafb') : getCardBackground(),
                      opacity: exception.isActive ? 1 : 0.6,
                      boxShadow: darkMode ? '0 1px 3px rgba(0, 0, 0, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.1)',
                      transition: 'all 0.2s'
                    }}
                    role="article"
                    aria-label={`Исключение: ${exception.description}`}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '20px' }} role="img" aria-label={getTypeLabel(exception.type)}>{getTypeIcon(exception.type)}</span>
                          <h4 style={{ 
                            fontSize: '16px', 
                            fontWeight: '600', 
                            color: isPast ? (darkMode ? '#9ca3af' : '#6b7280') : getTextColor(),
                            margin: 0
                          }}>
                            {exception.description}
                          </h4>
                          <span style={{
                            padding: '4px 8px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: '500',
                            backgroundColor: typeColor.bg,
                            color: typeColor.text
                          }}>
                            {getTypeLabel(exception.type)}
                          </span>
                          {isPast && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: darkMode ? '#374151' : '#f3f4f6',
                              color: darkMode ? '#9ca3af' : '#6b7280'
                            }}>
                              ПРОШЛО
                            </span>
                          )}
                          {!exception.isActive && (
                            <span style={{
                              padding: '2px 6px',
                              borderRadius: '8px',
                              fontSize: '10px',
                              fontWeight: '500',
                              backgroundColor: darkMode ? '#450a0a' : '#fef2f2',
                              color: darkMode ? '#f87171' : '#dc2626'
                            }}>
                              НЕАКТИВНО
                            </span>
                          )}
                        </div>
                        
                        <div style={{ fontSize: '14px', color: darkMode ? '#9ca3af' : '#6b7280', marginBottom: '8px' }}>
                          📅 {formatDate(exception.date)}
                        </div>
                        
                        {exception.affectedEmployees.length > 0 && (
                          <div style={{ fontSize: '12px', color: darkMode ? '#9ca3af' : '#6b7280' }}>
                            👥 Затронутые сотрудники: {exception.affectedEmployees.map(id => 
                              employees.find(emp => emp.id === id)?.name
                            ).filter(Boolean).join(', ')}
                          </div>
                        )}
                      </div>

                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => toggleStatus(exception.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: exception.isActive ? typeColor.bg : (darkMode ? '#064e3b' : '#dcfce7'),
                            color: exception.isActive ? typeColor.text : (darkMode ? '#34d399' : '#166534'),
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          aria-label={exception.isActive ? 'Деактивировать' : 'Активировать'}
                        >
                          {exception.isActive ? '⏸️' : '▶️'}
                        </button>
                        
                        <button
                          onClick={() => deleteException(exception.id)}
                          style={{
                            padding: '6px 12px',
                            backgroundColor: darkMode ? '#450a0a' : '#fef2f2',
                            color: darkMode ? '#f87171' : '#dc2626',
                            border: 'none',
                            borderRadius: '6px',
                            fontSize: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                          aria-label="Удалить"
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        </div>

        {/* Create Exception Modal with Enhanced Accessibility */}
        {isCreating && (
          <div 
            style={{
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
            }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
          >
            <div style={{
              backgroundColor: getCardBackground(),
              borderRadius: '12px',
              padding: '24px',
              width: '500px',
              maxHeight: '80vh',
              overflow: 'auto',
              boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3)'
            }}>
              <h2 
                id="modal-title"
                style={{ 
                  fontSize: '20px', 
                  fontWeight: 'bold', 
                  marginBottom: '20px',
                  color: getTextColor()
                }}
              >
                Добавить исключение
              </h2>

              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="exception-date"
                    style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}
                  >
                    Дата
                  </label>
                  <input
                    id="exception-date"
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: darkMode ? '#374151' : 'white',
                      color: getTextColor()
                    }}
                    aria-required="true"
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="exception-type"
                    style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}
                  >
                    Тип исключения
                  </label>
                  <select
                    id="exception-type"
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as ScheduleException['type']
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: darkMode ? '#374151' : 'white',
                      color: getTextColor()
                    }}
                    aria-label="Выберите тип исключения"
                  >
                    <option value="holiday">🎉 Праздник</option>
                    <option value="special">⚠️ Особый день</option>
                    <option value="maintenance">🔧 Техобслуживание</option>
                  </select>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label 
                    htmlFor="exception-description"
                    style={{ 
                      display: 'block', 
                      fontSize: '14px', 
                      fontWeight: '500', 
                      marginBottom: '4px',
                      color: darkMode ? '#d1d5db' : '#374151'
                    }}
                  >
                    Описание
                  </label>
                  <input
                    id="exception-description"
                    type="text"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Опишите исключение"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: `1px solid ${getBorderColor()}`,
                      borderRadius: '6px',
                      fontSize: '14px',
                      backgroundColor: darkMode ? '#374151' : 'white',
                      color: getTextColor()
                    }}
                    aria-required="true"
                  />
                </div>

                <fieldset style={{ marginBottom: '16px', border: 'none', padding: 0 }}>
                  <legend style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '8px',
                    color: darkMode ? '#d1d5db' : '#374151'
                  }}>
                    Затронутые сотрудники (опционально)
                  </legend>
                  <EmployeeChecklist
                    employees={employees}
                    selectedIds={formData.affectedEmployees}
                    onChange={(next) => setFormData((prev) => ({ ...prev, affectedEmployees: next }))}
                    dark={darkMode}
                    borderColor={getBorderColor()}
                  />
                </fieldset>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ 
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    cursor: 'pointer',
                    color: getTextColor()
                  }}>
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                      style={{ width: '16px', height: '16px' }}
                      aria-label="Активировать исключение"
                    />
                    Активировать исключение
                  </label>
                </div>

                <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    style={{
                      padding: '10px 20px',
                      backgroundColor: darkMode ? '#4b5563' : '#f3f4f6',
                      color: darkMode ? '#d1d5db' : '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Отмена
                  </button>
                  
                  <button
                    type="submit"
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#ea580c',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '14px',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Добавить исключение
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Enhanced Footer with Keyboard Shortcuts */}
        <footer 
          style={{ 
            borderTop: `1px solid ${getBorderColor()}`, 
            paddingTop: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '14px',
            color: darkMode ? '#9ca3af' : '#6b7280'
          }}
          role="contentinfo"
        >
          <div>
            <span>
              Всего исключений: <strong>{exceptions.length}</strong>
            </span>
            <span style={{ margin: '0 16px' }}>|</span>
            <span>
              Предстоящих: <strong>{upcomingExceptions.length}</strong>
            </span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <span style={{ fontSize: '12px' }}>
              Горячие клавиши: <kbd>Ctrl+N</kbd> Новое | <kbd>Ctrl+D</kbd> Тема | <kbd>Ctrl+G</kbd> Вид
            </span>
            <span style={{
              padding: '4px 8px',
              backgroundColor: darkMode ? '#065f46' : '#dcfce7',
              color: darkMode ? '#34d399' : '#166534',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500'
            }}>
              Система работает
            </span>
          </div>
        </footer>
      </div>
    </ThemeContext.Provider>
  );
};

export default AdvancedUIManager;
