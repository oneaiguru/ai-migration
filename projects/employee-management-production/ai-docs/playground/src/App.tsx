import { useState } from "react";
import type { ReactElement } from "react";
import { DialogDemo } from "./examples/dialog-demo/DialogDemo";
import { TableDemo } from "./examples/table-demo/TableDemo";
import { FormDemo } from "./examples/form-demo/FormDemo";
import { DndDemo } from "./examples/dnd-demo/DndDemo";
import { ChartsDemo } from "./examples/charts-demo/ChartsDemo";
import { SearchDemo } from "./examples/search-demo/SearchDemo";
import { MobileDemo } from "./examples/mobile-demo/MobileDemo";
import "./App.css";

type Demo = {
  id: string;
  title: string;
  description: string;
  element: ReactElement;
};

const demos: Demo[] = [
  {
    id: "dialog",
    title: "Диалог (Radix)",
    description: "Пример модального окна с подтверждением увольнения.",
    element: <DialogDemo />,
  },
  {
    id: "table",
    title: "Таблица (TanStack Table + Virtual)",
    description: "Виртуализованный список из 5 000 сотрудников.",
    element: <TableDemo />,
  },
  {
    id: "form",
    title: "Форма (React Hook Form + Zod)",
    description: "Валидация логина, email и пароля.",
    element: <FormDemo />,
  },
  {
    id: "dnd",
    title: "Drag & Drop (dnd-kit)",
    description: "Перестановка команд клавиатурой и мышью.",
    element: <DndDemo />,
  },
  {
    id: "charts",
    title: "Графики (Tremor + Recharts)",
    description: "SLA и количество звонков по часам.",
    element: <ChartsDemo />,
  },
  {
    id: "search",
    title: "Поиск (MiniSearch)",
    description: "Мини-поисковик по документации.",
    element: <SearchDemo />,
  },
  {
    id: "mobile",
    title: "Мобильный фильтр (Vaul)",
    description: "Нижний лист с фильтрами смен.",
    element: <MobileDemo />,
  },
];

function App() {
  const [activeDemo, setActiveDemo] = useState<Demo>(demos[0]);

  return (
    <div className="app-shell">
      <aside className="sidebar" aria-label="Демонстрации библиотек">
        <h1>Playground библиотек</h1>
        <p className="sidebar-description">
          Набор изолированных примеров для подготовки к миграции UI-слоя.
        </p>
        <nav>
          <ul>
            {demos.map((demo) => (
              <li key={demo.id}>
                <button
                  type="button"
                  className={demo.id === activeDemo.id ? "nav-button active" : "nav-button"}
                  onClick={() => setActiveDemo(demo)}
                >
                  <span className="nav-title">{demo.title}</span>
                  <span className="nav-desc">{demo.description}</span>
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="demo-area">
        <header>
          <h2>{activeDemo.title}</h2>
          <p>{activeDemo.description}</p>
        </header>
        <section className="demo-content">{activeDemo.element}</section>
      </main>
    </div>
  );
}

export default App;
