/**
 * รีเซ็ตฐานข้อมูลกลับไปเป็นข้อมูลตัวอย่าง 10 รายการ
 * ใช้คำสั่ง:  npm run seed
 *
 * ระวัง: ข้อมูลที่ลงทะเบียนเพิ่มเข้ามาทีหลังจะหายทั้งหมด
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(__dirname, '..', 'src', 'data', 'accommodations.seed.json');

const seed = JSON.parse(fs.readFileSync(SEED_FILE, 'utf8'));
const payload = { accommodations: seed.accommodations };

fs.mkdirSync(DATA_DIR, { recursive: true });

if (fs.existsSync(DB_FILE)) {
  const backup = `${DB_FILE}.backup-${Date.now()}`;
  fs.copyFileSync(DB_FILE, backup);
  console.log(`สำรองไฟล์เดิมไว้ที่ ${backup}`);
}

fs.writeFileSync(DB_FILE, JSON.stringify(payload, null, 2), 'utf8');
console.log(`เขียน ${DB_FILE} ใหม่แล้ว (${payload.accommodations.length} รายการ)`);
