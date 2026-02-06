import { getDatabase } from './src/database/things-db.js';

const db = getDatabase();
const status = db.status();
console.log('Database status:', status);

if (status.ready) {
  console.log('\nTodayTasks:', db.getTodayTasks().slice(0, 3));
  console.log('\nUpcomingTasks:', db.getUpcomingTasks().slice(0, 3));
  console.log('\nAnytimeTasks:', db.getAnytimeTasks().slice(0, 3));
  console.log('\nSomedayTasks:', db.getSomedayTasks().slice(0, 3));
}
