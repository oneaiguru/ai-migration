import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Bell, CheckCircle2, AlertTriangle, Download, X } from 'lucide-react';
import { useNotificationCenter } from './NotificationCenter';

const formatTime = (iso: string) => new Intl.DateTimeFormat('ru-RU', {
  hour: '2-digit',
  minute: '2-digit',
  day: '2-digit',
  month: '2-digit',
}).format(new Date(iso));

const kindIcon = {
  success: CheckCircle2,
  error: AlertTriangle,
  info: Bell,
};

const kindClasses: Record<string, string> = {
  success: 'text-emerald-600',
  error: 'text-rose-600',
  info: 'text-sky-600',
};

const NotificationBell: React.FC = () => {
  const { notifications, unreadCount, markAllAsRead, clearNotification } = useNotificationCenter();
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (open && unreadCount > 0) {
      markAllAsRead();
    }
  }, [open, unreadCount, markAllAsRead]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        buttonRef.current?.focus();
      }
    };

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node | null;
      if (!target) {
        return;
      }
      if (panelRef.current?.contains(target) || buttonRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('click', handleClickOutside);

    const focusTarget = panelRef.current?.querySelector<HTMLAnchorElement>('a[href]') ?? panelRef.current;
    focusTarget?.focus();

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('click', handleClickOutside);
    };
  }, [open]);

  const entries = useMemo(() => notifications.slice(0, 6), [notifications]);

  return (
    <div className="relative">
      <button
        type="button"
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-600 transition hover:text-purple-600"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        ref={buttonRef}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 inline-flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-purple-600 px-1 text-[10px] font-semibold text-white">
            {unreadCount}
          </span>
        )}
        <span className="sr-only">Открыть центр уведомлений</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="absolute right-0 z-50 mt-2 w-80 rounded-xl border border-gray-200 bg-white shadow-xl"
          tabIndex={-1}
        >
          <header className="flex items-center justify-between border-b border-gray-100 px-4 py-2">
            <span className="text-sm font-semibold text-gray-900">Уведомления</span>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                buttonRef.current?.focus();
              }}
              className="rounded-full p-1 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Закрыть список уведомлений</span>
            </button>
          </header>

          <ul className="max-h-80 divide-y divide-gray-100 overflow-y-auto">
            {entries.length === 0 ? (
              <li className="px-4 py-5 text-sm text-gray-500">Пока нет уведомлений</li>
            ) : (
              entries.map((entry) => {
                const Icon = kindIcon[entry.kind];
                return (
                  <li key={entry.id} className="flex flex-col gap-2 px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-start gap-3">
                      <Icon className={`mt-0.5 h-4 w-4 ${kindClasses[entry.kind]}`} />
                      <div className="flex-1">
                        <p className="font-medium text-gray-900">{entry.title}</p>
                        <p className="text-xs text-gray-500">{entry.message}</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => clearNotification(entry.id)}
                        className="rounded-full p-1 text-gray-400 hover:text-gray-600"
                      >
                        <X className="h-3.5 w-3.5" />
                        <span className="sr-only">Удалить уведомление</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-400">
                      <span>{formatTime(entry.createdAt)}</span>
                      {entry.downloadHref && (
                        <a
                          className="inline-flex items-center gap-1 rounded-full bg-purple-50 px-2 py-1 text-[11px] font-medium text-purple-700 hover:bg-purple-100"
                          href={entry.downloadHref}
                          download={entry.downloadLabel}
                        >
                          <Download className="h-3.5 w-3.5" />
                          {entry.downloadLabel ?? 'Скачать'}
                        </a>
                      )}
                    </div>
                  </li>
                );
              })
            )}
          </ul>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
