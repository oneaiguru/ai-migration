import React, { useState, useEffect } from 'react';

interface MyOffersProps {
  employeeId: string;
  onEditOffer: (offerId: string) => void;
  onCancelOffer: (offerId: string) => void;
  onViewInterests: (offerId: string) => void;
  onAcceptExchange: (offerId: string, interestedEmployeeId: string) => void;
  onCreateNewOffer: () => void;
}

interface MyShiftOffer {
  id: string;
  shift: {
    date: Date;
    startTime: string;
    endTime: string;
    type: 'regular' | 'overtime' | 'training' | 'night' | 'holiday';
    location?: string;
    description?: string;
    duration: number;
  };
  reason?: string;
  wantedInReturn?: string;
  postedAt: Date;
  expiresAt: Date;
  status: 'active' | 'pending_exchange' | 'completed' | 'expired' | 'cancelled';
  interestedEmployees: InterestedEmployee[];
  exchangeType: 'any_shift' | 'specific_date' | 'specific_shift' | 'flexible';
  urgency: 'low' | 'normal' | 'high';
  views: number;
  messages: number;
}

interface InterestedEmployee {
  id: string;
  name: string;
  position: string;
  team: string;
  avatar?: string;
  interestedAt: Date;
  message?: string;
  proposedExchange?: {
    date: Date;
    startTime: string;
    endTime: string;
    type: string;
  };
  status: 'interested' | 'proposed' | 'accepted' | 'declined';
}

const MyOffers: React.FC<MyOffersProps> = ({
  employeeId,
  onEditOffer,
  onCancelOffer,
  onViewInterests,
  onAcceptExchange,
  onCreateNewOffer
}) => {
  const [offers, setOffers] = useState<MyShiftOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'all'>('active');
  const [sortBy, setSortBy] = useState<'date' | 'posted' | 'interest' | 'expires'>('date');

  // Load user's offers
  useEffect(() => {
    const loadMyOffers = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 600));
      
      const mockOffers: MyShiftOffer[] = [
        {
          id: 'my-1',
          shift: {
            date: new Date('2025-06-20'),
            startTime: '14:00',
            endTime: '23:00',
            type: 'regular',
            duration: 8,
            location: 'Офис центр'
          },
          reason: 'Семейный ужин, который нельзя перенести',
          wantedInReturn: 'Утренняя смена в любой день этой недели',
          postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
          status: 'active',
          interestedEmployees: [
            {
              id: 'emp2',
              name: 'Петрова Анна Ивановна',
              position: 'Старший оператор',
              team: 'Поддержка клиентов',
              interestedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
              message: 'Готова обменяться! У меня утренняя смена в четверг',
              proposedExchange: {
                date: new Date('2025-06-19'),
                startTime: '08:00',
                endTime: '17:00',
                type: 'regular'
              },
              status: 'proposed'
            },
            {
              id: 'emp5',
              name: 'Козлов Дмитрий Сергеевич',
              position: 'Оператор',
              team: 'Техническая поддержка',
              interestedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
              message: 'Заинтересован в обмене',
              status: 'interested'
            }
          ],
          exchangeType: 'specific_shift',
          urgency: 'normal',
          views: 24,
          messages: 3
        },
        {
          id: 'my-2',
          shift: {
            date: new Date('2025-06-25'),
            startTime: '23:00',
            endTime: '08:00',
            type: 'night',
            duration: 8,
            location: 'Офис центр'
          },
          reason: 'Хочу перейти на дневные смены',
          wantedInReturn: 'Любая дневная смена',
          postedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          status: 'active',
          interestedEmployees: [],
          exchangeType: 'flexible',
          urgency: 'low',
          views: 8,
          messages: 0
        },
        {
          id: 'my-3',
          shift: {
            date: new Date('2025-06-10'),
            startTime: '09:00',
            endTime: '18:00',
            type: 'training',
            duration: 8,
            location: 'Учебный центр'
          },
          reason: 'Уже прошел обучение по этой теме',
          wantedInReturn: 'Рабочая смена или выходной',
          postedAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          status: 'completed',
          interestedEmployees: [
            {
              id: 'emp8',
              name: 'Сидорова Мария Петровна',
              position: 'Оператор',
              team: 'Качество',
              interestedAt: new Date(Date.now() - 36 * 60 * 60 * 1000),
              status: 'accepted'
            }
          ],
          exchangeType: 'any_shift',
          urgency: 'normal',
          views: 15,
          messages: 2
        }
      ];
      
      setOffers(mockOffers);
      setLoading(false);
    };
    
    loadMyOffers();
  }, [employeeId]);

  const getFilteredOffers = () => {
    let filtered = [...offers];
    
    switch (activeTab) {
      case 'active':
        filtered = filtered.filter(offer => 
          ['active', 'pending_exchange'].includes(offer.status)
        );
        break;
      case 'completed':
        filtered = filtered.filter(offer => 
          ['completed', 'expired', 'cancelled'].includes(offer.status)
        );
        break;
      // 'all' shows everything
    }
    
    // Sort offers
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return a.shift.date.getTime() - b.shift.date.getTime();
        case 'posted':
          return b.postedAt.getTime() - a.postedAt.getTime();
        case 'interest':
          return b.interestedEmployees.length - a.interestedEmployees.length;
        case 'expires':
          return a.expiresAt.getTime() - b.expiresAt.getTime();
        default:
          return 0;
      }
    });
    
    return filtered;
  };

  const getStatusColor = (status: MyShiftOffer['status']) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      pending_exchange: 'bg-yellow-100 text-yellow-800',
      completed: 'bg-blue-100 text-blue-800',
      expired: 'bg-gray-100 text-gray-600',
      cancelled: 'bg-red-100 text-red-800'
    };
    return colors[status];
  };

  const getStatusText = (status: MyShiftOffer['status']) => {
    const texts = {
      active: 'Активно',
      pending_exchange: 'Ожидает обмена',
      completed: 'Завершено',
      expired: 'Истекло',
      cancelled: 'Отменено'
    };
    return texts[status];
  };

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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatRelativeDate = (date: Date) => {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'сегодня';
    if (diffDays === 1) return 'завтра';
    if (diffDays > 0) return `через ${diffDays} дн.`;
    return `${Math.abs(diffDays)} дн. назад`;
  };

  const handleAcceptInterest = (offerId: string, employeeId: string) => {
    setOffers(prev => 
      prev.map(offer => {
        if (offer.id === offerId) {
          return {
            ...offer,
            status: 'pending_exchange' as const,
            interestedEmployees: offer.interestedEmployees.map(emp => 
              emp.id === employeeId 
                ? { ...emp, status: 'accepted' as const }
                : { ...emp, status: 'declined' as const }
            )
          };
        }
        return offer;
      })
    );
    
    onAcceptExchange(offerId, employeeId);
  };

  const handleCancelOffer = (offerId: string) => {
    if (window.confirm('Вы уверены, что хотите отменить это предложение?')) {
      setOffers(prev => 
        prev.map(offer => 
          offer.id === offerId 
            ? { ...offer, status: 'cancelled' as const }
            : offer
        )
      );
      
      onCancelOffer(offerId);
    }
  };

  const filteredOffers = getFilteredOffers();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Мои предложения</h2>
          <p className="text-sm text-gray-500 mt-1">
            Управление вашими предложениями по обмену смен
          </p>
        </div>
        
        <button
          onClick={onCreateNewOffer}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Предложить смену
        </button>
      </div>

      {/* Tabs and Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Tabs */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {(['active', 'completed', 'all'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === tab
                  ? 'bg-white text-blue-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab === 'active' && 'Активные'}
              {tab === 'completed' && 'Завершенные'}
              {tab === 'all' && 'Все'}
              <span className="ml-2 px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">
                {getFilteredOffers().length}
              </span>
            </button>
          ))}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as any)}
          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
        >
          <option value="date">По дате смены</option>
          <option value="posted">По дате публикации</option>
          <option value="interest">По количеству заинтересованных</option>
          <option value="expires">По сроку истечения</option>
        </select>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="flex flex-col items-center gap-4">
            <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600">Загрузка предложений...</p>
          </div>
        </div>
      ) : filteredOffers.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-4xl mb-4">📝</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {activeTab === 'active' 
              ? 'Нет активных предложений'
              : activeTab === 'completed'
              ? 'Нет завершенных обменов'
              : 'Вы еще не создавали предложений'
            }
          </h3>
          <p className="text-gray-500 mb-4">
            {activeTab === 'active' 
              ? 'Создайте предложение, чтобы обменяться сменой с коллегами'
              : 'История ваших обменов будет отображаться здесь'
            }
          </p>
          {activeTab === 'active' && (
            <button
              onClick={onCreateNewOffer}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Создать предложение
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOffers.map((offer) => (
            <div key={offer.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
              
              {/* Offer Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-medium text-gray-900">
                      {formatDate(offer.shift.date)} • {offer.shift.startTime} - {offer.shift.endTime}
                    </h3>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getShiftTypeColor(offer.shift.type)}`}>
                      {offer.shift.type === 'regular' ? 'Обычная' :
                       offer.shift.type === 'overtime' ? 'Сверхурочная' :
                       offer.shift.type === 'training' ? 'Обучение' :
                       offer.shift.type === 'night' ? 'Ночная' : 'Праздничная'}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded ${getStatusColor(offer.status)}`}>
                      {getStatusText(offer.status)}
                    </span>
                  </div>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    <div><strong>Продолжительность:</strong> {offer.shift.duration} ч.</div>
                    {offer.shift.location && (
                      <div><strong>Место:</strong> {offer.shift.location}</div>
                    )}
                    {offer.reason && (
                      <div><strong>Причина:</strong> {offer.reason}</div>
                    )}
                    {offer.wantedInReturn && (
                      <div><strong>Хочу взамен:</strong> {offer.wantedInReturn}</div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 ml-4">
                  {offer.status === 'active' && (
                    <>
                      <button
                        onClick={() => onEditOffer(offer.id)}
                        className="px-3 py-1 text-sm border border-blue-300 text-blue-600 rounded hover:bg-blue-50 transition-colors"
                      >
                        Редактировать
                      </button>
                      <button
                        onClick={() => handleCancelOffer(offer.id)}
                        className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50 transition-colors"
                      >
                        Отменить
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-6 text-sm text-gray-500 mb-4">
                <div className="flex items-center gap-1">
                  <span>👁️</span>
                  <span>{offer.views} просмотров</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>👥</span>
                  <span>{offer.interestedEmployees.length} заинтересованных</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>💬</span>
                  <span>{offer.messages} сообщений</span>
                </div>
                <div className="flex items-center gap-1">
                  <span>⏰</span>
                  <span>Истекает {formatRelativeDate(offer.expiresAt)}</span>
                </div>
              </div>

              {/* Interested Employees */}
              {offer.interestedEmployees.length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-medium text-gray-900 mb-3">
                    Заинтересованные сотрудники ({offer.interestedEmployees.length})
                  </h4>
                  
                  <div className="space-y-3">
                    {offer.interestedEmployees.slice(0, 3).map((employee) => (
                      <div key={employee.id} className="flex items-start justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-start gap-3">
                          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                            {employee.avatar ? (
                              <img src={employee.avatar} alt={employee.name} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              employee.name.charAt(0)
                            )}
                          </div>
                          
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">{employee.name}</div>
                            <div className="text-sm text-gray-600">{employee.position} • {employee.team}</div>
                            
                            {employee.message && (
                              <div className="text-sm text-gray-700 mt-1 italic">
                                "{employee.message}"
                              </div>
                            )}
                            
                            {employee.proposedExchange && (
                              <div className="text-sm text-green-700 mt-1">
                                <strong>Предлагает:</strong> {formatDate(employee.proposedExchange.date)} 
                                • {employee.proposedExchange.startTime} - {employee.proposedExchange.endTime}
                              </div>
                            )}
                            
                            <div className="text-xs text-gray-500 mt-1">
                              Заинтересовался {formatRelativeDate(employee.interestedAt)}
                            </div>
                          </div>
                        </div>

                        {/* Employee Actions */}
                        {offer.status === 'active' && employee.status === 'interested' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAcceptInterest(offer.id, employee.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Принять
                            </button>
                            <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                              Написать
                            </button>
                          </div>
                        )}
                        
                        {employee.status === 'proposed' && (
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleAcceptInterest(offer.id, employee.id)}
                              className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                            >
                              Согласиться
                            </button>
                            <button className="px-3 py-1 text-sm border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors">
                              Обсудить
                            </button>
                          </div>
                        )}
                        
                        {employee.status === 'accepted' && (
                          <span className="px-3 py-1 text-sm bg-green-100 text-green-800 rounded">
                            ✓ Принято
                          </span>
                        )}
                      </div>
                    ))}
                    
                    {offer.interestedEmployees.length > 3 && (
                      <button
                        onClick={() => onViewInterests(offer.id)}
                        className="w-full text-sm text-blue-600 hover:text-blue-800 py-2"
                      >
                        Показать еще {offer.interestedEmployees.length - 3} заинтересованных
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyOffers;