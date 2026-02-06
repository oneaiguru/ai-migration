import React, { useState } from 'react';

// Reference Data Types
export interface WorkRule {
  id: string;
  name: string;
  description: string;
  type: 'working_hours' | 'break_schedule' | 'overtime_rules' | 'weekend_rules';
  conditions: Record<string, any>;
  isActive: boolean;
  createdAt: string;
}

export interface EventType {
  id: string;
  name: string;
  description: string;
  category: 'meeting' | 'training' | 'system_maintenance' | 'holiday' | 'special';
  duration: number;
  color: string;
  isActive: boolean;
  createdAt: string;
}

export interface VacationScheme {
  id: string;
  name: string;
  description: string;
  yearlyDays: number;
  maxConsecutiveDays: number;
  minAdvanceNotice: number;
  carryOverDays: number;
  isActive: boolean;
  createdAt: string;
}

export interface AbsenceReason {
  id: string;
  name: string;
  description: string;
  category: 'vacation' | 'sick_leave' | 'personal' | 'training' | 'other';
  requiresApproval: boolean;
  maxDuration: number;
  isActive: boolean;
  createdAt: string;
}

export interface ReferenceDataConfig {
  workRules: WorkRule[];
  eventTypes: EventType[];
  vacationSchemes: VacationScheme[];
  absenceReasons: AbsenceReason[];
}

const ReferenceDataConfigurationUI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'work_rules' | 'events' | 'vacation' | 'absence'>('work_rules');
  
  // Work Rules State
  const [workRules, setWorkRules] = useState<WorkRule[]>([
    {
      id: '1',
      name: 'Стандартные рабочие часы',
      description: 'Основные правила рабочего времени для контакт-центра',
      type: 'working_hours',
      conditions: { dailyHours: 8, weeklyHours: 40, startTime: '09:00', endTime: '18:00' },
      isActive: true,
      createdAt: '2024-07-10',
    },
    {
      id: '2',
      name: 'Перерывы и обеды',
      description: 'Правила для перерывов и обеденного времени',
      type: 'break_schedule',
      conditions: { lunchBreak: 60, coffeeBreaks: 2, breakDuration: 15 },
      isActive: true,
      createdAt: '2024-07-10',
    },
  ]);

  // Event Types State
  const [eventTypes, setEventTypes] = useState<EventType[]>([
    {
      id: '1',
      name: 'Еженедельное совещание',
      description: 'Регулярное совещание команды',
      category: 'meeting',
      duration: 60,
      color: '#3B82F6',
      isActive: true,
      createdAt: '2024-07-10',
    },
    {
      id: '2',
      name: 'Обучение новых сотрудников',
      description: 'Программа адаптации для новых операторов',
      category: 'training',
      duration: 240,
      color: '#10B981',
      isActive: true,
      createdAt: '2024-07-10',
    },
  ]);

  // Vacation Schemes State
  const [vacationSchemes, setVacationSchemes] = useState<VacationScheme[]>([
    {
      id: '1',
      name: 'Базовый отпуск',
      description: 'Стандартная схема отпусков для всех сотрудников',
      yearlyDays: 28,
      maxConsecutiveDays: 21,
      minAdvanceNotice: 14,
      carryOverDays: 5,
      isActive: true,
      createdAt: '2024-07-10',
    },
    {
      id: '2',
      name: 'Расширенный отпуск',
      description: 'Схема для сотрудников со стажем более 5 лет',
      yearlyDays: 35,
      maxConsecutiveDays: 28,
      minAdvanceNotice: 21,
      carryOverDays: 7,
      isActive: true,
      createdAt: '2024-07-10',
    },
  ]);

  // Absence Reasons State
  const [absenceReasons, setAbsenceReasons] = useState<AbsenceReason[]>([
    {
      id: '1',
      name: 'Больничный лист',
      description: 'Отсутствие по болезни с медицинским подтверждением',
      category: 'sick_leave',
      requiresApproval: false,
      maxDuration: 30,
      isActive: true,
      createdAt: '2024-07-10',
    },
    {
      id: '2',
      name: 'Отпуск по семейным обстоятельствам',
      description: 'Краткосрочный отпуск для решения семейных вопросов',
      category: 'personal',
      requiresApproval: true,
      maxDuration: 3,
      isActive: true,
      createdAt: '2024-07-10',
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [showDetails, setShowDetails] = useState<string | null>(null);

  // Form States
  const [workRuleForm, setWorkRuleForm] = useState({
    name: '',
    description: '',
    type: 'working_hours' as WorkRule['type'],
    dailyHours: 8,
    weeklyHours: 40,
    startTime: '09:00',
    endTime: '18:00',
  });

  const [eventForm, setEventForm] = useState({
    name: '',
    description: '',
    category: 'meeting' as EventType['category'],
    duration: 60,
    color: '#3B82F6',
  });

  const [vacationForm, setVacationForm] = useState({
    name: '',
    description: '',
    yearlyDays: 28,
    maxConsecutiveDays: 21,
    minAdvanceNotice: 14,
    carryOverDays: 5,
  });

  const [absenceForm, setAbsenceForm] = useState({
    name: '',
    description: '',
    category: 'personal' as AbsenceReason['category'],
    requiresApproval: true,
    maxDuration: 1,
  });

  // CRUD Operations
  const handleCreateWorkRule = () => {
    const newWorkRule: WorkRule = {
      id: Date.now().toString(),
      name: workRuleForm.name,
      description: workRuleForm.description,
      type: workRuleForm.type,
      conditions: {
        dailyHours: workRuleForm.dailyHours,
        weeklyHours: workRuleForm.weeklyHours,
        startTime: workRuleForm.startTime,
        endTime: workRuleForm.endTime,
      },
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setWorkRules(prev => [...prev, newWorkRule]);
    setWorkRuleForm({
      name: '',
      description: '',
      type: 'working_hours',
      dailyHours: 8,
      weeklyHours: 40,
      startTime: '09:00',
      endTime: '18:00',
    });
    setIsCreating(false);
    console.log('✅ Создано правило работы:', newWorkRule.name);
  };

  const handleCreateEvent = () => {
    const newEvent: EventType = {
      id: Date.now().toString(),
      name: eventForm.name,
      description: eventForm.description,
      category: eventForm.category,
      duration: eventForm.duration,
      color: eventForm.color,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setEventTypes(prev => [...prev, newEvent]);
    setEventForm({
      name: '',
      description: '',
      category: 'meeting',
      duration: 60,
      color: '#3B82F6',
    });
    setIsCreating(false);
    console.log('✅ Создан тип события:', newEvent.name);
  };

  const handleCreateVacation = () => {
    const newVacation: VacationScheme = {
      id: Date.now().toString(),
      name: vacationForm.name,
      description: vacationForm.description,
      yearlyDays: vacationForm.yearlyDays,
      maxConsecutiveDays: vacationForm.maxConsecutiveDays,
      minAdvanceNotice: vacationForm.minAdvanceNotice,
      carryOverDays: vacationForm.carryOverDays,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setVacationSchemes(prev => [...prev, newVacation]);
    setVacationForm({
      name: '',
      description: '',
      yearlyDays: 28,
      maxConsecutiveDays: 21,
      minAdvanceNotice: 14,
      carryOverDays: 5,
    });
    setIsCreating(false);
    console.log('✅ Создана схема отпуска:', newVacation.name);
  };

  const handleCreateAbsence = () => {
    const newAbsence: AbsenceReason = {
      id: Date.now().toString(),
      name: absenceForm.name,
      description: absenceForm.description,
      category: absenceForm.category,
      requiresApproval: absenceForm.requiresApproval,
      maxDuration: absenceForm.maxDuration,
      isActive: true,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAbsenceReasons(prev => [...prev, newAbsence]);
    setAbsenceForm({
      name: '',
      description: '',
      category: 'personal',
      requiresApproval: true,
      maxDuration: 1,
    });
    setIsCreating(false);
    console.log('✅ Создана причина отсутствия:', newAbsence.name);
  };

  const toggleItemStatus = (id: string) => {
    switch (activeTab) {
      case 'work_rules':
        setWorkRules(prev => prev.map(rule => 
          rule.id === id ? { ...rule, isActive: !rule.isActive } : rule
        ));
        break;
      case 'events':
        setEventTypes(prev => prev.map(event => 
          event.id === id ? { ...event, isActive: !event.isActive } : event
        ));
        break;
      case 'vacation':
        setVacationSchemes(prev => prev.map(scheme => 
          scheme.id === id ? { ...scheme, isActive: !scheme.isActive } : scheme
        ));
        break;
      case 'absence':
        setAbsenceReasons(prev => prev.map(reason => 
          reason.id === id ? { ...reason, isActive: !reason.isActive } : reason
        ));
        break;
    }
  };

  const deleteItem = (id: string) => {
    switch (activeTab) {
      case 'work_rules':
        setWorkRules(prev => prev.filter(rule => rule.id !== id));
        break;
      case 'events':
        setEventTypes(prev => prev.filter(event => event.id !== id));
        break;
      case 'vacation':
        setVacationSchemes(prev => prev.filter(scheme => scheme.id !== id));
        break;
      case 'absence':
        setAbsenceReasons(prev => prev.filter(reason => reason.id !== id));
        break;
    }
    console.log('🗑️ Элемент удален');
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'working_hours': return '⏰';
      case 'break_schedule': return '☕';
      case 'overtime_rules': return '⏳';
      case 'weekend_rules': return '📅';
      case 'meeting': return '🤝';
      case 'training': return '📚';
      case 'system_maintenance': return '🔧';
      case 'holiday': return '🎉';
      case 'special': return '⭐';
      case 'vacation': return '🏖️';
      case 'sick_leave': return '🏥';
      case 'personal': return '👤';
      case 'other': return '📋';
      default: return '📋';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'working_hours': return 'Рабочие часы';
      case 'break_schedule': return 'Перерывы';
      case 'overtime_rules': return 'Сверхурочные';
      case 'weekend_rules': return 'Выходные';
      case 'meeting': return 'Совещания';
      case 'training': return 'Обучение';
      case 'system_maintenance': return 'Техническое обслуживание';
      case 'holiday': return 'Праздники';
      case 'special': return 'Специальные';
      case 'vacation': return 'Отпуск';
      case 'sick_leave': return 'Больничный';
      case 'personal': return 'Личные';
      case 'other': return 'Другое';
      default: return 'Неизвестно';
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'work_rules': return 'Правила работы';
      case 'events': return 'Управление событиями';
      case 'vacation': return 'Схемы отпусков';
      case 'absence': return 'Причины отсутствия';
      default: return 'Справочные данные';
    }
  };

  const getTabData = () => {
    switch (activeTab) {
      case 'work_rules': return workRules;
      case 'events': return eventTypes;
      case 'vacation': return vacationSchemes;
      case 'absence': return absenceReasons;
      default: return [];
    }
  };

  const handleCreate = () => {
    switch (activeTab) {
      case 'work_rules': handleCreateWorkRule(); break;
      case 'events': handleCreateEvent(); break;
      case 'vacation': handleCreateVacation(); break;
      case 'absence': handleCreateAbsence(); break;
    }
  };

  const renderCreateForm = () => {
    switch (activeTab) {
      case 'work_rules':
        return (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Название правила
              </label>
              <input
                type="text"
                value={workRuleForm.name}
                onChange={(e) => setWorkRuleForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название правила"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Описание
              </label>
              <textarea
                value={workRuleForm.description}
                onChange={(e) => setWorkRuleForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите правило работы"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Тип правила
              </label>
              <select
                value={workRuleForm.type}
                onChange={(e) => setWorkRuleForm(prev => ({ ...prev, type: e.target.value as WorkRule['type'] }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="working_hours">⏰ Рабочие часы</option>
                <option value="break_schedule">☕ Перерывы</option>
                <option value="overtime_rules">⏳ Сверхурочные</option>
                <option value="weekend_rules">📅 Выходные</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Часов в день
                </label>
                <input
                  type="number"
                  min="1"
                  max="24"
                  value={workRuleForm.dailyHours}
                  onChange={(e) => setWorkRuleForm(prev => ({ ...prev, dailyHours: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Часов в неделю
                </label>
                <input
                  type="number"
                  min="1"
                  max="168"
                  value={workRuleForm.weeklyHours}
                  onChange={(e) => setWorkRuleForm(prev => ({ ...prev, weeklyHours: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
            </div>
          </>
        );
      
      case 'events':
        return (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Название события
              </label>
              <input
                type="text"
                value={eventForm.name}
                onChange={(e) => setEventForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название события"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Описание
              </label>
              <textarea
                value={eventForm.description}
                onChange={(e) => setEventForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите событие"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Категория
              </label>
              <select
                value={eventForm.category}
                onChange={(e) => setEventForm(prev => ({ ...prev, category: e.target.value as EventType['category'] }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="meeting">🤝 Совещания</option>
                <option value="training">📚 Обучение</option>
                <option value="system_maintenance">🔧 Техническое обслуживание</option>
                <option value="holiday">🎉 Праздники</option>
                <option value="special">⭐ Специальные</option>
              </select>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Длительность (минуты)
              </label>
              <input
                type="number"
                min="1"
                value={eventForm.duration}
                onChange={(e) => setEventForm(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Цвет
              </label>
              <input
                type="color"
                value={eventForm.color}
                onChange={(e) => setEventForm(prev => ({ ...prev, color: e.target.value }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
          </>
        );
      
      case 'vacation':
        return (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Название схемы
              </label>
              <input
                type="text"
                value={vacationForm.name}
                onChange={(e) => setVacationForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название схемы отпуска"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Описание
              </label>
              <textarea
                value={vacationForm.description}
                onChange={(e) => setVacationForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите схему отпуска"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Дней в году
                </label>
                <input
                  type="number"
                  min="1"
                  value={vacationForm.yearlyDays}
                  onChange={(e) => setVacationForm(prev => ({ ...prev, yearlyDays: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Макс. подряд
                </label>
                <input
                  type="number"
                  min="1"
                  value={vacationForm.maxConsecutiveDays}
                  onChange={(e) => setVacationForm(prev => ({ ...prev, maxConsecutiveDays: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
            </div>
          </>
        );
      
      case 'absence':
        return (
          <>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Название причины
              </label>
              <input
                type="text"
                value={absenceForm.name}
                onChange={(e) => setAbsenceForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название причины отсутствия"
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Описание
              </label>
              <textarea
                value={absenceForm.description}
                onChange={(e) => setAbsenceForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите причину отсутствия"
                rows={3}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px', resize: 'vertical' }}
              />
            </div>
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                Категория
              </label>
              <select
                value={absenceForm.category}
                onChange={(e) => setAbsenceForm(prev => ({ ...prev, category: e.target.value as AbsenceReason['category'] }))}
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
              >
                <option value="vacation">🏖️ Отпуск</option>
                <option value="sick_leave">🏥 Больничный</option>
                <option value="personal">👤 Личные</option>
                <option value="training">📚 Обучение</option>
                <option value="other">📋 Другое</option>
              </select>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '14px', fontWeight: '500', marginBottom: '4px', color: '#374151' }}>
                  Макс. дней
                </label>
                <input
                  type="number"
                  min="1"
                  value={absenceForm.maxDuration}
                  onChange={(e) => setAbsenceForm(prev => ({ ...prev, maxDuration: parseInt(e.target.value) }))}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #d1d5db', borderRadius: '6px', fontSize: '14px' }}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="checkbox"
                  checked={absenceForm.requiresApproval}
                  onChange={(e) => setAbsenceForm(prev => ({ ...prev, requiresApproval: e.target.checked }))}
                  id="requiresApproval"
                />
                <label htmlFor="requiresApproval" style={{ fontSize: '14px', color: '#374151' }}>
                  Требует согласования
                </label>
              </div>
            </div>
          </>
        );
      
      default:
        return null;
    }
  };

  const renderItemDetails = (item: any) => {
    switch (activeTab) {
      case 'work_rules':
        return (
          <div style={{ fontSize: '12px', color: '#6b7280' }}>
            Условия: {JSON.stringify(item.conditions)}
          </div>
        );
      case 'events':
        return (
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '16px' }}>
            <span>Длительность: {item.duration} мин</span>
            <span>Цвет: <span style={{ display: 'inline-block', width: '12px', height: '12px', backgroundColor: item.color, borderRadius: '2px', marginLeft: '4px' }}></span></span>
          </div>
        );
      case 'vacation':
        return (
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '16px' }}>
            <span>Дней в году: {item.yearlyDays}</span>
            <span>Макс. подряд: {item.maxConsecutiveDays}</span>
            <span>Переносимых: {item.carryOverDays}</span>
          </div>
        );
      case 'absence':
        return (
          <div style={{ fontSize: '12px', color: '#6b7280', display: 'flex', gap: '16px' }}>
            <span>Макс. дней: {item.maxDuration}</span>
            <span>Согласование: {item.requiresApproval ? 'Да' : 'Нет'}</span>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      padding: '24px'
    }}>
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0 
          }}>
            Управление справочными данными
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Настройка правил работы, событий, отпусков и причин отсутствия
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          ➕ Создать {activeTab === 'work_rules' ? 'правило' : activeTab === 'events' ? 'событие' : activeTab === 'vacation' ? 'схему' : 'причину'}
        </button>
      </div>

      {/* Navigation Tabs */}
      <div style={{ 
        display: 'flex', 
        gap: '8px', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb'
      }}>
        {[
          { key: 'work_rules', label: 'Правила работы', icon: '⏰' },
          { key: 'events', label: 'События', icon: '🎯' },
          { key: 'vacation', label: 'Отпуска', icon: '🏖️' },
          { key: 'absence', label: 'Отсутствия', icon: '📋' }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            style={{
              padding: '12px 20px',
              backgroundColor: activeTab === tab.key ? '#2563eb' : 'transparent',
              color: activeTab === tab.key ? 'white' : '#6b7280',
              border: 'none',
              borderRadius: '8px 8px 0 0',
              fontSize: '14px',
              fontWeight: '500',
              cursor: 'pointer',
              borderBottom: activeTab === tab.key ? '2px solid #2563eb' : '2px solid transparent'
            }}
          >
            {tab.icon} {tab.label}
          </button>
        ))}
      </div>

      {/* Items List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {getTabData().map((item: any) => (
          <div
            key={item.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              marginBottom: '16px',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Item Header */}
            <div style={{ 
              padding: '20px', 
              borderBottom: showDetails === item.id ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: 0 
                    }}>
                      {item.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: item.isActive ? '#dcfce7' : '#fef3c7',
                      color: item.isActive ? '#166534' : '#92400e'
                    }}>
                      {item.isActive ? 'Активно' : 'Неактивно'}
                    </span>
                  </div>
                  
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: '0 0 8px 0' 
                  }}>
                    {item.description}
                  </p>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af',
                    display: 'flex',
                    gap: '16px',
                    alignItems: 'center'
                  }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '16px' }}>
                        {getCategoryIcon(item.type || item.category)}
                      </span>
                      <span style={{ 
                        backgroundColor: '#f3f4f6',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {getCategoryLabel(item.type || item.category)}
                      </span>
                    </span>
                    <span>📅 Создано: {item.createdAt}</span>
                  </div>
                  
                  <div style={{ marginTop: '8px' }}>
                    {renderItemDetails(item)}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowDetails(showDetails === item.id ? null : item.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {showDetails === item.id ? '👁️ Скрыть' : '👁️ Подробнее'}
                  </button>
                  
                  <button
                    onClick={() => toggleItemStatus(item.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: item.isActive ? '#fef3c7' : '#dcfce7',
                      color: item.isActive ? '#92400e' : '#166534',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {item.isActive ? '⏸️' : '▶️'}
                  </button>
                  
                  <button
                    onClick={() => deleteItem(item.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#fef2f2',
                      color: '#dc2626',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            </div>

            {/* Item Details */}
            {showDetails === item.id && (
              <div style={{ padding: '20px', backgroundColor: '#f9fafb' }}>
                <h4 style={{ 
                  fontSize: '16px', 
                  fontWeight: '500', 
                  color: '#111827',
                  margin: '0 0 12px 0'
                }}>
                  Детальная информация
                </h4>
                <div style={{ fontSize: '14px', color: '#374151' }}>
                  {activeTab === 'work_rules' && (
                    <div>
                      <p><strong>Тип:</strong> {getCategoryLabel(item.type)}</p>
                      <p><strong>Условия:</strong></p>
                      <ul style={{ paddingLeft: '20px' }}>
                        {Object.entries(item.conditions).map(([key, value]) => (
                          <li key={key}>{key}: {String(value)}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {activeTab === 'events' && (
                    <div>
                      <p><strong>Категория:</strong> {getCategoryLabel(item.category)}</p>
                      <p><strong>Длительность:</strong> {item.duration} минут</p>
                      <p><strong>Цвет:</strong> {item.color}</p>
                    </div>
                  )}
                  {activeTab === 'vacation' && (
                    <div>
                      <p><strong>Дней в году:</strong> {item.yearlyDays}</p>
                      <p><strong>Максимум подряд:</strong> {item.maxConsecutiveDays}</p>
                      <p><strong>Минимальное уведомление:</strong> {item.minAdvanceNotice} дней</p>
                      <p><strong>Переносимых дней:</strong> {item.carryOverDays}</p>
                    </div>
                  )}
                  {activeTab === 'absence' && (
                    <div>
                      <p><strong>Категория:</strong> {getCategoryLabel(item.category)}</p>
                      <p><strong>Требует согласования:</strong> {item.requiresApproval ? 'Да' : 'Нет'}</p>
                      <p><strong>Максимальная длительность:</strong> {item.maxDuration} дней</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Item Modal */}
      {isCreating && (
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
            padding: '24px',
            width: '400px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#111827'
            }}>
              Создать {getTabTitle().toLowerCase().slice(0, -1)}у
            </h3>

            {renderCreateForm()}

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCreating(false)}
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
                onClick={handleCreate}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#2563eb',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}
              >
                Создать
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Footer */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <span>
          Всего в разделе "{getTabTitle()}": <strong>{getTabData().length}</strong>
        </span>
        <span>
          Активных: <strong>{getTabData().filter((item: any) => item.isActive).length}</strong>
        </span>
      </div>
    </div>
  );
};

export default ReferenceDataConfigurationUI;