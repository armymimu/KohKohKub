/**
 * ความจำร่วมของผู้ใช้ (crowd memory)
 *
 * แนวคิด: ทุกครั้งที่มีคนถามบอทเรื่องเลขบัญชีหนึ่ง เราจดไว้ว่า "เคยเห็นเลขนี้"
 * ไม่ต้องรอเจ้าของที่พักมาลงทะเบียน ฐานข้อมูลโตเองจากคนใช้งาน
 *
 * ทำไมถึงบอกอะไรได้:
 *   - บัญชีของที่พักจริง คนถามเรื่อย ๆ กระจายตัวเป็นเดือนเป็นปี
 *   - บัญชีม้าของมิจฉาชีพ เพิ่งเปิด ไม่มีใครเคยเห็น หรือโผล่ถี่มากในไม่กี่วันแล้วหายไป
 *
 * ⚠️ ความเป็นส่วนตัว: เราไม่เก็บเลขบัญชีจริง
 * เก็บเฉพาะค่าแฮชแบบทางเดียว (HMAC-SHA256 + salt ลับ)
 * เอาไว้เทียบว่า "เลขนี้เคยเจอไหม" ได้ แต่ถอดกลับเป็นเลขบัญชีไม่ได้
 * ต่อให้ไฟล์ฐานข้อมูลหลุด ก็ไม่มีเลขบัญชีของใครรั่วออกไป
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DATA_DIR = path.join(__dirname, '..', 'data');
const FILE = path.join(DATA_DIR, 'sightings.json');
const SALT_FILE = path.join(DATA_DIR, 'salt.txt');

let cache = null;
let salt = null;
let writeQueue = Promise.resolve();

function ensureDir() {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
}

/**
 * salt ต้องคงที่ตลอดไป ถ้าเปลี่ยนเมื่อไหร่ ประวัติเดิมเทียบไม่ได้อีกเลย
 * ห้ามลบไฟล์ data/salt.txt และห้าม commit ขึ้น git
 */
function getSalt() {
  if (salt) return salt;
  ensureDir();
  if (fs.existsSync(SALT_FILE)) {
    salt = fs.readFileSync(SALT_FILE, 'utf8').trim();
  } else {
    salt = crypto.randomBytes(32).toString('hex');
    fs.writeFileSync(SALT_FILE, salt, 'utf8');
    console.log('[sightings] สร้าง salt ใหม่ที่ data/salt.txt (ห้ามลบ ห้ามขึ้น git)');
  }
  return salt;
}

function hashAccount(digits) {
  return crypto.createHmac('sha256', getSalt()).update(String(digits)).digest('hex').slice(0, 32);
}

function load() {
  if (cache) return cache;
  ensureDir();
  cache = fs.existsSync(FILE) ? JSON.parse(fs.readFileSync(FILE, 'utf8')) : { records: {} };
  if (!cache.records) cache.records = {};
  return cache;
}

function persist() {
  const snapshot = JSON.stringify(load());
  writeQueue = writeQueue.then(async () => {
    const tmp = `${FILE}.tmp`;
    await fs.promises.writeFile(tmp, snapshot, 'utf8');
    await fs.promises.rename(tmp, FILE);
  });
  return writeQueue;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * บันทึกว่ามีคนถามถึงเลขบัญชีนี้ แล้วคืนสถิติของมัน
 * @returns {{ count:number, firstSeen:string, lastSeen:string, spanDays:number, isFirstEver:boolean, burst:boolean }}
 */
function record(accountDigits) {
  const db = load();
  const key = hashAccount(accountDigits);
  const now = new Date().toISOString();

  const existing = db.records[key];
  const isFirstEver = !existing;

  const entry = existing || { first: now, last: now, count: 0 };
  entry.count += 1;
  entry.last = now;
  db.records[key] = entry;
  persist();

  const spanDays = (new Date(entry.last) - new Date(entry.first)) / DAY_MS;

  return {
    count: entry.count,
    firstSeen: entry.first,
    lastSeen: entry.last,
    spanDays,
    isFirstEver,
    // ถูกถามถี่มากในเวลาสั้น = อาจเป็นการหว่านหลอกหลายคนพร้อมกัน
    burst: entry.count >= 5 && spanDays < 14,
    // เห็นมานาน กระจายตัว = มีแนวโน้มเป็นบัญชีที่ใช้จริงมานาน
    longLived: spanDays >= 120 && entry.count >= 3,
  };
}

/** ดูสถิติโดยไม่บันทึกเพิ่ม */
function peek(accountDigits) {
  const entry = load().records[hashAccount(accountDigits)];
  if (!entry) return null;
  return { count: entry.count, firstSeen: entry.first, lastSeen: entry.last };
}

function stats() {
  const records = Object.values(load().records);
  return {
    accounts: records.length,
    queries: records.reduce((sum, r) => sum + r.count, 0),
  };
}

module.exports = { record, peek, stats, hashAccount };
