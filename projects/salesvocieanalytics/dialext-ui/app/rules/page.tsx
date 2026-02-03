export const metadata = {
  title: 'Правила оценки',
};

const rules = [
  {
    id: 1,
    name: 'Обход секретаря',
    group: 1,
    scale: 3,
    description: 'Менеджер успешно связался с ЛПР',
  },
  {
    id: 2,
    name: 'Приветствие и установка контакта',
    group: 1,
    scale: 3,
    description: 'Менеджер представился и назвал компанию',
  },
  {
    id: 3,
    name: 'Назначение времени демонстрации',
    group: 2,
    scale: 3,
    description: 'Менеджер предложил конкретное время для демо',
  },
  {
    id: 4,
    name: 'Актуализация контактов',
    group: 2,
    scale: 3,
    description: 'Менеджер уточнил контактные данные',
  },
  {
    id: 5,
    name: 'Должность и функционал',
    group: 3,
    scale: 3,
    description: 'Менеджер уточнил должность клиента',
  },
  {
    id: 6,
    name: 'Выявление потребностей',
    group: 3,
    scale: 3,
    description: 'Менеджер задал вопросы о потребностях',
  },
  {
    id: 7,
    name: 'Обработка возражений',
    group: 3,
    scale: 3,
    description: 'Менеджер ответил на возражения клиента',
  },
  {
    id: 8,
    name: 'Презентация продукта',
    group: 1,
    scale: 3,
    description: 'Менеджер описал преимущества продукта',
  },
];

export default function RulesPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Правила оценки</h1>

      <div className="flex gap-6 h-96">
        {/* Left pane: Rules table */}
        <div className="flex-1 border rounded bg-white overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold text-xs">№</th>
                  <th className="p-2 text-left font-semibold text-xs">Группа</th>
                  <th className="p-2 text-left font-semibold text-xs">Шкала</th>
                  <th className="p-2 text-left font-semibold text-xs">Название</th>
                </tr>
              </thead>
              <tbody>
                {rules.map((rule) => (
                  <tr key={rule.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{rule.id}</td>
                    <td className="p-2">{rule.group}</td>
                    <td className="p-2">{rule.scale}</td>
                    <td className="p-2">{rule.name}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t p-2 text-xs text-info bg-gray-50">47 результатов</div>
        </div>

        {/* Right pane: Rule editor */}
        <div className="flex-1 border rounded bg-white p-4">
          <h3 className="font-semibold mb-4">Редактор правила</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block font-medium mb-1">KEY:</label>
              <input className="w-full border p-1 rounded" placeholder="правило_key" />
            </div>
            <div>
              <label className="block font-medium mb-1">Группа № :</label>
              <input type="number" className="w-full border p-1 rounded" placeholder="1" />
            </div>
            <div>
              <label className="block font-medium mb-1">Шкала:</label>
              <input type="number" className="w-full border p-1 rounded" placeholder="3" />
            </div>
            <div>
              <label className="block font-medium mb-1">Название:</label>
              <input className="w-full border p-1 rounded" placeholder="Название правила" />
            </div>
            <div>
              <label className="block font-medium mb-1">Описание:</label>
              <textarea
                className="w-full border p-1 rounded h-12"
                placeholder="Подробное описание правила..."
              />
            </div>
            <button className="w-full bg-primary text-white px-3 py-1 rounded text-sm font-medium hover:bg-primary-hover">
              Улучшить правило
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
