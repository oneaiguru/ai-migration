import { ScoreBadge } from '@/components/data-display/score-badge';

export const metadata = {
  title: 'Детали звонка',
};

export async function generateStaticParams() {
  return [{ id: '1' }, { id: '2' }, { id: '3' }];
}

interface Criterion {
  name: string;
  score: number;
  max: number;
  rationale: string;
  weight: number;
}

export default function CallDetailPage({ params }: { params: { id: string } }) {
  const callData = {
    id: params.id,
    dateTime: '2025-01-27 12:32:45',
    manager: 'Менеджер 1',
    duration: '00:03:13',
    from: '+7 (495) 123-45-67',
    to: '+7 (495) 987-65-43',
    direction: 'Исходящий',
    type: 'ЛИД',
    tags: ['Холодный звонок', 'Презентация'],
    overallScore: 72,
    source: 'Яндекс Директ',
  };

  const criteria: Criterion[] = [
    {
      name: 'Обход секретаря',
      score: 3,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер успешно связался с лицом, принимающим решения, минуя секретаря. Использовал уверенный тон и назвал цель звонка.',
    },
    {
      name: 'Приветствие и установка контакта',
      score: 3,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер четко представился, назвал компанию и кратко обозначил причину звонка. Тон был вежливым и профессиональным.',
    },
    {
      name: 'Назначение времени демонстрации',
      score: 2,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер предложил время для демонстрации, но не использовал технику альтернативного выбора. Клиент согласился не сразу.',
    },
    {
      name: 'Актуализация контактов',
      score: 0,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер не уточнил email клиента и не подтвердил номер телефона для последующей связи.',
    },
    {
      name: 'Должность и функционал',
      score: 1,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер спросил о должности, но не уточнил функционал и зону ответственности собеседника.',
    },
    {
      name: 'Выявление потребностей',
      score: 1,
      max: 3,
      weight: 1,
      rationale:
        'Задал один общий вопрос о проблемах, но не провел глубокое выявление потребностей через открытые вопросы.',
    },
    {
      name: 'Обработка возражений',
      score: 0,
      max: 3,
      weight: 1,
      rationale:
        'Клиент выразил сомнения относительно цены, но менеджер не отработал возражение, а сразу предложил скидку.',
    },
    {
      name: 'Презентация продукта',
      score: 2,
      max: 3,
      weight: 1,
      rationale:
        'Менеджер описал основные функции продукта, но не связал их с потребностями клиента. Презентация была общей.',
    },
  ];

  const transcript = [
    {
      time: '00:00',
      speaker: 'Менеджер',
      text: 'Добрый день! Меня зовут Иван, компания Voice Analytics. Правильно ли я понимаю, что вы руководитель отдела продаж?',
    },
    {
      time: '00:08',
      speaker: 'Клиент',
      text: 'Да, здравствуйте. Да, я руководитель.',
    },
    {
      time: '00:12',
      speaker: 'Менеджер',
      text: 'Отлично! Иван, мы помогаем компаниям автоматизировать анализ звонков менеджеров. Скажите, как сейчас у вас организован контроль качества звонков?',
    },
    {
      time: '00:25',
      speaker: 'Клиент',
      text: 'Честно говоря, никак особо. Иногда слушаем записи, но это очень долго.',
    },
    {
      time: '00:32',
      speaker: 'Менеджер',
      text: 'Понимаю. Наша система как раз автоматически анализирует все звонки и выставляет оценки по вашим критериям. Хотите посмотреть, как это работает? Могу показать демо в среду в 14:00 или в четверг в 11:00?',
    },
    {
      time: '00:48',
      speaker: 'Клиент',
      text: 'Хм, звучит интересно. А сколько это стоит?',
    },
    {
      time: '00:52',
      speaker: 'Менеджер',
      text: 'Цена зависит от количества звонков. Для начала давайте посмотрим демо, чтобы вы оценили функционал. Среда в 14:00 подойдет?',
    },
    {
      time: '01:02',
      speaker: 'Клиент',
      text: 'Ладно, давайте в среду.',
    },
    {
      time: '01:05',
      speaker: 'Менеджер',
      text: 'Отлично! Я отправлю вам ссылку на встречу в Zoom. Какой у вас email?',
    },
    {
      time: '01:10',
      speaker: 'Клиент',
      text: 'ivan@example.com',
    },
    {
      time: '01:14',
      speaker: 'Менеджер',
      text: 'Записал. До встречи в среду! Хорошего дня!',
    },
    {
      time: '01:18',
      speaker: 'Клиент',
      text: 'Спасибо, до свидания.',
    },
  ];

  const totalPossible = criteria.reduce((sum, c) => sum + c.max * c.weight, 0);
  const totalReceived = criteria.reduce((sum, c) => sum + c.score * c.weight, 0);
  const overallScore = Math.round((totalReceived / totalPossible) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Детали звонка #{params.id}</h1>
        <ScoreBadge percent={overallScore}>
          <span className="text-lg font-bold">{overallScore}%</span>
        </ScoreBadge>
      </div>

      {/* Metadata Grid */}
      <div className="border border-border p-6 bg-white">
        <h3 className="text-section-header mb-4">Общая информация</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <label className="text-xs font-medium text-info">Дата и время:</label>
            <div className="text-sm font-mono">{callData.dateTime}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Менеджер:</label>
            <div className="text-sm">{callData.manager}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Длительность:</label>
            <div className="text-sm font-mono">{callData.duration}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Направление:</label>
            <div className="text-sm">{callData.direction}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">От:</label>
            <div className="text-sm font-mono">{callData.from}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Кому:</label>
            <div className="text-sm font-mono">{callData.to}</div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Тип:</label>
            <div className="text-sm">
              <span className="px-2 py-1 bg-blue-500 text-white rounded text-xs">
                {callData.type}
              </span>
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-info">Источник:</label>
            <div className="text-sm">{callData.source}</div>
          </div>
        </div>
        <div className="mt-4">
          <label className="text-xs font-medium text-info">Теги:</label>
          <div className="flex gap-2 mt-1">
            {callData.tags.map((tag, idx) => (
              <span
                key={idx}
                className="px-2 py-1 bg-gray-100 border border-border rounded text-xs"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Scoring Details */}
      <div className="border border-border p-6 bg-white">
        <h3 className="text-section-header mb-4">Детализация оценки</h3>
        <div className="space-y-4">
          {criteria.map((item, idx) => {
            const percent = (item.score / item.max) * 100;
            return (
              <div key={idx} className="border-b border-border pb-4 last:border-b-0">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono">
                      {item.score}/{item.max}
                    </span>
                    <ScoreBadge percent={percent}>
                      <span className="text-xs">{Math.round(percent)}%</span>
                    </ScoreBadge>
                  </div>
                </div>
                <p className="text-xs text-info leading-relaxed">{item.rationale}</p>
              </div>
            );
          })}
        </div>
        <div className="mt-6 pt-4 border-t border-border flex justify-between items-center">
          <span className="font-semibold">Итого:</span>
          <div className="flex items-center gap-3">
            <span className="font-mono">
              {totalReceived}/{totalPossible}
            </span>
            <ScoreBadge percent={overallScore}>
              <span className="font-bold">{overallScore}%</span>
            </ScoreBadge>
          </div>
        </div>
      </div>

      {/* Transcript */}
      <div className="border border-border p-6 bg-white">
        <h3 className="text-section-header mb-4">Расшифровка звонка</h3>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transcript.map((line, idx) => (
            <div key={idx} className="flex gap-3">
              <div className="text-xs font-mono text-info shrink-0 w-12">
                {line.time}
              </div>
              <div className="flex-1">
                <span className="text-xs font-semibold text-slate-700">
                  {line.speaker}:
                </span>{' '}
                <span className="text-sm text-slate-600">{line.text}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="border border-border px-6 py-2 rounded font-medium hover:bg-gray-50">
          ← Назад к списку
        </button>
        <button className="border border-border px-6 py-2 rounded font-medium hover:bg-gray-50">
          Экспорт PDF
        </button>
        <button className="border border-border px-6 py-2 rounded font-medium hover:bg-gray-50">
          Прослушать запись
        </button>
      </div>
    </div>
  );
}
