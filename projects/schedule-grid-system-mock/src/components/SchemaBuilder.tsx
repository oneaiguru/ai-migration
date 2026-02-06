import React, { useState } from 'react';
import { ScheduleSchema, SchemaRule } from '../types/schedule';

const SchemaBuilder: React.FC = () => {
  const [schemas, setSchemas] = useState<ScheduleSchema[]>([
    {
      id: '1',
      name: 'Основная схема планирования',
      description: 'Стандартные правила для контакт-центра',
      rules: [
        {
          id: 'r1',
          type: 'minStaff',
          description: 'Минимум 5 операторов в смену',
          conditions: { minCount: 5, timeRange: 'shift' },
          isActive: true,
        },
        {
          id: 'r2',
          type: 'skillRequired',
          description: 'Обязательный навык "Входящая линия_1"',
          conditions: { requiredSkill: 'Входящая линия_1', coverage: 80 },
          isActive: true,
        },
      ],
      isActive: true,
      createdAt: '2024-07-10',
    },
    {
      id: '2',
      name: 'Ночная схема',
      description: 'Правила для ночных смен',
      rules: [
        {
          id: 'r3',
          type: 'minStaff',
          description: 'Минимум 2 оператора ночью',
          conditions: { minCount: 2, timeRange: '20:00-09:00' },
          isActive: true,
        },
      ],
      isActive: false,
      createdAt: '2024-07-15',
    },
  ]);

  const [isCreating, setIsCreating] = useState(false);
  const [editingSchema, setEditingSchema] = useState<ScheduleSchema | null>(null);
  const [editingRule, setEditingRule] = useState<SchemaRule | null>(null);
  const [showRules, setShowRules] = useState<string | null>(null);

  const [schemaForm, setSchemaForm] = useState({
    name: '',
    description: '',
  });

  const [ruleForm, setRuleForm] = useState({
    type: 'minStaff' as SchemaRule['type'],
    description: '',
    minCount: 1,
    timeRange: 'shift',
    requiredSkill: '',
    coverage: 100,
  });

  const handleCreateSchema = () => {
    const newSchema: ScheduleSchema = {
      id: Date.now().toString(),
      name: schemaForm.name,
      description: schemaForm.description,
      rules: [],
      isActive: false,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setSchemas(prev => [...prev, newSchema]);
    setSchemaForm({ name: '', description: '' });
    setIsCreating(false);
    console.log('✅ Created schema:', newSchema.name);
  };

  const handleAddRule = (schemaId: string) => {
    const rule: SchemaRule = {
      id: `r${Date.now()}`,
      type: ruleForm.type,
      description: ruleForm.description,
      conditions: getRuleConditions(),
      isActive: true,
    };

    setSchemas(prev => prev.map(schema => 
      schema.id === schemaId 
        ? { ...schema, rules: [...schema.rules, rule] }
        : schema
    ));

    setRuleForm({
      type: 'minStaff',
      description: '',
      minCount: 1,
      timeRange: 'shift',
      requiredSkill: '',
      coverage: 100,
    });
    setEditingRule(null);
    console.log('✅ Added rule to schema');
  };

  const getRuleConditions = () => {
    switch (ruleForm.type) {
      case 'minStaff':
      case 'maxStaff':
        return { minCount: ruleForm.minCount, timeRange: ruleForm.timeRange };
      case 'skillRequired':
        return { requiredSkill: ruleForm.requiredSkill, coverage: ruleForm.coverage };
      case 'timeConstraint':
        return { timeRange: ruleForm.timeRange };
      default:
        return {};
    }
  };

  const toggleSchemaStatus = (id: string) => {
    setSchemas(prev => prev.map(schema => 
      schema.id === id ? { ...schema, isActive: !schema.isActive } : schema
    ));
  };

  const toggleRuleStatus = (schemaId: string, ruleId: string) => {
    setSchemas(prev => prev.map(schema => 
      schema.id === schemaId 
        ? {
            ...schema,
            rules: schema.rules.map(rule => 
              rule.id === ruleId ? { ...rule, isActive: !rule.isActive } : rule
            )
          }
        : schema
    ));
  };

  const deleteSchema = (id: string) => {
    setSchemas(prev => prev.filter(schema => schema.id !== id));
    console.log('🗑️ Deleted schema');
  };

  const deleteRule = (schemaId: string, ruleId: string) => {
    setSchemas(prev => prev.map(schema => 
      schema.id === schemaId 
        ? { ...schema, rules: schema.rules.filter(rule => rule.id !== ruleId) }
        : schema
    ));
    console.log('🗑️ Deleted rule');
  };

  const getRuleIcon = (type: SchemaRule['type']) => {
    switch (type) {
      case 'minStaff': return '👥';
      case 'maxStaff': return '🚫';
      case 'skillRequired': return '🎯';
      case 'timeConstraint': return '⏰';
      default: return '📋';
    }
  };

  const getRuleTypeLabel = (type: SchemaRule['type']) => {
    switch (type) {
      case 'minStaff': return 'Минимум сотрудников';
      case 'maxStaff': return 'Максимум сотрудников';
      case 'skillRequired': return 'Обязательный навык';
      case 'timeConstraint': return 'Временное ограничение';
      default: return 'Правило';
    }
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
            Схемы планирования
          </h1>
          <p style={{ 
            fontSize: '14px', 
            color: '#6b7280', 
            margin: '4px 0 0 0' 
          }}>
            Управление правилами и ограничениями автоматического планирования
          </p>
        </div>

        <button
          onClick={() => setIsCreating(true)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#2563eb',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          ➕ Создать схему
        </button>
      </div>

      {/* Schemas List */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        {schemas.map(schema => (
          <div
            key={schema.id}
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              marginBottom: '16px',
              backgroundColor: 'white',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
            }}
          >
            {/* Schema Header */}
            <div style={{ 
              padding: '20px', 
              borderBottom: showRules === schema.id ? '1px solid #f3f4f6' : 'none'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                    <h3 style={{ 
                      fontSize: '18px', 
                      fontWeight: '600', 
                      color: '#111827', 
                      margin: 0 
                    }}>
                      {schema.name}
                    </h3>
                    <span style={{
                      padding: '4px 8px',
                      borderRadius: '12px',
                      fontSize: '12px',
                      fontWeight: '500',
                      backgroundColor: schema.isActive ? '#dcfce7' : '#fef3c7',
                      color: schema.isActive ? '#166534' : '#92400e'
                    }}>
                      {schema.isActive ? 'Активна' : 'Неактивна'}
                    </span>
                  </div>
                  
                  <p style={{ 
                    fontSize: '14px', 
                    color: '#6b7280', 
                    margin: '0 0 8px 0' 
                  }}>
                    {schema.description}
                  </p>
                  
                  <div style={{ 
                    fontSize: '12px', 
                    color: '#9ca3af',
                    display: 'flex',
                    gap: '16px'
                  }}>
                    <span>📅 Создана: {schema.createdAt}</span>
                    <span>📋 Правил: {schema.rules.length}</span>
                    <span>✅ Активных: {schema.rules.filter(r => r.isActive).length}</span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={() => setShowRules(showRules === schema.id ? null : schema.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: '#f3f4f6',
                      color: '#374151',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {showRules === schema.id ? '📋 Скрыть правила' : '📋 Показать правила'}
                  </button>
                  
                  <button
                    onClick={() => toggleSchemaStatus(schema.id)}
                    style={{
                      padding: '8px 12px',
                      backgroundColor: schema.isActive ? '#fef3c7' : '#dcfce7',
                      color: schema.isActive ? '#92400e' : '#166534',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    {schema.isActive ? '⏸️' : '▶️'}
                  </button>
                  
                  <button
                    onClick={() => deleteSchema(schema.id)}
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
            </div>

            {/* Rules Section */}
            {showRules === schema.id && (
              <div style={{ padding: '20px' }}>
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: '16px'
                }}>
                  <h4 style={{ 
                    fontSize: '16px', 
                    fontWeight: '500', 
                    color: '#111827',
                    margin: 0
                  }}>
                    Правила схемы
                  </h4>
                  <button
                    onClick={() => setEditingRule({ 
                      id: '', 
                      type: 'minStaff', 
                      description: '', 
                      conditions: {}, 
                      isActive: true 
                    })}
                    style={{
                      padding: '6px 12px',
                      backgroundColor: '#059669',
                      color: 'white',
                      border: 'none',
                      borderRadius: '6px',
                      fontSize: '12px',
                      cursor: 'pointer'
                    }}
                  >
                    ➕ Добавить правило
                  </button>
                </div>

                {/* Rules List */}
                {schema.rules.length === 0 ? (
                  <div style={{ 
                    textAlign: 'center', 
                    padding: '32px',
                    color: '#6b7280',
                    backgroundColor: '#f9fafb',
                    borderRadius: '8px'
                  }}>
                    <div style={{ fontSize: '24px', marginBottom: '8px' }}>📋</div>
                    <p>Нет правил в этой схеме</p>
                  </div>
                ) : (
                  <div style={{ display: 'grid', gap: '12px' }}>
                    {schema.rules.map(rule => (
                      <div
                        key={rule.id}
                        style={{
                          border: '1px solid #e5e7eb',
                          borderRadius: '8px',
                          padding: '16px',
                          backgroundColor: rule.isActive ? 'white' : '#f9fafb',
                          opacity: rule.isActive ? 1 : 0.7
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                              <span style={{ fontSize: '16px' }}>{getRuleIcon(rule.type)}</span>
                              <span style={{ 
                                fontSize: '12px', 
                                color: '#6b7280',
                                backgroundColor: '#f3f4f6',
                                padding: '2px 6px',
                                borderRadius: '4px'
                              }}>
                                {getRuleTypeLabel(rule.type)}
                              </span>
                              {rule.isActive && (
                                <span style={{ 
                                  fontSize: '10px', 
                                  color: '#059669',
                                  backgroundColor: '#dcfce7',
                                  padding: '2px 6px',
                                  borderRadius: '4px'
                                }}>
                                  АКТИВНО
                                </span>
                              )}
                            </div>
                            <p style={{ 
                              fontSize: '14px', 
                              color: '#374151', 
                              margin: '0 0 4px 0',
                              fontWeight: '500'
                            }}>
                              {rule.description}
                            </p>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              Условия: {JSON.stringify(rule.conditions)}
                            </div>
                          </div>

                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button
                              onClick={() => toggleRuleStatus(schema.id, rule.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: rule.isActive ? '#fef3c7' : '#dcfce7',
                                color: rule.isActive ? '#92400e' : '#166534',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              {rule.isActive ? '⏸️' : '▶️'}
                            </button>
                            <button
                              onClick={() => deleteRule(schema.id, rule.id)}
                              style={{
                                padding: '4px 8px',
                                backgroundColor: '#fef2f2',
                                color: '#dc2626',
                                border: 'none',
                                borderRadius: '4px',
                                fontSize: '10px',
                                cursor: 'pointer'
                              }}
                            >
                              🗑️
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Rule Modal */}
                {editingRule && (
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
                      width: '400px',
                      maxHeight: '80vh',
                      overflow: 'auto'
                    }}>
                      <h3 style={{ 
                        fontSize: '18px', 
                        fontWeight: 'bold', 
                        marginBottom: '20px',
                        color: '#111827'
                      }}>
                        Добавить правило
                      </h3>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '4px',
                          color: '#374151'
                        }}>
                          Тип правила
                        </label>
                        <select
                          value={ruleForm.type}
                          onChange={(e) => setRuleForm(prev => ({ 
                            ...prev, 
                            type: e.target.value as SchemaRule['type']
                          }))}
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        >
                          <option value="minStaff">👥 Минимум сотрудников</option>
                          <option value="maxStaff">🚫 Максимум сотрудников</option>
                          <option value="skillRequired">🎯 Обязательный навык</option>
                          <option value="timeConstraint">⏰ Временное ограничение</option>
                        </select>
                      </div>

                      <div style={{ marginBottom: '16px' }}>
                        <label style={{ 
                          display: 'block', 
                          fontSize: '14px', 
                          fontWeight: '500', 
                          marginBottom: '4px',
                          color: '#374151'
                        }}>
                          Описание правила
                        </label>
                        <input
                          type="text"
                          value={ruleForm.description}
                          onChange={(e) => setRuleForm(prev => ({ ...prev, description: e.target.value }))}
                          placeholder="Опишите правило"
                          style={{
                            width: '100%',
                            padding: '10px 12px',
                            border: '1px solid #d1d5db',
                            borderRadius: '6px',
                            fontSize: '14px'
                          }}
                        />
                      </div>

                      {(ruleForm.type === 'minStaff' || ruleForm.type === 'maxStaff') && (
                        <div style={{ marginBottom: '16px' }}>
                          <label style={{ 
                            display: 'block', 
                            fontSize: '14px', 
                            fontWeight: '500', 
                            marginBottom: '4px',
                            color: '#374151'
                          }}>
                            Количество сотрудников
                          </label>
                          <input
                            type="number"
                            min="1"
                            value={ruleForm.minCount}
                            onChange={(e) => setRuleForm(prev => ({ ...prev, minCount: parseInt(e.target.value) }))}
                            style={{
                              width: '100%',
                              padding: '10px 12px',
                              border: '1px solid #d1d5db',
                              borderRadius: '6px',
                              fontSize: '14px'
                            }}
                          />
                        </div>
                      )}

                      {ruleForm.type === 'skillRequired' && (
                        <>
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '14px', 
                              fontWeight: '500', 
                              marginBottom: '4px',
                              color: '#374151'
                            }}>
                              Навык
                            </label>
                            <select
                              value={ruleForm.requiredSkill}
                              onChange={(e) => setRuleForm(prev => ({ ...prev, requiredSkill: e.target.value }))}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            >
                              <option value="">Выберите навык</option>
                              <option value="Входящая линия_1">Входящая линия_1</option>
                              <option value="Исходящая линия">Исходящая линия</option>
                              <option value="Email поддержка">Email поддержка</option>
                              <option value="Чат поддержка">Чат поддержка</option>
                            </select>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <label style={{ 
                              display: 'block', 
                              fontSize: '14px', 
                              fontWeight: '500', 
                              marginBottom: '4px',
                              color: '#374151'
                            }}>
                              Покрытие (%)
                            </label>
                            <input
                              type="number"
                              min="1"
                              max="100"
                              value={ruleForm.coverage}
                              onChange={(e) => setRuleForm(prev => ({ ...prev, coverage: parseInt(e.target.value) }))}
                              style={{
                                width: '100%',
                                padding: '10px 12px',
                                border: '1px solid #d1d5db',
                                borderRadius: '6px',
                                fontSize: '14px'
                              }}
                            />
                          </div>
                        </>
                      )}

                      <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => setEditingRule(null)}
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
                          onClick={() => handleAddRule(schema.id)}
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
                          Добавить правило
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Create Schema Modal */}
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
            width: '400px'
          }}>
            <h3 style={{ 
              fontSize: '18px', 
              fontWeight: 'bold', 
              marginBottom: '20px',
              color: '#111827'
            }}>
              Создать новую схему
            </h3>

            <div style={{ marginBottom: '16px' }}>
              <label style={{ 
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: '#374151'
              }}>
                Название схемы
              </label>
              <input
                type="text"
                value={schemaForm.name}
                onChange={(e) => setSchemaForm(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Введите название схемы"
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
                display: 'block', 
                fontSize: '14px', 
                fontWeight: '500', 
                marginBottom: '4px',
                color: '#374151'
              }}>
                Описание
              </label>
              <textarea
                value={schemaForm.description}
                onChange={(e) => setSchemaForm(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Опишите назначение схемы"
                rows={3}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '14px',
                  resize: 'vertical'
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setIsCreating(false)}
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
                onClick={handleCreateSchema}
                disabled={!schemaForm.name}
                style={{
                  padding: '10px 20px',
                  backgroundColor: schemaForm.name ? '#2563eb' : '#9ca3af',
                  color: 'white',
                  border: 'none',
                  borderRadius: '6px',
                  fontSize: '14px',
                  cursor: schemaForm.name ? 'pointer' : 'not-allowed'
                }}
              >
                Создать схему
              </button>
            </div>
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
          Всего схем: <strong>{schemas.length}</strong>
        </span>
        <span>
          Активных: <strong>{schemas.filter(s => s.isActive).length}</strong>
        </span>
      </div>
    </div>
  );
};

export default SchemaBuilder;