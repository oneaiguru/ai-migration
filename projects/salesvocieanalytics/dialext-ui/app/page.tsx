import Link from 'next/link';
import { Card } from '@/components/ui/card';

export const metadata = {
  title: 'Voice Analytics — Демо интерфейса',
};

export default function HomePage() {
  const sections = [
    {
      title: 'Статистика',
      links: [
        { href: '/stats/time/', label: 'По времени' },
        { href: '/stats/days/', label: 'По дням' },
      ],
    },
    {
      title: 'Администрирование',
      links: [
        { href: '/admin/email-notify/', label: 'Email уведомления' },
        { href: '/admin/privacy/', label: 'Настройки доступа' },
        { href: '/admin/crm-pull/', label: 'Получение из CRM' },
        { href: '/admin/crm-tasks/', label: 'Создание задач' },
        { href: '/admin/filters/', label: 'Фильтры' },
        { href: '/admin/filters/managers/', label: 'Фильтр менеджеров' },
        { href: '/admin/filters/sources/', label: 'Фильтр источников' },
      ],
    },
    {
      title: 'Настройки компании',
      links: [
        { href: '/company/', label: 'Компания' },
        { href: '/rules/', label: 'Правила оценки' },
        { href: '/llm-tags/', label: 'LLM теги' },
        { href: '/groups/', label: 'Группы' },
      ],
    },
    {
      title: 'Отчеты',
      links: [
        { href: '/reports/managers/', label: 'Менеджеры' },
        { href: '/reports/calls/filter/', label: 'Фильтр звонков' },
        { href: '/reports/calls/list/', label: 'Список звонков' },
        { href: '/reports/call/1/', label: 'Детали звонка' },
        { href: '/reports/lagging/', label: 'Западающие показатели' },
        { href: '/reports/trends/', label: 'Динамика' },
      ],
    },
    {
      title: 'Bitrix 24',
      links: [
        { href: '/bitrix/transcript/', label: 'Расшифровка' },
        { href: '/bitrix/score/', label: 'Оценка' },
      ],
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-page-title mb-2">Voice Analytics — Демо интерфейса</h1>
        <p className="text-body text-info">
          Статический прототип интерфейса платформы анализа звонков
        </p>
      </div>

      {sections.map((section) => (
        <Card key={section.title} className="p-6">
          <h2 className="text-section-header mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {section.links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="p-3 border border-border hover:bg-bg-secondary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}
