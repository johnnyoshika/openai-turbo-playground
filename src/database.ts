import sqlite3 from 'sqlite3';

const DBSOURCE = 'data.sqlite';

// Enable additional debugging information
sqlite3.verbose();

export const db = new sqlite3.Database(DBSOURCE, err => {
  if (err) {
    // Cannot open database
    console.error(err.message);
    throw err;
  } else {
    console.log('Connected to SQLite database.');
    // messages and usage will be JSON string
    db.run(
      `CREATE TABLE IF NOT EXISTS chats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        creationTime DATETIME DEFAULT CURRENT_TIMESTAMP,
        like BOOLEAN,
        temperature REAL,
        top_p REAL,
        messages TEXT,
        response TEXT,
        usage TEXT
      )`,
      err => {
        if (err) console.error('Error creating chats table', err);
      },
    );
  }
});
