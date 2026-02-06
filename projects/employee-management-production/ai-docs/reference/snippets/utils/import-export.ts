import Papa from "papaparse";
import { utils as xlsxUtils, writeFileXLSX } from "xlsx";

type EmployeeRow = {
  id: string;
  fullName: string;
  login: string;
  position: string;
  team: string;
  notes?: string;
};

const CSV_HEADERS: Record<string, string> = {
  fullName: "ФИО",
  login: "Логин",
  position: "Должность",
  team: "Команда",
  notes: "Комментарии",
};

export function formatEmployeesForCsv(rows: EmployeeRow[]): string {
  const data = rows.map(({ id: _ignore, ...columns }) => columns);
  return Papa.unparse({
    fields: Object.values(CSV_HEADERS),
    data: data.map((row) => Object.keys(CSV_HEADERS).map((key) => row[key as keyof typeof row] ?? "")),
  });
}

export function downloadEmployeeWorkbook(rows: EmployeeRow[], filename = "employees.xlsx") {
  const worksheet = xlsxUtils.json_to_sheet(rows, { header: Object.keys(CSV_HEADERS) });
  const workbook = xlsxUtils.book_new();
  xlsxUtils.book_append_sheet(workbook, worksheet, "Сотрудники");
  writeFileXLSX(workbook, filename, { compression: true });
}
