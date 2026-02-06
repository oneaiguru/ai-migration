export const metadata = {
  title: 'Настройки получения объектов из CRM',
};

export default function CrmPullPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки получения объектов из CRM</h1>

      <div className="space-y-4">
        <p className="text-sm font-medium">
          Получение данных из CRM для кастомных полей следующих типов объектов:
        </p>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Сделка</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Лид</span>
          </label>
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span>Контакт</span>
          </label>
        </div>

        <p className="text-sm font-medium mt-6">
          Загрузка данных из выбранных полей в INTERNAL DATA
        </p>

        <div className="space-y-2">
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ ЛИДОВ
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ СДЕЛОК
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ КОНТАКТОВ
          </button>
          <button className="border px-4 py-2 rounded bg-white w-full text-left">
            ПОЛЯ КОМПАНИЙ
          </button>
        </div>

        <div className="flex gap-3 mt-4">
          <button className="border px-4 py-2 rounded bg-white">
            Обновить список полей
          </button>
          <button className="bg-primary text-white px-6 py-2 rounded">
            Сохранить
          </button>
        </div>
      </div>
    </div>
  );
}
