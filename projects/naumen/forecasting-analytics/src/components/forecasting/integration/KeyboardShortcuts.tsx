// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/KeyboardShortcuts.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Keyboard, HelpCircle, X } from 'lucide-react';

interface ShortcutAction {
  id: string;
  keys: string[];
  description: string;
  category: string;
  action: () => void;
  enabled?: boolean;
}

interface KeyboardShortcutsProps {
  actions?: ShortcutAction[];
  onShortcutExecuted?: (actionId: string) => void;
  showIndicator?: boolean;
  className?: string;
}

const defaultActions: ShortcutAction[] = [
  {
    id: 'save-forecast',
    keys: ['Ctrl', 'S'],
    description: 'Сохранить прогноз',
    category: 'Общие',
    action: () => console.log('Save forecast'),
    enabled: true
  },
  {
    id: 'new-forecast',
    keys: ['Ctrl', 'N'],
    description: 'Создать новый прогноз',
    category: 'Общие',
    action: () => console.log('New forecast'),
    enabled: true
  },
  {
    id: 'export',
    keys: ['Ctrl', 'E'],
    description: 'Экспорт данных',
    category: 'Общие',
    action: () => console.log('Export'),
    enabled: true
  },
  {
    id: 'undo',
    keys: ['Ctrl', 'Z'],
    description: 'Отменить действие',
    category: 'Редактирование',
    action: () => console.log('Undo'),
    enabled: true
  },
  {
    id: 'redo',
    keys: ['Ctrl', 'Y'],
    description: 'Повторить действие',
    category: 'Редактирование',
    action: () => console.log('Redo'),
    enabled: true
  },
  {
    id: 'zoom-in',
    keys: ['Ctrl', '+'],
    description: 'Увеличить масштаб графика',
    category: 'Графики',
    action: () => console.log('Zoom in'),
    enabled: true
  },
  {
    id: 'zoom-out',
    keys: ['Ctrl', '-'],
    description: 'Уменьшить масштаб графика',
    category: 'Графики',
    action: () => console.log('Zoom out'),
    enabled: true
  },
  {
    id: 'reset-zoom',
    keys: ['R'],
    description: 'Сбросить масштаб графика',
    category: 'Графики',
    action: () => console.log('Reset zoom'),
    enabled: true
  },
  {
    id: 'toggle-legend',
    keys: ['L'],
    description: 'Показать/скрыть легенду',
    category: 'Графики',
    action: () => console.log('Toggle legend'),
    enabled: true
  },
  {
    id: 'fullscreen',
    keys: ['F'],
    description: 'Полноэкранный режим графика',
    category: 'Графики',
    action: () => console.log('Fullscreen'),
    enabled: true
  },
  {
    id: 'help',
    keys: ['?'],
    description: 'Показать горячие клавиши',
    category: 'Справка',
    action: () => console.log('Show help'),
    enabled: true
  },
  {
    id: 'search',
    keys: ['Ctrl', 'F'],
    description: 'Поиск по данным',
    category: 'Навигация',
    action: () => console.log('Search'),
    enabled: true
  }
];

const KeyboardShortcuts: React.FC<KeyboardShortcutsProps> = ({
  actions = defaultActions,
  onShortcutExecuted,
  showIndicator = true,
  className = ''
}) => {
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [showHelp, setShowHelp] = useState(false);
  const [lastExecuted, setLastExecuted] = useState<string | null>(null);

  // Normalize key names for consistency
  const normalizeKey = (key: string): string => {
    const keyMap: Record<string, string> = {
      'Control': 'Ctrl',
      'Meta': 'Cmd',
      'Alt': 'Alt',
      'Shift': 'Shift',
      ' ': 'Space',
      'Escape': 'Esc',
      'ArrowUp': '↑',
      'ArrowDown': '↓',
      'ArrowLeft': '←',
      'ArrowRight': '→'
    };
    
    return keyMap[key] || key.toUpperCase();
  };

  // Check if a key combination matches
  const matchesShortcut = useCallback((shortcut: string[], pressed: Set<string>): boolean => {
    if (shortcut.length !== pressed.size) return false;
    return shortcut.every(key => pressed.has(normalizeKey(key)));
  }, []);

  // Execute matching shortcut
  const executeShortcut = useCallback((pressed: Set<string>) => {
    for (const action of actions) {
      if (!action.enabled) continue;
      
      if (matchesShortcut(action.keys, pressed)) {
        action.action();
        setLastExecuted(action.id);
        
        if (onShortcutExecuted) {
          onShortcutExecuted(action.id);
        }
        
        // Clear the indicator after a short delay
        setTimeout(() => setLastExecuted(null), 1000);
        
        return true;
      }
    }
    return false;
  }, [actions, matchesShortcut, onShortcutExecuted]);

  // Handle key down
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = normalizeKey(event.key);
    
    setPressedKeys(prev => {
      const newPressed = new Set(prev);
      newPressed.add(key);
      
      // Check for shortcut match
      if (executeShortcut(newPressed)) {
        event.preventDefault();
        event.stopPropagation();
      }
      
      return newPressed;
    });
  }, [executeShortcut]);

  // Handle key up
  const handleKeyUp = useCallback((event: KeyboardEvent) => {
    const key = normalizeKey(event.key);
    
    setPressedKeys(prev => {
      const newPressed = new Set(prev);
      newPressed.delete(key);
      return newPressed;
    });
  }, []);

  // Set up event listeners
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    // Clear pressed keys when window loses focus
    const handleBlur = () => setPressedKeys(new Set());
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleBlur);
    };
  }, [handleKeyDown, handleKeyUp]);

  // Special handling for help shortcut
  useEffect(() => {
    const helpAction = actions.find(a => a.id === 'help');
    if (helpAction) {
      helpAction.action = () => setShowHelp(true);
    }
  }, [actions]);

  // Group actions by category
  const groupedActions = actions.reduce((groups, action) => {
    if (!groups[action.category]) {
      groups[action.category] = [];
    }
    groups[action.category].push(action);
    return groups;
  }, {} as Record<string, ShortcutAction[]>);

  // Format key combination for display
  const formatKeys = (keys: string[]): string => {
    return keys.join(' + ');
  };

  // Get the executed action for indicator
  const executedAction = lastExecuted ? actions.find(a => a.id === lastExecuted) : null;

  return (
    <>
      {/* Shortcut Indicator */}
      {showIndicator && executedAction && (
        <div className="fixed top-4 right-4 z-50 bg-black bg-opacity-90 text-white px-4 py-2 rounded-lg shadow-lg">
          <div className="flex items-center space-x-2">
            <Keyboard className="w-4 h-4" />
            <span className="text-sm font-medium">{formatKeys(executedAction.keys)}</span>
            <span className="text-xs opacity-75">{executedAction.description}</span>
          </div>
        </div>
      )}

      {/* Help Modal */}
      {showHelp && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className={`bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[80vh] overflow-hidden ${className}`}>
            <div className="flex items-center justify-between p-4 border-b">
              <div className="flex items-center">
                <Keyboard className="w-5 h-5 text-gray-600 mr-2" />
                <h2 className="text-lg font-semibold text-gray-900">Горячие клавиши</h2>
              </div>
              <button
                onClick={() => setShowHelp(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Закрыть справку"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 overflow-y-auto max-h-96">
              {Object.entries(groupedActions).map(([category, categoryActions]) => (
                <div key={category} className="mb-6">
                  <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide mb-3">
                    {category}
                  </h3>
                  <div className="space-y-2">
                    {categoryActions
                      .filter(action => action.enabled)
                      .map(action => (
                        <div key={action.id} className="flex items-center justify-between py-2 px-3 rounded hover:bg-gray-50">
                          <span className="text-sm text-gray-900">{action.description}</span>
                          <div className="flex items-center space-x-1">
                            {action.keys.map((key, index) => (
                              <React.Fragment key={index}>
                                {index > 0 && <span className="text-xs text-gray-400">+</span>}
                                <kbd className="px-2 py-1 text-xs font-mono bg-gray-100 border border-gray-300 rounded">
                                  {key}
                                </kbd>
                              </React.Fragment>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t bg-gray-50">
              <p className="text-xs text-gray-600">
                💡 Совет: Горячие клавиши работают везде, кроме полей ввода. 
                Нажмите <kbd className="px-1 py-0.5 text-xs bg-gray-200 rounded">?</kbd> для быстрого доступа к этой справке.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pressed Keys Indicator (Debug Mode) */}
      {process.env.NODE_ENV === 'development' && pressedKeys.size > 0 && (
        <div className="fixed bottom-4 left-4 z-50 bg-yellow-100 border border-yellow-300 text-yellow-800 px-3 py-2 rounded text-sm">
          Нажатые клавиши: {Array.from(pressedKeys).join(' + ')}
        </div>
      )}

      {/* Help Button */}
      <button
        onClick={() => setShowHelp(true)}
        className="fixed bottom-4 left-4 z-40 bg-gray-600 text-white p-3 rounded-full shadow-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
        aria-label="Показать горячие клавиши"
        title="Горячие клавиши (?)"
      >
        <HelpCircle className="w-5 h-5" />
      </button>
    </>
  );
};

export default KeyboardShortcuts;
