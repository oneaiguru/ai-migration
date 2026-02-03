export const metadata = {
  title: 'Группы',
};

const tags = [
  { id: 1, name: 'дожим клиента' },
  { id: 2, name: 'Теплые звонки' },
  { id: 3, name: 'Проведение демонстрации' },
  { id: 4, name: 'Пропущенные' },
  { id: 5, name: 'Холодные звонки' },
];

const groups = [
  { id: 1, name: 'Чек-лист 1', criteriaCount: 5, active: true },
  { id: 2, name: 'Чек-лист 2', criteriaCount: 8, active: true },
  { id: 3, name: 'Чек-лист 3', criteriaCount: 3, active: true },
];

export default function GroupsPage() {
  const selectedGroup = groups[0];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Группы</h1>

      <div className="flex gap-6 h-96">
        {/* Left pane: Groups table */}
        <div className="flex-1 border bg-white overflow-hidden flex flex-col">
          <div className="overflow-y-auto flex-1">
            <table className="w-full border-collapse text-sm">
              <thead className="sticky top-0 bg-gray-50">
                <tr className="border-b">
                  <th className="p-2 text-left font-semibold text-xs">№</th>
                  <th className="p-2 text-left font-semibold text-xs">Название</th>
                  <th className="p-2 text-left font-semibold text-xs">
                    Кол-во критериев
                  </th>
                  <th className="p-2 text-left font-semibold text-xs">Активно</th>
                </tr>
              </thead>
              <tbody>
                {groups.map((group) => (
                  <tr key={group.id} className="border-b hover:bg-gray-50">
                    <td className="p-2">{group.id}</td>
                    <td className="p-2">{group.name}</td>
                    <td className="p-2">{group.criteriaCount}</td>
                    <td className="p-2">
                      <input type="checkbox" defaultChecked={group.active} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="border-t p-2 text-xs text-info bg-gray-50">
            {groups.length} результата
          </div>
        </div>

        {/* Right pane: Group editor */}
        <div className="flex-1 border bg-white p-4">
          <h3 className="font-semibold mb-4">Редактор группы</h3>
          <div className="space-y-3 text-sm">
            <div>
              <label className="block font-medium mb-1">Название:</label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={selectedGroup.name}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium mb-1">
                Кол-во критериев в чек-листе:
              </label>
              <input
                className="w-full border px-2 py-1 rounded"
                value={selectedGroup.criteriaCount}
                readOnly
              />
            </div>
            <div>
              <label className="block font-medium mb-2">Теги:</label>
              <div className="space-y-1 mb-3">
                {tags.map((tag) => (
                  <label key={tag.id} className="flex items-center gap-2">
                    <input type="checkbox" />
                    <span>{tag.name}</span>
                  </label>
                ))}
              </div>
            </div>
            <button className="w-full bg-primary text-white px-3 py-2 rounded text-sm font-medium hover:bg-primary-hover">
              Сохранить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
