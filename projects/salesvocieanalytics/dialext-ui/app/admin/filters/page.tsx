export const metadata = {
  title: 'Настройки фильтров',
};

export default function FiltersPage() {
  const filters = [
    {
      name: 'Фильтр первых звонков',
      description: 'Ограничение на получение и обработку только первых звонков от клиента.',
    },
    {
      name: 'Фильтр совпадающих ответственных лиц',
      description: 'Фильтрация по совпадению ответственных за звонок и связанные сущности.',
    },
    {
      name: 'Фильтр длительности звонков',
      description: 'Ограничение на длительность получаемых звонков.',
    },
    {
      name: 'Фильтр по типу звонка',
      description: 'Ограничение на получение и обработку по типу звонка.',
    },
    {
      name: 'Фильтр менеджеров',
      description: 'Список менеджеров чьи звонки будут обрабатываться.',
    },
    {
      name: 'Фильтр по источнику данных',
      description: 'Ограничение на получение и обработку звонков из определённых источников.',
    },
    {
      name: 'Фильтр по стадиям сделки',
      description: 'Фильтрация звонков по стадиям связанной с ним сделки.',
    },
    {
      name: 'Фильтр по статусу лида',
      description: 'Получаем только звонки у лидов которых проставлен соответствующий статус.',
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки фильтрации объектов из CRM</h1>

      <div className="space-y-4">
        {filters.map((filter, idx) => (
          <div key={idx} className="border p-4 rounded">
            <h3 className="font-semibold mb-1">{idx + 1}. {filter.name}</h3>
            <p className="text-sm text-gray-600">{filter.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
