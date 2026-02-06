export const metadata = {
  title: 'Расшифровка звонка',
};

export default function BitrixTranscriptPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Расшифровка звонка из Bitrix24</h1>

      <div className="border p-6 rounded bg-white">
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Телефон:</label>
            <div className="border p-2 rounded bg-white">+7 (999) 123-45-67</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Менеджер:</label>
            <div className="border p-2 rounded bg-white">Иван Петров</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Время звонка:</label>
            <div className="border p-2 rounded bg-white">2025-01-27 12:32</div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Длительность:</label>
            <div className="border p-2 rounded bg-white">3 минуты 13 секунд</div>
          </div>
        </div>
      </div>

      <div className="border p-6 rounded">
        <h3 className="text-section-header mb-4">Текст расшифровки</h3>
        <div className="space-y-3 text-sm">
          <p><span className="font-semibold">М:</span> Добрый день! Это компания Voice Analytics. С кем я имею честь говорить?</p>
          <p><span className="font-semibold">К:</span> Добрый день! Это Мария.</p>
          <p><span className="font-semibold">М:</span> Мария, очень рад познакомиться! Это Иван из отдела продаж.</p>
          <p className="text-gray-500">[Расшифровка продолжается...]</p>
        </div>
      </div>
    </div>
  );
}
