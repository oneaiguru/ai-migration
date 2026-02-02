import React, { useState, useEffect } from 'react';
import EmployeeLayout from './EmployeeLayout';
import PersonalSchedule from './PersonalSchedule';
import RequestList from './RequestList';
import ShiftMarketplace from './ShiftMarketplace';
import MyOffers from './MyOffers';
import ProfileView from './ProfileView';
import PersonalDashboard from './PersonalDashboard';
import RequestForm from './RequestForm';
import OfferForm from './OfferForm';
import ExchangeChat from './ExchangeChat';
import InterestsList from './InterestsList';
import RequestStatus from './RequestStatus';

/**
 * EmployeePortalDemo - Complete Employee Self-Service Portal
 * 
 * This is the main demo component that showcases all functionality
 * in a realistic workflow. It integrates all 40+ components built
 * across the previous tasks into a cohesive employee portal.
 * 
 * Features demonstrated:
 * - Personal schedule management (weekly/monthly views)
 * - Request submission and tracking (vacation, sick leave, shift changes)
 * - Shift exchange marketplace with colleague communication
 * - Profile management with preferences
 * - Personal reports and analytics
 * - Real-time notifications and status updates
 */

interface EmployeePortalDemoProps {
  // Optional props for customization
  theme?: 'light' | 'dark';
  locale?: 'ru' | 'en' | 'ky';
  demoMode?: boolean;
}

// Mock current user data for demo
const DEMO_EMPLOYEE = {
  id: 'emp-001',
  name: 'Иванов Иван Иванович',
  position: 'Оператор',
  team: 'Поддержка клиентов',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  email: 'ivan.ivanov@company.com',
  phone: '+996 555 123 456'
};

type ActiveModule = 
  | 'schedule' 
  | 'requests' 
  | 'exchange' 
  | 'my-offers'
  | 'profile' 
  | 'reports';

interface AppState {
  currentUser: typeof DEMO_EMPLOYEE;
  activeModule: ActiveModule;
  notifications: any[];
  requests: any[];
  offers: any[];
  loading: boolean;
  showModal: string | null;
  modalData: any;
}

const EmployeePortalDemo: React.FC<EmployeePortalDemoProps> = ({
  theme = 'light',
  locale = 'ru',
  demoMode = true
}) => {
  const [appState, setAppState] = useState<AppState>({
    currentUser: DEMO_EMPLOYEE,
    activeModule: 'schedule',
    notifications: [],
    requests: [],
    offers: [],
    loading: true,
    showModal: null,
    modalData: null
  });

  // Demo data initialization
  useEffect(() => {
    initializeDemoData();
  }, []);

  const initializeDemoData = async () => {
    setAppState(prev => ({ ...prev, loading: true }));
    
    // Simulate app initialization
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Initialize with realistic demo data
    const mockNotifications = [
      {
        id: '1',
        type: 'schedule_change',
        title: 'Изменение графика',
        message: 'Ваша смена на завтра перенесена с 08:00 на 09:00',
        timestamp: new Date(Date.now() - 30 * 60 * 1000),
        read: false,
        priority: 'high'
      },
      {
        id: '2',
        type: 'request_update',
        title: 'Заявка одобрена',
        message: 'Ваша заявка на отпуск одобрена менеджером',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        read: false,
        priority: 'normal'
      }
    ];

    const mockRequests = [
      {
        id: 'req-1',
        type: 'vacation',
        title: 'Ежегодный отпуск - семейный отдых',
        status: 'pending_approval',
        startDate: new Date('2025-07-15'),
        endDate: new Date('2025-07-19'),
        submittedAt: new Date('2025-06-01'),
        priority: 'normal'
      }
    ];

    const mockOffers = [
      {
        id: 'offer-1',
        shift: {
          date: new Date('2025-06-20'),
          startTime: '14:00',
          endTime: '23:00',
          type: 'regular'
        },
        interestedEmployees: ['emp-2', 'emp-5'],
        status: 'active'
      }
    ];

    setAppState(prev => ({
      ...prev,
      notifications: mockNotifications,
      requests: mockRequests,
      offers: mockOffers,
      loading: false
    }));

    // Show welcome message in demo mode
    if (demoMode) {
      setTimeout(() => {
        showDemoWelcome();
      }, 500);
    }
  };

  const showDemoWelcome = () => {
    setAppState(prev => ({
      ...prev,
      showModal: 'welcome',
      modalData: {
        title: 'Добро пожаловать в демо-портал сотрудника!',
        message: 'Это полнофункциональная демонстрация портала самообслуживания сотрудников. Вы можете просматривать график, подавать заявки, обмениваться сменами и управлять профилем.',
        features: [
          '📅 Личный график и календарь',
          '📝 Подача и отслеживание заявок',
          '🔄 Обмен сменами с коллегами',
          '👤 Управление профилем',
          '📊 Персональные отчеты'
        ]
      }
    }));
  };

  // Navigation handlers
  const handleModuleChange = (module: ActiveModule) => {
    setAppState(prev => ({ ...prev, activeModule: module }));
  };

  const handleOpenModal = (modalType: string, data?: any) => {
    setAppState(prev => ({
      ...prev,
      showModal: modalType,
      modalData: data
    }));
  };

  const handleCloseModal = () => {
    setAppState(prev => ({
      ...prev,
      showModal: null,
      modalData: null
    }));
  };

  // Action handlers
  const handleSubmitRequest = (requestData: any) => {
    const newRequest = {
      ...requestData,
      id: `req-${Date.now()}`,
      submittedAt: new Date(),
      status: 'submitted'
    };

    setAppState(prev => ({
      ...prev,
      requests: [...prev.requests, newRequest]
    }));

    // Show success notification
    showNotification('success', 'Заявка успешно подана!');
  };

  const handleExpressInterest = (offerId: string) => {
    // Simulate expressing interest in a shift
    showNotification('info', 'Интерес к смене выражен. Владелец смены будет уведомлен.');
  };

  const handleCreateOffer = (offerData: any) => {
    const newOffer = {
      ...offerData,
      id: `offer-${Date.now()}`,
      postedAt: new Date(),
      status: 'active',
      interestedEmployees: []
    };

    setAppState(prev => ({
      ...prev,
      offers: [...prev.offers, newOffer]
    }));

    showNotification('success', 'Предложение обмена создано!');
  };

  const showNotification = (type: 'success' | 'info' | 'warning' | 'error', message: string) => {
    const notification = {
      id: `notif-${Date.now()}`,
      type: 'system',
      title: type === 'success' ? 'Успешно' : type === 'info' ? 'Информация' : 'Уведомление',
      message,
      timestamp: new Date(),
      read: false,
      priority: 'normal'
    };

    setAppState(prev => ({
      ...prev,
      notifications: [notification, ...prev.notifications]
    }));

    // Auto-remove after 5 seconds
    setTimeout(() => {
      setAppState(prev => ({
        ...prev,
        notifications: prev.notifications.filter(n => n.id !== notification.id)
      }));
    }, 5000);
  };

  // Render current module content
  const renderActiveModule = () => {
    const commonProps = {
      employeeId: appState.currentUser.id,
      onAction: handleOpenModal
    };

    switch (appState.activeModule) {
      case 'schedule':
        return <PersonalSchedule {...commonProps} />;
        
      case 'requests':
        return (
          <RequestList
            {...commonProps}
            onCreateRequest={() => handleOpenModal('new-request')}
          />
        );
        
      case 'exchange':
        return (
          <ShiftMarketplace
            currentEmployeeId={appState.currentUser.id}
            onExpressInterest={handleExpressInterest}
            onMessage={(offerId, recipientId) => handleOpenModal('chat', { offerId, recipientId })}
            onViewOfferDetails={(offerId) => handleOpenModal('offer-details', { offerId })}
          />
        );
        
      case 'my-offers':
        return (
          <MyOffers
            {...commonProps}
            onCreateNewOffer={() => handleOpenModal('new-offer')}
            onEditOffer={(offerId) => handleOpenModal('edit-offer', { offerId })}
            onCancelOffer={(offerId) => console.log('Cancel offer:', offerId)}
            onViewInterests={(offerId) => handleOpenModal('interests', { offerId })}
            onAcceptExchange={(offerId, employeeId) => console.log('Accept exchange:', offerId, employeeId)}
          />
        );
        
      case 'profile':
        return (
          <ProfileView
            {...commonProps}
            onSave={(profileData) => {
              console.log('Save profile:', profileData);
              showNotification('success', 'Профиль обновлен!');
            }}
          />
        );
        
      case 'reports':
        return <PersonalDashboard {...commonProps} />;
        
      default:
        return <PersonalSchedule {...commonProps} />;
    }
  };

  // Render modals
  const renderModals = () => {
    switch (appState.showModal) {
      case 'welcome':
        return (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">
                {appState.modalData?.title}
              </h2>
              <p className="text-gray-600 mb-4">{appState.modalData?.message}</p>
              
              <div className="space-y-2 mb-6">
                {appState.modalData?.features?.map((feature: string, index: number) => (
                  <div key={index} className="text-sm text-gray-700">{feature}</div>
                ))}
              </div>
              
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    handleCloseModal();
                    handleModuleChange('schedule');
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Начать знакомство
                </button>
                <button
                  onClick={handleCloseModal}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Пропустить
                </button>
              </div>
            </div>
          </div>
        );

      case 'new-request':
        return (
          <RequestForm
            isOpen={true}
            onClose={handleCloseModal}
            onSubmit={handleSubmitRequest}
          />
        );

      case 'new-offer':
      case 'edit-offer':
        return (
          <OfferForm
            isOpen={true}
            onClose={handleCloseModal}
            onSubmit={handleCreateOffer}
            employeeId={appState.currentUser.id}
            editOffer={appState.showModal === 'edit-offer' ? appState.modalData : undefined}
          />
        );

      case 'chat':
        return (
          <ExchangeChat
            isOpen={true}
            onClose={handleCloseModal}
            offerId={appState.modalData?.offerId}
            otherEmployeeId={appState.modalData?.recipientId}
            currentEmployeeId={appState.currentUser.id}
            onSendProposal={(proposalData) => console.log('Send proposal:', proposalData)}
            onAcceptProposal={(proposalId) => console.log('Accept proposal:', proposalId)}
          />
        );

      case 'interests':
        return (
          <InterestsList
            isOpen={true}
            onClose={handleCloseModal}
            offerId={appState.modalData?.offerId}
            onAcceptInterest={(employeeId, proposalData) => console.log('Accept interest:', employeeId)}
            onDeclineInterest={(employeeId) => console.log('Decline interest:', employeeId)}
            onStartChat={(employeeId) => handleOpenModal('chat', { 
              offerId: appState.modalData?.offerId, 
              recipientId: employeeId 
            })}
          />
        );

      case 'request-status':
        return (
          <RequestStatus
            isOpen={true}
            onClose={handleCloseModal}
            requestId={appState.modalData?.requestId}
            onAction={(action, data) => console.log('Request action:', action, data)}
          />
        );

      default:
        return null;
    }
  };

  if (appState.loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Загрузка портала сотрудника</h2>
            <p className="text-gray-600 mt-1">Инициализация системы...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${theme === 'dark' ? 'dark' : ''}`}>
      <EmployeeLayout currentUser={appState.currentUser}>
        {/* Navigation Menu */}
        <nav className="mb-6">
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'schedule', label: 'График', icon: '📅' },
              { id: 'requests', label: 'Заявки', icon: '📝' },
              { id: 'exchange', label: 'Обмен смен', icon: '🔄' },
              { id: 'my-offers', label: 'Мои предложения', icon: '📋' },
              { id: 'reports', label: 'Отчеты', icon: '📊' },
              { id: 'profile', label: 'Профиль', icon: '👤' }
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => handleModuleChange(item.id as ActiveModule)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 ${
                  appState.activeModule === item.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white border border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <span>{item.icon}</span>
                {item.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Module Content */}
        <main>
          {renderActiveModule()}
        </main>

        {/* Demo Floating Action Button */}
        {demoMode && (
          <button
            onClick={() => handleOpenModal('welcome')}
            className="fixed bottom-6 right-6 w-14 h-14 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition-all duration-200 flex items-center justify-center text-xl z-40"
            title="Показать справку по демо"
          >
            ❓
          </button>
        )}

        {/* Quick Stats Widget (Demo Feature) */}
        {demoMode && (
          <div className="fixed bottom-6 left-6 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-40">
            <h4 className="font-medium text-gray-900 mb-2">📊 Демо статистика</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Активные заявки:</span>
                <span className="font-medium">{appState.requests.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Мои предложения:</span>
                <span className="font-medium">{appState.offers.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Уведомления:</span>
                <span className="font-medium">{appState.notifications.filter(n => !n.read).length}</span>
              </div>
            </div>
          </div>
        )}
      </EmployeeLayout>

      {/* Render Modals */}
      {renderModals()}
    </div>
  );
};

export default EmployeePortalDemo;