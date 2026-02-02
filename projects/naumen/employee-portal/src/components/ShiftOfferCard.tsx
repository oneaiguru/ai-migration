import React, { useState } from 'react';

interface ShiftOfferCardProps {
  offer: ShiftOffer;
  onExpressInterest: (offerId: string) => void;
  onViewDetails: (offerId: string) => void;
  onMessage: (offerId: string) => void;
  showMyOffer?: boolean;
  currentEmployeeId?: string;
}

interface ShiftOffer {
  id: string;
  employee: {
    id: string;
    name: string;
    position: string;
    team: string;
    avatar?: string;
    rating?: number;
    exchangeCount?: number;
  };
  shift: {
    date: Date;
    startTime: string;
    endTime: string;
    type: 'regular' | 'overtime' | 'training' | 'night' | 'holiday';
    location?: string;
    description?: string;
    duration: number; // hours
  };
  reason?: string;
  wantedInReturn?: string;
  postedAt: Date;
  expiresAt: Date;
  interestCount: number;
  status: 'available' | 'pending' | 'completed' | 'expired';
  interestedEmployees: string[];
  preferredSkills?: string[];
  exchangeType: 'any_shift' | 'specific_date' | 'specific_shift' | 'flexible';
  urgency: 'low' | 'normal' | 'high';
}

const ShiftOfferCard: React.FC<ShiftOfferCardProps> = ({ 
  offer, 
  onExpressInterest, 
  onViewDetails, 
  onMessage,
  showMyOffer = false,
  currentEmployeeId
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showInterestTooltip, setShowInterestTooltip] = useState(false);

  const isMyOffer = currentEmployeeId === offer.employee.id;
  const hasExpressedInterest = currentEmployeeId && offer.interestedEmployees.includes(currentEmployeeId);

  const getShiftTypeColor = (type: string) => {
    const colors = {
      regular: 'bg-blue-100 text-blue-800',
      overtime: 'bg-purple-100 text-purple-800',
      training: 'bg-green-100 text-green-800',
      night: 'bg-indigo-100 text-indigo-800',
      holiday: 'bg-red-100 text-red-800'
    };
    return colors[type as keyof typeof colors] || colors.regular;
  };

  const getShiftTypeText = (type: string) => {
    const texts = {
      regular: 'Обычная',
      overtime: 'Сверхурочная',
      training: 'Обучение',
      night: 'Ночная',
      holiday: 'Праздничная'
    };
    return texts[type as keyof typeof texts] || type;
  };

  const getUrgencyIndicator = (urgency: string) => {
    if (urgency === 'high') {
      return (
        <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded">
          🔥 Срочно
        </span>
      );
    }
    return null;
  };

  const getExchangeTypeText = (type: string) => {
    const texts = {
      any_shift: 'Любая смена',
      specific_date: 'Конкретная дата',
      specific_shift: 'Конкретная смена',
      flexible: 'Гибко'
    };
    return texts[type as keyof typeof texts] || type;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatTime = (time: string) => {
    return time;
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'завтра';
    if (diffDays > 0 && diffDays <= 7) return `через ${diffDays} дн.`;
    return formatDate(date);
  };

  const isExpiringSoon = () => {
    const now = new Date();
    const diffTime = offer.expiresAt.getTime() - now.getTime();
    const diffHours = diffTime / (1000 * 60 * 60);
    return diffHours <= 24 && diffHours > 0;
  };

  const isExpired = () => {
    return new Date() > offer.expiresAt || offer.status === 'expired';
  };

  return (
    <div className={`bg-white border rounded-lg p-4 transition-all duration-200 hover:shadow-md ${
      isExpired() ? 'opacity-60 border-gray-300' : 'border-gray-200 hover:border-blue-300'
    } ${hasExpressedInterest ? 'ring-2 ring-green-200 bg-green-50' : ''}`}>
      
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Employee Avatar */}
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
            {offer.employee.avatar ? (
              <img src={offer.employee.avatar} alt={offer.employee.name} className="w-full h-full rounded-full object-cover" />
            ) : (
              offer.employee.name.charAt(0)
            )}
          </div>
          
          {/* Employee Info */}
          <div>
            <h3 className="font-medium text-gray-900">{offer.employee.name}</h3>
            <div className="text-sm text-gray-600">
              {offer.employee.position} • {offer.employee.team}
            </div>
            
            {/* Trust indicators */}
            <div className="flex items-center gap-2 mt-1">
              {offer.employee.rating && (
                <div className="flex items-center gap-1 text-xs text-yellow-600">
                  <span>⭐</span>
                  <span>{offer.employee.rating.toFixed(1)}</span>
                </div>
              )}
              {offer.employee.exchangeCount && offer.employee.exchangeCount > 0 && (
                <div className="text-xs text-gray-500">
                  {offer.employee.exchangeCount} обменов
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Status indicators */}
        <div className="flex flex-col items-end gap-1">
          {getUrgencyIndicator(offer.urgency)}
          
          {isExpiringSoon() && !isExpired() && (
            <span className="text-xs text-orange-600 bg-orange-100 px-2 py-1 rounded">
              ⏰ Истекает через {Math.ceil((offer.expiresAt.getTime() - new Date().getTime()) / (1000 * 60 * 60))} ч.
            </span>
          )}
          
          {isExpired() && (
            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
              Истекла
            </span>
          )}
          
          {hasExpressedInterest && (
            <span className="text-xs text-green-600 bg-green-100 px-2 py-1 rounded">
              ✓ Вы заинтересованы
            </span>
          )}
        </div>
      </div>

      {/* Shift Details */}
      <div className="bg-gray-50 rounded-lg p-3 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-gray-900">
            {formatRelativeDate(offer.shift.date)} • {formatTime(offer.shift.startTime)} - {formatTime(offer.shift.endTime)}
          </h4>
          <span className={`px-2 py-1 text-xs font-medium rounded ${getShiftTypeColor(offer.shift.type)}`}>
            {getShiftTypeText(offer.shift.type)}
          </span>
        </div>
        
        <div className="grid grid-cols-2 gap-2 text-sm text-gray-600">
          <div><strong>Дата:</strong> {formatDate(offer.shift.date)}</div>
          <div><strong>Продолжительность:</strong> {offer.shift.duration} ч.</div>
          {offer.shift.location && (
            <div><strong>Место:</strong> {offer.shift.location}</div>
          )}
          {offer.shift.description && (
            <div className="col-span-2"><strong>Описание:</strong> {offer.shift.description}</div>
          )}
        </div>
      </div>

      {/* Exchange Details */}
      <div className="space-y-2 mb-3">
        {offer.reason && (
          <div className="text-sm">
            <strong className="text-gray-700">Причина:</strong>
            <span className="text-gray-600 ml-1">
              {offer.reason.length > 80 && !isExpanded 
                ? `${offer.reason.substring(0, 80)}...` 
                : offer.reason
              }
              {offer.reason.length > 80 && (
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="ml-1 text-blue-600 hover:text-blue-800 text-xs"
                >
                  {isExpanded ? 'Свернуть' : 'Показать полностью'}
                </button>
              )}
            </span>
          </div>
        )}
        
        {offer.wantedInReturn && (
          <div className="text-sm">
            <strong className="text-gray-700">Хочет взамен:</strong>
            <span className="text-gray-600 ml-1">{offer.wantedInReturn}</span>
          </div>
        )}
        
        <div className="text-sm">
          <strong className="text-gray-700">Тип обмена:</strong>
          <span className="text-gray-600 ml-1">{getExchangeTypeText(offer.exchangeType)}</span>
        </div>

        {offer.preferredSkills && offer.preferredSkills.length > 0 && (
          <div className="text-sm">
            <strong className="text-gray-700">Предпочтительные навыки:</strong>
            <div className="flex flex-wrap gap-1 mt-1">
              {offer.preferredSkills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Interest Counter */}
      <div className="flex items-center justify-between mb-3">
        <div 
          className="relative"
          onMouseEnter={() => setShowInterestTooltip(true)}
          onMouseLeave={() => setShowInterestTooltip(false)}
        >
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span>👥</span>
            <span>
              {offer.interestCount} 
              {offer.interestCount === 1 ? ' заинтересован' : ' заинтересованы'}
            </span>
          </div>
          
          {showInterestTooltip && offer.interestCount > 0 && (
            <div className="absolute bottom-full left-0 mb-2 w-48 bg-black text-white text-xs rounded py-1 px-2 z-10">
              {offer.interestCount} сотрудников выразили интерес к этой смене
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Размещено {formatRelativeDate(offer.postedAt)}
        </div>
      </div>

      {/* Actions */}
      {!isExpired() && (
        <div className="flex items-center gap-2">
          {!isMyOffer && !hasExpressedInterest && (
            <button
              onClick={() => onExpressInterest(offer.id)}
              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Заинтересован
            </button>
          )}
          
          {!isMyOffer && hasExpressedInterest && (
            <div className="flex-1 px-4 py-2 bg-green-100 text-green-800 rounded-lg text-sm font-medium text-center">
              ✓ Интерес выражен
            </div>
          )}
          
          {isMyOffer && (
            <div className="flex-1 px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm text-center">
              Ваше предложение
            </div>
          )}
          
          <button
            onClick={() => onViewDetails(offer.id)}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
          >
            Детали
          </button>
          
          {!isMyOffer && (
            <button
              onClick={() => onMessage(offer.id)}
              className="px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors text-sm"
              title="Написать сообщение"
            >
              💬
            </button>
          )}
        </div>
      )}

      {/* Expired state actions */}
      {isExpired() && (
        <div className="text-center text-sm text-gray-500 py-2">
          Предложение истекло
        </div>
      )}
    </div>
  );
};

export default ShiftOfferCard;