export const metadata = {
  title: 'Настройки фильтров по источникам сделок',
};

export default function SourcesFilterPage() {
  const sources = [
    { name: 'Источник 1', checked: true },
    { name: 'Источник 2', checked: false },
    { name: 'Источник 3', checked: false },
    { name: 'Источник 4', checked: true },
    { name: 'Источник 5', checked: false },
    { name: 'Источник 6', checked: true },
    { name: 'Источник 7', checked: false },
    { name: 'Источник 8', checked: false },
    { name: 'Источник 9', checked: false },
    { name: 'Источник 10', checked: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Настройки фильтров по источникам сделок
      </h1>

      <button className="border px-4 py-2 rounded bg-white">
        Загрузить список источников
      </button>

      <div className="space-y-4">
        <p className="font-semibold">
          Обрабатывать звонки для следующих источников:
        </p>
        <label className="flex items-center gap-2">
          <input type="radio" name="sourceFilter" />
          <span>Всех</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="sourceFilter" defaultChecked />
          <span>Выбранных</span>
        </label>

        <div className="ml-8 space-y-2 mt-3">
          {sources.map((src, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={src.checked} />
              <span>{src.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
