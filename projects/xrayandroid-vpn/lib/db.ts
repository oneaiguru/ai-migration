import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { seedDatabase } from "./seed";
import { schemaSql } from "./schema";

let db: Database.Database | null = null;

export function getDb() {
  if (db) {
    return db;
  }

  const dataDir = path.join(process.cwd(), "data");
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const dbPath = path.join(dataDir, "freegate.db");
  const isNew = !fs.existsSync(dbPath);
  db = new Database(dbPath);
  db.pragma("foreign_keys = ON");

  // Always run schema to create any new tables (uses CREATE TABLE IF NOT EXISTS)
  db.exec(schemaSql);

  // Only seed on fresh database
  if (isNew) {
    seedDatabase(db);
  }

  return db;
}
