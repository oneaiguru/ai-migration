import { Drawer } from "vaul";

export function MobileFilters() {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button className="rounded-full border px-4 py-2">Фильтры</button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-black/40" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 rounded-t-3xl bg-white">
          <div className="mx-auto max-w-lg p-6 space-y-4">
            <Drawer.Handle className="mx-auto" />
            <Drawer.Title className="text-lg font-semibold">
              Подбор смен
            </Drawer.Title>
            <div className="space-y-3">
              <label className="flex items-center justify-between">
                <span>Только очные</span>
                <input type="checkbox" defaultChecked />
              </label>
              <label className="flex items-center justify-between">
                <span>Учитывать отпуск</span>
                <input type="checkbox" />
              </label>
              <label className="block text-sm font-medium">
                Команда
                <select className="mt-1 w-full rounded border p-2">
                  <option>Все</option>
                  <option>Поддержка</option>
                  <option>Развитие</option>
                </select>
              </label>
            </div>
            <div className="flex justify-end gap-2">
              <Drawer.Close asChild>
                <button className="rounded border px-4 py-2">Отмена</button>
              </Drawer.Close>
              <Drawer.Close asChild>
                <button className="rounded bg-blue-600 px-4 py-2 text-white">
                  Применить
                </button>
              </Drawer.Close>
            </div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
