import { Drawer } from "vaul";
import { useState } from "react";

export function MobileDemo() {
  const [onlyOnsite, setOnlyOnsite] = useState(true);

  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        <button
          style={{ padding: "10px 16px", borderRadius: 999, border: "1px solid #2563eb", color: "#2563eb", background: "transparent" }}
        >
          Фильтры смен
        </button>
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay style={{ position: "fixed", inset: 0, backgroundColor: "rgba(30,41,59,0.4)" }} />
        <Drawer.Content
          style={{
            position: "fixed",
            insetInline: 0,
            bottom: 0,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            background: "white",
            padding: "24px 20px",
          }}
        >
          <div
            style={{ width: 40, height: 4, background: "#e2e8f0", borderRadius: 999, margin: "0 auto 20px" }}
            aria-hidden
          />
          <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 16 }}>Подбор смен</h2>
          <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
            <span>Только очные</span>
            <input type="checkbox" checked={onlyOnsite} onChange={(e) => setOnlyOnsite(e.target.checked)} />
          </label>
          <label style={{ display: "flex", justifyContent: "space-between", marginBottom: 20 }}>
            <span>Учитывать отпуск</span>
            <input type="checkbox" />
          </label>
          <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <span>Команда</span>
            <select style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}>
              <option>Все</option>
              <option>Поддержка</option>
              <option>Развитие</option>
            </select>
          </label>
          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 24 }}>
            <Drawer.Close asChild>
              <button style={{ padding: "10px 16px", borderRadius: 8, border: "1px solid #e2e8f0" }}>Отмена</button>
            </Drawer.Close>
            <Drawer.Close asChild>
              <button
                style={{ padding: "10px 16px", borderRadius: 8, border: "none", backgroundColor: "#2563eb", color: "white" }}
              >
                Применить
              </button>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
