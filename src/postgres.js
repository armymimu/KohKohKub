/**
 * PostgreSQL Database Adapter for Railway & Production
 * Auto-detects DATABASE_URL, initializes tables, and seeds initial data.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');

const DATABASE_URL = process.env.DATABASE_URL || '';
let pool = null;

if (DATABASE_URL) {
  pool = new Pool({
    connectionString: DATABASE_URL,
    ssl: DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
  });

  pool.on('error', (err) => {
    console.error('[pg] Unexpected error on idle client:', err);
  });
}

function isPostgres() {
  return !!pool;
}

async function initPostgres() {
  if (!pool) return false;

  console.log('[pg] กำลังเชื่อมต่อ PostgreSQL และตรวจสอบตาราง...');
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS accommodations (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        aliases JSONB DEFAULT '[]',
        bank_name VARCHAR(100),
        account_number VARCHAR(100),
        account_name VARCHAR(255),
        facebook_page VARCHAR(255),
        phone VARCHAR(100),
        gps JSONB,
        area VARCHAR(255),
        category VARCHAR(100),
        verified BOOLEAN DEFAULT false,
        verified_at VARCHAR(50),
        verified_by VARCHAR(255),
        reporter_name VARCHAR(255),
        reporter_role VARCHAR(100),
        consent_at VARCHAR(50),
        consent_version VARCHAR(50),
        consent_ip VARCHAR(100),
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS sightings (
        account_hash VARCHAR(64) PRIMARY KEY,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        count INTEGER NOT NULL DEFAULT 1
      );

      CREATE TABLE IF NOT EXISTS entities (
        entity_key VARCHAR(128) PRIMARY KEY,
        entity_type VARCHAR(50) NOT NULL,
        label VARCHAR(255),
        query_count INTEGER NOT NULL DEFAULT 1,
        verified_reports_count INTEGER NOT NULL DEFAULT 0,
        pending_reports_count INTEGER NOT NULL DEFAULT 0,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS entity_edges (
        source_key VARCHAR(128) NOT NULL,
        target_key VARCHAR(128) NOT NULL,
        occurrences INTEGER NOT NULL DEFAULT 1,
        first_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        last_seen TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (source_key, target_key)
      );

      CREATE TABLE IF NOT EXISTS scam_reports (
        id SERIAL PRIMARY KEY,
        entity_keys JSONB NOT NULL,
        category VARCHAR(100) NOT NULL,
        details TEXT,
        ip_hash VARCHAR(64),
        verified BOOLEAN DEFAULT false,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `);

    // Add columns if table already existed without them
    await client.query(`
      ALTER TABLE entities ADD COLUMN IF NOT EXISTS verified_reports_count INTEGER DEFAULT 0;
      ALTER TABLE entities ADD COLUMN IF NOT EXISTS pending_reports_count INTEGER DEFAULT 0;
      ALTER TABLE scam_reports ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
    `).catch(() => {});

    // Seed / Sync verified accommodations to Postgres
    const seedPath = path.join(__dirname, 'data', 'accommodations.seed.json');
    if (fs.existsSync(seedPath)) {
      const seedData = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
      const list = seedData.accommodations || [];
      for (const item of list) {
        await client.query(
          `INSERT INTO accommodations 
            (id, name, aliases, bank_name, account_number, account_name, facebook_page, phone, gps, area, category, verified, verified_at, verified_by, created_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, NOW())
           ON CONFLICT (id) DO UPDATE SET
            name = EXCLUDED.name,
            aliases = EXCLUDED.aliases,
            bank_name = EXCLUDED.bank_name,
            account_number = EXCLUDED.account_number,
            account_name = EXCLUDED.account_name,
            facebook_page = EXCLUDED.facebook_page,
            phone = EXCLUDED.phone,
            gps = EXCLUDED.gps,
            area = EXCLUDED.area,
            category = EXCLUDED.category,
            verified = EXCLUDED.verified,
            verified_at = EXCLUDED.verified_at,
            verified_by = EXCLUDED.verified_by`,
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
            item.verifiedBy || 'สมาคมผู้ประกอบการท่องเที่ยวเกาะล้าน',
          ]
        );
      }
      console.log(`[pg] อัปเดตรายชื่อธุรกิจยืนยัน ${list.length} รายการลง Postgres เรียบร้อย`);
    }

    console.log('[pg] PostgreSQL พร้อมใช้งาน 100%');
    return true;
  } catch (err) {
    console.error('[pg] เกิดข้อผิดพลาดในการสร้างตาราง:', err);
    return false;
  } finally {
    client.release();
  }
}

module.exports = {
  pool,
  isPostgres,
  initPostgres,
};
