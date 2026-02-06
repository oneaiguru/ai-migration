import React, { useState } from 'react';

interface ShiftTemplate {
  id: string;
  name: string;
  startTime: string;
  endTime: string;
  duration: number;
  breakDuration: number;
  color: string;
  type: 'day' | 'night' | 'overtime';
  workPattern: string; // e.g., "5/2", "2/2", "6/1"
  isActive: boolean;
}

const ShiftTemplateManager: React.FC = () => {
  const [templates, setTemplates] = useState<ShiftTemplate[]>([
    {
      id: '1',
      name: 'Дневная смена',
      startTime: '08:00',
      endTime: '17:00',
      duration: 480,
      breakDuration: 60,
      color: '#74a689',
      type: 'day',
      workPattern: '5/2',
      isActive: true,
    },
    {
      id: '2',
      name: 'Ночная смена',
      startTime: '20:00',
      endTime: '09:00',
      duration: 660,
      breakDuration: 60,
      color: '#4f46e5',
      type: 'night',
      workPattern: '2/2',
      isActive: true,
    },
    {
      id: '3',
      name: 'Сокращенная смена',
      startTime: '10:00',
      endTime: '15:00',
      duration: 240,
      breakDuration: 30,
      color: '#f59e0b',
      type: 'day',
      workPattern: '6/1',
      isActive: false,
    },
  ]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const duration = calculateDuration(formData.startTime!, formData.endTime!);
    
    const template: ShiftTemplate = {
      id: editingTemplate?.id || Date.now().toString(),
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

    if (editingTemplate) {
      setTemplates(prev => prev.map(t => t.id === editingTemplate.id ? template : t));
      console.log('✏️ Updated template:', template.name);
    } else {
      setTemplates(prev => [...prev, template]);
      console.log('➕ Created new template:', template.name);
    }

    handleCancel();
  };

  const handleEdit = (template: ShiftTemplate) => {
    setEditingTemplate(template);
    setFormData(template);
    setIsCreating(true);
    console.log('✏️ Editing template:', template.name);
  };

  const handleDelete = (id: string) => {
    const template = templates.find(t => t.id === id);
    setTemplates(prev => prev.filter(t => t.id !== id));
    console.log('🗑️ Deleted template:', template?.name);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTemplate(null);
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

  const toggleStatus = (id: string) => {
    setTemplates(prev => prev.map(t => 
      t.id === id ? { ...t, isActive: !t.isActive } : t
    ));
  };

  return (
    <div style={{ 
      height: 'calc(100vh - 180px)', 
      display: 'flex', 
      flexDirection: 'column', 
      backgroundColor: 'white',
      padding: '24px'
    }}>
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

        <button
          onClick={() => setIsCreating(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#059669',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          ➕ Создать смену
        </button>
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
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    backgroundColor: '#f3f4f6',
                    color: '#374151',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ✏️ Редактировать
                </button>
                
                <button
                  onClick={() => toggleStatus(template.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: template.isActive ? '#fef3c7' : '#dcfce7',
                    color: template.isActive ? '#92400e' : '#166534',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  {template.isActive ? '⏸️' : '▶️'}
                </button>
                
                <button
                  onClick={() => handleDelete(template.id)}
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#fef2f2',
                    color: '#dc2626',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '12px',
                    cursor: 'pointer'
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
                  style={{
                    padding: '10px 20px',
                    backgroundColor: '#059669',
                    color: 'white',
                    border: 'none',
                    borderRadius: '6px',
                    fontSize: '14px',
                    cursor: 'pointer'
                  }}
                >
                  {editingTemplate ? 'Сохранить изменения' : 'Создать смену'}
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
          Всего шаблонов: <strong>{templates.length}</strong>
        </span>
        <span>
          Активных: <strong>{templates.filter(t => t.isActive).length}</strong>
        </span>
      </div>
    </div>
  );
};

export default ShiftTemplateManager;