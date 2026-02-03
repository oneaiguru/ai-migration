// /Users/m/Documents/wfm/competitor/naumen/forecasting-analytics/src/components/forecasting/integration/AccessibilityHelper.tsx
import React, { useState, useEffect } from 'react';
import { Eye, EyeOff, Type, Contrast, Volume2, Keyboard } from 'lucide-react';

interface AccessibilitySettings {
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large' | 'extra-large';
  reducedMotion: boolean;
  screenReader: boolean;
  focusVisible: boolean;
  keyboardNavigation: boolean;
}

interface AccessibilityHelperProps {
  onSettingsChange?: (settings: AccessibilitySettings) => void;
  className?: string;
}

const AccessibilityHelper: React.FC<AccessibilityHelperProps> = ({
  onSettingsChange,
  className = ''
}) => {
  const [settings, setSettings] = useState<AccessibilitySettings>({
    highContrast: false,
    fontSize: 'medium',
    reducedMotion: false,
    screenReader: false,
    focusVisible: true,
    keyboardNavigation: true
  });

  const [isOpen, setIsOpen] = useState(false);
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Apply accessibility settings to document
  useEffect(() => {
    const root = document.documentElement;
    
    // High contrast
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // Font size
    root.classList.remove('font-small', 'font-medium', 'font-large', 'font-extra-large');
    root.classList.add(`font-${settings.fontSize}`);

    // Reduced motion
    if (settings.reducedMotion) {
      root.classList.add('reduced-motion');
    } else {
      root.classList.remove('reduced-motion');
    }

    // Focus visible
    if (settings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }

    if (onSettingsChange) {
      onSettingsChange(settings);
    }
  }, [settings, onSettingsChange]);

  // Screen reader announcements
  const announce = (message: string) => {
    setAnnouncements(prev => [...prev, message]);
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 3000);
  };

  // Keyboard navigation helper
  useEffect(() => {
    if (!settings.keyboardNavigation) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Skip links with Alt + S
      if (e.altKey && e.key === 's') {
        e.preventDefault();
        const mainContent = document.querySelector('main') || document.querySelector('[role="main"]');
        if (mainContent) {
          (mainContent as HTMLElement).focus();
          announce('Переход к основному содержимому');
        }
      }

      // Focus trap in modals
      if (e.key === 'Tab') {
        const modal = document.querySelector('[role="dialog"]');
        if (modal) {
          const focusableElements = modal.querySelectorAll(
            'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

          if (e.shiftKey) {
            if (document.activeElement === firstElement) {
              e.preventDefault();
              lastElement.focus();
            }
          } else {
            if (document.activeElement === lastElement) {
              e.preventDefault();
              firstElement.focus();
            }
          }
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [settings.keyboardNavigation]);

  const updateSetting = <K extends keyof AccessibilitySettings>(
    key: K,
    value: AccessibilitySettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    
    // Announce changes
    const messages = {
      highContrast: value ? 'Высокий контраст включен' : 'Высокий контраст выключен',
      fontSize: `Размер шрифта изменен на ${value}`,
      reducedMotion: value ? 'Анимации отключены' : 'Анимации включены',
      screenReader: value ? 'Режим программы чтения экрана включен' : 'Режим программы чтения экрана выключен',
      focusVisible: value ? 'Видимость фокуса включена' : 'Видимость фокуса выключена',
      keyboardNavigation: value ? 'Навигация с клавиатуры включена' : 'Навигация с клавиатуры выключена'
    };
    
    announce(messages[key] as string);
  };

  const fontSizeLabels = {
    small: 'Мелкий',
    medium: 'Средний',
    large: 'Крупный',
    'extra-large': 'Очень крупный'
  };

  return (
    <>
      {/* Accessibility Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-4 right-4 z-50 bg-blue-600 text-white p-3 rounded-full shadow-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        aria-label="Открыть настройки доступности"
        title="Настройки доступности"
      >
        <Eye className="w-6 h-6" />
      </button>

      {/* Skip Links */}
      <div className="sr-only focus:not-sr-only">
        <a
          href="#main-content"
          className="fixed top-4 left-4 z-50 bg-blue-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          Перейти к основному содержимому
        </a>
      </div>

      {/* Accessibility Panel */}
      {isOpen && (
        <div
          className={`fixed bottom-20 right-4 z-40 bg-white rounded-lg shadow-xl border w-80 ${className}`}
          role="dialog"
          aria-label="Настройки доступности"
          aria-modal="true"
        >
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">Настройки доступности</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded"
                aria-label="Закрыть настройки доступности"
              >
                <EyeOff className="w-5 h-5" />
              </button>
            </div>
          </div>

          <div className="p-4 space-y-4 max-h-96 overflow-y-auto">
            {/* High Contrast */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Contrast className="w-5 h-5 text-gray-600 mr-3" />
                <label htmlFor="high-contrast" className="text-sm font-medium text-gray-700">
                  Высокий контраст
                </label>
              </div>
              <input
                id="high-contrast"
                type="checkbox"
                checked={settings.highContrast}
                onChange={(e) => updateSetting('highContrast', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-describedby="high-contrast-desc"
              />
            </div>
            <p id="high-contrast-desc" className="text-xs text-gray-600 ml-8">
              Увеличивает контрастность для лучшей видимости
            </p>

            {/* Font Size */}
            <div>
              <div className="flex items-center mb-2">
                <Type className="w-5 h-5 text-gray-600 mr-3" />
                <label htmlFor="font-size" className="text-sm font-medium text-gray-700">
                  Размер шрифта
                </label>
              </div>
              <select
                id="font-size"
                value={settings.fontSize}
                onChange={(e) => updateSetting('fontSize', e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                aria-describedby="font-size-desc"
              >
                {Object.entries(fontSizeLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
              <p id="font-size-desc" className="text-xs text-gray-600 mt-1">
                Настройка размера текста для комфортного чтения
              </p>
            </div>

            {/* Reduced Motion */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Volume2 className="w-5 h-5 text-gray-600 mr-3" />
                <label htmlFor="reduced-motion" className="text-sm font-medium text-gray-700">
                  Отключить анимации
                </label>
              </div>
              <input
                id="reduced-motion"
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-describedby="reduced-motion-desc"
              />
            </div>
            <p id="reduced-motion-desc" className="text-xs text-gray-600 ml-8">
              Убирает анимации и переходы для людей с вестибулярными расстройствами
            </p>

            {/* Keyboard Navigation */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Keyboard className="w-5 h-5 text-gray-600 mr-3" />
                <label htmlFor="keyboard-nav" className="text-sm font-medium text-gray-700">
                  Навигация с клавиатуры
                </label>
              </div>
              <input
                id="keyboard-nav"
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-describedby="keyboard-nav-desc"
              />
            </div>
            <p id="keyboard-nav-desc" className="text-xs text-gray-600 ml-8">
              Улучшенная навигация с помощью клавиатуры и горячих клавиш
            </p>

            {/* Focus Visible */}
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Eye className="w-5 h-5 text-gray-600 mr-3" />
                <label htmlFor="focus-visible" className="text-sm font-medium text-gray-700">
                  Видимость фокуса
                </label>
              </div>
              <input
                id="focus-visible"
                type="checkbox"
                checked={settings.focusVisible}
                onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                aria-describedby="focus-visible-desc"
              />
            </div>
            <p id="focus-visible-desc" className="text-xs text-gray-600 ml-8">
              Показывает четкий индикатор фокуса при навигации с клавиатуры
            </p>

            {/* Keyboard Shortcuts */}
            <div className="border-t pt-4">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Горячие клавиши</h3>
              <div className="space-y-1 text-xs text-gray-600">
                <div className="flex justify-between">
                  <span>Alt + S</span>
                  <span>Перейти к содержимому</span>
                </div>
                <div className="flex justify-between">
                  <span>Tab / Shift + Tab</span>
                  <span>Навигация по элементам</span>
                </div>
                <div className="flex justify-between">
                  <span>Enter / Пробел</span>
                  <span>Активировать элемент</span>
                </div>
                <div className="flex justify-between">
                  <span>Esc</span>
                  <span>Закрыть диалоги</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Screen Reader Announcements */}
      <div 
        aria-live="polite" 
        aria-atomic="true" 
        className="sr-only"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>

      {/* Accessibility Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%);
        }
        
        .font-small {
          font-size: 14px;
        }
        
        .font-medium {
          font-size: 16px;
        }
        
        .font-large {
          font-size: 18px;
        }
        
        .font-extra-large {
          font-size: 22px;
        }
        
        .reduced-motion * {
          animation-duration: 0.01s !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01s !important;
        }
        
        .focus-visible *:focus {
          outline: 2px solid #2563eb !important;
          outline-offset: 2px !important;
        }
        
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          white-space: nowrap;
          border: 0;
        }
        
        .sr-only:focus {
          position: static;
          width: auto;
          height: auto;
          padding: 0.5rem;
          margin: 0;
          overflow: visible;
          clip: auto;
          white-space: normal;
          border: 1px solid #2563eb;
        }
      `}</style>
    </>
  );
};

export default AccessibilityHelper;
