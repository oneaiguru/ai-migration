import React, { useState, useEffect } from 'react';

interface InterestsListProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  onAcceptInterest: (employeeId: string, proposalData?: ExchangeProposal) => void;
  onDeclineInterest: (employeeId: string) => void;
  onStartChat: (employeeId: string) => void;
}

interface InterestedEmployee {
  id: string;
  name: string;
  position: string;
  team: string;
  avatar?: string;
  rating?: number;
  exchangeCount?: number;
  interestedAt: Date;
  message?: string;
  status: 'interested' | 'proposed' | 'accepted' | 'declined' | 'pending';
  proposedExchange?: ExchangeProposal;
  lastActive?: Date;
  responseTime?: number; // average hours to respond
}

interface ExchangeProposal {
  shiftDate: Date;
  startTime: string;
  endTime: string;
  shiftType: string;
  location: string;
  duration: number;
  notes?: string;
  flexibility?: 'strict' | 'some' | 'flexible';
}

interface ShiftOffer {
  id: string;
  shift: {
    date: Date;
    startTime: string;
    endTime: string;
    type: string;
    location: string;
    duration: number;
  };
  employee: {
    name: string;
    position: string;
    team: string;
  };
  reason?: string;
  wantedInReturn?: string;
}

const InterestsList: React.FC<InterestsListProps> = ({
  isOpen,
  onClose,
  offerId,
  onAcceptInterest,
  onDeclineInterest,
  onStartChat
}) => {
  const [interestedEmployees, setInterestedEmployees] = useState<InterestedEmployee[]>([]);
  const [offer, setOffer] = useState<ShiftOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'time' | 'rating' | 'experience'>('time');
  const [filterBy, setFilterBy] = useState<'all' | 'proposed' | 'interested'>('all');
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [showProposalDetails, setShowProposalDetails] = useState<string | null>(null);

  // Load interested employees and offer details
  useEffect(() => {
    if (isOpen && offerId) {
      loadInterestsList();
    }
  }, [isOpen, offerId]);

  const loadInterestsList = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock offer data
    const mockOffer: ShiftOffer = {
      id: offerId,
      shift: {
        date: new Date('2025-06-20'),
        startTime: '14:00',
        endTime: '23:00',
        type: 'regular',
        location: 'Офис центр',
        duration: 8
      },
      employee: {
        name: 'Иванов Иван Иванович',
        position: 'Оператор',
        team: 'Поддержка клиентов'
      },
      reason: 'Семейный ужин',
      wantedInReturn: 'Утренняя смена в любой день этой недели'
    };
    
    // Mock interested employees
    const mockInterested: InterestedEmployee[] = [
      {
        id: 'emp2',
        name: 'Петрова Анна Ивановна',
        position: 'Старший оператор',
        team: 'Поддержка клиентов',
        rating: 4.8,
        exchangeCount: 12,
        interestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        message: 'Готова обменяться! У меня как раз есть утренняя смена в четверг, которая идеально подойдет.',
        status: 'proposed',
        proposedExchange: {
          shiftDate: new Date('2025-06-19'),
          startTime: '08:00',
          endTime: '17:00',
          shiftType: 'regular',
          location: 'Офис центр',
          duration: 8,
          notes: 'Могу поменяться местами, время удобное',
          flexibility: 'some'
        },
        lastActive: new Date(Date.now() - 30 * 60 * 1000),
        responseTime: 2.5
      },
      {
        id: 'emp5',
        name: 'Козлов Дмитрий Сергеевич',
        position: 'Оператор',
        team: 'Техническая поддержка',
        rating: 4.5,
        exchangeCount: 8,
        interestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        message: 'Заинтересован в обмене. Могу предложить несколько вариантов.',
        status: 'interested',
        lastActive: new Date(Date.now() - 15 * 60 * 1000),
        responseTime: 4.2
      },
      {
        id: 'emp8',
        name: 'Смирнова Елена Владимировна',
        position: 'Супервайзер',
        team: 'Продажи',
        rating: 4.9,
        exchangeCount: 15,
        interestedAt: new Date(Date.now() - 45 * 60 * 1000),
        message: 'У меня есть утренняя смена в пятницу, если подойдет',
        status: 'proposed',
        proposedExchange: {
          shiftDate: new Date('2025-06-21'),
          startTime: '08:00',
          endTime: '17:00',
          shiftType: 'regular',
          location: 'Офис центр',
          duration: 8,
          flexibility: 'flexible'
        },
        lastActive: new Date(Date.now() - 10 * 60 * 1000),
        responseTime: 1.8
      },
      {
        id: 'emp12',
        name: 'Федоров Алексей Николаевич',
        position: 'Оператор',
        team: 'Бэк-офис',
        rating: 4.2,
        exchangeCount: 3,
        interestedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
        status: 'interested',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        responseTime: 8.5
      },
      {
        id: 'emp15',
        name: 'Морозова Ольга Петровна',
        position: 'Оператор',
        team: 'Качество',
        rating: 4.6,
        exchangeCount: 7,
        interestedAt: new Date(Date.now() - 20 * 60 * 1000),
        message: 'Могу поменяться на дневную смену',
        status: 'interested',
        lastActive: new Date(Date.now() - 5 * 60 * 1000),
        responseTime: 3.1
      }
    ];
    
    setOffer(mockOffer);
    setInterestedEmployees(mockInterested);
    setLoading(false);
  };

  const getFilteredAndSortedEmployees = () => {
    let filtered = [...interestedEmployees];
    
    // Apply filter
    switch (filterBy) {
      case 'proposed':
        filtered = filtered.filter(emp => emp.status === 'proposed');
        break;
      case 'interested':
        filtered = filtered.filter(emp => emp.status === 'interested');
        break;
      // 'all' shows everything
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'time':
          return b.interestedAt.getTime() - a.interestedAt.getTime();
        case 'rating':
          return (b.rating || 0) - (a.rating || 0);
        case 'experience':
          return (b.exchangeCount || 0) - (a.exchangeCount || 0);
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const handleAccept = (employeeId: string) => {
    const employee = interestedEmployees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    if (window.confirm(`Принять предложение от ${employee.name}?`)) {
      setInterestedEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, status: 'accepted' as const }
            : { ...emp, status: 'declined' as const }
        )
      );
      
      onAcceptInterest(employeeId, employee.proposedExchange);
    }
  };

  const handleDecline = (employeeId: string) => {
    const employee = interestedEmployees.find(emp => emp.id === employeeId);
    if (!employee) return;
    
    if (window.confirm(`Отклонить предложение от ${employee.name}?`)) {
      setInterestedEmployees(prev => 
        prev.map(emp => 
          emp.id === employeeId 
            ? { ...emp, status: 'declined' as const }
            : emp
        )
      );
      
      onDeclineInterest(employeeId);
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeTime = (date: Date) => {
    const now = new Date();
    const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffMinutes < 60) return `${diffMinutes} мин. назад`;
    
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours} ч. назад`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} дн. назад`;
  };

  const getStatusColor = (status: string) => {
    const colors = {
      interested: 'bg-blue-100 text-blue-800',
      proposed: 'bg-green-100 text-green-800',
      accepted: 'bg-green-100 text-green-800',
      declined: 'bg-gray-100 text-gray-600',
      pending: 'bg-yellow-100 text-yellow-800'
    };
    return colors[status as keyof typeof colors] || colors.interested;
  };

  const getStatusText = (status: string) => {
    const texts = {
      interested: 'Заинтересован',
      proposed: 'Предложил обмен',
      accepted: 'Принято',
      declined: 'Отклонено',
      pending: 'Ожидает ответа'
    };
    return texts[status as keyof typeof texts] || status;
  };

  const filteredEmployees = getFilteredAndSortedEmployees();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Заинтересованные сотрудники</h2>
              <p className="text-sm text-gray-600">
                {interestedEmployees.length} сотрудников заинтересованы в этой смене
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
        </div>

        {/* Offer Summary */}
        {offer && (
          <div className="px-6 py-4 bg-blue-50 border-b border-blue-200">
            <h3 className="font-medium text-blue-900 mb-2">Предлагаемая смена</h3>
            <div className="text-sm text-blue-800">
              <strong>{formatDate(offer.shift.date)}</strong> • {offer.shift.startTime} - {offer.shift.endTime} • {offer.shift.duration} ч. • {offer.shift.location}
            </div>
            {offer.wantedInReturn && (
              <div className="text-sm text-blue-700 mt-1">
                <strong>Хочу взамен:</strong> {offer.wantedInReturn}
              </div>
            )}
          </div>
        )}

        {/* Controls */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Filter Tabs */}
            <div className="flex bg-white rounded-lg p-1 border">
              {[
                { value: 'all', label: 'Все', count: interestedEmployees.length },
                { value: 'proposed', label: 'С предложениями', count: interestedEmployees.filter(e => e.status === 'proposed').length },
                { value: 'interested', label: 'Заинтересованы', count: interestedEmployees.filter(e => e.status === 'interested').length }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setFilterBy(tab.value as any)}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    filterBy === tab.value
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label} ({tab.count})
                </button>
              ))}
            </div>

            {/* Sort */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="time">По времени интереса</option>
              <option value="rating">По рейтингу</option>
              <option value="experience">По опыту обменов</option>
            </select>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Загрузка списка...</p>
              </div>
            </div>
          ) : filteredEmployees.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Нет заинтересованных</h3>
              <p className="text-gray-500">
                {filterBy === 'all' 
                  ? 'Пока никто не заинтересовался этой сменой'
                  : `Нет сотрудников в категории "${filterBy === 'proposed' ? 'С предложениями' : 'Заинтересованы'}"`
                }
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-4">
              {filteredEmployees.map((employee) => (
                <div
                  key={employee.id}
                  className={`border rounded-lg p-4 transition-all duration-200 ${
                    selectedEmployee === employee.id ? 'border-blue-300 bg-blue-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    
                    {/* Employee Info */}
                    <div className="flex items-start gap-4 flex-1">
                      {/* Avatar */}
                      <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {employee.avatar ? (
                          <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          employee.name.charAt(0)
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h4 className="font-medium text-gray-900">{employee.name}</h4>
                          <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(employee.status)}`}>
                            {getStatusText(employee.status)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 mb-2">
                          {employee.position} • {employee.team}
                        </div>
                        
                        {/* Trust Indicators */}
                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-2">
                          {employee.rating && (
                            <div className="flex items-center gap-1">
                              <span>⭐</span>
                              <span>{employee.rating.toFixed(1)}</span>
                            </div>
                          )}
                          {employee.exchangeCount && employee.exchangeCount > 0 && (
                            <div>{employee.exchangeCount} обменов</div>
                          )}
                          {employee.responseTime && (
                            <div>~{employee.responseTime}ч ответ</div>
                          )}
                          <div className="flex items-center gap-1">
                            <div className={`w-2 h-2 rounded-full ${
                              employee.lastActive && (new Date().getTime() - employee.lastActive.getTime()) < 30 * 60 * 1000
                                ? 'bg-green-400'
                                : 'bg-gray-300'
                            }`}></div>
                            <span>
                              {employee.lastActive 
                                ? formatRelativeTime(employee.lastActive)
                                : 'давно не был'
                              }
                            </span>
                          </div>
                        </div>
                        
                        {/* Message */}
                        {employee.message && (
                          <div className="bg-gray-50 rounded-lg p-3 mb-3">
                            <p className="text-sm text-gray-700 italic">"{employee.message}"</p>
                            <p className="text-xs text-gray-500 mt-1">
                              {formatRelativeTime(employee.interestedAt)}
                            </p>
                          </div>
                        )}
                        
                        {/* Proposed Exchange */}
                        {employee.proposedExchange && (
                          <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-3">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-medium text-green-900">Предлагает взамен:</h5>
                              <button
                                onClick={() => setShowProposalDetails(
                                  showProposalDetails === employee.id ? null : employee.id
                                )}
                                className="text-green-600 hover:text-green-800 text-sm"
                              >
                                {showProposalDetails === employee.id ? 'Скрыть' : 'Детали'}
                              </button>
                            </div>
                            
                            <div className="text-sm text-green-800">
                              <strong>{formatDate(employee.proposedExchange.shiftDate)}</strong> • 
                              {employee.proposedExchange.startTime} - {employee.proposedExchange.endTime} • 
                              {employee.proposedExchange.duration} ч.
                            </div>
                            
                            {showProposalDetails === employee.id && (
                              <div className="mt-2 text-sm text-green-700 space-y-1">
                                <div><strong>Тип:</strong> {employee.proposedExchange.shiftType}</div>
                                <div><strong>Место:</strong> {employee.proposedExchange.location}</div>
                                <div><strong>Гибкость:</strong> {
                                  employee.proposedExchange.flexibility === 'strict' ? 'Строго' :
                                  employee.proposedExchange.flexibility === 'some' ? 'Есть варианты' : 'Гибко'
                                }</div>
                                {employee.proposedExchange.notes && (
                                  <div><strong>Заметки:</strong> {employee.proposedExchange.notes}</div>
                                )}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-2 ml-4">
                      {employee.status === 'interested' && (
                        <>
                          <button
                            onClick={() => onStartChat(employee.id)}
                            className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Написать
                          </button>
                          <button
                            onClick={() => handleDecline(employee.id)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      
                      {employee.status === 'proposed' && (
                        <>
                          <button
                            onClick={() => handleAccept(employee.id)}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                          >
                            Принять
                          </button>
                          <button
                            onClick={() => onStartChat(employee.id)}
                            className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                          >
                            Обсудить
                          </button>
                          <button
                            onClick={() => handleDecline(employee.id)}
                            className="px-3 py-1 text-sm border border-gray-300 text-gray-600 rounded hover:bg-gray-50 transition-colors"
                          >
                            Отклонить
                          </button>
                        </>
                      )}
                      
                      {employee.status === 'accepted' && (
                        <div className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded text-center">
                          ✓ Принято
                        </div>
                      )}
                      
                      {employee.status === 'declined' && (
                        <div className="px-3 py-1 text-sm bg-gray-100 text-gray-600 rounded text-center">
                          Отклонено
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Показано: {filteredEmployees.length} из {interestedEmployees.length} заинтересованных
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InterestsList;