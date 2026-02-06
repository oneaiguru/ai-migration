import * as Dialog from "@radix-ui/react-dialog";
import type { CSSProperties } from "react";

const triggerStyle: CSSProperties = {
  padding: "8px 16px",
  borderRadius: 8,
  border: "1px solid #1d4ed8",
  color: "#1d4ed8",
  background: "transparent",
  cursor: "pointer",
};

const overlayStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.3)",
};

const contentStyle: CSSProperties = {
  backgroundColor: "white",
  borderRadius: 12,
  padding: 24,
  width: "min(420px, 90vw)",
  boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
  position: "fixed",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
};

export function DialogDemo() {
  return (
    <Dialog.Root>
      <Dialog.Trigger style={triggerStyle}>Уволить сотрудника</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay style={overlayStyle} />
        <Dialog.Content style={contentStyle} aria-describedby="dismiss-description">
          <Dialog.Title style={{ fontSize: 20, fontWeight: 600, marginBottom: 12 }}>
            Подтверждение увольнения
          </Dialog.Title>
          <Dialog.Description id="dismiss-description" style={{ color: "#4b5563", marginBottom: 18 }}>
            Доступ к системе будет отключён немедленно. Вы сможете восстановить сотрудника в течение 7 дней через журнал операций.
          </Dialog.Description>
          <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
            <Dialog.Close asChild>
              <button
                type="button"
                style={{ padding: "8px 16px", borderRadius: 8, border: "1px solid #e5e7eb", cursor: "pointer" }}
              >
                Отмена
              </button>
            </Dialog.Close>
            <Dialog.Close asChild>
              <button
                type="button"
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: "none",
                  backgroundColor: "#dc2626",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                Уволить
              </button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
