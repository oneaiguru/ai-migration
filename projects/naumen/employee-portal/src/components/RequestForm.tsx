import React, { useState, useEffect } from 'react';

interface RequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (requestData: RequestFormData) => void;
  editRequest?: RequestFormData;
}

interface RequestFormData {
  id?: string;
  type: 'vacation' | 'sick_leave' | 'time_off' | 'shift_change' | 'overtime' | '';
  title: string;
  startDate: string;
  endDate: string;
  reason: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  attachments: File[];
  additionalInfo: {
    emergencyContact?: string;
    halfDay?: boolean;
    currentShift?: string;
    requestedShift?: string;
    medicalCertificate?: boolean;
    overtimeHours?: number;
  };
}

interface ValidationErrors {
  [key: string]: string;
}

const RequestForm: React.FC<RequestFormProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  editRequest 
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<RequestFormData>({
    type: '',
    title: '',
    startDate: '',
    endDate: '',
    reason: '',
    priority: 'normal',
    attachments: [],
    additionalInfo: {}
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 4;

  // Initialize form with edit data
  useEffect(() => {
    if (editRequest) {
      setFormData(editRequest);
    } else {
      // Reset form for new request
      setFormData({
        type: '',
        title: '',
        startDate: '',
        endDate: '',
        reason: '',
        priority: 'normal',
        attachments: [],
        additionalInfo: {}
      });
    }
    setCurrentStep(1);
    setErrors({});
  }, [editRequest, isOpen]);

  const requestTypes = [
    {
      id: 'vacation',
      title: 'Отпуск',
      description: 'Ежегодный оплачиваемый отпуск',
      icon: '🏖️',
      requiresEndDate: true
    },
    {
      id: 'sick_leave',
      title: 'Больничный',
      description: 'Временная нетрудоспособность',
      icon: '🏥',
      requiresEndDate: true
    },
    {
      id: 'time_off',
      title: 'Отгул',
      description: 'Отгул за переработку или личные дела',
      icon: '🕐',
      requiresEndDate: false
    },
    {
      id: 'shift_change',
      title: 'Изменение смены',
      description: 'Изменение рабочего графика',
      icon: '🔄',
      requiresEndDate: false
    },
    {
      id: 'overtime',
      title: 'Сверхурочные',
      description: 'Работа сверх нормы',
      icon: '⏰',
      requiresEndDate: false
    }
  ];

  const validateStep = (step: number): boolean => {
    const newErrors: ValidationErrors = {};
    
    switch (step) {
      case 1:
        if (!formData.type) {
          newErrors.type = 'Выберите тип заявки';
        }
        break;
        
      case 2:
        if (!formData.startDate) {
          newErrors.startDate = 'Укажите дату начала';
        }
        
        const selectedType = requestTypes.find(t => t.id === formData.type);
        if (selectedType?.requiresEndDate && !formData.endDate) {
          newErrors.endDate = 'Укажите дату окончания';
        }
        
        if (formData.startDate && formData.endDate) {
          const start = new Date(formData.startDate);
          const end = new Date(formData.endDate);
          if (end < start) {
            newErrors.endDate = 'Дата окончания не может быть раньше даты начала';
          }
        }
        
        // Type-specific validations
        if (formData.type === 'shift_change') {
          if (!formData.additionalInfo.currentShift) {
            newErrors.currentShift = 'Укажите текущую смену';
          }
          if (!formData.additionalInfo.requestedShift) {
            newErrors.requestedShift = 'Укажите желаемую смену';
          }
        }
        
        if (formData.type === 'overtime') {
          if (!formData.additionalInfo.overtimeHours || formData.additionalInfo.overtimeHours <= 0) {
            newErrors.overtimeHours = 'Укажите количество сверхурочных часов';
          }
        }
        break;
        
      case 3:
        if (!formData.reason.trim()) {
          newErrors.reason = 'Укажите причину заявки';
        } else if (formData.reason.trim().length < 10) {
          newErrors.reason = 'Причина должна содержать минимум 10 символов';
        }
        
        if (!formData.title.trim()) {
          newErrors.title = 'Укажите название заявки';
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
    }
  };

  const handleSubmit = async (asDraft: boolean = false) => {
    if (!asDraft && !validateStep(currentStep)) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const submitData = {
        ...formData,
        status: asDraft ? 'draft' : 'submitted',
        submittedAt: new Date()
      };
      
      onSubmit(submitData);
      onClose();
    } catch (error) {
      console.error('Ошибка при отправке заявки:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileUpload = (files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files).filter(file => {
        // File size limit: 10MB
        return file.size <= 10 * 1024 * 1024;
      });
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...newFiles]
      }));
    }
  };

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      attachments: prev.attachments.filter((_, i) => i !== index)
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold text-gray-900">
              {editRequest ? 'Редактирование заявки' : 'Новая заявка'}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Progress Bar */}
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
          {/* Step 1: Request Type */}
          {currentStep === 1 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Выберите тип заявки
              </h3>
              
              <div className="space-y-3">
                {requestTypes.map((type) => (
                  <label
                    key={type.id}
                    className={`block p-4 border rounded-lg cursor-pointer transition-colors hover:bg-gray-50 ${
                      formData.type === type.id
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200'
                    }`}
                  >
                    <input
                      type="radio"
                      name="requestType"
                      value={type.id}
                      checked={formData.type === type.id}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        type: e.target.value as any
                      }))}
                      className="sr-only"
                    />
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{type.icon}</span>
                      <div>
                        <div className="font-medium text-gray-900">{type.title}</div>
                        <div className="text-sm text-gray-600">{type.description}</div>
                      </div>
                    </div>
                  </label>
                ))}
              </div>
              
              {errors.type && (
                <p className="mt-2 text-sm text-red-600">{errors.type}</p>
              )}
            </div>
          )}

          {/* Step 2: Dates and Details */}
          {currentStep === 2 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Укажите даты и детали
              </h3>
              
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Дата начала *
                    </label>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        startDate: e.target.value
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    {errors.startDate && (
                      <p className="mt-1 text-sm text-red-600">{errors.startDate}</p>
                    )}
                  </div>
                  
                  {requestTypes.find(t => t.id === formData.type)?.requiresEndDate && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Дата окончания *
                      </label>
                      <input
                        type="date"
                        value={formData.endDate}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          endDate: e.target.value
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                      {errors.endDate && (
                        <p className="mt-1 text-sm text-red-600">{errors.endDate}</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Type-specific fields */}
                {formData.type === 'sick_leave' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.additionalInfo.medicalCertificate || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          additionalInfo: {
                            ...prev.additionalInfo,
                            medicalCertificate: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Есть медицинская справка</span>
                    </label>
                  </div>
                )}

                {formData.type === 'time_off' && (
                  <div>
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.additionalInfo.halfDay || false}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          additionalInfo: {
                            ...prev.additionalInfo,
                            halfDay: e.target.checked
                          }
                        }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">Полдня</span>
                    </label>
                  </div>
                )}

                {formData.type === 'shift_change' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Текущая смена *
                      </label>
                      <select
                        value={formData.additionalInfo.currentShift || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          additionalInfo: {
                            ...prev.additionalInfo,
                            currentShift: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите смену</option>
                        <option value="morning">Утренняя (08:00-17:00)</option>
                        <option value="day">Дневная (09:00-18:00)</option>
                        <option value="evening">Вечерняя (14:00-23:00)</option>
                        <option value="night">Ночная (23:00-08:00)</option>
                      </select>
                      {errors.currentShift && (
                        <p className="mt-1 text-sm text-red-600">{errors.currentShift}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Желаемая смена *
                      </label>
                      <select
                        value={formData.additionalInfo.requestedShift || ''}
                        onChange={(e) => setFormData(prev => ({
                          ...prev,
                          additionalInfo: {
                            ...prev.additionalInfo,
                            requestedShift: e.target.value
                          }
                        }))}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                      >
                        <option value="">Выберите смену</option>
                        <option value="morning">Утренняя (08:00-17:00)</option>
                        <option value="day">Дневная (09:00-18:00)</option>
                        <option value="evening">Вечерняя (14:00-23:00)</option>
                        <option value="night">Ночная (23:00-08:00)</option>
                      </select>
                      {errors.requestedShift && (
                        <p className="mt-1 text-sm text-red-600">{errors.requestedShift}</p>
                      )}
                    </div>
                  </div>
                )}

                {formData.type === 'overtime' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Количество сверхурочных часов *
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="12"
                      value={formData.additionalInfo.overtimeHours || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        additionalInfo: {
                          ...prev.additionalInfo,
                          overtimeHours: parseInt(e.target.value) || 0
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.overtimeHours && (
                      <p className="mt-1 text-sm text-red-600">{errors.overtimeHours}</p>
                    )}
                  </div>
                )}

                {formData.type === 'vacation' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Контакт в экстренной ситуации
                    </label>
                    <input
                      type="text"
                      placeholder="Телефон или другой способ связи"
                      value={formData.additionalInfo.emergencyContact || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        additionalInfo: {
                          ...prev.additionalInfo,
                          emergencyContact: e.target.value
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 3: Reason and Title */}
          {currentStep === 3 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Причина и описание
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Название заявки *
                  </label>
                  <input
                    type="text"
                    placeholder="Краткое описание заявки"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Причина и обоснование *
                  </label>
                  <textarea
                    rows={5}
                    placeholder="Подробно опишите причину подачи заявки..."
                    value={formData.reason}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      reason: e.target.value
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <div className="flex justify-between text-sm text-gray-500 mt-1">
                    <span>{formData.reason.length}/500 символов</span>
                    {errors.reason && (
                      <span className="text-red-600">{errors.reason}</span>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Приоритет
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({
                      ...prev,
                      priority: e.target.value as any
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="low">Низкий</option>
                    <option value="normal">Обычный</option>
                    <option value="high">Высокий</option>
                    <option value="urgent">Срочный</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Review and Attachments */}
          {currentStep === 4 && (
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Проверка и вложения
              </h3>
              
              <div className="space-y-6">
                {/* Request Summary */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-3">Сводка заявки</h4>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Тип:</dt>
                      <dd className="font-medium">
                        {requestTypes.find(t => t.id === formData.type)?.title}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Название:</dt>
                      <dd className="font-medium">{formData.title}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Период:</dt>
                      <dd className="font-medium">
                        {formData.startDate}
                        {formData.endDate && ` - ${formData.endDate}`}
                      </dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-gray-600">Приоритет:</dt>
                      <dd className="font-medium">{formData.priority === 'low' ? 'Низкий' : formData.priority === 'normal' ? 'Обычный' : formData.priority === 'high' ? 'Высокий' : 'Срочный'}</dd>
                    </div>
                  </dl>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <dt className="text-gray-600 text-sm mb-1">Причина:</dt>
                    <dd className="text-sm">{formData.reason}</dd>
                  </div>
                </div>
                
                {/* File Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Вложения (необязательно)
                  </label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <input
                      type="file"
                      multiple
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                      onChange={(e) => handleFileUpload(e.target.files)}
                      className="hidden"
                      id="file-upload"
                    />
                    <label
                      htmlFor="file-upload"
                      className="cursor-pointer text-blue-600 hover:text-blue-800"
                    >
                      📎 Выберите файлы или перетащите сюда
                    </label>
                    <p className="text-xs text-gray-500 mt-1">
                      Поддерживаются: PDF, DOC, DOCX, JPG, PNG (до 10 МБ)
                    </p>
                  </div>
                  
                  {formData.attachments.length > 0 && (
                    <div className="mt-3">
                      <h5 className="text-sm font-medium text-gray-700 mb-2">
                        Прикрепленные файлы:
                      </h5>
                      <div className="space-y-2">
                        {formData.attachments.map((file, index) => (
                          <div
                            key={index}
                            className="flex items-center justify-between p-2 bg-gray-50 rounded"
                          >
                            <span className="text-sm text-gray-700">{file.name}</span>
                            <button
                              onClick={() => removeFile(index)}
                              className="text-red-500 hover:text-red-700 text-sm"
                            >
                              Удалить
                            </button>
                          </div>
                        ))}
                      </div>
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
            {currentStep === totalSteps && (
              <button
                onClick={() => handleSubmit(true)}
                disabled={isSubmitting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Сохранить как черновик
              </button>
            )}
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Далее →
              </button>
            ) : (
              <button
                onClick={() => handleSubmit(false)}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center gap-2"
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
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestForm;