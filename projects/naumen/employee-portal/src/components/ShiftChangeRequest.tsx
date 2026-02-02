import React, { useState, useEffect } from 'react';

interface ShiftChangeRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

interface Shift {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: string;
  description: string;
}

const ShiftChangeRequest: React.FC<ShiftChangeRequestProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: '',
    changeType: '', // 'permanent' | 'temporary' | 'swap'
    targetDate: '',
    endDate: '', // for temporary changes
    currentShift: '',
    requestedShift: '',
    reason: '',
    swapPartner: '',
    urgency: 'normal',
    impactAnalysis: ''
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentSchedule, setCurrentSchedule] = useState<any[]>([]);

  const shifts: Shift[] = [
    { id: 'morning', name: 'Утренняя смена', startTime: '08:00', endTime: '17:00', duration: '8 ч', description: 'Стандартная утренняя смена' },
    { id: 'day', name: 'Дневная смена', startTime: '09:00', endTime: '18:00', duration: '8 ч', description: 'Дневная смена с поздним началом' },
    { id: 'evening', name: 'Вечерняя смена', startTime: '14:00', endTime: '23:00', duration: '8 ч', description: 'Вечерняя смена до позднего вечера' },
    { id: 'night', name: 'Ночная смена', startTime: '23:00', endTime: '08:00', duration: '8 ч', description: 'Ночная смена с доплатой' },
    { id: 'flexible', name: 'Гибкий график', startTime: 'варьируется', endTime: 'варьируется', duration: '8 ч', description: 'Гибкое время начала и окончания' }
  ];

  const teammates = [
    { id: '1', name: 'Петров Петр Петрович', shift: 'evening', position: 'Оператор' },
    { id: '2', name: 'Сидорова Анна Ивановна', shift: 'morning', position: 'Старший оператор' },
    { id: '3', name: 'Козлов Дмитрий Сергеевич', shift: 'day', position: 'Оператор' },
    { id: '4', name: 'Морозова Елена Владимировна', shift: 'night', position: 'Оператор' }
  ];

  const changeTypes = [
    {
      id: 'temporary',
      title: 'Временное изменение',
      description: 'Изменение на определенный период',
      icon: '⏱️',
      requiresEndDate: true
    },
    {
      id: 'permanent',
      title: 'Постоянное изменение',
      description: 'Смена графика на постоянной основе',
      icon: '📋',
      requiresEndDate: false
    },
    {
      id: 'swap',
      title: 'Обмен сменами',
      description: 'Обмен сменами с коллегой',
      icon: '🔄',
      requiresEndDate: false
    }
  ];

  // Load current schedule
  useEffect(() => {
    if (isOpen) {
      // Mock current schedule
      const mockSchedule = [
        { date: '2025-06-10', shift: 'morning', status: 'scheduled' },
        { date: '2025-06-11', shift: 'morning', status: 'scheduled' },
        { date: '2025-06-12', shift: 'morning', status: 'scheduled' },
        { date: '2025-06-13', shift: 'morning', status: 'scheduled' },
        { date: '2025-06-14', shift: 'morning', status: 'scheduled' }
      ];
      setCurrentSchedule(mockSchedule);
      
      // Set current shift if available
      if (mockSchedule.length > 0) {
        setFormData(prev => ({ ...prev, currentShift: mockSchedule[0].shift }));
      }
    }
  }, [isOpen]);

  const getShiftInfo = (shiftId: string) => {
    return shifts.find(s => s.id === shiftId);
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.title.trim()) newErrors.title = 'Укажите название заявки';
    if (!formData.changeType) newErrors.changeType = 'Выберите тип изменения';
    if (!formData.targetDate) newErrors.targetDate = 'Укажите дату изменения';
    if (!formData.currentShift) newErrors.currentShift = 'Укажите текущую смену';
    if (!formData.requestedShift) newErrors.requestedShift = 'Укажите желаемую смену';
    if (!formData.reason.trim()) newErrors.reason = 'Укажите причину изменения';
    
    // Type-specific validations
    if (formData.changeType === 'temporary' && !formData.endDate) {
      newErrors.endDate = 'Укажите дату окончания для временного изменения';
    }
    
    if (formData.changeType === 'swap' && !formData.swapPartner) {
      newErrors.swapPartner = 'Выберите коллегу для обмена сменами';
    }
    
    if (formData.targetDate) {
      const targetDate = new Date(formData.targetDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      if (targetDate < today) {
        newErrors.targetDate = 'Дата не может быть в прошлом';
      }
      
      // Check advance notice (except for urgent requests)
      if (formData.urgency !== 'urgent') {
        const requiredDate = new Date(today);
        requiredDate.setDate(today.getDate() + 3); // 3 days advance notice
        
        if (targetDate < requiredDate) {
          newErrors.targetDate = 'Требуется уведомление за 3 дня (или укажите срочность)';
        }
      }
    }
    
    if (formData.endDate && formData.targetDate) {
      const start = new Date(formData.targetDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submitData = {
        ...formData,
        status: asDraft ? 'draft' : 'submitted',
        submittedAt: new Date(),
        type: 'shift_change'
      };
      
      onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentShiftInfo = getShiftInfo(formData.currentShift);
  const requestedShiftInfo = getShiftInfo(formData.requestedShift);
  const selectedChangeType = changeTypes.find(t => t.id === formData.changeType);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-purple-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Изменение рабочей смены</h2>
              <p className="text-sm text-gray-600">Запрос на изменение графика работы</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="flex max-h-[70vh]">
          {/* Current Schedule Sidebar */}
          <div className="w-80 bg-gray-50 border-r p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Текущий график</h3>
            
            {/* Current Shift Info */}
            {currentShiftInfo && (
              <div className="bg-white rounded-lg p-4 mb-4 border">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">📅</span>
                  <span className="font-medium">Текущая смена</span>
                </div>
                <div className="text-sm space-y-1">
                  <div><strong>{currentShiftInfo.name}</strong></div>
                  <div>{currentShiftInfo.startTime} - {currentShiftInfo.endTime}</div>
                  <div className="text-gray-600">{currentShiftInfo.description}</div>
                </div>
              </div>
            )}

            {/* Schedule Preview */}
            <div className="bg-white rounded-lg p-4 border">
              <h4 className="font-medium mb-3">Ближайшие смены</h4>
              <div className="space-y-2">
                {currentSchedule.slice(0, 5).map((schedule, index) => {
                  const shiftInfo = getShiftInfo(schedule.shift);
                  const date = new Date(schedule.date).toLocaleDateString('ru-RU', { 
                    day: '2-digit', 
                    month: '2-digit',
                    weekday: 'short'
                  });
                  
                  return (
                    <div key={index} className="flex justify-between text-sm">
                      <span>{date}</span>
                      <span className="text-gray-600">
                        {shiftInfo ? `${shiftInfo.startTime}-${shiftInfo.endTime}` : schedule.shift}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Impact Summary */}
            {formData.changeType && formData.targetDate && (
              <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Сводка изменений</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div><strong>Тип:</strong> {selectedChangeType?.title}</div>
                  <div><strong>Дата:</strong> {new Date(formData.targetDate).toLocaleDateString('ru-RU')}</div>
                  {formData.endDate && (
                    <div><strong>До:</strong> {new Date(formData.endDate).toLocaleDateString('ru-RU')}</div>
                  )}
                  {requestedShiftInfo && (
                    <div><strong>Новая смена:</strong> {requestedShiftInfo.name}</div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название заявки *</label>
                <input
                  type="text"
                  placeholder="Например: Изменение смены на дневную - медицинские показания"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Change Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Тип изменения *</label>
                <div className="space-y-2">
                  {changeTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`block p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.changeType === type.id ? 'border-purple-500 bg-purple-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="changeType"
                        value={type.id}
                        checked={formData.changeType === type.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, changeType: e.target.value }))}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-3">
                        <span className="text-xl">{type.icon}</span>
                        <div>
                          <div className="font-medium">{type.title}</div>
                          <div className="text-sm text-gray-600">{type.description}</div>
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errors.changeType && <p className="mt-1 text-sm text-red-600">{errors.changeType}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {formData.changeType === 'temporary' ? 'Дата начала' : 'Дата изменения'} *
                  </label>
                  <input
                    type="date"
                    value={formData.targetDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, targetDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  {errors.targetDate && <p className="mt-1 text-sm text-red-600">{errors.targetDate}</p>}
                </div>
                
                {selectedChangeType?.requiresEndDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания *</label>
                    <input
                      type="date"
                      value={formData.endDate}
                      onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                    />
                    {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                  </div>
                )}
              </div>

              {/* Current and Requested Shifts */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Текущая смена *</label>
                  <select
                    value={formData.currentShift}
                    onChange={(e) => setFormData(prev => ({ ...prev, currentShift: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Выберите смену</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime}-{shift.endTime})
                      </option>
                    ))}
                  </select>
                  {errors.currentShift && <p className="mt-1 text-sm text-red-600">{errors.currentShift}</p>}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Желаемая смена *</label>
                  <select
                    value={formData.requestedShift}
                    onChange={(e) => setFormData(prev => ({ ...prev, requestedShift: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Выберите смену</option>
                    {shifts.map((shift) => (
                      <option key={shift.id} value={shift.id}>
                        {shift.name} ({shift.startTime}-{shift.endTime})
                      </option>
                    ))}
                  </select>
                  {errors.requestedShift && <p className="mt-1 text-sm text-red-600">{errors.requestedShift}</p>}
                </div>
              </div>

              {/* Swap Partner (for swap requests) */}
              {formData.changeType === 'swap' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Коллега для обмена *</label>
                  <select
                    value={formData.swapPartner}
                    onChange={(e) => setFormData(prev => ({ ...prev, swapPartner: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  >
                    <option value="">Выберите коллегу</option>
                    {teammates.map((teammate) => (
                      <option key={teammate.id} value={teammate.id}>
                        {teammate.name} - {teammate.position} (тек. смена: {getShiftInfo(teammate.shift)?.name})
                      </option>
                    ))}
                  </select>
                  {errors.swapPartner && <p className="mt-1 text-sm text-red-600">{errors.swapPartner}</p>}
                </div>
              )}

              {/* Urgency */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Срочность</label>
                <select
                  value={formData.urgency}
                  onChange={(e) => setFormData(prev => ({ ...prev, urgency: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                >
                  <option value="normal">Обычная (3+ дня уведомления)</option>
                  <option value="urgent">Срочная (менее 3 дней)</option>
                  <option value="emergency">Экстренная (в тот же день)</option>
                </select>
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Причина изменения *</label>
                <textarea
                  rows={4}
                  placeholder="Подробно опишите причину изменения смены..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>{formData.reason.length}/500 символов</span>
                  {errors.reason && <span className="text-red-600">{errors.reason}</span>}
                </div>
              </div>

              {/* Impact Analysis */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Анализ влияния на команду (необязательно)
                </label>
                <textarea
                  rows={3}
                  placeholder="Опишите, как это изменение может повлиять на работу команды..."
                  value={formData.impactAnalysis}
                  onChange={(e) => setFormData(prev => ({ ...prev, impactAnalysis: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {formData.targetDate && (
              <span>
                Изменение с <strong>{new Date(formData.targetDate).toLocaleDateString('ru-RU')}</strong>
                {formData.endDate && ` по ${new Date(formData.endDate).toLocaleDateString('ru-RU')}`}
              </span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={() => handleSubmit(true)}
              disabled={isSubmitting}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
            >
              Сохранить черновик
            </button>
            <button
              onClick={() => handleSubmit(false)}
              disabled={isSubmitting}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Отправка...
                </>
              ) : (
                'Подать заявку'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShiftChangeRequest;