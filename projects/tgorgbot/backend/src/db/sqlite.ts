import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";

export type SqliteDatabase = InstanceType<typeof Database>;

const SCHEMA_FILENAME = "schema.sql";

function applySchema(db: SqliteDatabase): void {
  const schemaPath = path.join(__dirname, SCHEMA_FILENAME);
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  db.exec(schemaSql);
}

export function openSqliteDb(sqlitePath: string): SqliteDatabase {
  const db = new Database(sqlitePath);

  db.pragma("journal_mode = WAL");
  db.pragma("foreign_keys = ON");
  db.pragma("synchronous = NORMAL");
  db.pragma("busy_timeout = 5000");

  applySchema(db);
  return db;
}
