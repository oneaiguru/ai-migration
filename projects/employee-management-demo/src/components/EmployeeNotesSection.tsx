// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeNotesSection.tsx

import React, { useState, useMemo } from 'react';
import { Employee } from '../types/employee';

// ========================
// EMPLOYEE NOTES SECTION - Manager notes and comments system
// Rich text notes with mentions, categories, and collaboration features
// ========================

interface EmployeeNotesSectionProps {
  employee: Employee;
  currentUserId: string;
  onNoteAdd?: (note: EmployeeNote) => void;
  onNoteUpdate?: (noteId: string, updates: Partial<EmployeeNote>) => void;
  onNoteDelete?: (noteId: string) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

interface EmployeeNote {
  id: string;
  employeeId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  category: 'performance' | 'feedback' | 'development' | 'disciplinary' | 'achievement' | 'general';
  priority: 'low' | 'normal' | 'high' | 'urgent';
  visibility: 'private' | 'managers' | 'hr' | 'public';
  tags: string[];
  attachments: NoteAttachment[];
  createdAt: Date;
  updatedAt: Date;
  isConfidential: boolean;
  followUpDate?: Date;
  relatedNotes?: string[];
  reactions: NoteReaction[];
  mentions: string[];
}

interface NoteAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  url: string;
  uploadedAt: Date;
}

interface NoteReaction {
  userId: string;
  userName: string;
  type: '👍' | '👎' | '❤️' | '😄' | '😢' | '😮';
  timestamp: Date;
}

interface NoteFilter {
  category: EmployeeNote['category'] | '';
  priority: EmployeeNote['priority'] | '';
  author: string;
  dateRange: { start?: Date; end?: Date };
  search: string;
  tags: string[];
}

const EmployeeNotesSection: React.FC<EmployeeNotesSectionProps> = ({
  employee,
  currentUserId,
  onNoteAdd,
  onNoteUpdate,
  onNoteDelete,
  canEdit = true,
  canDelete = false
}) => {
  const [notes, setNotes] = useState<EmployeeNote[]>([
    // Mock data
    {
      id: 'note_1',
      employeeId: employee.id,
      authorId: 'mgr_001',
      authorName: 'Иванов И.И.',
      authorRole: 'Менеджер',
      content: 'Отличные результаты по качеству обслуживания клиентов в этом месяце. Показатель достиг 94%, что превышает целевой показатель. Рекомендую рассмотреть для повышения.',
      category: 'performance',
      priority: 'normal',
      visibility: 'managers',
      tags: ['качество', 'результаты', 'повышение'],
      attachments: [],
      createdAt: new Date('2024-02-10T10:30:00'),
      updatedAt: new Date('2024-02-10T10:30:00'),
      isConfidential: false,
      reactions: [
        { userId: 'hr_001', userName: 'HR Специалист', type: '👍', timestamp: new Date('2024-02-10T11:00:00') }
      ],
      mentions: []
    },
    {
      id: 'note_2',
      employeeId: employee.id,
      authorId: 'hr_001',
      authorName: 'Петрова А.В.',
      authorRole: 'HR Специалист',
      content: 'Проведена беседа по результатам оценки 360. Обсуждены области для развития: работа в команде и планирование времени. Запланировано дополнительное обучение.',
      category: 'development',
      priority: 'high',
      visibility: 'hr',
      tags: ['развитие', 'обучение', '360'],
      attachments: [
        {
          id: 'att_1',
          name: 'План_развития_Q2_2024.pdf',
          type: 'application/pdf',
          size: 245760,
          url: '#',
          uploadedAt: new Date('2024-02-15T14:20:00')
        }
      ],
      createdAt: new Date('2024-02-15T14:15:00'),
      updatedAt: new Date('2024-02-15T14:25:00'),
      isConfidential: true,
      followUpDate: new Date('2024-04-15'),
      reactions: [],
      mentions: ['mgr_001']
    }
  ]);

  const [showAddNote, setShowAddNote] = useState(false);
  const [editingNote, setEditingNote] = useState<string | null>(null);
  const [filters, setFilters] = useState<NoteFilter>({
    category: '',
    priority: '',
    author: '',
    dateRange: {},
    search: '',
    tags: []
  });

  // Filter notes
  const filteredNotes = useMemo(() => {
    return notes.filter(note => {
      const matchesCategory = !filters.category || note.category === filters.category;
      const matchesPriority = !filters.priority || note.priority === filters.priority;
      const matchesAuthor = !filters.author || note.authorId === filters.author;
      const matchesSearch = !filters.search || 
        note.content.toLowerCase().includes(filters.search.toLowerCase()) ||
        note.tags.some(tag => tag.toLowerCase().includes(filters.search.toLowerCase()));
      
      return matchesCategory && matchesPriority && matchesAuthor && matchesSearch;
    }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }, [notes, filters]);

  // Get category configuration
  const getCategoryConfig = (category: EmployeeNote['category']) => {
    const configs = {
      performance: { color: 'bg-blue-100 text-blue-800', icon: '📊', label: 'Производительность' },
      feedback: { color: 'bg-green-100 text-green-800', icon: '💬', label: 'Обратная связь' },
      development: { color: 'bg-purple-100 text-purple-800', icon: '🎯', label: 'Развитие' },
      disciplinary: { color: 'bg-red-100 text-red-800', icon: '⚠️', label: 'Дисциплинарное' },
      achievement: { color: 'bg-yellow-100 text-yellow-800', icon: '🏆', label: 'Достижение' },
      general: { color: 'bg-gray-100 text-gray-800', icon: '📝', label: 'Общее' }
    };
    return configs[category];
  };

  // Get priority configuration
  const getPriorityConfig = (priority: EmployeeNote['priority']) => {
    const configs = {
      low: { color: 'text-gray-500', icon: '🔻' },
      normal: { color: 'text-blue-500', icon: '➖' },
      high: { color: 'text-orange-500', icon: '🔺' },
      urgent: { color: 'text-red-500', icon: '🚨' }
    };
    return configs[priority];
  };

  // Add Note Form Component
  const AddNoteForm: React.FC<{ note?: EmployeeNote; onClose: () => void }> = ({ note, onClose }) => {
    const [formData, setFormData] = useState({
      content: note?.content || '',
      category: note?.category || 'general' as EmployeeNote['category'],
      priority: note?.priority || 'normal' as EmployeeNote['priority'],
      visibility: note?.visibility || 'managers' as EmployeeNote['visibility'],
      tags: note?.tags.join(', ') || '',
      isConfidential: note?.isConfidential || false,
      followUpDate: note?.followUpDate?.toISOString().split('T')[0] || ''
    });

    const handleSubmit = () => {
      const noteData: EmployeeNote = {
        id: note?.id || `note_${Date.now()}`,
        employeeId: employee.id,
        authorId: currentUserId,
        authorName: 'Текущий пользователь',
        authorRole: 'Менеджер',
        content: formData.content,
        category: formData.category,
        priority: formData.priority,
        visibility: formData.visibility,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t),
        attachments: note?.attachments || [],
        createdAt: note?.createdAt || new Date(),
        updatedAt: new Date(),
        isConfidential: formData.isConfidential,
        followUpDate: formData.followUpDate ? new Date(formData.followUpDate) : undefined,
        reactions: note?.reactions || [],
        mentions: []
      };

      if (note) {
        onNoteUpdate?.(note.id, noteData);
        setNotes(prev => prev.map(n => n.id === note.id ? noteData : n));
      } else {
        onNoteAdd?.(noteData);
        setNotes(prev => [noteData, ...prev]);
      }

      onClose();
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
          <div className="border-b border-gray-200 p-6">
            <h3 className="text-xl font-bold text-gray-900">
              {note ? 'Редактировать заметку' : 'Добавить заметку'}
            </h3>
            <p className="text-gray-600 mt-1">
              {employee.personalInfo.firstName} {employee.personalInfo.lastName}
            </p>
          </div>

          <div className="p-6 space-y-4">
            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Содержание</label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                rows={6}
                placeholder="Введите текст заметки..."
              />
            </div>

            {/* Category and Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Категория</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="general">Общее</option>
                  <option value="performance">Производительность</option>
                  <option value="feedback">Обратная связь</option>
                  <option value="development">Развитие</option>
                  <option value="achievement">Достижение</option>
                  <option value="disciplinary">Дисциплинарное</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Приоритет</label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Низкий</option>
                  <option value="normal">Обычный</option>
                  <option value="high">Высокий</option>
                  <option value="urgent">Срочный</option>
                </select>
              </div>
            </div>

            {/* Visibility and Tags */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Видимость</label>
                <select
                  value={formData.visibility}
                  onChange={(e) => setFormData(prev => ({ ...prev, visibility: e.target.value as any }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="private">Только я</option>
                  <option value="managers">Менеджеры</option>
                  <option value="hr">HR и менеджеры</option>
                  <option value="public">Все</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Теги</label>
                <input
                  type="text"
                  value={formData.tags}
                  onChange={(e) => setFormData(prev => ({ ...prev, tags: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="тег1, тег2, тег3"
                />
              </div>
            </div>

            {/* Options */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.isConfidential}
                    onChange={(e) => setFormData(prev => ({ ...prev, isConfidential: e.target.checked }))}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm">Конфиденциально</span>
                </label>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Дата напоминания</label>
                <input
                  type="date"
                  value={formData.followUpDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, followUpDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 p-6 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Отмена
            </button>
            <button
              onClick={handleSubmit}
              disabled={!formData.content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {note ? 'Сохранить' : 'Добавить заметку'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // Unique authors for filter
  const authors = useMemo(() => {
    const authorMap = new Map();
    notes.forEach(note => {
      if (!authorMap.has(note.authorId)) {
        authorMap.set(note.authorId, { id: note.authorId, name: note.authorName });
      }
    });
    return Array.from(authorMap.values());
  }, [notes]);

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200">
      {/* Header */}
      <div className="border-b border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Заметки о сотруднике</h3>
            <p className="text-gray-600">
              {employee.personalInfo.firstName} {employee.personalInfo.lastName} - {notes.length} заметок
            </p>
          </div>
          
          {canEdit && (
            <button
              onClick={() => setShowAddNote(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <span className="mr-2">📝</span>
              Добавить заметку
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Поиск в заметках..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-2.5 text-gray-400">🔍</span>
          </div>

          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все категории</option>
            <option value="performance">Производительность</option>
            <option value="feedback">Обратная связь</option>
            <option value="development">Развитие</option>
            <option value="achievement">Достижения</option>
            <option value="disciplinary">Дисциплинарные</option>
            <option value="general">Общие</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value as any }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все приоритеты</option>
            <option value="urgent">Срочные</option>
            <option value="high">Высокий</option>
            <option value="normal">Обычный</option>
            <option value="low">Низкий</option>
          </select>

          <select
            value={filters.author}
            onChange={(e) => setFilters(prev => ({ ...prev, author: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Все авторы</option>
            {authors.map(author => (
              <option key={author.id} value={author.id}>{author.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Notes List */}
      <div className="p-6">
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl text-gray-300 mb-4">📝</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {notes.length === 0 ? 'Нет заметок' : 'Заметки не найдены'}
            </h3>
            <p className="text-gray-500 mb-4">
              {notes.length === 0 
                ? 'Добавьте первую заметку о сотруднике'
                : 'Попробуйте изменить параметры фильтрации'
              }
            </p>
            {canEdit && notes.length === 0 && (
              <button
                onClick={() => setShowAddNote(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Добавить заметку
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredNotes.map(note => {
              const categoryConfig = getCategoryConfig(note.category);
              const priorityConfig = getPriorityConfig(note.priority);

              return (
                <div key={note.id} className="border border-gray-200 rounded-lg p-6">
                  {/* Note Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 text-xs font-medium rounded ${categoryConfig.color}`}>
                          {categoryConfig.icon} {categoryConfig.label}
                        </span>
                        <span className={`text-lg ${priorityConfig.color}`}>
                          {priorityConfig.icon}
                        </span>
                        {note.isConfidential && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded">
                            🔒 Конфиденциально
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      {canEdit && (
                        <button
                          onClick={() => setEditingNote(note.id)}
                          className="p-1 text-gray-400 hover:text-gray-600"
                        >
                          ✏️
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={() => {
                            if (confirm('Удалить заметку?')) {
                              onNoteDelete?.(note.id);
                              setNotes(prev => prev.filter(n => n.id !== note.id));
                            }
                          }}
                          className="p-1 text-gray-400 hover:text-red-600"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Note Content */}
                  <div className="mb-4">
                    <p className="text-gray-900 whitespace-pre-wrap">{note.content}</p>
                  </div>

                  {/* Tags */}
                  {note.tags.length > 0 && (
                    <div className="mb-4">
                      <div className="flex flex-wrap gap-1">
                        {note.tags.map((tag, index) => (
                          <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Attachments */}
                  {note.attachments.length > 0 && (
                    <div className="mb-4">
                      <div className="space-y-2">
                        {note.attachments.map(attachment => (
                          <div key={attachment.id} className="flex items-center gap-3 p-2 bg-gray-50 rounded">
                            <span className="text-lg">📎</span>
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{attachment.name}</p>
                              <p className="text-xs text-gray-500">
                                {(attachment.size / 1024).toFixed(1)} KB
                              </p>
                            </div>
                            <button className="p-1 text-gray-400 hover:text-gray-600">
                              📥
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Note Footer */}
                  <div className="flex items-center justify-between text-sm text-gray-500 border-t border-gray-100 pt-4">
                    <div className="flex items-center gap-4">
                      <span>
                        <span className="font-medium">{note.authorName}</span> ({note.authorRole})
                      </span>
                      <span>{note.createdAt.toLocaleDateString()} в {note.createdAt.toLocaleTimeString()}</span>
                      {note.followUpDate && (
                        <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs rounded">
                          📅 Напомнить: {note.followUpDate.toLocaleDateString()}
                        </span>
                      )}
                    </div>

                    {/* Reactions */}
                    {note.reactions.length > 0 && (
                      <div className="flex items-center gap-1">
                        {note.reactions.map((reaction, index) => (
                          <span key={index} className="text-lg" title={reaction.userName}>
                            {reaction.type}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Add/Edit Note Modal */}
      {showAddNote && (
        <AddNoteForm onClose={() => setShowAddNote(false)} />
      )}
      
      {editingNote && (
        <AddNoteForm 
          note={notes.find(n => n.id === editingNote)}
          onClose={() => setEditingNote(null)} 
        />
      )}
    </div>
  );
};

export default EmployeeNotesSection;