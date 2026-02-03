import { ScoreBadge } from '@/components/data-display/score-badge';

export const metadata = {
  title: 'Список звонков',
};

function getTypeColor(type: string): string {
  switch (type) {
    case 'ЛИД':
      return '#0066FF';
    case 'СДЕЛКА':
      return '#00AA33';
    case 'ЗВОНОК':
      return '#9933FF';
    default:
      return '#CCCCCC';
  }
}

export default function CallsListPage() {
  const calls = [
    {
      dateTime: '2025-01-27 12:32',
      type: 'ЛИД',
      number: 13,
      manager: 'Менеджер 1',
      duration: '00:03:13',
      group: 1,
      tags: 'lead, cold',
      score: 72,
    },
    {
      dateTime: '2025-01-27 11:45',
      type: 'СДЕЛКА',
      number: 12,
      manager: 'Менеджер 2',
      duration: '00:05:22',
      group: 2,
      tags: 'warm',
      score: 85,
    },
    {
      dateTime: '2025-01-27 10:30',
      type: 'ЗВОНОК',
      number: 11,
      manager: 'Менеджер 1',
      duration: '00:02:15',
      group: 1,
      tags: 'demo',
      score: 65,
    },
    {
      dateTime: '2025-01-27 09:50',
      type: 'ЛИД',
      number: 10,
      manager: 'Менеджер 3',
      duration: '00:04:03',
      group: 3,
      tags: 'cold',
      score: 52,
    },
    {
      dateTime: '2025-01-27 09:15',
      type: 'СДЕЛКА',
      number: 9,
      manager: 'Менеджер 2',
      duration: '00:06:45',
      group: 2,
      tags: 'warm, demo',
      score: 78,
    },
    {
      dateTime: '2025-01-26 16:20',
      type: 'ЛИД',
      number: 8,
      manager: 'Менеджер 4',
      duration: '00:03:30',
      group: 1,
      tags: 'cold',
      score: 38,
    },
    {
      dateTime: '2025-01-26 15:10',
      type: 'ЗВОНОК',
      number: 7,
      manager: 'Менеджер 1',
      duration: '00:02:50',
      group: 2,
      tags: 'follow-up',
      score: 68,
    },
    {
      dateTime: '2025-01-26 14:05',
      type: 'СДЕЛКА',
      number: 6,
      manager: 'Менеджер 3',
      duration: '00:05:15',
      group: 3,
      tags: 'demo',
      score: 80,
    },
    {
      dateTime: '2025-01-26 13:20',
      type: 'ЛИД',
      number: 5,
      manager: 'Менеджер 2',
      duration: '00:04:10',
      group: 1,
      tags: 'warm',
      score: 58,
    },
    {
      dateTime: '2025-01-26 12:30',
      type: 'ЗВОНОК',
      number: 4,
      manager: 'Менеджер 4',
      duration: '00:03:25',
      group: 2,
      tags: 'cold',
      score: 45,
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Список звонков</h1>

      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b">
              <th className="p-3 text-left text-sm font-semibold">Дата/Время</th>
              <th className="p-3 text-left text-sm font-semibold">Ссылки</th>
              <th className="p-3 text-right text-sm font-semibold">Номер</th>
              <th className="p-3 text-left text-sm font-semibold">Менеджер</th>
              <th className="p-3 text-right text-sm font-semibold">Длительность</th>
              <th className="p-3 text-right text-sm font-semibold">Оценка</th>
            </tr>
          </thead>
          <tbody>
            {calls.map((call, idx) => (
              <tr key={idx} className="border-b hover:bg-gray-50">
                <td className="p-3 text-left">{call.dateTime}</td>
                <td className="p-3 text-left">
                  <span
                    className="inline-block px-2 py-1 rounded text-white text-xs font-medium"
                    style={{ backgroundColor: getTypeColor(call.type) }}
                  >
                    {call.type}
                  </span>
                </td>
                <td className="p-3 text-right">{call.number}</td>
                <td className="p-3 text-left">{call.manager}</td>
                <td className="p-3 text-right">{call.duration}</td>
                <td className="p-3 text-right">
                  <ScoreBadge percent={call.score}>{call.score}%</ScoreBadge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-sm text-info">16 результатов</div>
    </div>
  );
}
