import React, { useState, useEffect } from 'react';
import realShiftTemplateService, { ShiftTemplate } from '../services/realShiftTemplateService';

const ShiftTemplateManager: React.FC = () => {
  // Real state management - NO MOCK DATA
  const [templates, setTemplates] = useState<ShiftTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [apiError, setApiError] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState(false);
  const [templateStats, setTemplateStats] = useState({
    totalCount: 0,
    activeCount: 0
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ShiftTemplate | null>(null);
  const [formData, setFormData] = useState<Partial<ShiftTemplate>>({
    name: '',
    startTime: '08:00',
    endTime: '17:00',
    breakDuration: 60,
    color: '#74a689',
    type: 'day',
    workPattern: '5/2',
    isActive: true,
  });
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Load templates on component mount
  useEffect(() => {
    loadTemplates();
  }, []);

  const loadTemplates = async () => {
    setApiError('');
    setIsLoading(true);
    
    try {
      // Check API health first
      const isApiHealthy = await realShiftTemplateService.checkApiHealth();
      if (!isApiHealthy) {
        throw new Error('Shift Template API server is not available. Please try again later.');
      }

      console.log('[REAL SHIFT TEMPLATE] Loading templates...');
      
      const result = await realShiftTemplateService.getAllTemplates();
      
      if (result.success && result.data) {
        console.log('[REAL SHIFT TEMPLATE] Success:', result.data);
        
        setTemplates(result.data.templates);
        setTemplateStats({
          totalCount: result.data.totalCount,
          activeCount: result.data.activeCount
        });
        
      } else {
        // Handle real error from API
        setApiError(result.error || 'Failed to load shift templates');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL SHIFT TEMPLATE] Error loading templates:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDuration = (start: string, end: string): number => {
    const [startHour, startMin] = start.split(':').map(Number);
    const [endHour, endMin] = end.split(':').map(Number);
    
    let startMinutes = startHour * 60 + startMin;
    let endMinutes = endHour * 60 + endMin;
    
    // Handle overnight shifts
    if (endMinutes <= startMinutes) {
      endMinutes += 24 * 60;
    }
    
    return endMinutes - startMinutes;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError('');
    setValidationErrors([]);
    setIsConnecting(true);
    
    try {
      const duration = calculateDuration(formData.startTime!, formData.endTime!);
      
      const templateData = {
        name: formData.name!,
        startTime: formData.startTime!,
        endTime: formData.endTime!,
        duration,
        breakDuration: formData.breakDuration!,
        color: formData.color!,
        type: formData.type!,
        workPattern: formData.workPattern!,
        isActive: formData.isActive!,
      };

      // Validate template data first
      const validationResult = await realShiftTemplateService.validateTemplate(templateData);
      if (validationResult.success && validationResult.data && !validationResult.data.valid) {
        setValidationErrors(validationResult.data.errors);
        return;
      }

      let result;
      if (editingTemplate) {
        // Update existing template
        result = await realShiftTemplateService.updateTemplate(editingTemplate.id, templateData);
        console.log('[REAL SHIFT TEMPLATE] Updating template:', editingTemplate.id);
      } else {
        // Create new template
        result = await realShiftTemplateService.createTemplate(templateData);
        console.log('[REAL SHIFT TEMPLATE] Creating template:', templateData);
      }

      if (result.success && result.data) {
        console.log('[REAL SHIFT TEMPLATE] Operation success:', result.data);
        
        if (editingTemplate) {
          // Update local state with response
          setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? result.data! : t));
        } else {
          // Add new template to local state
          setTemplates(prev => [...prev, result.data!]);
        }
        
        // Refresh stats
        loadTemplates();
        handleCancel();
      } else {
        setApiError(result.error || `Failed to ${editingTemplate ? 'update' : 'create'} template`);
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL SHIFT TEMPLATE] Submit error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsCreating(true);
    console.log('✏️ Editing template:', template.name);
  };

  const handleDelete = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    const confirmDelete = window.confirm(`Вы уверены, что хотите удалить шаблон "${template.name}"?`);
    if (!confirmDelete) return;
    
    setApiError('');
    setIsConnecting(true);
    
    try {
      // Check template usage before deletion
      const usageResult = await realShiftTemplateService.getTemplateUsage(id);
      if (usageResult.success && usageResult.data && !usageResult.data.canDelete) {
        throw new Error(`Cannot delete template "${template.name}": it is being used by ${usageResult.data.employeeCount} employees in ${usageResult.data.scheduleCount} schedules`);
      }
      
      console.log('[REAL SHIFT TEMPLATE] Deleting template:', id);
      
      const result = await realShiftTemplateService.deleteTemplate(id);
      
      if (result.success) {
        console.log('[REAL SHIFT TEMPLATE] Delete success:', template.name);
        
        // Remove from local state
        setTemplates(prev => prev.filter(t => t.id !== id));
        
        // Refresh stats
        loadTemplates();
      } else {
        setApiError(result.error || 'Failed to delete template');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL SHIFT TEMPLATE] Delete error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
    setValidationErrors([]);
    setFormData({
      name: '',
      startTime: '08:00',
      endTime: '17:00',
      breakDuration: 60,
      color: '#74a689',
      type: 'day',
      workPattern: '5/2',
      isActive: true,
    });
  };

  const toggleStatus = async (id: string) => {
    const template = templates.find(t => t.id === id);
    if (!template) return;
    
    setApiError('');
    setIsConnecting(true);
    
    try {
      const newStatus = !template.isActive;
      console.log('[REAL SHIFT TEMPLATE] Toggling status:', id, newStatus);
      
      const result = await realShiftTemplateService.toggleTemplateStatus(id, newStatus);
      
      if (result.success && result.data) {
        console.log('[REAL SHIFT TEMPLATE] Status toggle success:', result.data);
        
        // Update local state with response
        setTemplates(prev => prev.map(t => 
          t.id === id ? result.data! : t
        ));
        
        // Refresh stats
        loadTemplates();
      } else {
        setApiError(result.error || 'Failed to toggle template status');
      }
      
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setApiError(errorMessage);
      console.error('[REAL SHIFT TEMPLATE] Toggle status error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div style={{
        height: 'calc(100vh - 180px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'white'
      }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '24px', marginBottom: '16px' }}>🛠️</div>
          <div style={{ fontSize: '16px', color: '#6b7280' }}>Загрузка шаблонов смен...</div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      padding: '24px'
    }}>
      {/* API Error Display */}
      {apiError && (
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#fee2e2',
          borderLeft: '4px solid #ef4444',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '20px' }}>❌</span>
            <div>
              <div style={{ fontWeight: '600', color: '#991b1b', marginBottom: '4px' }}>
                Ошибка работы с шаблонами
              </div>
              <div style={{ fontSize: '14px', color: '#7f1d1d' }}>
                {apiError}
              </div>
              <button
                onClick={loadTemplates}
                disabled={isConnecting}
                style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  fontSize: '12px',
                  cursor: isConnecting ? 'not-allowed' : 'pointer',
                  opacity: isConnecting ? 0.6 : 1
                }}
              >
                {isConnecting ? 'Повтор...' : 'Повторить'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Loading indicator during operations */}
      {isConnecting && (
        <div style={{
          padding: '12px 24px',
          backgroundColor: '#f0f9ff',
          borderLeft: '4px solid #0ea5e9',
          marginBottom: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ fontSize: '16px' }}>⚙️</span>
            <div style={{ fontSize: '14px', color: '#0c4a6e' }}>
              Обработка шаблона...
            </div>
          </div>
        </div>
      )}
      {/* Header */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginBottom: '24px',
        borderBottom: '1px solid #e5e7eb',
        paddingBottom: '16px'
      }}>
        <div>
          <h1 style={{ 
            fontSize: '24px', 
            fontWeight: 'bold', 
            color: '#111827', 
            margin: 0 
          }}>
            Управление сменами
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Создание и редактирование шаблонов смен
          </p>
        </div>

        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={loadTemplates}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              backgroundColor: '#6b7280',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
              opacity: isConnecting ? 0.6 : 1
            }}
          >
            🔄 {isConnecting ? 'Обновление...' : 'Обновить'}
          </button>
          
          <button
            onClick={() => setIsCreating(true)}
            disabled={isConnecting}
            style={{
              padding: '12px 24px',
              backgroundColor: isConnecting ? '#9ca3af' : '#059669',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '500',
              cursor: isConnecting ? 'not-allowed' : 'pointer',
            }}
          >
            ➕ Создать смену
          </button>
        </div>
      </div>

      {/* Templates Grid */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', 
          gap: '20px',
          marginBottom: '20px'
        }}>
          {templates.map(template => (
            <div
              key={template.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                padding: '20px',
                backgroundColor: 'white',
                boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
                position: 'relative'
              }}
            >
              {/* Status Badge */}
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                padding: '4px 8px',
                borderRadius: '12px',
                fontSize: '12px',
                fontWeight: '500',
                backgroundColor: template.isActive ? '#dcfce7' : '#fef3c7',
                color: template.isActive ? '#166534' : '#92400e'
              }}>
                {template.isActive ? 'Активна' : 'Неактивна'}
              </div>

              {/* Template Header */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <div
                    style={{
                      width: '20px',
                      height: '20px',
                      borderRadius: '4px',
                      backgroundColor: template.color
                    }}
                  />
                  <h3 style={{ 
                    fontSize: '18px', 
                    fontWeight: '600', 
                    color: '#111827', 
                    margin: 0 
                  }}>
                    {template.name}
                  </h3>
                </div>
                
                <div style={{ 
                  fontSize: '12px', 
                  color: '#6b7280',
                  display: 'flex',
                  gap: '12px'
                }}>
                  <span>{template.type === 'day' ? '🌅 Дневная' : '🌙 Ночная'}</span>
                  <span>📅 {template.workPattern}</span>
                </div>
              </div>

              {/* Time Information */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '8px'
                }}>
                  <span style={{ fontSize: '14px', color: '#374151', fontWeight: '500' }}>
                    ⏰ {template.startTime} - {template.endTime}
                  </span>
                  <span style={{ 
                    fontSize: '12px', 
                    color: '#6b7280',
                    backgroundColor: '#f3f4f6',
                    padding: '2px 6px',
                    borderRadius: '4px'
                  }}>
                    {Math.floor(template.duration / 60)}ч {template.duration % 60}м
                  </span>
                </div>
                
                <div style={{ fontSize: '12px', color: '#6b7280' }}>
                  ☕ Перерыв: {template.breakDuration} мин
                </div>
              </div>

              {/* Actions */}
              <div style={{ 
                display: 'flex', 
                gap: '8px',
                borderTop: '1px solid #f3f4f6',
                paddingTop: '12px'
              }}>
                <button
                  onClick={() => handleEdit(template)}
                  disabled={isConnecting}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    opacity: isConnecting ? 0.6 : 1
                  }}
                >
                  ✏️ Редактировать
                </button>
                
                <button
                  onClick={() => toggleStatus(template.id)}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: template.isActive ? '#fef3c7' : '#dcfce7',
                    color: template.isActive ? '#92400e' : '#166534',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    opacity: isConnecting ? 0.6 : 1
                  }}
                >
                  {template.isActive ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={() => handleDelete(template.id)}
                  disabled={isConnecting}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer',
                    opacity: isConnecting ? 0.6 : 1
                  }}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create/Edit Modal */}
      {isCreating && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '12px',
            padding: '24px',
            width: '500px',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h2 style={{ 
              fontSize: '20px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#111827'
            }}>
              {editingTemplate ? 'Редактирование смены' : 'Создание новой смены'}
            </h2>

            {/* Validation Errors */}
            {validationErrors.length > 0 && (
              <div style={{
                marginBottom: '16px',
                padding: '12px',
                backgroundColor: '#fef2f2',
                border: '1px solid #fca5a5',
                borderRadius: '6px'
              }}>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#991b1b', marginBottom: '8px' }}>
                  Ошибки валидации:
                </div>
                <ul style={{ margin: 0, paddingLeft: '20px', color: '#7f1d1d' }}>
                  {validationErrors.map((error, index) => (
                    <li key={index} style={{ fontSize: '13px' }}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Название смены
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Введите название смены"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Время начала
                  </label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Время окончания
                  </label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '16px' }}>
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Тип смены
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      type: e.target.value as 'day' | 'night',
                      color: e.target.value === 'day' ? '#74a689' : '#4f46e5'
                    }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="day">🌅 Дневная</option>
                    <option value="night">🌙 Ночная</option>
                  </select>
                </div>
                
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '14px', 
                    fontWeight: '500', 
                    marginBottom: '4px',
                    color: '#374151'
                  }}>
                    Режим работы
                  </label>
                  <select
                    value={formData.workPattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, workPattern: e.target.value }))}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      border: '1px solid #d1d5db',
                      borderRadius: '6px',
                      fontSize: '14px'
                    }}
                  >
                    <option value="5/2">5/2 (5 дней работы, 2 выходных)</option>
                    <option value="2/2">2/2 (2 дня работы, 2 выходных)</option>
                    <option value="6/1">6/1 (6 дней работы, 1 выходной)</option>
                    <option value="7/0">7/0 (без выходных)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ 
                  display: 'block', 
                  fontSize: '14px', 
                  fontWeight: '500', 
                  marginBottom: '4px',
                  color: '#374151'
                }}>
                  Продолжительность перерыва (минуты)
                </label>
                <input
                  type="number"
                  min="0"
                  max="120"
                  value={formData.breakDuration}
                  onChange={(e) => setFormData(prev => ({ ...prev, breakDuration: parseInt(e.target.value) }))}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid #d1d5db',
                    borderRadius: '6px',
                    fontSize: '14px'
                  }}
                />
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={{ 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  fontSize: '14px',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData(prev => ({ ...prev, isActive: e.target.checked }))}
                    style={{ width: '16px', height: '16px' }}
                  />
                  Активировать смену после создания
                </label>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={handleCancel}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  Отмена
                </button>
                
                <button
                  type="submit"
                  disabled={isConnecting}
                  style={{
                    padding: '10px 20px',
                    backgroundColor: isConnecting ? '#9ca3af' : '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: isConnecting ? 'not-allowed' : 'pointer'
                  }}
                >
                  {isConnecting ? 'Сохранение...' : 
                   editingTemplate ? 'Сохранить изменения' : 'Создать смену'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Statistics Footer */}
      <div style={{ 
        borderTop: '1px solid #e5e7eb', 
        paddingTop: '16px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '14px',
        color: '#6b7280'
      }}>
        <span>
          Всего шаблонов: <strong>{templateStats.totalCount || templates.length}</strong>
        </span>
        <span>
          Активных: <strong>{templateStats.activeCount || templates.filter(t => t.isActive).length}</strong>
        </span>
      </div>
    </div>
  );
};

export default ShiftTemplateManager;