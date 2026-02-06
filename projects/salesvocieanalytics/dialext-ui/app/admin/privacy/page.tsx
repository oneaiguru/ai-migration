export const metadata = {
  title: 'Настройки доступа по email',
};

export default function PrivacyPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Настройки доступа по email</h1>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Type:</label>
          <div className="border p-2 rounded bg-white w-48">Private ▼</div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email list</label>
          <textarea
            className="w-full border p-3 rounded h-32 font-mono text-sm"
            placeholder="Список утверждённых адресов электронной почты, разделённых новой строкой"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Email domains list</label>
          <textarea
            className="w-full border p-3 rounded h-32 font-mono text-sm"
            placeholder="Список утверждённых доменов, разделённых новой строкой"
          />
        </div>
      </div>
    </div>
  );
}
