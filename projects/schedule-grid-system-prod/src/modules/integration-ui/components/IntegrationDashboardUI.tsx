import React, { useState, useEffect } from 'react';
import { 
  Employee, 
  ScheduleException 
} from '../../../types/schedule';

interface IntegrationSystem {
  id: string;
  name: string;
  type: '1C_ZUP' | 'SAP_HR' | 'ORACLE_HCM';
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSync: string | null;
  nextSync: string | null;
  recordsSynced: number;
  errors: number;
  config: {
    endpoint: string;
    credentials: string;
    syncInterval: number;
    dataMapping: Record<string, string>;
  };
}

interface SyncLog {
  id: string;
  systemId: string;
  timestamp: string;
  type: 'success' | 'error' | 'warning';
  message: string;
  recordsAffected: number;
  duration: number;
}

interface DataMapping {
  id: string;
  sourceField: string;
  targetField: string;
  transformation: string;
  isActive: boolean;
}

interface IntegrationStats {
  totalSystems: number;
  activeConnections: number;
  syncedToday: number;
  errorsToday: number;
  avgSyncTime: number;
}

const IntegrationDashboardUI: React.FC = () => {
  // Состояния адаптированные из TimeAttendanceUI (85% повторное использование)
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
  ]);

  const [integrationSystems, setIntegrationSystems] = useState<IntegrationSystem[]>([
    {
      id: '1',
      name: '1С:ЗУП 3.1',
      type: '1C_ZUP',
      status: 'connected',
      lastSync: new Date(Date.now() - 3600000).toISOString(),
      nextSync: new Date(Date.now() + 1800000).toISOString(),
      recordsSynced: 1247,
      errors: 0,
      config: {
        endpoint: 'https://1c.company.ru/ws/integration',
        credentials: '***',
        syncInterval: 30,
        dataMapping: {
          'employeeId': 'КодСотрудника',
          'fullName': 'ФИО',
          'role': 'Должность'
        }
      }
    },
    {
      id: '2',
      name: 'SAP HR',
      type: 'SAP_HR',
      status: 'syncing',
      lastSync: new Date(Date.now() - 7200000).toISOString(),
      nextSync: null,
      recordsSynced: 892,
      errors: 2,
      config: {
        endpoint: 'https://sap.company.com/api/hr',
        credentials: '***',
        syncInterval: 60,
        dataMapping: {
          'employeeId': 'PERNR',
          'fullName': 'ENAME',
          'role': 'PLANS'
        }
      }
    },
    {
      id: '3',
      name: 'Oracle HCM Cloud',
      type: 'ORACLE_HCM',
      status: 'error',
      lastSync: new Date(Date.now() - 86400000).toISOString(),
      nextSync: null,
      recordsSynced: 0,
      errors: 15,
      config: {
        endpoint: 'https://oracle.company.com/hcm/api',
        credentials: '***',
        syncInterval: 120,
        dataMapping: {
          'employeeId': 'PersonNumber',
          'fullName': 'DisplayName',
          'role': 'JobTitle'
        }
      }
    }
  ]);

  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([
    {
      id: '1',
      systemId: '1',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      type: 'success',
      message: 'Успешная синхронизация данных сотрудников',
      recordsAffected: 1247,
      duration: 45
    },
    {
      id: '2',
      systemId: '2',
      timestamp: new Date(Date.now() - 1800000).toISOString(),
      type: 'warning',
      message: 'Частичная синхронизация: 2 записи пропущены из-за ошибок валидации',
      recordsAffected: 890,
      duration: 78
    },
    {
      id: '3',
      systemId: '3',
      timestamp: new Date(Date.now() - 900000).toISOString(),
      type: 'error',
      message: 'Ошибка подключения: Таймаут соединения с сервером Oracle HCM',
      recordsAffected: 0,
      duration: 120
    }
  ]);

  const [activeView, setActiveView] = useState<'dashboard' | 'connectors' | 'mapping' | 'sync' | 'errors'>('dashboard');
  const [selectedSystemId, setSelectedSystemId] = useState<string | null>(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [pendingSyncSystem, setPendingSyncSystem] = useState<string | null>(null);

  // Датамаппинг конфигурация
  const [dataMappings, setDataMappings] = useState<DataMapping[]>([
    {
      id: '1',
      sourceField: 'employeeId',
      targetField: 'КодСотрудника',
      transformation: 'direct',
      isActive: true
    },
    {
      id: '2',
      sourceField: 'fullName',
      targetField: 'ФИО',
      transformation: 'uppercase',
      isActive: true
    },
    {
      id: '3',
      sourceField: 'scheduledHours',
      targetField: 'ПлановыеЧасы',
      transformation: 'number',
      isActive: true
    }
  ]);

  // Расчет статистики
  const calculateStats = (): IntegrationStats => {
    const today = new Date().toISOString().split('T')[0];
    const todayLogs = syncLogs.filter(log => 
      log.timestamp.split('T')[0] === today
    );
    
    return {
      totalSystems: integrationSystems.length,
      activeConnections: integrationSystems.filter(s => s.status === 'connected' || s.status === 'syncing').length,
      syncedToday: todayLogs.filter(l => l.type === 'success').reduce((sum, l) => sum + l.recordsAffected, 0),
      errorsToday: todayLogs.filter(l => l.type === 'error').length,
      avgSyncTime: todayLogs.length > 0 
        ? todayLogs.reduce((sum, l) => sum + l.duration, 0) / todayLogs.length 
        : 0
    };
  };

  const stats = calculateStats();

  // Обработка синхронизации
  const handleSync = (systemId: string) => {
    setPendingSyncSystem(systemId);
    
    setIntegrationSystems(prev => prev.map(system => 
      system.id === systemId 
        ? { ...system, status: 'syncing' }
        : system
    ));

    // Симуляция синхронизации
    setTimeout(() => {
      const success = Math.random() > 0.2;
      
      setIntegrationSystems(prev => prev.map(system => 
        system.id === systemId 
          ? { 
              ...system, 
              status: success ? 'connected' : 'error',
              lastSync: new Date().toISOString(),
              recordsSynced: success ? Math.floor(Math.random() * 1000) + 500 : 0,
              errors: success ? 0 : system.errors + 1
            }
          : system
      ));

      setSyncLogs(prev => [...prev, {
        id: Date.now().toString(),
        systemId,
        timestamp: new Date().toISOString(),
        type: success ? 'success' : 'error',
        message: success 
          ? 'Синхронизация завершена успешно'
          : 'Ошибка синхронизации: Неверные учетные данные',
        recordsAffected: success ? Math.floor(Math.random() * 1000) + 500 : 0,
        duration: Math.floor(Math.random() * 100) + 20
      }]);

      setPendingSyncSystem(null);
    }, 3000);
  };

  // Главная панель мониторинга
  const renderDashboard = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        🔄 Панель интеграций
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
            {stats.activeConnections}
          </div>
          <div style={{ fontSize: '14px', color: '#166534' }}>
            Активные подключения
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#dbeafe',
          borderRadius: '8px',
          border: '1px solid #bfdbfe'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#1e40af' }}>
            {stats.syncedToday.toLocaleString('ru-RU')}
          </div>
          <div style={{ fontSize: '14px', color: '#1e40af' }}>
            Записей синхронизировано
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: stats.errorsToday > 0 ? '#fee2e2' : '#f3f4f6',
          borderRadius: '8px',
          border: `1px solid ${stats.errorsToday > 0 ? '#fecaca' : '#e5e7eb'}`
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: stats.errorsToday > 0 ? '#dc2626' : '#6b7280' }}>
            {stats.errorsToday}
          </div>
          <div style={{ fontSize: '14px', color: stats.errorsToday > 0 ? '#dc2626' : '#6b7280' }}>
            Ошибок сегодня
          </div>
        </div>
        
        <div style={{
          padding: '16px',
          backgroundColor: '#fef3c7',
          borderRadius: '8px',
          border: '1px solid #fde68a'
        }}>
          <div style={{ fontSize: '32px', fontWeight: 'bold', color: '#92400e' }}>
            {stats.avgSyncTime.toFixed(0)}с
          </div>
          <div style={{ fontSize: '14px', color: '#92400e' }}>
            Среднее время синхронизации
          </div>
        </div>
      </div>
      
      {/* Статус систем */}
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px' }}>
        <h3 style={{ fontSize: '18px', fontWeight: '600', marginBottom: '16px', color: '#111827' }}>
          Состояние внешних систем
        </h3>
        
        <div style={{ display: 'grid', gap: '12px' }}>
          {integrationSystems.map(system => (
            <div key={system.id} style={{
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
                  backgroundColor: 
                    system.status === 'connected' ? '#dcfce7' :
                    system.status === 'syncing' ? '#dbeafe' :
                    system.status === 'error' ? '#fee2e2' : '#f3f4f6',
                  borderRadius: '8px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  fontSize: '24px'
                }}>
                  {system.type === '1C_ZUP' ? '1️⃣' : 
                   system.type === 'SAP_HR' ? '🔷' : '🔶'}
                </div>
                
                <div>
                  <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                    {system.name}
                  </div>
                  <div style={{ fontSize: '14px', color: '#6b7280' }}>
                    {system.lastSync ? `Последняя синхронизация: ${new Date(system.lastSync).toLocaleString('ru-RU')}` : 'Не синхронизировано'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#059669', marginTop: '4px' }}>
                    {system.recordsSynced > 0 && `✓ ${system.recordsSynced} записей`}
                    {system.errors > 0 && <span style={{ color: '#dc2626', marginLeft: '8px' }}>⚠️ {system.errors} ошибок</span>}
                  </div>
                </div>
              </div>
              
              <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                <div style={{
                  width: '12px',
                  height: '12px',
                  borderRadius: '50%',
                  backgroundColor: 
                    system.status === 'connected' ? '#10b981' :
                    system.status === 'syncing' ? '#3b82f6' :
                    system.status === 'error' ? '#ef4444' : '#6b7280',
                  animation: system.status === 'syncing' ? 'pulse 2s infinite' : 'none'
                }}></div>
                
                <button
                  onClick={() => handleSync(system.id)}
                  disabled={system.status === 'syncing'}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: system.status === 'syncing' ? '#e5e7eb' : '#3b82f6',
                    color: system.status === 'syncing' ? '#6b7280' : 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    fontWeight: '500',
                    cursor: system.status === 'syncing' ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  {system.status === 'syncing' ? '⏳ Синхронизация...' : '🔄 Синхронизировать'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  // Управление коннекторами
  const renderConnectors = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        🔌 Управление коннекторами
      </h2>
      
      <div style={{ display: 'grid', gap: '24px' }}>
        {integrationSystems.map(system => (
          <div key={system.id} style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            border: '1px solid #e5e7eb',
            boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontSize: '20px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                  {system.name}
                </h3>
                <div style={{ 
                  display: 'inline-block', 
                  padding: '4px 12px', 
                  backgroundColor: 
                    system.status === 'connected' ? '#dcfce7' :
                    system.status === 'error' ? '#fee2e2' : '#f3f4f6',
                  color: 
                    system.status === 'connected' ? '#166534' :
                    system.status === 'error' ? '#dc2626' : '#374151',
                  borderRadius: '16px',
                  fontSize: '12px',
                  fontWeight: '500'
                }}>
                  {system.status === 'connected' ? '✓ Подключено' :
                   system.status === 'error' ? '⚠️ Ошибка' :
                   system.status === 'syncing' ? '🔄 Синхронизация' : '○ Отключено'}
                </div>
              </div>
              
              <button
                onClick={() => {
                  setSelectedSystemId(system.id);
                  setShowConfigModal(true);
                }}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#f3f4f6',
                  color: '#374151',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                ⚙️ Настройки
              </button>
            </div>
            
            <div style={{ 
              backgroundColor: '#f9fafb', 
              borderRadius: '8px', 
              padding: '16px',
              marginBottom: '16px'
            }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', fontSize: '14px' }}>
                <div style={{ color: '#6b7280' }}>Endpoint:</div>
                <div style={{ fontFamily: 'monospace', color: '#111827' }}>{system.config.endpoint}</div>
                
                <div style={{ color: '#6b7280' }}>Интервал синхронизации:</div>
                <div style={{ color: '#111827' }}>{system.config.syncInterval} минут</div>
                
                <div style={{ color: '#6b7280' }}>Следующая синхронизация:</div>
                <div style={{ color: '#111827' }}>
                  {system.nextSync ? new Date(system.nextSync).toLocaleString('ru-RU') : 'Не запланирована'}
                </div>
              </div>
            </div>
            
            <div style={{ display: 'flex', gap: '12px' }}>
              <button style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                📊 Тестировать подключение
              </button>
              
              <button style={{
                flex: 1,
                padding: '10px',
                backgroundColor: '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '14px',
                fontWeight: '500',
                cursor: 'pointer'
              }}>
                🔌 Отключить
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Конфигурация маппинга данных
  const renderDataMapping = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        🔗 Маппинг данных
      </h2>
      
      <div style={{ backgroundColor: '#f9fafb', borderRadius: '8px', padding: '16px', marginBottom: '24px' }}>
        <p style={{ fontSize: '14px', color: '#6b7280' }}>
          Настройте соответствие полей между системой WFM и внешними системами. 
          Это обеспечит корректную синхронизацию данных.
        </p>
      </div>
      
      <div style={{ backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f9fafb' }}>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Поле WFM</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Поле внешней системы</th>
              <th style={{ padding: '12px', textAlign: 'left', borderBottom: '1px solid #e5e7eb' }}>Преобразование</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Статус</th>
              <th style={{ padding: '12px', textAlign: 'center', borderBottom: '1px solid #e5e7eb' }}>Действия</th>
            </tr>
          </thead>
          <tbody>
            {dataMappings.map((mapping, index) => (
              <tr key={mapping.id} style={{ borderBottom: '1px solid #e5e7eb' }}>
                <td style={{ padding: '12px' }}>
                  <code style={{ 
                    backgroundColor: '#f3f4f6', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    {mapping.sourceField}
                  </code>
                </td>
                <td style={{ padding: '12px' }}>
                  <code style={{ 
                    backgroundColor: '#e0e7ff', 
                    padding: '4px 8px', 
                    borderRadius: '4px',
                    fontSize: '13px'
                  }}>
                    {mapping.targetField}
                  </code>
                </td>
                <td style={{ padding: '12px' }}>
                  <select style={{
                    padding: '6px 12px',
                    border: '1px solid #e5e7eb',
                    borderRadius: '4px',
                    fontSize: '14px'
                  }}>
                    <option value="direct">Прямое копирование</option>
                    <option value="uppercase">В верхний регистр</option>
                    <option value="lowercase">В нижний регистр</option>
                    <option value="number">Числовое значение</option>
                    <option value="date">Формат даты</option>
                  </select>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <div style={{
                    display: 'inline-block',
                    width: '8px',
                    height: '8px',
                    borderRadius: '50%',
                    backgroundColor: mapping.isActive ? '#10b981' : '#6b7280'
                  }}></div>
                </td>
                <td style={{ padding: '12px', textAlign: 'center' }}>
                  <button style={{
                    padding: '4px 8px',
                    backgroundColor: 'transparent',
                    color: '#dc2626',
                    border: 'none',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}>
                    Удалить
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <div style={{ padding: '16px', borderTop: '1px solid #e5e7eb' }}>
          <button style={{
            padding: '8px 16px',
            backgroundColor: '#3b82f6',
            color: 'white',
            border: 'none',
            borderRadius: '6px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            + Добавить маппинг
          </button>
        </div>
      </div>
    </div>
  );

  // Монитор синхронизации
  const renderSyncMonitor = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        📊 Монитор синхронизации
      </h2>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {syncLogs.map(log => {
          const system = integrationSystems.find(s => s.id === log.systemId);
          
          return (
            <div key={log.id} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              border: `1px solid ${
                log.type === 'success' ? '#bbf7d0' :
                log.type === 'error' ? '#fecaca' : '#fde68a'
              }`,
              borderLeft: `4px solid ${
                log.type === 'success' ? '#10b981' :
                log.type === 'error' ? '#ef4444' : '#f59e0b'
              }`
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <span style={{ fontSize: '20px' }}>
                      {log.type === 'success' ? '✅' :
                       log.type === 'error' ? '❌' : '⚠️'}
                    </span>
                    <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827' }}>
                      {system?.name}
                    </h4>
                    <span style={{ 
                      fontSize: '12px', 
                      color: '#6b7280',
                      backgroundColor: '#f3f4f6',
                      padding: '2px 8px',
                      borderRadius: '12px'
                    }}>
                      {new Date(log.timestamp).toLocaleString('ru-RU')}
                    </span>
                  </div>
                  
                  <p style={{ fontSize: '14px', color: '#374151', marginBottom: '8px' }}>
                    {log.message}
                  </p>
                  
                  <div style={{ display: 'flex', gap: '24px', fontSize: '13px', color: '#6b7280' }}>
                    <span>📝 Записей: {log.recordsAffected}</span>
                    <span>⏱️ Время: {log.duration}с</span>
                  </div>
                </div>
                
                {log.type === 'error' && (
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#fee2e2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    🔄 Повторить
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Панель ошибок
  const renderErrorDashboard = () => (
    <div style={{ padding: '24px' }}>
      <h2 style={{ fontSize: '24px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
        ⚠️ Панель ошибок
      </h2>
      
      <div style={{ 
        backgroundColor: '#fee2e2', 
        borderRadius: '8px', 
        padding: '16px', 
        marginBottom: '24px',
        border: '1px solid #fecaca'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '600', color: '#dc2626' }}>
              Обнаружено {stats.errorsToday} критических ошибок
            </div>
            <div style={{ fontSize: '14px', color: '#7f1d1d', marginTop: '4px' }}>
              Требуется немедленное внимание для восстановления синхронизации
            </div>
          </div>
          
          <button style={{
            padding: '10px 20px',
            backgroundColor: '#dc2626',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer'
          }}>
            🔧 Исправить все
          </button>
        </div>
      </div>
      
      <div style={{ display: 'grid', gap: '16px' }}>
        {syncLogs.filter(log => log.type === 'error').map(log => {
          const system = integrationSystems.find(s => s.id === log.systemId);
          
          return (
            <div key={log.id} style={{
              backgroundColor: 'white',
              borderRadius: '8px',
              padding: '16px',
              border: '1px solid #e5e7eb',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div>
                  <h4 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>
                    {system?.name} - Ошибка синхронизации
                  </h4>
                  <p style={{ fontSize: '14px', color: '#dc2626', marginBottom: '8px' }}>
                    {log.message}
                  </p>
                  <div style={{ fontSize: '13px', color: '#6b7280' }}>
                    Время: {new Date(log.timestamp).toLocaleString('ru-RU')}
                  </div>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#fef3c7',
                    color: '#92400e',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    📋 Детали
                  </button>
                  
                  <button style={{
                    padding: '6px 12px',
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}>
                    ✓ Решено
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );

  // Модальное окно конфигурации
  const renderConfigModal = () => showConfigModal && selectedSystemId && (
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
        width: '600px',
        maxHeight: '80vh',
        overflow: 'auto'
      }}>
        <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '24px', color: '#111827' }}>
          ⚙️ Настройки интеграции
        </h3>
        
        <div style={{ display: 'grid', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Название системы
            </label>
            <input 
              type="text" 
              value={integrationSystems.find(s => s.id === selectedSystemId)?.name}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Endpoint URL
            </label>
            <input 
              type="text" 
              value={integrationSystems.find(s => s.id === selectedSystemId)?.config.endpoint}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px',
                fontFamily: 'monospace'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Интервал синхронизации (минуты)
            </label>
            <input 
              type="number" 
              value={integrationSystems.find(s => s.id === selectedSystemId)?.config.syncInterval}
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
          
          <div>
            <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', color: '#374151', marginBottom: '4px' }}>
              Учетные данные
            </label>
            <input 
              type="password" 
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '8px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            />
          </div>
        </div>
        
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '24px' }}>
          <button
            onClick={() => {
              setShowConfigModal(false);
              setSelectedSystemId(null);
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
            onClick={() => {
              setShowConfigModal(false);
              setSelectedSystemId(null);
              console.log('✅ Настройки сохранены');
            }}
            style={{
              padding: '10px 20px',
              backgroundColor: '#3b82f6',
              color: 'white',
              border: 'none',
              borderRadius: '6px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Сохранить
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
            { id: 'dashboard', label: '🔄 Панель мониторинга' },
            { id: 'connectors', label: '🔌 Коннекторы' },
            { id: 'mapping', label: '🔗 Маппинг данных' },
            { id: 'sync', label: '📊 Синхронизация' },
            { id: 'errors', label: '⚠️ Ошибки' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              style={{
                padding: '16px 0',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeView === tab.id ? '2px solid #3b82f6' : '2px solid transparent',
                color: activeView === tab.id ? '#3b82f6' : '#6b7280',
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
        {activeView === 'dashboard' && renderDashboard()}
        {activeView === 'connectors' && renderConnectors()}
        {activeView === 'mapping' && renderDataMapping()}
        {activeView === 'sync' && renderSyncMonitor()}
        {activeView === 'errors' && renderErrorDashboard()}
      </div>
      
      {/* Модальные окна */}
      {renderConfigModal()}
      
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
          Система интеграции WFM • {new Date().toLocaleDateString('ru-RU')}
        </span>
        <div style={{ display: 'flex', gap: '24px' }}>
          <span style={{ color: '#6b7280' }}>
            Активно: <span style={{ fontWeight: '500', color: '#059669' }}>{stats.activeConnections}/{stats.totalSystems}</span>
          </span>
          <span style={{ color: '#6b7280' }}>
            Синхронизировано: <span style={{ fontWeight: '500' }}>{stats.syncedToday.toLocaleString('ru-RU')}</span>
          </span>
          <span style={{ color: '#6b7280' }}>
            Статус: <span style={{ fontWeight: '500', color: stats.errorsToday > 0 ? '#dc2626' : '#059669' }}>
              {stats.errorsToday > 0 ? 'Требует внимания' : 'Работает'}
            </span>
          </span>
        </div>
      </div>
      
      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
        
        @keyframes progress {
          from { width: 0; }
          to { width: 60%; }
        }
      `}</style>
    </div>
  );
};

export default IntegrationDashboardUI;