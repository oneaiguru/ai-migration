import React, { useState, useEffect } from 'react';

interface TimeOffRequestProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: any) => void;
}

interface TimeOffBalance {
  vacation: { total: number; used: number; remaining: number };
  sick: { total: number; used: number; remaining: number };
  personal: { total: number; used: number; remaining: number };
}

const TimeOffRequest: React.FC<TimeOffRequestProps> = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    emergencyContact: '',
    halfDay: false,
    medicalCertificate: false
  });
  
  const [balance] = useState<TimeOffBalance>({
    vacation: { total: 28, used: 15, remaining: 13 },
    sick: { total: 12, used: 3, remaining: 9 },
    personal: { total: 4, used: 1, remaining: 3 }
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [daysRequested, setDaysRequested] = useState(0);

  const timeOffTypes = [
    { id: 'vacation', title: 'Ежегодный отпуск', icon: '🏖️', description: 'Основной оплачиваемый отпуск' },
    { id: 'sick_leave', title: 'Больничный лист', icon: '🏥', description: 'Временная нетрудоспособность' },
    { id: 'personal_leave', title: 'Личный отпуск', icon: '🏠', description: 'Отпуск без сохранения зарплаты' }
  ];

  // Calculate days requested
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const timeDiff = end.getTime() - start.getTime();
      let days = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1;
      
      if (formData.halfDay) {
        days = days * 0.5;
      }
      
      setDaysRequested(Math.max(0, days));
    } else {
      setDaysRequested(0);
    }
  }, [formData.startDate, formData.endDate, formData.halfDay]);

  const getCurrentBalance = () => {
    switch (formData.type) {
      case 'vacation': return balance.vacation;
      case 'sick_leave': return balance.sick;
      case 'personal_leave': return balance.personal;
      default: return { total: 0, used: 0, remaining: 0 };
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.type) newErrors.type = 'Выберите тип отпуска';
    if (!formData.title.trim()) newErrors.title = 'Укажите название заявки';
    if (!formData.startDate) newErrors.startDate = 'Укажите дату начала';
    if (!formData.endDate) newErrors.endDate = 'Укажите дату окончания';
    if (!formData.reason.trim()) newErrors.reason = 'Укажите причину отпуска';
    
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
      }
    }
    
    // Check balance
    const currentBalance = getCurrentBalance();
    if (formData.type === 'vacation' && daysRequested > currentBalance.remaining) {
      newErrors.endDate = `Недостаточно дней отпуска. Доступно: ${currentBalance.remaining} дней`;
    }
    
    if (formData.type === 'vacation' && !formData.emergencyContact.trim()) {
      newErrors.emergencyContact = 'Укажите контакт для экстренной связи';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (asDraft = false) => {
    if (!asDraft && !validateForm()) return;
    
    setIsSubmitting(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      onSubmit({ ...formData, status: asDraft ? 'draft' : 'submitted', daysRequested });
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-5xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-blue-50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Заявка на отпуск</h2>
              <p className="text-sm text-gray-600">Подача заявки с проверкой баланса дней</p>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
          </div>
        </div>

        <div className="flex max-h-[70vh]">
          {/* Balance Sidebar */}
          <div className="w-80 bg-gray-50 border-r p-6 overflow-y-auto">
            <h3 className="font-semibold text-gray-900 mb-4">Баланс отпускных дней</h3>
            
            {/* Vacation Balance */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏖️</span>
                <span className="font-medium">Ежегодный отпуск</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Всего:</span><span>{balance.vacation.total} дней</span>
                </div>
                <div className="flex justify-between">
                  <span>Использовано:</span><span>{balance.vacation.used} дней</span>
                </div>
                <div className="flex justify-between font-semibold text-green-600">
                  <span>Осталось:</span><span>{balance.vacation.remaining} дней</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-green-500 h-2 rounded-full"
                  style={{ width: `${(balance.vacation.remaining / balance.vacation.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Sick Leave Balance */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏥</span>
                <span className="font-medium">Больничные</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Всего:</span><span>{balance.sick.total} дней</span>
                </div>
                <div className="flex justify-between">
                  <span>Использовано:</span><span>{balance.sick.used} дней</span>
                </div>
                <div className="flex justify-between font-semibold text-blue-600">
                  <span>Осталось:</span><span>{balance.sick.remaining} дней</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full"
                  style={{ width: `${(balance.sick.remaining / balance.sick.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Personal Leave Balance */}
            <div className="bg-white rounded-lg p-4 mb-4 border">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">🏠</span>
                <span className="font-medium">Личные дни</span>
              </div>
              <div className="text-sm space-y-1">
                <div className="flex justify-between">
                  <span>Всего:</span><span>{balance.personal.total} дней</span>
                </div>
                <div className="flex justify-between">
                  <span>Использовано:</span><span>{balance.personal.used} дней</span>
                </div>
                <div className="flex justify-between font-semibold text-purple-600">
                  <span>Осталось:</span><span>{balance.personal.remaining} дней</span>
                </div>
              </div>
              <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full"
                  style={{ width: `${(balance.personal.remaining / balance.personal.total) * 100}%` }}
                />
              </div>
            </div>

            {/* Current Request Info */}
            {daysRequested > 0 && (
              <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                <h4 className="font-medium text-blue-900 mb-2">Текущая заявка</h4>
                <div className="text-sm text-blue-800 space-y-1">
                  <div className="flex justify-between">
                    <span>Дней запрошено:</span>
                    <span className="font-semibold">{daysRequested}</span>
                  </div>
                  {formData.type && (
                    <div className="flex justify-between">
                      <span>Остается после:</span>
                      <span className="font-semibold">
                        {getCurrentBalance().remaining - daysRequested}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Main Form */}
          <div className="flex-1 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Тип отпуска *</label>
                <div className="space-y-2">
                  {timeOffTypes.map((type) => (
                    <label
                      key={type.id}
                      className={`block p-3 border rounded-lg cursor-pointer hover:bg-gray-50 ${
                        formData.type === type.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <input
                        type="radio"
                        name="type"
                        value={type.id}
                        checked={formData.type === type.id}
                        onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
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
                {errors.type && <p className="mt-1 text-sm text-red-600">{errors.type}</p>}
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Название заявки *</label>
                <input
                  type="text"
                  placeholder="Например: Ежегодный отпуск - семейный отдых"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.title && <p className="mt-1 text-sm text-red-600">{errors.title}</p>}
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата начала *</label>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.startDate && <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Дата окончания *</label>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.endDate && <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>}
                </div>
              </div>

              {/* Options */}
              <div className="space-y-3">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={formData.halfDay}
                    onChange={(e) => setFormData(prev => ({ ...prev, halfDay: e.target.checked }))}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm">Половина дня</span>
                </label>

                {formData.type === 'sick_leave' && (
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.medicalCertificate}
                      onChange={(e) => setFormData(prev => ({ ...prev, medicalCertificate: e.target.checked }))}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm">Медицинская справка прилагается</span>
                  </label>
                )}
              </div>

              {/* Reason */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Причина *</label>
                <textarea
                  rows={3}
                  placeholder="Подробно опишите причину отпуска..."
                  value={formData.reason}
                  onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
                {errors.reason && <p className="mt-1 text-sm text-red-600">{errors.reason}</p>}
              </div>

              {/* Emergency Contact for vacation */}
              {formData.type === 'vacation' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Контакт для экстренной связи *
                  </label>
                  <input
                    type="text"
                    placeholder="Телефон или другой способ связи"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData(prev => ({ ...prev, emergencyContact: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                  {errors.emergencyContact && <p className="mt-1 text-sm text-red-600">{errors.emergencyContact}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t bg-gray-50 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {daysRequested > 0 && (
              <span>Запрошено дней: <strong>{daysRequested}</strong></span>
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
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center gap-2"
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

export default TimeOffRequest;