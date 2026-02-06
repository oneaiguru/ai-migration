export const metadata = {
  title: 'Настройки email уведомлений по этапам воронок CRM'
};

export default function EmailNotifyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">
        Настройки email уведомлений по этапам воронок CRM
      </h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">ВОРОНКА CRM:</label>
          <div className="border p-2 rounded bg-white">ПСМ3</div>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Водители 2</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Для тестирования Крео</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Техническая Salebot</label>
          <div className="border p-2 rounded bg-white">Закрыто и не реализовано</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Список адресов отправки:</label>
          <textarea
            className="w-full border p-3 rounded h-24 font-mono text-sm"
            placeholder="Список адресов, разделенных новой строкой"
          />
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2">
            <input type="checkbox" className="w-4 h-4" />
            <span className="text-sm">
              Отправка уведомления при изменении воронки звонка
            </span>
          </label>
          <p className="text-xs text-gray-500 ml-6">
            After call pipeline changed
          </p>
        </div>

        <button className="bg-primary text-white px-6 py-2 rounded font-button hover:bg-primary-hover mt-4">
          ПРИМЕНИТЬ
        </button>
      </div>
    </div>
  );
}
