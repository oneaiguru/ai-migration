export const metadata = {
  title: 'Фильтр звонков',
};

const topics = [
  'Обход секретаря',
  'Приветствие',
  'Презентация продукта',
  'Выявление потребностей',
  'Обработка возражений',
  'Назначение демо',
  'Актуализация контактов',
  'Обсуждение цены',
  'Следующие шаги',
  'Завершение звонка',
  'Технические вопросы',
  'Конкуренты',
  'Бюджет клиента',
  'Сроки внедрения',
  'Интеграции',
  'Команда клиента',
  'Текущее решение',
  'Проблемы клиента',
  'Дожим клиента',
  'Теплый звонок',
  'Холодный звонок',
  'Пропущенные',
];

export default function CallsFilterPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Фильтр звонков</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Basic Filters */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Поиск:</label>
            <input
              type="text"
              className="border p-2 rounded bg-white w-full"
              placeholder="Поиск по транскрипту, менеджеру, номеру..."
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Воркспейс:</label>
            <select className="border p-2 rounded bg-white w-full">
              <option>Любой</option>
              <option>Демо</option>
              <option>Продажи</option>
              <option>Поддержка</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Менеджер:</label>
            <select className="border p-2 rounded bg-white w-full">
              <option>Все</option>
              <option>Менеджер 1</option>
              <option>Менеджер 2</option>
              <option>Менеджер 3</option>
              <option>Менеджер 4</option>
              <option>Менеджер 5</option>
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Дата от:</label>
            <input
              type="text"
              className="border p-2 rounded bg-white w-full"
              placeholder="дд.мм.гггг"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Дата до:</label>
            <input
              type="text"
              className="border p-2 rounded bg-white w-full"
              placeholder="дд.мм.гггг"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Длительность:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" defaultChecked />
                <span className="text-sm">Любая</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" />
                <span className="text-sm">Меньше 1 минуты</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" />
                <span className="text-sm">1-3 минуты</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" />
                <span className="text-sm">3-5 минут</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" />
                <span className="text-sm">5-10 минут</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="radio" name="duration" />
                <span className="text-sm">Более 10 минут</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Оценка:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Все оценки</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm text-green-600">Хорошо (≥72%)</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm text-yellow-600">
                  Удовлетворительно (40-71%)
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm text-pink-600">
                  Неудовлетворительно (&lt;40%)
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Right Column - Topics Grid */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">
              Темы и критерии (выберите интересующие):
            </label>
            <div className="border rounded p-4 bg-white max-h-96 overflow-y-auto">
              <div className="grid grid-cols-1 gap-2">
                {topics.map((topic, idx) => (
                  <label key={idx} className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span className="text-sm">{topic}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Направление:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Все</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Входящие</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">Исходящие</span>
              </label>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Тип звонка:</label>
            <div className="space-y-2">
              <label className="flex items-center gap-2">
                <input type="checkbox" defaultChecked />
                <span className="text-sm">Все типы</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">ЛИД</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">СДЕЛКА</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" />
                <span className="text-sm">ЗВОНОК</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <button className="bg-primary text-white px-8 py-2 rounded font-medium hover:bg-primary-hover">
          ПРИМЕНИТЬ
        </button>
        <button className="border border-border px-8 py-2 rounded font-medium hover:bg-gray-50">
          СБРОС
        </button>
      </div>

      {/* Results Preview */}
      <div className="border-t pt-4">
        <p className="text-sm text-info">
          Найдено звонков: <span className="font-semibold">16</span>
        </p>
      </div>
    </div>
  );
}
