import React, { useState, useEffect, useRef } from 'react';

interface ExchangeChatProps {
  isOpen: boolean;
  onClose: () => void;
  offerId: string;
  otherEmployeeId: string;
  currentEmployeeId: string;
  onSendProposal: (proposalData: ExchangeProposal) => void;
  onAcceptProposal: (proposalId: string) => void;
}

interface ChatMessage {
  id: string;
  senderId: string;
  message: string;
  timestamp: Date;
  type: 'text' | 'proposal' | 'system' | 'acceptance';
  proposal?: ExchangeProposal;
  read: boolean;
}

interface ExchangeProposal {
  id: string;
  shiftDate: Date;
  startTime: string;
  endTime: string;
  shiftType: string;
  location: string;
  duration: number;
  notes?: string;
  status: 'proposed' | 'accepted' | 'declined' | 'counter_proposed';
}

interface Employee {
  id: string;
  name: string;
  position: string;
  team: string;
  avatar?: string;
  isOnline: boolean;
  lastSeen?: Date;
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
  wantedInReturn?: string;
}

const ExchangeChat: React.FC<ExchangeChatProps> = ({
  isOpen,
  onClose,
  offerId,
  otherEmployeeId,
  currentEmployeeId,
  onSendProposal,
  onAcceptProposal
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [otherEmployee, setOtherEmployee] = useState<Employee | null>(null);
  const [offer, setOffer] = useState<ShiftOffer | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Quick message templates
  const quickMessages = [
    "Привет! Интересует ваша смена.",
    "Могу предложить обмен",
    "Когда удобно обсудить детали?",
    "Спасибо за предложение",
    "Согласен на обмен",
    "К сожалению, не подходит"
  ];

  // Load chat data
  useEffect(() => {
    if (isOpen) {
      loadChatData();
    }
  }, [isOpen, offerId, otherEmployeeId]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const loadChatData = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 600));
    
    // Mock other employee data
    const mockEmployee: Employee = {
      id: otherEmployeeId,
      name: 'Петрова Анна Ивановна',
      position: 'Старший оператор',
      team: 'Поддержка клиентов',
      isOnline: true,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000)
    };
    
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
      wantedInReturn: 'Утренняя смена в любой день этой недели'
    };
    
    // Mock chat messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        senderId: otherEmployeeId,
        message: 'Привет! Увидела ваше предложение по обмену смен. Очень интересует!',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '2',
        senderId: currentEmployeeId,
        message: 'Здравствуйте! Отлично, какую смену можете предложить взамен?',
        timestamp: new Date(Date.now() - 110 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '3',
        senderId: otherEmployeeId,
        message: 'У меня есть утренняя смена в четверг 19 июня. Время: 08:00-17:00. Подойдет?',
        timestamp: new Date(Date.now() - 100 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '4',
        senderId: otherEmployeeId,
        message: 'Отправляю официальное предложение',
        timestamp: new Date(Date.now() - 95 * 60 * 1000),
        type: 'text',
        read: true
      },
      {
        id: '5',
        senderId: otherEmployeeId,
        message: '',
        timestamp: new Date(Date.now() - 90 * 60 * 1000),
        type: 'proposal',
        proposal: {
          id: 'prop-1',
          shiftDate: new Date('2025-06-19'),
          startTime: '08:00',
          endTime: '17:00',
          shiftType: 'regular',
          location: 'Офис центр',
          duration: 8,
          notes: 'Могу поменяться местами, время мне удобное',
          status: 'proposed'
        },
        read: true
      }
    ];
    
    setOtherEmployee(mockEmployee);
    setOffer(mockOffer);
    setMessages(mockMessages);
    setLoading(false);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || sending) return;
    
    setSending(true);
    
    const message: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderId: currentEmployeeId,
      message: newMessage.trim(),
      timestamp: new Date(),
      type: 'text',
      read: false
    };
    
    setMessages(prev => [...prev, message]);
    setNewMessage('');
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Simulate typing response (50% chance)
    if (Math.random() > 0.5) {
      setTimeout(() => {
        setIsTyping(true);
        
        setTimeout(() => {
          setIsTyping(false);
          
          const responses = [
            "Понятно, дайте подумать",
            "Хорошо, это подходит",
            "Можем обсудить детали",
            "Спасибо за сообщение",
            "Согласен с предложением"
          ];
          
          const response: ChatMessage = {
            id: `msg-${Date.now()}-response`,
            senderId: otherEmployeeId,
            message: responses[Math.floor(Math.random() * responses.length)],
            timestamp: new Date(),
            type: 'text',
            read: false
          };
          
          setMessages(prev => [...prev, response]);
        }, 2000);
      }, 1000);
    }
    
    setSending(false);
  };

  const handleQuickMessage = (message: string) => {
    setNewMessage(message);
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleAcceptProposal = (proposalId: string) => {
    if (window.confirm('Принять это предложение обмена?')) {
      // Update proposal status
      setMessages(prev => 
        prev.map(msg => 
          msg.proposal?.id === proposalId 
            ? { 
                ...msg, 
                proposal: { ...msg.proposal, status: 'accepted' } 
              }
            : msg
        )
      );
      
      // Add system message
      const systemMessage: ChatMessage = {
        id: `sys-${Date.now()}`,
        senderId: 'system',
        message: 'Предложение принято! Обмен будет обработан автоматически.',
        timestamp: new Date(),
        type: 'system',
        read: false
      };
      
      setMessages(prev => [...prev, systemMessage]);
      onAcceptProposal(proposalId);
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-bold relative">
                {otherEmployee?.avatar ? (
                  <img src={otherEmployee.avatar} alt={otherEmployee.name} className="w-full h-full rounded-full object-cover" />
                ) : (
                  otherEmployee?.name.charAt(0) || '?'
                )}
                {otherEmployee?.isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-400 border-2 border-white rounded-full"></div>
                )}
              </div>
              
              {/* Info */}
              <div>
                <h3 className="font-medium text-gray-900">{otherEmployee?.name || 'Загрузка...'}</h3>
                <div className="text-sm text-gray-600">
                  {otherEmployee?.isOnline ? (
                    <span className="text-green-600">В сети</span>
                  ) : otherEmployee?.lastSeen ? (
                    `Был(а) в сети ${formatTime(otherEmployee.lastSeen)}`
                  ) : (
                    'Не в сети'
                  )}
                </div>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              ✕
            </button>
          </div>
          
          {/* Offer Summary */}
          {offer && (
            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="text-sm">
                <strong>Обмен смены:</strong> {formatDate(offer.shift.date)} • {offer.shift.startTime} - {offer.shift.endTime}
              </div>
              {offer.wantedInReturn && (
                <div className="text-sm text-blue-600 mt-1">
                  <strong>Нужно взамен:</strong> {offer.wantedInReturn}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <div className="flex flex-col items-center gap-4">
                <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-gray-600">Загрузка сообщений...</p>
              </div>
            </div>
          ) : (
            <>
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.senderId === currentEmployeeId ? 'justify-end' : 'justify-start'
                  } ${message.type === 'system' ? 'justify-center' : ''}`}
                >
                  {message.type === 'system' ? (
                    <div className="bg-gray-100 text-gray-600 text-sm px-3 py-2 rounded-lg max-w-xs text-center">
                      {message.message}
                    </div>
                  ) : message.type === 'proposal' && message.proposal ? (
                    <div className={`max-w-sm ${
                      message.senderId === currentEmployeeId ? 'ml-auto' : 'mr-auto'
                    }`}>
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <h4 className="font-medium text-green-900 mb-2">Предложение обмена</h4>
                        <div className="text-sm text-green-800 space-y-1">
                          <div><strong>{formatDate(message.proposal.shiftDate)}</strong></div>
                          <div>{message.proposal.startTime} - {message.proposal.endTime}</div>
                          <div>{message.proposal.duration} часов • {message.proposal.location}</div>
                          {message.proposal.notes && (
                            <div className="italic mt-2">"{message.proposal.notes}"</div>
                          )}
                        </div>
                        
                        {message.senderId !== currentEmployeeId && message.proposal.status === 'proposed' && (
                          <div className="flex gap-2 mt-3">
                            <button
                              onClick={() => handleAcceptProposal(message.proposal!.id)}
                              className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700 transition-colors"
                            >
                              Принять
                            </button>
                            <button className="px-3 py-1 border border-gray-300 text-gray-700 text-sm rounded hover:bg-gray-50 transition-colors">
                              Отклонить
                            </button>
                          </div>
                        )}
                        
                        {message.proposal.status === 'accepted' && (
                          <div className="mt-3 text-green-600 text-sm font-medium">
                            ✓ Предложение принято
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-gray-500 mt-1 text-right">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  ) : (
                    <div className={`max-w-xs ${
                      message.senderId === currentEmployeeId ? 'ml-auto' : 'mr-auto'
                    }`}>
                      <div className={`px-4 py-2 rounded-lg ${
                        message.senderId === currentEmployeeId
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-900'
                      }`}>
                        {message.message}
                      </div>
                      <div className={`text-xs text-gray-500 mt-1 ${
                        message.senderId === currentEmployeeId ? 'text-right' : 'text-left'
                      }`}>
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Typing Indicator */}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-gray-100 text-gray-600 px-4 py-2 rounded-lg max-w-xs">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </>
          )}
        </div>

        {/* Quick Messages */}
        <div className="px-4 py-2 border-t border-gray-100">
          <div className="flex flex-wrap gap-2">
            {quickMessages.slice(0, 3).map((msg, index) => (
              <button
                key={index}
                onClick={() => handleQuickMessage(msg)}
                className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors"
              >
                {msg}
              </button>
            ))}
          </div>
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-end gap-3">
            <div className="flex-1">
              <input
                ref={inputRef}
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Напишите сообщение..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                disabled={sending}
              />
            </div>
            
            <button
              onClick={() => setShowProposalForm(!showProposalForm)}
              className="px-3 py-2 border border-blue-300 text-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
              title="Отправить предложение"
            >
              📋
            </button>
            
            <button
              onClick={handleSendMessage}
              disabled={!newMessage.trim() || sending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {sending ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                'Отправить'
              )}
            </button>
          </div>
          
          {/* Proposal Form */}
          {showProposalForm && (
            <div className="mt-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-medium text-blue-900 mb-3">Отправить предложение обмена</h4>
              <p className="text-sm text-blue-700 mb-3">
                Отправьте формальное предложение с деталями вашей смены
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    // This would open a detailed proposal form
                    console.log('Open proposal form');
                    setShowProposalForm(false);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors text-sm"
                >
                  Создать предложение
                </button>
                <button
                  onClick={() => setShowProposalForm(false)}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 transition-colors text-sm"
                >
                  Отмена
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExchangeChat;