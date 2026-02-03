export const metadata = {
  title: 'Настройки фильтров по менеджерам',
};

export default function ManagersFilterPage() {
  const managers = [
    { name: 'Менеджер 1', checked: true },
    { name: 'Менеджер 2', checked: true },
    { name: 'Менеджер 3', checked: true },
    { name: 'Менеджер 4', checked: false },
    { name: 'Менеджер 5', checked: false },
    { name: 'Менеджер 6', checked: true },
    { name: 'Менеджер 7', checked: true },
    { name: 'Менеджер 8', checked: false },
    { name: 'Менеджер 9', checked: false },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки фильтров по менеджерам</h1>

      <div className="space-y-4">
        <p className="font-semibold">Объект фильтрации:</p>
        <label className="flex items-center gap-2">
          <input type="radio" name="filterType" defaultChecked />
          <span>Лиды/Сделки/Клиенты (фильтруются полученные данные)</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="filterType" />
          <span>Звонки (для Битрикс, вставляется в запрос)</span>
        </label>

        <p className="font-semibold mt-6">
          Обрабатывать звонки для следующих менеджеров:
        </p>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" />
          <span>Всех</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" />
          <span>Текст &quot;VOICE_ANALYTICS&quot; в поле UF_INTERESTS у менеджера в CRM</span>
        </label>
        <label className="flex items-center gap-2">
          <input type="radio" name="managerFilter" defaultChecked />
          <span>Выбранных</span>
        </label>

        <div className="ml-8 space-y-2 mt-3">
          {managers.map((mgr, idx) => (
            <label key={idx} className="flex items-center gap-2">
              <input type="checkbox" defaultChecked={mgr.checked} />
              <span>{mgr.name}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
