/**
 * ความจำร่วมของผู้ใช้ (Crowd Memory)
 * PostgreSQL-First Architecture (ถาวรบน Railway พร้อม fallback สู่ Local JSON)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { pool, isPostgres } = require('./postgres');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'sightings.json');
const SALT_FILE = path.join(DATA_DIR, 'salt.txt');

let cache = null;
let salt = null;
let writeQueue = Promise.resolve();

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

function getSaltSource() {
  return process.env.SIGHTING_SALT ? 'env' : 'ephemeral-file';
}

function getSalt() {
  if (process.env.SIGHTING_SALT) return process.env.SIGHTING_SALT;
  if (salt) return salt;
  ensureDir();
  if (fs.existsSync(SALT_FILE)) {
    salt = fs.readFileSync(SALT_FILE, 'utf8').trim();
  } else {
    salt = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SALT_FILE, salt, 'utf8');
  }
  return salt;
}

function hashAccount(digits) {
  return crypto.createHmac('sha256', getSalt()).update(String(digits)).digest('hex').slice(0, 32);
}

function loadLocal() {
  if (cache) return cache;
  ensureDir();
  cache = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { records: {} };
  if (!cache.records) cache.records = {};
  return cache;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * บันทึกการพบเลขบัญชี — อ่านและเขียนจาก PostgreSQL เป็นหลัก
 */
async function record(accountDigits) {
  const key = hashAccount(accountDigits);
  const now = new Date().toISOString();

  // 1. ถ้าเชื่อมต่อ PostgreSQL ให้ใช้ Postgres เป็น Single Source of Truth
  if (isPostgres()) {
    try {
      const res = await pool.query(
        `INSERT INTO sightings (account_hash, first_seen, last_seen, count)
         VALUES ($1, $2, $2, 1)
         ON CONFLICT (account_hash) DO UPDATE
         SET count = sightings.count + 1, last_seen = $2
         RETURNING account_hash, first_seen, last_seen, count`,
        [key, now]
      );

      const row = res.rows[0];
      const count = Number(row.count);
      const firstSeen = new Date(row.first_seen).toISOString();
      const lastSeen = new Date(row.last_seen).toISOString();
      const spanDays = (new Date(lastSeen) - new Date(firstSeen)) / DAY_MS;

      return {
        count,
        firstSeen,
        lastSeen,
        spanDays,
        isFirstEver: count === 1,
        burst: count >= 5 && spanDays < 14,
        longLived: spanDays >= 120 && count >= 3,
      };
    } catch (err) {
      console.error('[sightings] Postgres record error, falling back to local:', err);
    }
  }

  // 2. Fallback สู่ Local JSON
  const db = loadLocal();
  const existing = db.records[key];
  const isFirstEver = !existing;

  const entry = existing || { first: now, last: now, count: 0 };
  entry.count += 1;
  entry.last = now;
  db.records[key] = entry;

  writeQueue = writeQueue.then(async () => {
    try {
      const tmp = `${FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(db), 'utf8');
      await fs.promises.rename(tmp, FILE);
    } catch (e) {}
  });

  const spanDays = (new Date(entry.last) - new Date(entry.first)) / DAY_MS;

  return {
    count: entry.count,
    firstSeen: entry.first,
    lastSeen: entry.last,
    spanDays,
    isFirstEver,
    burst: entry.count >= 5 && spanDays < 14,
    longLived: spanDays >= 120 && entry.count >= 3,
  };
}

/**
 * ดึงสถิติจำนวนบัญชีและจำนวนครั้งที่ตรวจทั้งหมด — จาก Postgres
 */
async function stats() {
  if (isPostgres()) {
    try {
      const res = await pool.query(
        `SELECT COUNT(*)::int AS accounts, COALESCE(SUM(count), 0)::int AS queries FROM sightings`
      );
      return {
        accounts: Number(res.rows[0]?.accounts || 0),
        queries: Number(res.rows[0]?.queries || 0),
      };
    } catch (err) {
      console.error('[sightings] Postgres stats error:', err);
    }
  }

  const records = Object.values(loadLocal().records);
  return {
    accounts: records.length,
    queries: records.reduce((sum, r) => sum + r.count, 0),
  };
}

module.exports = { record, stats, hashAccount, getSalt, getSaltSource };
