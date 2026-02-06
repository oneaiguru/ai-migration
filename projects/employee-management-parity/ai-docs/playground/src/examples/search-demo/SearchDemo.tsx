import { useMemo, useState } from "react";
import MiniSearch from "minisearch";

type Doc = {
  id: number;
  title: string;
  tags: string[];
};

const docs: Doc[] = [
  { id: 1, title: "Массовое редактирование", tags: ["bulk", "status"] },
  { id: 2, title: "Импорт сотрудников", tags: ["csv", "xlsx"] },
  { id: 3, title: "Управление тегами", tags: ["tags", "catalog"] },
  { id: 4, title: "Экспорт данных", tags: ["export", "reports"] },
];

export function SearchDemo() {
  const [query, setQuery] = useState("тег");

  const miniSearch = useMemo(
    () =>
      new MiniSearch<Doc>({
        fields: ["title", "tags"],
        storeFields: ["title"],
        searchOptions: { boost: { title: 3 }, fuzzy: 0.2, prefix: true },
      }),
    []
  );

  const results = useMemo(() => {
    miniSearch.removeAll();
    miniSearch.addAll(docs);
    return miniSearch.search(query).map((hit) => ({ id: Number(hit.id), title: hit.title }));
  }, [miniSearch, query]);

  return (
    <div style={{ maxWidth: 420 }}>
      <label style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <span>Поиск по документации</span>
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Введите ключевые слова"
          style={{ padding: "10px 12px", borderRadius: 8, border: "1px solid #d1d5db" }}
        />
      </label>
      <ul style={{ marginTop: 16, listStyle: "none", padding: 0, display: "grid", gap: 8 }}>
        {results.map((result) => (
          <li key={result.id} style={{ padding: 12, borderRadius: 8, backgroundColor: "#f8fafc" }}>
            {result.title}
          </li>
        ))}
        {results.length === 0 && <li>Ничего не найдено</li>}
      </ul>
    </div>
  );
}
