import React, { useState, useRef } from 'react';

interface PersonalInfoProps {
  personalInfo: PersonalInfo;
  onChange: (data: Partial<PersonalInfo>) => void;
}

interface PersonalInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  preferredName?: string;
  avatar?: string;
  emergencyContact: {
    name: string;
    relationship: string;
    phone: string;
  };
}

const PersonalInfo: React.FC<PersonalInfoProps> = ({ personalInfo, onChange }) => {
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePhone = (phone: string) => {
    const phoneRegex = /^\+996\s?\d{3}\s?\d{3}\s?\d{3}$/;
    return phoneRegex.test(phone);
  };

  const handleInputChange = (field: string, value: string) => {
    const newErrors = { ...errors };
    
    // Real-time validation
    switch (field) {
      case 'email':
        if (value && !validateEmail(value)) {
          newErrors.email = 'Неверный формат email';
        } else {
          delete newErrors.email;
        }
        break;
      case 'phone':
        if (value && !validatePhone(value)) {
          newErrors.phone = 'Формат: +996 555 123 456';
        } else {
          delete newErrors.phone;
        }
        break;
      case 'emergencyPhone':
        if (value && !validatePhone(value)) {
          newErrors.emergencyPhone = 'Формат: +996 555 123 456';
        } else {
          delete newErrors.emergencyPhone;
        }
        break;
      default:
        break;
    }
    
    setErrors(newErrors);
    
    // Update data
    if (field.startsWith('emergency')) {
      const emergencyField = field.replace('emergency', '').toLowerCase();
      onChange({
        emergencyContact: {
          ...personalInfo.emergencyContact,
          [emergencyField === 'phone' ? 'phone' : emergencyField]: value
        }
      });
    } else {
      onChange({ [field]: value });
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      alert('Пожалуйста, выберите изображение');
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert('Размер файла не должен превышать 5 МБ');
      return;
    }
    
    setUploadingAvatar(true);
    
    try {
      // Simulate upload
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Create object URL for preview (in real app would be server URL)
      const avatarUrl = URL.createObjectURL(file);
      onChange({ avatar: avatarUrl });
    } catch (error) {
      console.error('Ошибка загрузки фото:', error);
      alert('Ошибка загрузки фото');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleRemoveAvatar = () => {
    if (window.confirm('Удалить фото профиля?')) {
      onChange({ avatar: undefined });
    }
  };

  const relationshipOptions = [
    'Супруг/Супруга',
    'Родитель',
    'Ребенок',
    'Брат/Сестра',
    'Друг/Подруга',
    'Коллега',
    'Другое'
  ];

  return (
    <div className="space-y-8">
      
      {/* Profile Photo Section */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Фото профиля</h3>
        
        <div className="flex items-center gap-6">
          {/* Current Avatar */}
          <div className="relative">
            <div className="w-32 h-32 bg-blue-500 rounded-full overflow-hidden border-4 border-white shadow-lg">
              {personalInfo.avatar ? (
                <img 
                  src={personalInfo.avatar} 
                  alt="Профиль"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white font-bold text-3xl">
                  {personalInfo.firstName.charAt(0)}{personalInfo.lastName.charAt(0)}
                </div>
              )}
            </div>
            
            {uploadingAvatar && (
              <div className="absolute inset-0 bg-black bg-opacity-50 rounded-full flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
          </div>
          
          {/* Upload Controls */}
          <div className="space-y-3">
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
              />
              
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
              >
                {uploadingAvatar ? 'Загрузка...' : personalInfo.avatar ? 'Изменить фото' : 'Загрузить фото'}
              </button>
            </div>
            
            {personalInfo.avatar && (
              <button
                onClick={handleRemoveAvatar}
                className="block px-3 py-1 text-sm text-red-600 hover:text-red-800 transition-colors"
              >
                Удалить фото
              </button>
            )}
            
            <p className="text-xs text-gray-500">
              JPG, PNG до 5 МБ. Рекомендуется квадратное изображение.
            </p>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Основная информация</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Имя *
            </label>
            <input
              type="text"
              value={personalInfo.firstName}
              onChange={(e) => handleInputChange('firstName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите имя"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Фамилия *
            </label>
            <input
              type="text"
              value={personalInfo.lastName}
              onChange={(e) => handleInputChange('lastName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Введите фамилию"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Предпочитаемое имя
            </label>
            <input
              type="text"
              value={personalInfo.preferredName || ''}
              onChange={(e) => handleInputChange('preferredName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Как к вам обращаться (необязательно)"
            />
            <p className="text-xs text-gray-500 mt-1">
              Например, если вас зовут Иван, но все называют Ваня
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Контактная информация</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <input
              type="email"
              value={personalInfo.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.email ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="your.email@company.com"
            />
            {errors.email && (
              <p className="mt-1 text-sm text-red-600">{errors.email}</p>
            )}
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон *
            </label>
            <input
              type="tel"
              value={personalInfo.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.phone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+996 555 123 456"
            />
            {errors.phone && (
              <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Emergency Contact */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Экстренный контакт</h3>
        <p className="text-sm text-gray-600 mb-4">
          Контактное лицо, с которым можно связаться в экстренной ситуации
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              ФИО контакта *
            </label>
            <input
              type="text"
              value={personalInfo.emergencyContact.name}
              onChange={(e) => handleInputChange('emergencyName', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Иванова Мария Петровна"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Степень родства *
            </label>
            <select
              value={personalInfo.emergencyContact.relationship}
              onChange={(e) => handleInputChange('emergencyRelationship', e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Выберите</option>
              {relationshipOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Телефон контакта *
            </label>
            <input
              type="tel"
              value={personalInfo.emergencyContact.phone}
              onChange={(e) => handleInputChange('emergencyPhone', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.emergencyPhone ? 'border-red-300' : 'border-gray-300'
              }`}
              placeholder="+996 555 123 456"
            />
            {errors.emergencyPhone && (
              <p className="mt-1 text-sm text-red-600">{errors.emergencyPhone}</p>
            )}
          </div>
        </div>
      </div>

      {/* Data Privacy Notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">🔒</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Конфиденциальность данных</h4>
            <p className="text-sm text-blue-800">
              Ваши личные данные защищены и используются только для рабочих целей. 
              Доступ к информации имеют только уполномоченные сотрудники HR и ваш непосредственный руководитель.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PersonalInfo;