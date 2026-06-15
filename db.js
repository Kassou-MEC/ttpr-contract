// db.js — unified async data layer.
// Uses PostgreSQL when DATABASE_URL is set (Render); otherwise a local SQLite file.
const crypto = require("crypto");

const usePg = !!process.env.DATABASE_URL;
let runQuery;

if (usePg) {
  const { Pool } = require("pg");
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
  });
  runQuery = async (text, params = []) => {
    const res = await pool.query(text, params);
    return res.rows;
  };
} else {
  // Local/dev fallback: Node's built-in SQLite (no native build step).
  // Run with: npm run dev   (adds the --experimental-sqlite flag)
  const { DatabaseSync } = require("node:sqlite");
  const sqlite = new DatabaseSync(process.env.SQLITE_FILE || "contracts.db");
  // Translate Postgres-style $1 placeholders to SQLite "?"
  runQuery = async (text, params = []) => {
    const sql = text.replace(/\$\d+/g, "?");
    const stmt = sqlite.prepare(sql);
    if (/^\s*select/i.test(sql)) return stmt.all(...params);
    stmt.run(...params);
    return [];
  };
}

async function init() {
  // Portable schema (works on both Postgres and SQLite).
  await runQuery(`
    CREATE TABLE IF NOT EXISTS submissions (
      id            TEXT PRIMARY KEY,
      group_num     INTEGER NOT NULL,
      first_name    TEXT NOT NULL,
      last_name     TEXT NOT NULL,
      student_id    TEXT NOT NULL,
      email         TEXT,
      typed_name    TEXT NOT NULL,
      signature_data TEXT NOT NULL,
      signed_date   TEXT NOT NULL,
      ip            TEXT,
      user_agent    TEXT,
      created_at    TEXT NOT NULL
    )
  `);
}

async function insertSubmission(s) {
  const id = crypto.randomUUID();
  const createdAt = new Date().toISOString();
  await runQuery(
    `INSERT INTO submissions
       (id, group_num, first_name, last_name, student_id, email,
        typed_name, signature_data, signed_date, ip, user_agent, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
    [
      id,
      s.group_num,
      s.first_name,
      s.last_name,
      s.student_id,
      s.email || null,
      s.typed_name,
      s.signature_data,
      s.signed_date,
      s.ip || null,
      s.user_agent || null,
      createdAt,
    ]
  );
  return { id, created_at: createdAt };
}

async function listSubmissions(groupNum) {
  if (groupNum) {
    return runQuery(
      `SELECT * FROM submissions WHERE group_num = $1 ORDER BY created_at DESC`,
      [groupNum]
    );
  }
  return runQuery(`SELECT * FROM submissions ORDER BY created_at DESC`);
}

async function getSubmission(id) {
  const rows = await runQuery(`SELECT * FROM submissions WHERE id = $1`, [id]);
  return rows[0] || null;
}

async function deleteSubmission(id) {
  await runQuery(`DELETE FROM submissions WHERE id = $1`, [id]);
}

module.exports = {
  init,
  insertSubmission,
  listSubmissions,
  getSubmission,
  deleteSubmission,
  usePg,
};
