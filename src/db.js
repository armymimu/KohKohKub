/**
 * ฐานข้อมูล: รองรับทั้ง PostgreSQL (เมื่อ deploy บน Railway) และ Local JSON Fallback
 */

const fs = require('fs');
const path = require('path');
const { pool, isPostgres } = require('./postgres');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(__dirname, 'data', 'accommodations.seed.json');

let cache = null;
let writeQueue = Promise.resolve();

function readSeed() {
  const raw = fs.readFileSync(SEED_FILE, 'utf8');
  const seed = JSON.parse(raw);
  return { accommodations: seed.accommodations || [] };
}

function loadLocal() {
  if (cache) return cache;
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });

  if (fs.existsSync(DB_FILE)) {
    try {
      cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    } catch (e) {
      cache = readSeed();
    }
  } else {
    cache = readSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf8');
  }
  if (!Array.isArray(cache.accommodations)) cache.accommodations = [];
  return cache;
}

async function syncFromPostgres() {
  if (!isPostgres()) return loadLocal();
  try {
    const res = await pool.query('SELECT * FROM accommodations ORDER BY id ASC');
    const list = res.rows.map((r) => ({
      id: r.id,
      name: r.name,
      aliases: Array.isArray(r.aliases) ? r.aliases : (typeof r.aliases === 'string' ? JSON.parse(r.aliases) : []),
      bankName: r.bank_name || '',
      accountNumber: r.account_number || '',
      accountName: r.account_name || '',
      facebookPage: r.facebook_page || '',
      phone: r.phone || '',
      gps: r.gps,
      area: r.area || '',
      category: r.category || '',
      verified: r.verified === true,
      verifiedAt: r.verified_at,
      verifiedBy: r.verified_by,
      reporterName: r.reporter_name,
      reporterRole: r.reporter_role,
      consentAt: r.consent_at,
      consentVersion: r.consent_version,
      consentIp: r.consent_ip,
      createdAt: r.created_at,
    }));
    cache = { accommodations: list };
    return cache;
  } catch (err) {
    console.error('[db] Error syncing from Postgres:', err);
    return loadLocal();
  }
}

function load() {
  if (!cache) loadLocal();
  return cache;
}

function all() {
  return load().accommodations;
}

function verified() {
  return all().filter((item) => item.verified === true);
}

function findById(id) {
  return all().find((item) => item.id === id) || null;
}

function nextId() {
  const numbers = all()
    .map((item) => Number(String(item.id).replace(/\D/g, '')))
    .filter((n) => Number.isFinite(n));
  const max = numbers.length ? Math.max(...numbers) : 0;
  return `KL-${String(max + 1).padStart(3, '0')}`;
}

async function insert(record) {
  const item = {
    id: nextId(),
    verified: false,
    createdAt: new Date().toISOString(),
    ...record,
  };

  load().accommodations.push(item);

  if (isPostgres()) {
    try {
      await pool.query(
        `INSERT INTO accommodations 
          (id, name, aliases, bank_name, account_number, account_name, facebook_page, phone, gps, area, category, verified, verified_at, verified_by, reporter_name, reporter_role, consent_at, consent_version, consent_ip, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20)`,
        [
          item.id,
          item.name,
          JSON.stringify(item.aliases || []),
          item.bankName || '',
          item.accountNumber || '',
          item.accountName || '',
          item.facebookPage || '',
          item.phone || '',
          item.gps ? JSON.stringify(item.gps) : null,
          item.area || '',
          item.category || '',
          item.verified === true,
          item.verifiedAt || null,
          item.verifiedBy || null,
          item.reporterName || null,
          item.reporterRole || null,
          item.consentAt || null,
          item.consentVersion || null,
          item.consentIp || null,
          item.createdAt,
        ]
      );
    } catch (e) {
      console.error('[db] Postgres insert error:', e);
    }
  }

  // Local snapshot backup
  writeQueue = writeQueue.then(async () => {
    try {
      const tmp = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(load(), null, 2), 'utf8');
      await fs.promises.rename(tmp, DB_FILE);
    } catch (e) {}
  });

  return item;
}

async function update(id, patch) {
  const item = findById(id);
  if (!item) return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });

  if (isPostgres()) {
    try {
      await pool.query(
        `UPDATE accommodations SET 
          verified = $1, verified_at = $2, verified_by = $3, updated_at = NOW()
         WHERE id = $4`,
        [item.verified === true, item.verifiedAt || null, item.verifiedBy || null, id]
      );
    } catch (e) {
      console.error('[db] Postgres update error:', e);
    }
  }

  writeQueue = writeQueue.then(async () => {
    try {
      const tmp = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(load(), null, 2), 'utf8');
      await fs.promises.rename(tmp, DB_FILE);
    } catch (e) {}
  });

  return item;
}

async function remove(id) {
  const index = load().accommodations.findIndex((item) => item.id === id);
  if (index === -1) return false;
  load().accommodations.splice(index, 1);

  if (isPostgres()) {
    try {
      await pool.query('DELETE FROM accommodations WHERE id = $1', [id]);
    } catch (e) {
      console.error('[db] Postgres delete error:', e);
    }
  }

  writeQueue = writeQueue.then(async () => {
    try {
      const tmp = `${DB_FILE}.tmp`;
      await fs.promises.writeFile(tmp, JSON.stringify(load(), null, 2), 'utf8');
      await fs.promises.rename(tmp, DB_FILE);
    } catch (e) {}
  });

  return true;
}

module.exports = {
  all,
  verified,
  findById,
  insert,
  update,
  remove,
  syncFromPostgres,
  DB_FILE,
};
