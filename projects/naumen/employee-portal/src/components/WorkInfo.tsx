import React from 'react';

interface WorkInfoProps {
  workInfo: WorkInfo;
  onChange: (data: Partial<WorkInfo>) => void;
}

interface WorkInfo {
  employeeId: string;
  position: string;
  team: string;
  manager: string;
  hireDate: Date;
  location: string;
  status: 'active' | 'inactive' | 'vacation';
  skills: Skill[];
  certifications: Certification[];
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

const WorkInfo: React.FC<WorkInfoProps> = ({ workInfo, onChange }) => {
  const getSkillLevelColor = (level: string) => {
    const colors = {
      beginner: 'bg-gray-100 text-gray-800',
      intermediate: 'bg-blue-100 text-blue-800',
      advanced: 'bg-green-100 text-green-800',
      expert: 'bg-purple-100 text-purple-800'
    };
    return colors[level as keyof typeof colors] || colors.beginner;
  };

  const getSkillLevelText = (level: string) => {
    const texts = {
      beginner: 'Начинающий',
      intermediate: 'Средний',
      advanced: 'Продвинутый',
      expert: 'Эксперт'
    };
    return texts[level as keyof typeof texts] || level;
  };

  const getCertificationStatusColor = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      expired: 'bg-red-100 text-red-800',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.active;
  };

  const getCertificationStatusText = (status: string) => {
    const texts = {
      active: 'Активный',
      expired: 'Истек',
      pending: 'Ожидает'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const getWorkExperienceYears = () => {
    const now = new Date();
    const diffTime = now.getTime() - workInfo.hireDate.getTime();
    const diffYears = diffTime / (1000 * 60 * 60 * 24 * 365.25);
    return Math.floor(diffYears * 10) / 10; // Round to 1 decimal place
  };

  const isSkillExpiringSoon = (skill: Skill) => {
    if (!skill.expiresAt) return false;
    const now = new Date();
    const daysUntilExpiry = (skill.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  const isSkillExpired = (skill: Skill) => {
    if (!skill.expiresAt) return false;
    return new Date() > skill.expiresAt;
  };

  const isCertificationExpiringSoon = (cert: Certification) => {
    if (!cert.expiresAt) return false;
    const now = new Date();
    const daysUntilExpiry = (cert.expiresAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  return (
    <div className="space-y-8">
      
      {/* Employment Details */}
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Информация о трудоустройстве</h3>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ID сотрудника
              </label>
              <div className="text-lg font-semibold text-gray-900">{workInfo.employeeId}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Должность
              </label>
              <div className="text-lg font-semibold text-gray-900">{workInfo.position}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Команда/Отдел
              </label>
              <div className="text-lg font-semibold text-gray-900">{workInfo.team}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Руководитель
              </label>
              <div className="text-lg font-semibold text-gray-900">{workInfo.manager}</div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Дата трудоустройства
              </label>
              <div className="text-lg font-semibold text-gray-900">{formatDate(workInfo.hireDate)}</div>
              <div className="text-sm text-gray-500">
                Стаж: {getWorkExperienceYears()} {getWorkExperienceYears() === 1 ? 'год' : 'лет'}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Местоположение
              </label>
              <div className="text-lg font-semibold text-gray-900">{workInfo.location}</div>
            </div>
          </div>
        </div>
        
        {/* Note about read-only info */}
        <div className="mt-4 text-sm text-gray-600 bg-blue-50 border border-blue-200 rounded-lg p-3">
          <span className="font-medium">📝 Примечание:</span> Рабочая информация управляется HR отделом. 
          Для внесения изменений обратитесь к своему руководителю или в HR.
        </div>
      </div>

      {/* Skills Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Навыки и компетенции</h3>
          <span className="text-sm text-gray-500">
            {workInfo.skills.length} навыков
          </span>
        </div>
        
        {workInfo.skills.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">📚</div>
            <p className="text-gray-500">Навыки не указаны</p>
            <p className="text-sm text-gray-400 mt-1">
              Обратитесь к руководителю для добавления навыков
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {workInfo.skills.map((skill) => (
              <div key={skill.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="font-medium text-gray-900">{skill.name}</h4>
                    <p className="text-sm text-gray-600">{skill.category}</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getSkillLevelColor(skill.level)}`}>
                      {getSkillLevelText(skill.level)}
                    </span>
                    
                    {skill.certified && (
                      <span className="text-green-600" title="Сертифицирован">
                        ✓
                      </span>
                    )}
                  </div>
                </div>
                
                {/* Skill Status */}
                <div className="text-xs text-gray-500 space-y-1">
                  {skill.lastAssessed && (
                    <div>Последняя оценка: {formatDate(skill.lastAssessed)}</div>
                  )}
                  
                  {skill.expiresAt && (
                    <div className={
                      isSkillExpired(skill) ? 'text-red-600' :
                      isSkillExpiringSoon(skill) ? 'text-orange-600' : 'text-gray-500'
                    }>
                      {isSkillExpired(skill) ? '❌ Истек: ' :
                       isSkillExpiringSoon(skill) ? '⚠️ Истекает: ' : 'Действителен до: '}
                      {formatDate(skill.expiresAt)}
                    </div>
                  )}
                </div>
                
                {/* Warning for expiring skills */}
                {isSkillExpiringSoon(skill) && (
                  <div className="mt-2 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                    Требуется переаттестация в ближайшее время
                  </div>
                )}
                
                {isSkillExpired(skill) && (
                  <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-800">
                    Навык требует обновления сертификации
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Certifications Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-medium text-gray-900">Сертификаты</h3>
          <span className="text-sm text-gray-500">
            {workInfo.certifications.length} сертификатов
          </span>
        </div>
        
        {workInfo.certifications.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-2">🏆</div>
            <p className="text-gray-500">Сертификаты не указаны</p>
            <p className="text-sm text-gray-400 mt-1">
              Пройдите обучение для получения сертификатов
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {workInfo.certifications.map((cert) => (
              <div key={cert.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h4 className="font-medium text-gray-900">{cert.name}</h4>
                      <span className={`px-2 py-1 text-xs font-medium rounded ${getCertificationStatusColor(cert.status)}`}>
                        {getCertificationStatusText(cert.status)}
                      </span>
                    </div>
                    
                    <div className="text-sm text-gray-600 mb-1">
                      Выдан: {cert.issuer}
                    </div>
                    
                    <div className="text-xs text-gray-500 space-y-1">
                      <div>Дата получения: {formatDate(cert.issuedDate)}</div>
                      
                      {cert.expiresAt && (
                        <div className={
                          cert.status === 'expired' ? 'text-red-600' :
                          isCertificationExpiringSoon(cert) ? 'text-orange-600' : 'text-gray-500'
                        }>
                          {cert.status === 'expired' ? '❌ Истек: ' :
                           isCertificationExpiringSoon(cert) ? '⚠️ Истекает: ' : 'Действителен до: '}
                          {formatDate(cert.expiresAt)}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Certificate Icon */}
                  <div className="text-2xl">
                    {cert.status === 'active' ? '🏆' :
                     cert.status === 'expired' ? '⏳' : '⏱️'}
                  </div>
                </div>
                
                {/* Warning for expiring certifications */}
                {isCertificationExpiringSoon(cert) && cert.status === 'active' && (
                  <div className="mt-3 p-2 bg-orange-50 border border-orange-200 rounded text-xs text-orange-800">
                    ⚠️ Сертификат истекает в ближайшее время. Свяжитесь с HR для продления.
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Training Suggestions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <span className="text-blue-600 text-lg">🎓</span>
          <div>
            <h4 className="font-medium text-blue-900 mb-1">Развитие навыков</h4>
            <p className="text-sm text-blue-800 mb-3">
              Рекомендуем пройти дополнительные курсы для развития ваших компетенций:
            </p>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Продвинутые техники работы с клиентами</li>
              <li>• Управление конфликтными ситуациями</li>
              <li>• Английский язык для call-центра</li>
            </ul>
            <button className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium">
              Просмотреть доступные курсы →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkInfo;