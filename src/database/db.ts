import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';

const db = new sqlite3.Database('./database.sqlite');

export const initDb = () => {
  const schema = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  db.exec(schema, (err) => {
    if (err) console.error("Database Init Error:", err.message);
    else console.log("Database initialized successfully.");
  });
};

export default db;