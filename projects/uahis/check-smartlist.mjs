import Database from 'better-sqlite3';
import { homedir } from 'os';
import { join } from 'path';

const dbPath = join(homedir(), 'Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-DN6YE/Things Database.thingsdatabase/main.sqlite');

const db = new Database(dbPath, { readonly: true });

// Check TMSmartList
const schema = db.prepare("PRAGMA table_info(TMSmartList)").all();
console.log('TMSmartList columns:');
schema.forEach(col => {
  console.log(`  ${col.name} (${col.type})`);
});

// Sample data
const smartlists = db.prepare("SELECT uuid, title FROM TMSmartList").all();
console.log('\nSmartLists:');
smartlists.forEach(sl => {
  console.log(`  ${sl.title} (${sl.uuid})`);
});

db.close();
