import React, { useState, useEffect } from 'react';
import ShiftOfferCard from './ShiftOfferCard';
import ExchangeFilters from './ExchangeFilters';

interface ShiftMarketplaceProps {
  currentEmployeeId: string;
  onExpressInterest: (offerId: string) => void;
  onMessage: (offerId: string, recipientId: string) => void;
  onViewOfferDetails: (offerId: string) => void;
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
    duration: number;
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

interface ExchangeFilters {
  dateRange: { start: string; end: string };
  shiftTypes: string[];
  teams: string[];
  timeSlots: string[];
  onlyMySkills: boolean;
  urgentOnly: boolean;
  exchangeTypes: string[];
  search: string;
}

const ShiftMarketplace: React.FC<ShiftMarketplaceProps> = ({
  currentEmployeeId,
  onExpressInterest,
  onMessage,
  onViewOfferDetails
}) => {
  const [offers, setOffers] = useState<ShiftOffer[]>([]);
  const [filteredOffers, setFilteredOffers] = useState<ShiftOffer[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'posted' | 'interest' | 'urgent'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentFilters, setCurrentFilters] = useState<ExchangeFilters>({
    dateRange: { start: '', end: '' },
    shiftTypes: [],
    teams: [],
    timeSlots: [],
    onlyMySkills: false,
    urgentOnly: false,
    exchangeTypes: [],
    search: ''
  });

  const availableTeams = [
    'Поддержка клиентов',
    'Техническая поддержка',
    'Продажи',
    'Бэк-офис',
    'Супервайзеры',
    'Качество'
  ];

  // Mock data - in real app would come from API
  useEffect(() => {
    const loadOffers = async () => {
      setLoading(true);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockOffers: ShiftOffer[] = [
        {
          id: '1',
          employee: {
            id: 'emp2',
            name: 'Петрова Анна Ивановна',
            position: 'Старший оператор',
            team: 'Поддержка клиентов',
            rating: 4.8,
            exchangeCount: 12
          },
          shift: {
            date: new Date('2025-06-15'),
            startTime: '08:00',
            endTime: '17:00',
            type: 'regular',
            duration: 8,
            location: 'Офис центр'
          },
          reason: 'Семейные обстоятельства - необходимо забрать ребенка из школы',
          wantedInReturn: 'Вечерняя смена в тот же день или любая смена на следующей неделе',
          postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          interestCount: 3,
          status: 'available',
          interestedEmployees: ['emp5', 'emp8', 'emp12'],
          exchangeType: 'specific_date',
          urgency: 'normal'
        },
        {
          id: '2',
          employee: {
            id: 'emp3',
            name: 'Козлов Дмитрий Сергеевич',
            position: 'Оператор',
            team: 'Техническая поддержка',
            rating: 4.5,
            exchangeCount: 8
          },
          shift: {
            date: new Date('2025-06-18'),
            startTime: '23:00',
            endTime: '08:00',
            type: 'night',
            duration: 8,
            location: 'Офис центр'
          },
          reason: 'Хочу поменять на дневную смену',
          wantedInReturn: 'Любая дневная смена в течение недели',
          postedAt: new Date(Date.now() - 5 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          interestCount: 1,
          status: 'available',
          interestedEmployees: ['emp7'],
          exchangeType: 'flexible',
          urgency: 'low'
        },
        {
          id: '3',
          employee: {
            id: 'emp4',
            name: 'Смирнова Елена Владимировна',
            position: 'Супервайзер',
            team: 'Продажи',
            rating: 4.9,
            exchangeCount: 15
          },
          shift: {
            date: new Date('2025-06-12'),
            startTime: '14:00',
            endTime: '22:00',
            type: 'overtime',
            duration: 8,
            location: 'Удаленно'
          },
          reason: 'Срочно! Медицинский прием, который нельзя перенести',
          wantedInReturn: 'Любая смена в ближайшие дни',
          postedAt: new Date(Date.now() - 30 * 60 * 1000),
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
          interestCount: 5,
          status: 'available',
          interestedEmployees: ['emp1', 'emp6', 'emp9', 'emp11', 'emp13'],
          exchangeType: 'any_shift',
          urgency: 'high'
        },
        {
          id: '4',
          employee: {
            id: 'emp6',
            name: 'Иванов Алексей Петрович',
            position: 'Оператор',
            team: 'Бэк-офис',
            rating: 4.3,
            exchangeCount: 5
          },
          shift: {
            date: new Date('2025-06-20'),
            startTime: '09:00',
            endTime: '18:00',
            type: 'training',
            duration: 8,
            location: 'Учебный центр'
          },
          reason: 'Уже прошел это обучение, хочу поменять на рабочую смену',
          wantedInReturn: 'Обычная рабочая смена в любое время',
          postedAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
          interestCount: 2,
          status: 'available',
          interestedEmployees: ['emp10', 'emp14'],
          exchangeType: 'specific_shift',
          urgency: 'normal'
        },
        {
          id: '5',
          employee: {
            id: 'emp7',
            name: 'Федорова Мария Александровна',
            position: 'Оператор',
            team: 'Качество',
            rating: 4.6,
            exchangeCount: 7
          },
          shift: {
            date: new Date('2025-06-25'),
            startTime: '10:00',
            endTime: '19:00',
            type: 'holiday',
            duration: 8,
            location: 'Офис центр'
          },
          wantedInReturn: 'Выходной день или смена в будни',
          postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          interestCount: 4,
          status: 'available',
          interestedEmployees: ['emp2', 'emp8', 'emp15', 'emp16'],
          exchangeType: 'flexible',
          urgency: 'normal'
        }
      ];
      
      setOffers(mockOffers);
      setLoading(false);
    };
    
    loadOffers();
  }, []);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...offers];
    
    // Apply filters
    if (currentFilters.search) {
      const search = currentFilters.search.toLowerCase();
      filtered = filtered.filter(offer => 
        offer.employee.name.toLowerCase().includes(search) ||
        offer.employee.team.toLowerCase().includes(search) ||
        offer.reason?.toLowerCase().includes(search) ||
        offer.wantedInReturn?.toLowerCase().includes(search)
      );
    }
    
    if (currentFilters.shiftTypes.length > 0) {
      filtered = filtered.filter(offer => 
        currentFilters.shiftTypes.includes(offer.shift.type)
      );
    }
    
    if (currentFilters.teams.length > 0) {
      filtered = filtered.filter(offer => 
        currentFilters.teams.includes(offer.employee.team)
      );
    }
    
    if (currentFilters.exchangeTypes.length > 0) {
      filtered = filtered.filter(offer => 
        currentFilters.exchangeTypes.includes(offer.exchangeType)
      );
    }
    
    if (currentFilters.dateRange.start) {
      const startDate = new Date(currentFilters.dateRange.start);
      filtered = filtered.filter(offer => offer.shift.date >= startDate);
    }
    
    if (currentFilters.dateRange.end) {
      const endDate = new Date(currentFilters.dateRange.end);
      filtered = filtered.filter(offer => offer.shift.date <= endDate);
    }
    
    if (currentFilters.urgentOnly) {
      filtered = filtered.filter(offer => offer.urgency === 'high');
    }
    
    if (currentFilters.onlyMySkills) {
      // Mock skill matching - in real app would check against employee skills
      filtered = filtered.filter(offer => 
        offer.shift.type === 'regular' || offer.shift.type === 'overtime'
      );
    }
    
    // Filter out expired offers
    filtered = filtered.filter(offer => 
      offer.status === 'available' && new Date() < offer.expiresAt
    );
    
    // Filter out own offers
    filtered = filtered.filter(offer => offer.employee.id !== currentEmployeeId);
    
    // Apply sorting
    filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = a.shift.date.getTime() - b.shift.date.getTime();
          break;
        case 'posted':
          comparison = b.postedAt.getTime() - a.postedAt.getTime();
          break;
        case 'interest':
          comparison = b.interestCount - a.interestCount;
          break;
        case 'urgent':
          const urgencyOrder = { high: 3, normal: 2, low: 1 };
          comparison = urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    setFilteredOffers(filtered);
  }, [offers, currentFilters, sortBy, sortOrder, currentEmployeeId]);

  const handleExpressInterest = (offerId: string) => {
    // Update local state to show interest immediately
    setOffers(prev => 
      prev.map(offer => 
        offer.id === offerId 
          ? {
              ...offer,
              interestCount: offer.interestCount + 1,
              interestedEmployees: [...offer.interestedEmployees, currentEmployeeId]
            }
          : offer
      )
    );
    
    onExpressInterest(offerId);
  };

  const handleMessage = (offerId: string) => {
    const offer = offers.find(o => o.id === offerId);
    if (offer) {
      onMessage(offerId, offer.employee.id);
    }
  };

  const getSortOptions = () => [
    { value: 'date-asc', label: 'Дата (ближайшие)' },
    { value: 'date-desc', label: 'Дата (дальние)' },
    { value: 'posted-desc', label: 'Недавно размещенные' },
    { value: 'interest-desc', label: 'Популярные' },
    { value: 'urgent-desc', label: 'Срочные первыми' }
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-gray-900">Обмен сменами</h2>
          <p className="text-sm text-gray-500 mt-1">
            Найдите подходящие смены для обмена с коллегами
          </p>
        </div>
        
        <div className="flex items-center gap-3">
          {/* View Mode Toggle */}
          <div className="flex bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'grid' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              🔲 Сетка
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-3 py-1 text-sm font-medium rounded-md transition-colors ${
                viewMode === 'list' 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              📋 Список
            </button>
          </div>
          
          {/* Sort */}
          <select
            value={`${sortBy}-${sortOrder}`}
            onChange={(e) => {
              const [sort, order] = e.target.value.split('-');
              setSortBy(sort as any);
              setSortOrder(order as any);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 text-sm"
          >
            {getSortOptions().map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-6">
        {/* Filters Sidebar */}
        <div className="w-80 flex-shrink-0">
          <ExchangeFilters
            onFiltersChange={setCurrentFilters}
            availableTeams={availableTeams}
          />
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex flex-col items-center gap-4">
                <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Загрузка предложений...</p>
              </div>
            </div>
          ) : filteredOffers.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">🔄</div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Нет подходящих предложений
              </h3>
              <p className="text-gray-500 mb-4">
                Попробуйте изменить фильтры или проверьте позже
              </p>
              <button
                onClick={() => setCurrentFilters({
                  dateRange: { start: '', end: '' },
                  shiftTypes: [],
                  teams: [],
                  timeSlots: [],
                  onlyMySkills: false,
                  urgentOnly: false,
                  exchangeTypes: [],
                  search: ''
                })}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <>
              {/* Results Summary */}
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  Найдено {filteredOffers.length} предложений обмена
                </p>
                
                {/* Quick stats */}
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>
                    🔥 {filteredOffers.filter(o => o.urgency === 'high').length} срочных
                  </span>
                  <span>
                    👥 {filteredOffers.reduce((sum, o) => sum + o.interestCount, 0)} заинтересованных
                  </span>
                </div>
              </div>

              {/* Offers Grid/List */}
              <div className={
                viewMode === 'grid' 
                  ? 'grid grid-cols-1 xl:grid-cols-2 gap-6'
                  : 'space-y-4'
              }>
                {filteredOffers.map((offer) => (
                  <ShiftOfferCard
                    key={offer.id}
                    offer={offer}
                    onExpressInterest={handleExpressInterest}
                    onViewDetails={onViewOfferDetails}
                    onMessage={handleMessage}
                    currentEmployeeId={currentEmployeeId}
                  />
                ))}
              </div>
              
              {/* Load More (if implementing pagination) */}
              {filteredOffers.length >= 10 && (
                <div className="text-center mt-8">
                  <button className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                    Показать еще
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ShiftMarketplace;