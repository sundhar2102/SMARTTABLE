import { queryAll } from './backend/database/db.js';

async function checkTables() {
  try {
    const rows = await queryAll('SELECT * FROM `restaurants`');
    console.log(JSON.stringify(rows, null, 2));
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkTables();
