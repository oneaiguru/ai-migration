const Database = require('better-sqlite3');
const path = require('path');
const os = require('os');

const dbPath = path.join(os.homedir(), 'Library/Group Containers/JLMPQHK86H.com.culturedcode.ThingsMac/ThingsData-DN6YE/Things Database.thingsdatabase/main.sqlite');

console.log('Opening database at:', dbPath);

const db = new Database(dbPath, { readonly: true });

// Test query
const stmt = db.prepare('SELECT COUNT(*) as count FROM TMTask WHERE status = 0');
const result = stmt.get();
console.log('Total active tasks:', result.count);

// Test today list
const todayStmt = db.prepare(`
  SELECT uuid, title, \`index\`
  FROM TMTask
  WHERE list = 'today' AND status = 0
  ORDER BY \`index\` ASC
  LIMIT 5
`);

const today = todayStmt.all();
console.log('\nSample Today tasks:');
today.forEach(t => console.log('  -', t.title));

// Test upcoming
const upcomingStmt = db.prepare(`
  SELECT COUNT(*) as count FROM TMTask
  WHERE list = 'upcoming' AND status = 0
`);
const upcomingCount = upcomingStmt.get();
console.log('\nUpcoming tasks count:', upcomingCount.count);

// Test anytime
const anytimeStmt = db.prepare(`
  SELECT COUNT(*) as count FROM TMTask
  WHERE list = 'anytime' AND status = 0
`);
const anytimeCount = anytimeStmt.get();
console.log('Anytime tasks count:', anytimeCount.count);

// Test someday
const somedayStmt = db.prepare(`
  SELECT COUNT(*) as count FROM TMTask
  WHERE list = 'someday' AND status = 0
`);
const somedayCount = somedayStmt.get();
console.log('Someday tasks count:', somedayCount.count);

db.close();
console.log('\n✅ Database connection successful!');
