import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';

const dbPath = join(homedir(), 'Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-DN6YE/Things Database.thingsdatabase/main.sqlite');

const db = new Database(dbPath, { readonly: true });

// List all tables
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables:', tables.map(t => t.name).join(', '));

// Check TMTask columns
const schema = db.prepare("PRAGMA table_info(TMTask)").all();
console.log('\nTMTask columns:');
schema.forEach(col => {
  console.log(`  ${col.name} (${col.type})`);
});

// Sample data
console.log('\nSample TMTask row:');
const sample = db.prepare("SELECT * FROM TMTask LIMIT 1").get();
console.log(JSON.stringify(sample, null, 2));

db.close();
