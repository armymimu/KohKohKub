/**
 * ความจำร่วมของผู้ใช้ (Crowd Memory)
 * รองรับทั้ง PostgreSQL (ถาวรบน Railway) และ Local JSON
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

function record(accountDigits) {
  const db = loadLocal();
  const key = hashAccount(accountDigits);
  const now = new Date().toISOString();

  const existing = db.records[key];
  const isFirstEver = !existing;

  const entry = existing || { first: now, last: now, count: 0 };
  entry.count += 1;
  entry.last = now;
  db.records[key] = entry;

  // Local backup
  writeQueue = writeQueue.then(async () => {
    try {
      const tmp = `${FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(db), 'utf8');
      await fs.promises.rename(tmp, FILE);
    } catch (e) {}
  });

  // Async Postgres write
  if (isPostgres()) {
    pool.query(
      `INSERT INTO sightings (account_hash, first_seen, last_seen, count)
       VALUES ($1, $2, $2, 1)
       ON CONFLICT (account_hash) DO UPDATE
       SET count = sightings.count + 1, last_seen = $2`,
      [key, now]
    ).catch((e) => console.error('[sightings] Postgres error:', e));
  }

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

function stats() {
  const records = Object.values(loadLocal().records);
  return {
    accounts: records.length,
    queries: records.reduce((sum, r) => sum + r.count, 0),
  };
}

module.exports = { record, stats, hashAccount, getSalt };
