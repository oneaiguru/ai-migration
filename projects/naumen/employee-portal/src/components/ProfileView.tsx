import React, { useState, useEffect } from 'react';
import PersonalInfo from './PersonalInfo';
import WorkInfo from './WorkInfo';
import Preferences from './Preferences';

interface ProfileViewProps {
  employeeId: string;
  onSave: (profileData: EmployeeProfile) => void;
}

interface EmployeeProfile {
  id: string;
  personalInfo: {
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
  };
  workInfo: {
    employeeId: string;
    position: string;
    team: string;
    manager: string;
    hireDate: Date;
    location: string;
    status: 'active' | 'inactive' | 'vacation';
    skills: Skill[];
    certifications: Certification[];
  };
  preferences: {
    notifications: {
      scheduleChanges: boolean;
      shiftReminders: boolean;
      exchangeOffers: boolean;
      requestUpdates: boolean;
      emailDigest: boolean;
      pushNotifications: boolean;
    };
    shiftPreferences: {
      preferredShifts: string[];
      avoidShifts: string[];
      maxConsecutiveDays: number;
      minRestHours: number;
    };
    language: 'ru' | 'en' | 'ky';
    timezone: string;
    autoAcceptExchanges: {
      enabled: boolean;
      sameShiftType: boolean;
      sameDuration: boolean;
      preferredTeams: boolean;
    };
  };
}

interface Skill {
  id: string;
  name: string;
  category: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  certified: boolean;
  lastAssessed?: Date;
  expiresAt?: Date;
}

interface Certification {
  id: string;
  name: string;
  issuer: string;
  issuedDate: Date;
  expiresAt?: Date;
  status: 'active' | 'expired' | 'pending';
}

const ProfileView: React.FC<ProfileViewProps> = ({ employeeId, onSave }) => {
  const [profile, setProfile] = useState<EmployeeProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'work' | 'preferences'>('personal');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  // Load employee profile
  useEffect(() => {
    const loadProfile = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Mock profile data
      const mockProfile: EmployeeProfile = {
        id: employeeId,
        personalInfo: {
          firstName: 'Иван',
          lastName: 'Иванов',
          email: 'ivan.ivanov@company.com',
          phone: '+996 555 123 456',
          preferredName: 'Ваня',
          avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
          emergencyContact: {
            name: 'Иванова Мария Петровна',
            relationship: 'Супруга',
            phone: '+996 555 654 321'
          }
        },
        workInfo: {
          employeeId: 'EMP-001',
          position: 'Оператор',
          team: 'Поддержка клиентов',
          manager: 'Петрова Елена Сергеевна',
          hireDate: new Date('2023-03-15'),
          location: 'Бишкек, офис центр',
          status: 'active',
          skills: [
            {
              id: 'skill-1',
              name: 'Телефонные продажи',
              category: 'Продажи',
              level: 'advanced',
              certified: true,
              lastAssessed: new Date('2024-11-01'),
              expiresAt: new Date('2025-11-01')
            },
            {
              id: 'skill-2',
              name: 'Работа с жалобами',
              category: 'Поддержка',
              level: 'expert',
              certified: true,
              lastAssessed: new Date('2024-10-15')
            },
            {
              id: 'skill-3',
              name: 'Английский язык',
              category: 'Языки',
              level: 'intermediate',
              certified: false
            }
          ],
          certifications: [
            {
              id: 'cert-1',
              name: 'Сертификат качества обслуживания',
              issuer: 'Компания',
              issuedDate: new Date('2024-06-01'),
              expiresAt: new Date('2025-06-01'),
              status: 'active'
            },
            {
              id: 'cert-2',
              name: 'Базовый курс продаж',
              issuer: 'Учебный центр',
              issuedDate: new Date('2023-09-15'),
              status: 'active'
            }
          ]
        },
        preferences: {
          notifications: {
            scheduleChanges: true,
            shiftReminders: true,
            exchangeOffers: true,
            requestUpdates: true,
            emailDigest: false,
            pushNotifications: true
          },
          shiftPreferences: {
            preferredShifts: ['morning', 'day'],
            avoidShifts: ['night'],
            maxConsecutiveDays: 5,
            minRestHours: 11
          },
          language: 'ru',
          timezone: 'Asia/Bishkek',
          autoAcceptExchanges: {
            enabled: false,
            sameShiftType: false,
            sameDuration: false,
            preferredTeams: false
          }
        }
      };
      
      setProfile(mockProfile);
      setLoading(false);
    };
    
    loadProfile();
  }, [employeeId]);

  const handleSave = async () => {
    if (!profile || !hasUnsavedChanges) return;
    
    setSaving(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      onSave(profile);
      setHasUnsavedChanges(false);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Ошибка при сохранении профиля:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleProfileUpdate = (section: keyof EmployeeProfile, data: any) => {
    if (!profile) return;
    
    setProfile(prev => ({
      ...prev!,
      [section]: { ...prev![section], ...data }
    }));
    setHasUnsavedChanges(true);
  };

  const handleDiscardChanges = () => {
    if (window.confirm('Отменить все несохраненные изменения?')) {
      // Reload original profile
      setHasUnsavedChanges(false);
      // In real app, would reload from server
    }
  };

  const tabs = [
    { id: 'personal', label: 'Личная информация', icon: '👤' },
    { id: 'work', label: 'Рабочая информация', icon: '💼' },
    { id: 'preferences', label: 'Настройки', icon: '⚙️' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Мой профиль</h2>
          <p className="text-sm text-gray-500 mt-1">
            Управление личной информацией и настройками
          </p>
        </div>
        
        {/* Save Controls */}
        {hasUnsavedChanges && (
          <div className="flex items-center gap-3">
            <span className="text-sm text-orange-600">
              📝 Есть несохраненные изменения
            </span>
            <button
              onClick={handleDiscardChanges}
              className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Отменить
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Сохранение...
                </>
              ) : (
                'Сохранить изменения'
              )}
            </button>
          </div>
        )}
      </div>

      {/* Last Saved Indicator */}
      {lastSaved && !hasUnsavedChanges && (
        <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-lg px-3 py-2">
          ✓ Изменения сохранены {lastSaved.toLocaleTimeString('ru-RU')}
        </div>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Загрузка профиля...</p>
          </div>
        </div>
      ) : !profile ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">❌</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Ошибка загрузки профиля</h3>
          <p className="text-gray-500">Не удалось загрузить данные профиля</p>
        </div>
      ) : (
        <>
          {/* Profile Summary Card */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 bg-blue-500 rounded-full overflow-hidden">
                  {profile.personalInfo.avatar ? (
                    <img 
                      src={profile.personalInfo.avatar} 
                      alt={`${profile.personalInfo.firstName} ${profile.personalInfo.lastName}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white font-bold text-2xl">
                      {profile.personalInfo.firstName.charAt(0)}{profile.personalInfo.lastName.charAt(0)}
                    </div>
                  )}
                </div>
                <div className={`absolute bottom-1 right-1 w-6 h-6 rounded-full border-2 border-white ${
                  profile.workInfo.status === 'active' ? 'bg-green-400' :
                  profile.workInfo.status === 'vacation' ? 'bg-yellow-400' : 'bg-gray-400'
                }`}></div>
              </div>
              
              {/* Info */}
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900">
                  {profile.personalInfo.firstName} {profile.personalInfo.lastName}
                  {profile.personalInfo.preferredName && (
                    <span className="text-gray-500 font-normal"> ({profile.personalInfo.preferredName})</span>
                  )}
                </h3>
                <div className="text-gray-600 mt-1">
                  <div>{profile.workInfo.position} • {profile.workInfo.team}</div>
                  <div className="text-sm">ID: {profile.workInfo.employeeId} • Менеджер: {profile.workInfo.manager}</div>
                </div>
                
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div>📧 {profile.personalInfo.email}</div>
                  <div>📱 {profile.personalInfo.phone}</div>
                  <div className={`px-2 py-1 rounded text-xs font-medium ${
                    profile.workInfo.status === 'active' ? 'bg-green-100 text-green-800' :
                    profile.workInfo.status === 'vacation' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {profile.workInfo.status === 'active' ? 'Активен' :
                     profile.workInfo.status === 'vacation' ? 'В отпуске' : 'Неактивен'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            {/* Tab Headers */}
            <div className="border-b border-gray-200">
              <nav className="flex">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex-1 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600 bg-blue-50'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                    }`}
                  >
                    <span className="mr-2">{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'personal' && (
                <PersonalInfo
                  personalInfo={profile.personalInfo}
                  onChange={(data) => handleProfileUpdate('personalInfo', data)}
                />
              )}
              
              {activeTab === 'work' && (
                <WorkInfo
                  workInfo={profile.workInfo}
                  onChange={(data) => handleProfileUpdate('workInfo', data)}
                />
              )}
              
              {activeTab === 'preferences' && (
                <Preferences
                  preferences={profile.preferences}
                  onChange={(data) => handleProfileUpdate('preferences', data)}
                />
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ProfileView;