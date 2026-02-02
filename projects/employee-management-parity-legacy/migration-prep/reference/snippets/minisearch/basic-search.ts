import MiniSearch from "minisearch";

type Doc = { id: number; title: string; content: string };

const docs: Doc[] = [
  { id: 1, title: "Редактирование смен", content: "Массовое обновление смен и схем" },
  { id: 2, title: "Импорт сотрудников", content: "CSV, XLSX поддержка" },
  { id: 3, title: "Настройка тегов", content: "Присвоение тегов через модальное окно" },
];

const miniSearch = new MiniSearch<Doc>({
  fields: ["title", "content"],
  storeFields: ["title"],
  searchOptions: { boost: { title: 3 }, fuzzy: 0.2, prefix: true },
});

miniSearch.addAll(docs);

export function searchEmployeeDocs(query: string) {
  return miniSearch.search(query).map((result) => ({
    id: Number(result.id),
    title: result.title,
    score: result.score,
  }));
}

console.log(searchEmployeeDocs("тег"));
