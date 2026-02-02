import React, { useState, useMemo } from 'react';
import { AdminRequestsLayout } from './AdminRequestsLayout';
import { AdminRequestsFilters } from './AdminRequestsFilters';
import { RequestsDataTable } from './RequestsDataTable';
import { RequestDetailsModal } from './RequestDetailsModal';
import { ExportManager } from './ExportManager';
import { AdminRequest, FilterState, Employee } from '../../types';
import { mockAdminRequests, mockEmployees, defaultFilterState } from '../../data/mockData';
import { ArrowLeft, CheckSquare, XSquare, Filter } from 'lucide-react';

interface AdminRequestsProps {
  onBack?: () => void;
}

export const AdminRequests: React.FC<AdminRequestsProps> = ({ onBack }) => {
  const [activeSection, setActiveSection] = useState<'schedule_changes' | 'shift_exchanges'>('schedule_changes');
  const [filterState, setFilterState] = useState<FilterState>(defaultFilterState);
  const [requests, setRequests] = useState<AdminRequest[]>(mockAdminRequests);
  const [loading, setLoading] = useState(false);
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<AdminRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter requests based on current filters and section
  const filteredRequests = useMemo(() => {
    let filtered = requests;

    // Filter by section type
    if (activeSection === 'schedule_changes') {
      filtered = filtered.filter(req => req.type === 'schedule_change');
    } else {
      filtered = filtered.filter(req => req.type === 'shift_exchange');
    }

    // Apply filter state
    switch (filterState.mode) {
      case 'current':
        // Show pending and recently processed requests
        filtered = filtered.filter(req => 
          req.status === 'pending' || 
          (req.submissionDate > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)) // Last 7 days
        );
        break;
      
      case 'period':
        if (filterState.startDate) {
          filtered = filtered.filter(req => req.submissionDate >= filterState.startDate!);
        }
        if (filterState.endDate) {
          filtered = filtered.filter(req => req.submissionDate <= filterState.endDate!);
        }
        break;
      
      case 'employee':
        if (filterState.selectedEmployee) {
          filtered = filtered.filter(req => 
            req.employeeName.toLowerCase().includes(filterState.selectedEmployee!.toLowerCase())
          );
        }
        break;
    }

    return filtered.sort((a, b) => b.submissionDate.getTime() - a.submissionDate.getTime());
  }, [requests, activeSection, filterState]);

  const handleSectionChange = (section: 'schedule_changes' | 'shift_exchanges') => {
    setActiveSection(section);
  };

  const handleFilterChange = (newFilterState: FilterState) => {
    setFilterState(newFilterState);
  };

  const handleRefresh = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    setLoading(false);
  };

  const handleRequestSelect = (request: AdminRequest) => {
    setSelectedRequest(request);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setSelectedRequest(null);
  };

  const handleStatusChange = async (requestId: string, status: 'approved' | 'rejected', notes?: string) => {
    setRequests(prevRequests =>
      prevRequests.map(req =>
        req.id === requestId
          ? { 
              ...req, 
              status, 
              managerNotes: notes || `${status === 'approved' ? 'Одобрено' : 'Отклонено'} администратором` 
            }
          : req
      )
    );
  };

  const handleBulkAction = async (action: 'approve' | 'reject') => {
    if (selectedRequestIds.length === 0) return;
    
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setRequests(prevRequests =>
      prevRequests.map(req =>
        selectedRequestIds.includes(req.id)
          ? { 
              ...req, 
              status: action === 'approve' ? 'approved' : 'rejected',
              managerNotes: `${action === 'approve' ? 'Одобрено' : 'Отклонено'} массовой операцией`
            }
          : req
      )
    );
    
    setSelectedRequestIds([]);
    setLoading(false);
  };

  const handleSelectRequest = (requestId: string, selected: boolean) => {
    setSelectedRequestIds(prev =>
      selected
        ? [...prev, requestId]
        : prev.filter(id => id !== requestId)
    );
  };

  const handleSelectAll = (selected: boolean) => {
    setSelectedRequestIds(
      selected ? filteredRequests.map(req => req.id) : []
    );
  };

  const handleExport = () => {
    // This function is no longer needed as ExportManager handles exports
    console.log('Export handled by ExportManager component');
  };

  return (
    <AdminRequestsLayout
      activeSection={activeSection}
      onSectionChange={handleSectionChange}
      showNavigation={true}
    >
      {/* Back Button */}
      {onBack && (
        <div className="mb-6">
          <button
            onClick={onBack}
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Назад к отчетам
          </button>
        </div>
      )}

      {/* Enhanced Action Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            {/* Selected Items Info */}
            {selectedRequestIds.length > 0 && (
              <div className="flex items-center space-x-2 text-sm text-gray-600">
                <CheckSquare className="w-4 h-4" />
                <span>Выбрано: {selectedRequestIds.length}</span>
              </div>
            )}
            
            {/* Bulk Actions */}
            {selectedRequestIds.length > 0 && (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBulkAction('approve')}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  <CheckSquare className="w-4 h-4 mr-2" />
                  Одобрить все
                </button>
                <button
                  onClick={() => handleBulkAction('reject')}
                  disabled={loading}
                  className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 disabled:opacity-50"
                >
                  <XSquare className="w-4 h-4 mr-2" />
                  Отклонить все
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2">
            {/* Advanced Filters Toggle */}
            <button
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              <Filter className="w-4 h-4 mr-2" />
              Расширенные фильтры
            </button>

            {/* Export Manager */}
            <ExportManager
              requests={filteredRequests}
              selectedIds={selectedRequestIds}
              title={`Заявки - ${activeSection === 'schedule_changes' ? 'Изменение расписания' : 'Обмен сменами'}`}
            />
          </div>
        </div>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Статус
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Все статусы</option>
                  <option value="pending">На рассмотрении</option>
                  <option value="approved">Одобрено</option>
                  <option value="rejected">Отклонено</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Приоритет
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Все приоритеты</option>
                  <option value="high">Высокий</option>
                  <option value="medium">Средний</option>
                  <option value="low">Низкий</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Отдел
                </label>
                <select className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm">
                  <option value="">Все отделы</option>
                  <option value="contact-center">Контакт-центр</option>
                  <option value="support">Техподдержка</option>
                  <option value="sales">Продажи</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Filters */}
      <AdminRequestsFilters
        filterState={filterState}
        onFilterChange={handleFilterChange}
        employees={mockEmployees}
        loading={loading}
      />

      {/* Data Table */}
      <div className="mt-6">
        <RequestsDataTable
          requests={filteredRequests}
          loading={loading}
          selectedIds={selectedRequestIds}
          onRequestSelect={handleRequestSelect}
          onStatusChange={handleStatusChange}
          onSelectRequest={handleSelectRequest}
          onSelectAll={handleSelectAll}
        />
      </div>

      {/* Modal */}
      {selectedRequest && (
        <RequestDetailsModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={handleModalClose}
          onStatusChange={handleStatusChange}
        />
      )}

      {/* Statistics Summary */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Всего заявок</div>
          <div className="text-2xl font-bold text-gray-900">{filteredRequests.length}</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">На рассмотрении</div>
          <div className="text-2xl font-bold text-yellow-600">
            {filteredRequests.filter(req => req.status === 'pending').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Одобрено</div>
          <div className="text-2xl font-bold text-green-600">
            {filteredRequests.filter(req => req.status === 'approved').length}
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-sm text-gray-600">Отклонено</div>
          <div className="text-2xl font-bold text-red-600">
            {filteredRequests.filter(req => req.status === 'rejected').length}
          </div>
        </div>
      </div>
    </AdminRequestsLayout>
  );
};