export const metadata = {
  title: 'Настройки создания задач в CRM',
};

export default function CrmTasksPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки создания задач в CRM</h1>

      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input type="checkbox" className="w-4 h-4" />
          <span>Включить создание задач для данного воркспейса</span>
        </label>
        <p className="text-xs text-gray-500 ml-6">Статус аналитики: Отключена</p>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Минимальное пороговое значение (в %) для создания задачи ответственному лицу:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Максимальное пороговое значение (в %) для создания задачи ответственному лицу:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="40"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Отложить создание задач в период С (часов) UTC:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">
            Отложить создание задач в период ДО (часов) UTC:
          </label>
          <input
            type="number"
            className="border p-2 rounded w-32"
            defaultValue="0"
          />
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded mt-4">
          Сохранить
        </button>
      </div>
    </div>
  );
}
