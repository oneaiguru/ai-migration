// /Users/m/Documents/wfm/competitor/naumen/employee-management/src/components/EmployeeSearchSuggestions.tsx

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Employee, Team, Skill } from '../types/employee';

// ========================
// EMPLOYEE SEARCH SUGGESTIONS - Enhanced autocomplete search
// Smart search with suggestions, filters, and quick actions
// ========================

interface EmployeeSearchSuggestionsProps {
  employees: Employee[];
  teams: Team[];
  onEmployeeSelect?: (employee: Employee) => void;
  onTeamSelect?: (team: Team) => void;
  onSkillFilter?: (skill: string) => void;
  placeholder?: string;
  showQuickActions?: boolean;
  maxSuggestions?: number;
}

interface SearchSuggestion {
  type: 'employee' | 'team' | 'skill' | 'position' | 'action';
  id: string;
  title: string;
  subtitle?: string;
  icon: string;
  data: Employee | Team | string;
  relevanceScore: number;
}

const EmployeeSearchSuggestions: React.FC<EmployeeSearchSuggestionsProps> = ({
  employees,
  teams,
  onEmployeeSelect,
  onTeamSelect,
  onSkillFilter,
  placeholder = "Поиск сотрудников, команд, навыков...",
  showQuickActions = true,
  maxSuggestions = 8
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  // Generate search suggestions
  const suggestions = useMemo(() => {
    if (!query.trim()) {
      // Show recent searches and quick actions when no query
      const recent: SearchSuggestion[] = recentSearches.slice(0, 3).map((search, index) => ({
        type: 'action',
        id: `recent-${index}`,
        title: search,
        icon: '🕒',
        data: search,
        relevanceScore: 10 - index
      }));

      const quickActions: SearchSuggestion[] = showQuickActions ? [
        {
          type: 'action',
          id: 'active-employees',
          title: 'Активные сотрудники',
          subtitle: `${employees.filter(emp => emp.status === 'active').length} сотрудников`,
          icon: '👥',
          data: 'status:active',
          relevanceScore: 5
        },
        {
          type: 'action',
          id: 'new-employees',
          title: 'Новые сотрудники',
          subtitle: 'За последний месяц',
          icon: '✨',
          data: 'new:month',
          relevanceScore: 4
        }
      ] : [];

      return [...recent, ...quickActions];
    }

    const searchResults: SearchSuggestion[] = [];
    const queryLower = query.toLowerCase();

    // Search employees
    employees.forEach(employee => {
      const fullName = `${employee.personalInfo.firstName} ${employee.personalInfo.lastName}`;
      const relevance = calculateRelevance(queryLower, [
        fullName,
        employee.employeeId,
        employee.workInfo.position,
        employee.personalInfo.email
      ]);

      if (relevance > 0) {
        searchResults.push({
          type: 'employee',
          id: employee.id,
          title: fullName,
          subtitle: `${employee.workInfo.position} • ${employee.workInfo.team.name}`,
          icon: '👤',
          data: employee,
          relevanceScore: relevance
        });
      }
    });

    // Search teams
    teams.forEach(team => {
      const relevance = calculateRelevance(queryLower, [team.name, team.description || '']);
      
      if (relevance > 0) {
        searchResults.push({
          type: 'team',
          id: team.id,
          title: team.name,
          subtitle: `${team.memberCount} сотрудников`,
          icon: '👥',
          data: team,
          relevanceScore: relevance
        });
      }
    });

    // Search skills
    const allSkills = new Set<string>();
    employees.forEach(emp => {
      emp.skills.forEach(skill => allSkills.add(skill.name));
    });

    allSkills.forEach(skillName => {
      const relevance = calculateRelevance(queryLower, [skillName]);
      
      if (relevance > 0) {
        const employeeCount = employees.filter(emp => 
          emp.skills.some(skill => skill.name === skillName)
        ).length;
        
        searchResults.push({
          type: 'skill',
          id: `skill-${skillName}`,
          title: skillName,
          subtitle: `${employeeCount} сотрудников`,
          icon: '🎯',
          data: skillName,
          relevanceScore: relevance
        });
      }
    });

    // Search positions
    const allPositions = new Set<string>();
    employees.forEach(emp => allPositions.add(emp.workInfo.position));

    allPositions.forEach(position => {
      const relevance = calculateRelevance(queryLower, [position]);
      
      if (relevance > 0) {
        const employeeCount = employees.filter(emp => emp.workInfo.position === position).length;
        
        searchResults.push({
          type: 'position',
          id: `position-${position}`,
          title: position,
          subtitle: `${employeeCount} сотрудников`,
          icon: '💼',
          data: position,
          relevanceScore: relevance
        });
      }
    });

    // Sort by relevance and return top results
    return searchResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, maxSuggestions);
  }, [query, employees, teams, recentSearches, showQuickActions, maxSuggestions]);

  // Calculate search relevance
  const calculateRelevance = (query: string, searchFields: string[]): number => {
    let maxRelevance = 0;

    searchFields.forEach(field => {
      const fieldLower = field.toLowerCase();
      
      if (fieldLower === query) {
        maxRelevance = Math.max(maxRelevance, 100); // Exact match
      } else if (fieldLower.startsWith(query)) {
        maxRelevance = Math.max(maxRelevance, 80); // Starts with
      } else if (fieldLower.includes(query)) {
        maxRelevance = Math.max(maxRelevance, 60); // Contains
      } else if (fieldLower.includes(query.split(' ')[0])) {
        maxRelevance = Math.max(maxRelevance, 40); // Contains first word
      }
    });

    return maxRelevance;
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    switch (suggestion.type) {
      case 'employee':
        onEmployeeSelect?.(suggestion.data as Employee);
        addToRecentSearches(suggestion.title);
        break;
      case 'team':
        onTeamSelect?.(suggestion.data as Team);
        addToRecentSearches(suggestion.title);
        break;
      case 'skill':
        onSkillFilter?.(suggestion.data as string);
        addToRecentSearches(`Навык: ${suggestion.title}`);
        break;
      case 'position':
        // Handle position filter
        addToRecentSearches(`Должность: ${suggestion.title}`);
        break;
      case 'action':
        // Handle action
        if (typeof suggestion.data === 'string') {
          addToRecentSearches(suggestion.data);
        }
        break;
    }

    setQuery('');
    setIsOpen(false);
    setSelectedIndex(-1);
  };

  // Add to recent searches
  const addToRecentSearches = (search: string) => {
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item !== search);
      return [search, ...filtered].slice(0, 5);
    });
  };

  // Handle keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (!isOpen || suggestions.length === 0) return;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => prev > 0 ? prev - 1 : prev);
        break;
      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        inputRef.current && 
        !inputRef.current.contains(event.target as Node) &&
        suggestionsRef.current && 
        !suggestionsRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative">
      {/* Search Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all placeholder-gray-400"
        />
        
        <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
          <span className="text-gray-400 text-lg">🔍</span>
        </div>

        {query && (
          <button
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            ✕
          </button>
        )}
      </div>

      {/* Search Suggestions Dropdown */}
      {isOpen && (
        <div
          ref={suggestionsRef}
          className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto"
        >
          {suggestions.length === 0 ? (
            <div className="p-4 text-center text-gray-500">
              {query ? 'Ничего не найдено' : 'Начните печатать для поиска...'}
            </div>
          ) : (
            <div className="py-2">
              {/* Search Results Header */}
              {query && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide border-b border-gray-100">
                  Результаты поиска ({suggestions.length})
                </div>
              )}

              {/* Recent Searches Header */}
              {!query && recentSearches.length > 0 && (
                <div className="px-4 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                  Недавние поиски
                </div>
              )}

              {/* Suggestions List */}
              {suggestions.map((suggestion, index) => (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={`w-full px-4 py-3 text-left hover:bg-gray-50 transition-colors ${
                    index === selectedIndex ? 'bg-blue-50 border-r-2 border-blue-500' : ''
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl flex-shrink-0">{suggestion.icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {suggestion.title}
                      </div>
                      {suggestion.subtitle && (
                        <div className="text-sm text-gray-600 truncate">
                          {suggestion.subtitle}
                        </div>
                      )}
                    </div>
                    
                    {/* Type indicator */}
                    <div className={`px-2 py-1 text-xs rounded ${
                      suggestion.type === 'employee' ? 'bg-blue-100 text-blue-800' :
                      suggestion.type === 'team' ? 'bg-green-100 text-green-800' :
                      suggestion.type === 'skill' ? 'bg-purple-100 text-purple-800' :
                      suggestion.type === 'position' ? 'bg-orange-100 text-orange-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {suggestion.type === 'employee' ? 'Сотрудник' :
                       suggestion.type === 'team' ? 'Команда' :
                       suggestion.type === 'skill' ? 'Навык' :
                       suggestion.type === 'position' ? 'Должность' :
                       'Действие'}
                    </div>
                  </div>
                </button>
              ))}

              {/* Quick Actions Footer */}
              {!query && showQuickActions && (
                <div className="border-t border-gray-100 px-4 py-2">
                  <div className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                    Быстрые действия
                  </div>
                  <div className="flex flex-wrap gap-1">
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
                      Добавить сотрудника
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
                      Экспорт данных
                    </button>
                    <button className="px-3 py-1 bg-gray-100 text-gray-700 text-sm rounded-full hover:bg-gray-200 transition-colors">
                      Отчеты
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EmployeeSearchSuggestions;