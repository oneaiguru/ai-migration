import { ScoreBadge } from '@/components/data-display/score-badge';

export const metadata = {
  title: 'Оценка звонка',
};

export default function BitrixScorePage() {
  const criteria = [
    { name: 'Обход секретаря', score: 3, max: 3 },
    { name: 'Приветствие и установка контакта', score: 3, max: 3 },
    { name: 'Назначение времени демонстрации', score: 2, max: 3 },
    { name: 'Актуализация контактов', score: 0, max: 3 },
    { name: 'Должность и функционал', score: 0, max: 3 },
    { name: 'Выявление потребностей', score: 0, max: 3 },
    { name: 'Обработка возражений', score: 0, max: 3 },
    { name: 'Презентация продукта', score: 0, max: 3 },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Оценка звонка из Bitrix24</h1>

      <div className="border p-6 rounded bg-white">
        <div className="space-y-4 mb-6">
          <div className="flex justify-between items-center">
            <span className="text-section-header">Общая оценка:</span>
            <ScoreBadge percent={72}>72%</ScoreBadge>
          </div>
        </div>

        <h3 className="text-section-header mb-4">Детальная оценка</h3>
        <div className="space-y-3">
          {criteria.map((item, idx) => (
            <div key={idx} className="flex justify-between items-center pb-3 border-b">
              <span className="text-sm">{item.name}</span>
              <div className="flex items-center gap-3">
                <span className="font-semibold">{item.score}/{item.max}</span>
                <div className="w-24 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${(item.score / item.max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
