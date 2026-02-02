import MiniSearch from "minisearch";

type EmployeeDoc = {
  id: string;
  fullName: string;
  login: string;
  position: string;
  team: string;
  tags: string;
};

const normalize = (value: string) => value.normalize("NFC").toLowerCase();

const SEARCH_OPTIONS = {
  boost: {
    fullName: 4,
    login: 3,
    team: 2,
    position: 2,
    tags: 1,
  },
  fuzzy: 0.2 as const,
  prefix: true,
};

export const buildEmployeeDocs = (employees: Array<{
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
  login: string;
  position: string;
  team: string;
  tags: string[];
}>): EmployeeDoc[] =>
  employees.map((employee) => ({
    id: employee.id,
    fullName: normalize(
      [employee.lastName, employee.firstName, employee.middleName ?? ""].filter(Boolean).join(" "),
    ),
    login: normalize(employee.login),
    position: normalize(employee.position),
    team: normalize(employee.team),
    tags: normalize(employee.tags.join(" ")),
  }));

export const createEmployeeIndex = (documents: EmployeeDoc[]) => {
  const index = new MiniSearch<EmployeeDoc>({
    fields: ["fullName", "login", "position", "team", "tags"],
    storeFields: ["id"],
    searchOptions: SEARCH_OPTIONS,
  });
  index.addAll(documents);
  return index;
};

export const searchEmployeeDocs = (
  index: MiniSearch<EmployeeDoc>,
  query: string,
): { ids: Set<string>; order: Map<string, number> } | null => {
  const trimmed = query.trim();
  if (!trimmed) {
    return null;
  }

  const results = index.search(trimmed, SEARCH_OPTIONS);
  const ids = new Set<string>();
  const order = new Map<string, number>();

  results.forEach((result, position) => {
    const id = String(result.id);
    ids.add(id);
    order.set(id, position);
  });

  return { ids, order };
};

const demoIndex = createEmployeeIndex(
  buildEmployeeDocs([
    {
      id: "emp_1",
      firstName: "Динара",
      lastName: "Абдуллаева",
      login: "d.abdullaeva",
      position: "Старший оператор",
      team: "Контроль качества",
      tags: ["качество", "голос"],
    },
    {
      id: "emp_2",
      firstName: "Самат",
      lastName: "Ибраимов",
      login: "s.ibraimov",
      position: "Аналитик",
      team: "Аналитика",
      tags: ["резерв"],
    },
  ]),
);

console.log(searchEmployeeDocs(demoIndex, "абдуллаев"));
