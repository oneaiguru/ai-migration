import React, { useState, useEffect } from 'react';

interface OfferFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (offerData: OfferFormData) => void;
  employeeId: string;
  editOffer?: OfferFormData;
}

interface OfferFormData {
  id?: string;
  shiftId: string;
  shiftDetails: {
    date: string;
    startTime: string;
    endTime: string;
    type: 'regular' | 'overtime' | 'training' | 'night' | 'holiday';
    location: string;
    description?: string;
    duration: number;
  };
  reason: string;
  wantedInReturn: string;
  exchangeType: 'any_shift' | 'specific_date' | 'specific_shift' | 'flexible';
  urgency: 'low' | 'normal' | 'high';
  expirationDays: number;
  preferredSkills: string[];
  allowedTeams: string[];
  additionalNotes: string;
  autoAcceptRules: {
    enabled: boolean;
    sameShiftType: boolean;
    sameDuration: boolean;
    preferredTeams: boolean;
  };
}

interface EmployeeShift {
  id: string;
  date: Date;
  startTime: string;
  endTime: string;
  type: 'regular' | 'overtime' | 'training' | 'night' | 'holiday';
  duration: number;
  location: string;
  description?: string;
  canExchange: boolean;
}

const OfferForm: React.FC<OfferFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  employeeId,
  editOffer
}) => {
  const [formData, setFormData] = useState<OfferFormData>({
    shiftId: '',
    shiftDetails: {
      date: '',
      startTime: '',
      endTime: '',
      type: 'regular',
      location: '',
      duration: 8
    },
    reason: '',
    wantedInReturn: '',
    exchangeType: 'flexible',
    urgency: 'normal',
    expirationDays: 7,
    preferredSkills: [],
    allowedTeams: [],
    additionalNotes: '',
    autoAcceptRules: {
      enabled: false,
      sameShiftType: false,
      sameDuration: false,
      preferredTeams: false
    }
  });

  const [availableShifts, setAvailableShifts] = useState<EmployeeShift[]>([]);
  const [currentStep, setCurrentStep] = useState(1);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  const totalSteps = 3;

  const allTeams = [
    'Поддержка клиентов',
    'Техническая поддержка',
    'Продажи',
    'Бэк-офис',
    'Супервайзеры',
    'Качество'
  ];

  const allSkills = [
    'Телефонные продажи',
    'Техническая поддержка',
    'Работа с жалобами',
    'Обучение сотрудников',
    'Английский язык',
    'Работа с CRM',
    'Аналитика данных'
  ];

  // Load employee's available shifts
  useEffect(() => {
    if (isOpen) {
      loadAvailableShifts();
    }
  }, [isOpen, employeeId]);

  // Initialize form with edit data
  useEffect(() => {
    if (editOffer) {
      setFormData(editOffer);
    } else {
      // Reset form for new offer
      setFormData({
        shiftId: '',
        shiftDetails: {
          date: '',
          startTime: '',
          endTime: '',
          type: 'regular',
          location: '',
          duration: 8
        },
        reason: '',
        wantedInReturn: '',
        exchangeType: 'flexible',
        urgency: 'normal',
        expirationDays: 7,
        preferredSkills: [],
        allowedTeams: [],
        additionalNotes: '',
        autoAcceptRules: {
          enabled: false,
          sameShiftType: false,
          sameDuration: false,
          preferredTeams: false
        }
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [editOffer, isOpen]);

  const loadAvailableShifts = async () => {
    setLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock employee shifts
    const mockShifts: EmployeeShift[] = [
      {
        id: 'shift-1',
        date: new Date('2025-06-15'),
        startTime: '08:00',
        endTime: '17:00',
        type: 'regular',
        duration: 8,
        location: 'Офис центр',
        description: 'Обычная рабочая смена',
        canExchange: true
      },
      {
        id: 'shift-2',
        date: new Date('2025-06-18'),
        startTime: '14:00',
        endTime: '23:00',
        type: 'regular',
        duration: 8,
        location: 'Офис центр',
        canExchange: true
      },
      {
        id: 'shift-3',
        date: new Date('2025-06-20'),
        startTime: '09:00',
        endTime: '18:00',
        type: 'training',
        duration: 8,
        location: 'Учебный центр',
        description: 'Тренинг по продажам',
        canExchange: true
      },
      {
        id: 'shift-4',
        date: new Date('2025-06-22'),
        startTime: '23:00',
        endTime: '08:00',
        type: 'night',
        duration: 8,
        location: 'Офис центр',
        canExchange: true
      },
      {
        id: 'shift-5',
        date: new Date('2025-06-25'),
        startTime: '10:00',
        endTime: '20:00',
        type: 'overtime',
        duration: 10,
        location: 'Офис центр',
        description: 'Сверхурочная смена',
        canExchange: true
      }
    ];
    
    // Filter out past shifts and non-exchangeable ones
    const futureShifts = mockShifts.filter(shift => 
      shift.date > new Date() && shift.canExchange
    );
    
    setAvailableShifts(futureShifts);
    setLoading(false);
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    
    switch (step) {
      case 1:
        if (!formData.shiftId) {
          newErrors.shiftId = 'Выберите смену для обмена';
        }
        break;
        
      case 2:
        if (!formData.reason.trim()) {
          newErrors.reason = 'Укажите причину обмена';
        } else if (formData.reason.trim().length < 10) {
          newErrors.reason = 'Причина должна содержать минимум 10 символов';
        }
        
        if (!formData.wantedInReturn.trim()) {
          newErrors.wantedInReturn = 'Укажите, что хотите получить взамен';
        }
        
        if (formData.exchangeType === 'specific_date' && !formData.additionalNotes.includes('дата')) {
          newErrors.additionalNotes = 'Укажите конкретную дату в дополнительных заметках';
        }
        break;
        
      case 3:
        if (formData.expirationDays < 1 || formData.expirationDays > 30) {
          newErrors.expirationDays = 'Срок действия должен быть от 1 до 30 дней';
        }
        break;
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      if (currentStep < totalSteps) {
        setCurrentStep(currentStep + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
      setErrors({});
    }
  };

  const handleShiftSelect = (shiftId: string) => {
    const selectedShift = availableShifts.find(s => s.id === shiftId);
    if (selectedShift) {
      setFormData(prev => ({
        ...prev,
        shiftId,
        shiftDetails: {
          date: selectedShift.date.toISOString().split('T')[0],
          startTime: selectedShift.startTime,
          endTime: selectedShift.endTime,
          type: selectedShift.type,
          location: selectedShift.location,
          description: selectedShift.description,
          duration: selectedShift.duration
        }
      }));
    }
  };

  const toggleArrayValue = (array: string[], value: string): string[] => {
    return array.includes(value)
      ? array.filter(item => item !== value)
      : [...array, value];
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setIsSubmitting(true);
    
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submitData = {
        ...formData,
        id: editOffer?.id || `offer-${Date.now()}`,
        status: 'active',
        postedAt: new Date(),
        expiresAt: new Date(Date.now() + formData.expirationDays * 24 * 60 * 60 * 1000)
      };
      
      onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Ошибка при создании предложения:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getShiftTypeText = (type: string) => {
    const types = {
      regular: 'Обычная',
      overtime: 'Сверхурочная',
      training: 'Обучение',
      night: 'Ночная',
      holiday: 'Праздничная'
    };
    return types[type as keyof typeof types] || type;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editOffer ? 'Редактирование предложения' : 'Новое предложение обмена'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress */}
          <div className="mt-4">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>Шаг {currentStep} из {totalSteps}</span>
              <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6 overflow-y-auto max-h-[60vh]">
          
          {/* Step 1: Select Shift */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Выберите смену для обмена
              </h3>
              
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <span className="ml-2 text-gray-600">Загрузка смен...</span>
                </div>
              ) : availableShifts.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-2">📅</div>
                  <p className="text-gray-600">Нет доступных смен для обмена</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {availableShifts.map((shift) => (
                    <label
                      key={shift.id}
                      className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                        formData.shiftId === shift.id
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="shift"
                        value={shift.id}
                        checked={formData.shiftId === shift.id}
                        onChange={() => handleShiftSelect(shift.id)}
                        className="sr-only"
                      />
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-gray-900">
                            {formatDate(shift.date)} • {shift.startTime} - {shift.endTime}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            {getShiftTypeText(shift.type)} • {shift.duration} ч. • {shift.location}
                          </div>
                          {shift.description && (
                            <div className="text-sm text-gray-500 mt-1">{shift.description}</div>
                          )}
                        </div>
                        
                        <div className="text-2xl">
                          {shift.type === 'night' ? '🌙' :
                           shift.type === 'training' ? '📚' :
                           shift.type === 'overtime' ? '⏰' :
                           shift.type === 'holiday' ? '🎉' : '☀️'}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              )}
              
              {errors.shiftId && (
                <p className="mt-2 text-sm text-red-600">{errors.shiftId}</p>
              )}
            </div>
          )}

          {/* Step 2: Exchange Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Детали обмена
              </h3>
              
              <div className="space-y-6">
                
                {/* Selected Shift Summary */}
                {formData.shiftId && (
                  <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                    <h4 className="font-medium text-blue-900 mb-2">Выбранная смена</h4>
                    <div className="text-sm text-blue-800">
                      {formData.shiftDetails.date} • {formData.shiftDetails.startTime} - {formData.shiftDetails.endTime} • {formData.shiftDetails.location}
                    </div>
                  </div>
                )}

                {/* Exchange Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Тип обмена
                  </label>
                  <div className="space-y-2">
                    {[
                      { value: 'flexible', label: 'Гибкий обмен', desc: 'Готов рассмотреть разные варианты' },
                      { value: 'any_shift', label: 'Любая смена', desc: 'Подойдет любая смена в обмен' },
                      { value: 'specific_date', label: 'Конкретная дата', desc: 'Нужна смена в определенный день' },
                      { value: 'specific_shift', label: 'Конкретная смена', desc: 'Интересует конкретный тип смены' }
                    ].map((option) => (
                      <label key={option.value} className="flex items-start gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50">
                        <input
                          type="radio"
                          name="exchangeType"
                          value={option.value}
                          checked={formData.exchangeType === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, exchangeType: e.target.value as any }))}
                          className="mt-1"
                        />
                        <div>
                          <div className="font-medium text-gray-900">{option.label}</div>
                          <div className="text-sm text-gray-600">{option.desc}</div>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Reason */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Причина обмена *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Объясните, почему хотите обменять эту смену..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{formData.reason.length}/200 символов</span>
                    {errors.reason && <span className="text-red-600">{errors.reason}</span>}
                  </div>
                </div>

                {/* Wanted in Return */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Что хотите получить взамен *
                  </label>
                  <textarea
                    rows={3}
                    placeholder="Опишите, какую смену или условия хотите получить взамен..."
                    value={formData.wantedInReturn}
                    onChange={(e) => setFormData(prev => ({ ...prev, wantedInReturn: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.wantedInReturn && (
                    <p className="mt-1 text-sm text-red-600">{errors.wantedInReturn}</p>
                  )}
                </div>

                {/* Urgency */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Срочность
                  </label>
                  <div className="flex gap-3">
                    {[
                      { value: 'low', label: 'Низкая', color: 'border-gray-300' },
                      { value: 'normal', label: 'Обычная', color: 'border-blue-300' },
                      { value: 'high', label: 'Высокая', color: 'border-red-300' }
                    ].map((option) => (
                      <label key={option.value} className={`flex-1 p-3 border rounded-lg cursor-pointer text-center transition-colors ${
                        formData.urgency === option.value 
                          ? `${option.color} bg-blue-50` 
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}>
                        <input
                          type="radio"
                          name="urgency"
                          value={option.value}
                          checked={formData.urgency === option.value}
                          onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value as any }))}
                          className="sr-only"
                        />
                        <div className="font-medium">{option.label}</div>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Additional Notes */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Дополнительные заметки
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Любые дополнительные детали или требования..."
                    value={formData.additionalNotes}
                    onChange={(e) => setFormData(prev => ({ ...prev, additionalNotes: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.additionalNotes && (
                    <p className="mt-1 text-sm text-red-600">{errors.additionalNotes}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Preferences and Settings */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Настройки и предпочтения
              </h3>
              
              <div className="space-y-6">
                
                {/* Expiration */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Срок действия предложения
                  </label>
                  <select
                    value={formData.expirationDays}
                    onChange={(e) => setFormData(prev => ({ ...prev, expirationDays: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value={1}>1 день</option>
                    <option value={3}>3 дня</option>
                    <option value={7}>1 неделя</option>
                    <option value={14}>2 недели</option>
                    <option value={30}>1 месяц</option>
                  </select>
                  {errors.expirationDays && (
                    <p className="mt-1 text-sm text-red-600">{errors.expirationDays}</p>
                  )}
                </div>

                {/* Preferred Skills */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Предпочтительные навыки (необязательно)
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {allSkills.map((skill) => (
                      <label key={skill} className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.preferredSkills.includes(skill)}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            preferredSkills: toggleArrayValue(prev.preferredSkills, skill)
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{skill}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Allowed Teams */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Разрешенные команды
                  </label>
                  <div className="space-y-2">
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.allowedTeams.length === 0}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({ ...prev, allowedTeams: [] }));
                          }
                        }}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-700">Все команды</span>
                    </label>
                    
                    {allTeams.map((team) => (
                      <label key={team} className="flex items-center gap-2 ml-6">
                        <input
                          type="checkbox"
                          checked={formData.allowedTeams.includes(team)}
                          onChange={() => setFormData(prev => ({
                            ...prev,
                            allowedTeams: toggleArrayValue(prev.allowedTeams, team)
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">{team}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Auto-accept Rules */}
                <div className="border-t border-gray-200 pt-6">
                  <div className="flex items-center gap-2 mb-4">
                    <input
                      type="checkbox"
                      id="autoAccept"
                      checked={formData.autoAcceptRules.enabled}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        autoAcceptRules: { ...prev.autoAcceptRules, enabled: e.target.checked }
                      }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <label htmlFor="autoAccept" className="text-sm font-medium text-gray-700">
                      Автоматическое принятие предложений
                    </label>
                  </div>
                  
                  {formData.autoAcceptRules.enabled && (
                    <div className="ml-6 space-y-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.autoAcceptRules.sameShiftType}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autoAcceptRules: { ...prev.autoAcceptRules, sameShiftType: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Тот же тип смены</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.autoAcceptRules.sameDuration}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autoAcceptRules: { ...prev.autoAcceptRules, sameDuration: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Та же продолжительность</span>
                      </label>
                      
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={formData.autoAcceptRules.preferredTeams}
                          onChange={(e) => setFormData(prev => ({
                            ...prev,
                            autoAcceptRules: { ...prev.autoAcceptRules, preferredTeams: e.target.checked }
                          }))}
                          className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <span className="text-sm text-gray-700">Только из выбранных команд</span>
                      </label>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentStep === 1}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:text-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            ← Назад
          </button>
          
          <div className="flex items-center gap-3">
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Далее →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Создание...
                  </>
                ) : (
                  editOffer ? 'Сохранить изменения' : 'Создать предложение'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default OfferForm;