/**
 * ฐานข้อมูลแบบง่าย: เก็บเป็นไฟล์ JSON ไฟล์เดียว (data/db.json)
 *
 * ครั้งแรกที่รัน ถ้ายังไม่มี data/db.json จะคัดลอกข้อมูลตัวอย่าง
 * จาก src/data/accommodations.seed.json มาให้อัตโนมัติ
 *
 * ถ้าวันหลังอยากย้ายไป SQLite / Postgres ให้แก้เฉพาะไฟล์นี้ไฟล์เดียว
 * ส่วนที่เหลือของโปรแกรมเรียกใช้ผ่านฟังก์ชันข้างล่างนี้เท่านั้น
 */

const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const DB_FILE = path.join(DATA_DIR, 'db.json');
const SEED_FILE = path.join(__dirname, 'data', 'accommodations.seed.json');

let cache = null;
// กันเขียนไฟล์ชนกันเวลามีหลาย request พร้อมกัน: ต่อคิวเขียนเป็นสายเดียว
let writeQueue = Promise.resolve();

function readSeed() {
  const raw = fs.readFileSync(SEED_FILE, 'utf8');
  const seed = JSON.parse(raw);
  return { accommodations: seed.accommodations || [] };
}

function load() {
  if (cache) return cache;

  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (fs.existsSync(DB_FILE)) {
    cache = JSON.parse(fs.readFileSync(DB_FILE, 'utf8'));
    if (!Array.isArray(cache.accommodations)) cache.accommodations = [];
  } else {
    cache = readSeed();
    fs.writeFileSync(DB_FILE, JSON.stringify(cache, null, 2), 'utf8');
    console.log(`[db] สร้าง ${DB_FILE} จากข้อมูลตัวอย่าง (${cache.accommodations.length} รายการ)`);
  }

  return cache;
}

function persist() {
  const snapshot = JSON.stringify(load(), null, 2);
  writeQueue = writeQueue.then(async () => {
    const tmp = `${DB_FILE}.tmp`;
    await fs.promises.writeFile(tmp, snapshot, 'utf8');
    await fs.promises.rename(tmp, DB_FILE); // เขียนทับแบบ atomic กันไฟล์พัง
  });
  return writeQueue;
}

/** คืนรายการที่พักทั้งหมด */
function all() {
  return load().accommodations;
}

/** คืนเฉพาะรายการที่ยืนยันแล้ว */
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

/**
 * เพิ่มที่พักใหม่
 * สำคัญ: ของใหม่จะเป็น verified:false เสมอ ต้องมีคนตรวจสอบก่อนถึงจะยืนยัน
 * (ถ้าเปิดให้ลงทะเบียนแล้วยืนยันเองอัตโนมัติ มิจฉาชีพจะมาลงทะเบียนเองได้)
 */
async function insert(record) {
  const db = load();
  const item = {
    id: nextId(),
    verified: false,
    createdAt: new Date().toISOString(),
    ...record,
  };
  db.accommodations.push(item);
  await persist();
  return item;
}

/** ใช้ตอนแอดมินกดยืนยัน/แก้ไขข้อมูล */
async function update(id, patch) {
  const item = findById(id);
  if (!item) return null;
  Object.assign(item, patch, { updatedAt: new Date().toISOString() });
  await persist();
  return item;
}

/** ลบรายการถาวร ใช้ตอนแอดมินปฏิเสธ หรือเจ้าของขอถอนความยินยอม */
async function remove(id) {
  const db = load();
  const index = db.accommodations.findIndex((item) => item.id === id);
  if (index === -1) return false;
  db.accommodations.splice(index, 1);
  await persist();
  return true;
}

module.exports = { all, verified, findById, insert, update, remove, DB_FILE };
