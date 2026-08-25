/**
 * เซิร์ฟเวอร์หลัก
 *
 *   POST /webhook          <- LINE ยิงเข้ามาเมื่อมีคนทักบอท
 *   POST /register         <- ลงทะเบียนที่พักใหม่ (ยังไม่ยืนยันจนกว่าแอดมินจะกด)
 *   PATCH /admin/verify/:id<- แอดมินกดยืนยันที่พัก
 *   GET  /accommodations   <- ดูรายการที่ยืนยันแล้ว (ข้อมูลสาธารณะ)
 *   GET  /health           <- เช็กว่าเซิร์ฟเวอร์ยังมีชีวิต (Railway/Render ใช้)
 */

require('dotenv').config();

const express = require('express');
const { middleware, messagingApi } = require('@line/bot-sdk');

const path = require('path');

const db = require('./db');
const { buildReply } = require('./bot');
const { digitsOnly } = require('./matcher');
const appConfig = require('./config');
const consent = require('./consent');
const sightings = require('./sightings');

const PORT = process.env.PORT || 3000;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

if (!CHANNEL_ACCESS_TOKEN || !CHANNEL_SECRET) {
  console.warn(
    '[warn] ยังไม่ได้ตั้ง LINE_CHANNEL_ACCESS_TOKEN / LINE_CHANNEL_SECRET ใน .env\n' +
      '       เซิร์ฟเวอร์จะรันได้ แต่ /webhook จะใช้งานไม่ได้'
  );
}

const app = express();
app.set('trust proxy', 1);

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
});

// ---------------------------------------------------------------------------
// LINE webhook
// หมายเหตุ: middleware ของ LINE ต้องอ่าน "raw body" เพื่อตรวจลายเซ็น
// จึงต้องวางไว้ก่อน express.json() และห้ามใช้ express.json() กับ route นี้
// ---------------------------------------------------------------------------
// ถ้ายังไม่ได้ตั้ง secret ให้ตอบ 503 พร้อมบอกสาเหตุ แทนที่จะทำให้เซิร์ฟเวอร์ crash
const lineSignatureCheck = CHANNEL_SECRET
  ? middleware({ channelSecret: CHANNEL_SECRET })
  : (req, res) => res.status(503).send('ยังไม่ได้ตั้ง LINE_CHANNEL_SECRET ในไฟล์ .env');

app.post('/webhook', lineSignatureCheck, async (req, res) => {
  // ตอบ 200 กลับ LINE ให้เร็วที่สุด แล้วค่อยไปประมวลผลต่อ
  // ถ้าตอบช้าเกิน LINE จะถือว่า timeout แล้วยิงซ้ำ
  res.status(200).end();

  const events = req.body.events || [];
  for (const event of events) {
    try {
      await handleEvent(event);
    } catch (err) {
      console.error('[webhook] จัดการ event ไม่สำเร็จ:', err);
    }
  }
});

async function handleEvent(event) {
  if (event.type === 'follow') {
    const { helpText } = require('./messages');
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: helpText() }],
    });
  }

  if (event.type !== 'message') return;

  if (event.message.type !== 'text') {
    const { nonTextText } = require('./messages');
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [{ type: 'text', text: nonTextText() }],
    });
  }

  const messages = buildReply(event.message.text);
  console.log(`[chat] "${event.message.text}" -> ตอบ ${messages.length} ข้อความ`);

  return lineClient.replyMessage({ replyToken: event.replyToken, messages });
}

// ---------------------------------------------------------------------------
// ส่วนที่เหลือใช้ JSON body ปกติ
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '100kb' }));

// หน้าเว็บ: /          = ฟอร์มลงทะเบียนสำหรับเจ้าของที่พัก
//           /admin.html = หน้าผู้ดูแลไว้กดยืนยัน (ต้องใส่ ADMIN_API_KEY)
app.use(express.static(path.join(__dirname, '..', 'public')));

/** ข้อความยินยอม PDPA — ฟอร์มเว็บดึงไปแสดง */
app.get('/consent', (req, res) => {
  res.json({
    version: appConfig.consentVersion,
    short: consent.shortConsent,
    full: consent.fullConsentText(),
  });
});

app.get('/health', (req, res) => {
  res.json({ ok: true, accommodations: db.all().length, uptime: process.uptime() });
});

// ---------------------------------------------------------------------------
// SEO: บอก Google ว่ามีหน้าอะไรบ้าง และหน้าไหนห้ามเก็บ
// BASE_URL ต้องตั้งใน .env หลัง deploy เช่น https://xxx.up.railway.app
// ---------------------------------------------------------------------------
const PUBLIC_PAGES = ['/', '/job-scam.html', '/scammed.html', '/koh-larn.html', '/register.html'];

app.get('/robots.txt', (req, res) => {
  const base = appConfig.baseUrl || `${req.protocol}://${req.get('host')}`;
  res.type('text/plain').send(
    ['User-agent: *', 'Allow: /', 'Disallow: /admin.html', 'Disallow: /admin/', '', `Sitemap: ${base}/sitemap.xml`].join('\n')
  );
});

app.get('/sitemap.xml', (req, res) => {
  const base = appConfig.baseUrl || `${req.protocol}://${req.get('host')}`;
  const today = new Date().toISOString().slice(0, 10);
  const urls = PUBLIC_PAGES.map(
    (p) => `  <url><loc>${base}${p}</loc><lastmod>${today}</lastmod></url>`
  ).join('\n');
  res.type('application/xml').send(
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>`
  );
});

/** ค่าที่หน้าเว็บต้องใช้ — ปุ่มเพิ่มเพื่อน LINE และตัวเลขไว้โชว์ */
app.get('/site-config', (req, res) => {
  const id = appConfig.lineOaId;
  const s = sightings.stats();
  res.json({
    lineOaId: id || null,
    // ลิงก์เพิ่มเพื่อนมาตรฐานของ LINE (ไอดีขึ้นต้นด้วย @)
    addFriendUrl: id ? `https://line.me/R/ti/p/${encodeURIComponent(id)}` : null,
    siteName: appConfig.siteName,
    categories: appConfig.categories,
    verifiedCount: db.verified().length,
    queryCount: s.queries,
    accountCount: s.accounts,
  });
});

app.get('/accommodations', (req, res) => {
  const list = db.verified().map((r) => ({
    id: r.id,
    name: r.name,
    bankName: r.bankName,
    accountNumber: r.accountNumber,
    accountName: r.accountName,
    facebookPage: r.facebookPage,
    phone: r.phone,
    gps: r.gps,
    area: r.area,
    category: r.category,
    verifiedAt: r.verifiedAt,
  }));
  res.json({ count: list.length, data: list });
});

/**
 * ตรวจกุญแจแอดมิน
 *
 * ถ้ายังไม่ได้ตั้ง ADMIN_API_KEY จะ "ปิด" ทุก endpoint ของแอดมินไปเลย
 * เพราะแอดมินมีสิทธิ์กดเผยแพร่ข้อมูลว่า "ยืนยันแล้ว" ต่อสาธารณะ
 * ปล่อยเปิดโล่งไว้ = ใครก็ตั้งเลขบัญชีตัวเองให้ขึ้นเครื่องหมายถูกได้
 */
function requireAdminKey(req, res, next) {
  if (!ADMIN_API_KEY) {
    return res.status(503).json({
      ok: false,
      error: 'ยังไม่ได้ตั้ง ADMIN_API_KEY ใน .env — ปิดการใช้งานส่วนผู้ดูแลไว้เพื่อความปลอดภัย',
    });
  }
  const given = req.get('x-api-key') || '';
  // เทียบแบบ timing-safe กันการเดารหัสด้วยการจับเวลา
  const a = Buffer.from(given);
  const b = Buffer.from(ADMIN_API_KEY);
  const ok = a.length === b.length && require('crypto').timingSafeEqual(a, b);
  if (ok) return next();
  return res.status(401).json({ ok: false, error: 'x-api-key ไม่ถูกต้อง' });
}

/**
 * จำกัดจำนวนการลงทะเบียนต่อ IP กัน spam
 * เก็บในหน่วยความจำ พอสำหรับตอนนี้ ถ้าโตกว่านี้ค่อยย้ายไป Redis
 */
const REGISTER_LIMIT = 5;
const REGISTER_WINDOW_MS = 60 * 60 * 1000; // 1 ชั่วโมง
const registerHits = new Map();

function rateLimitRegister(req, res, next) {
  const ip = req.ip || 'unknown';
  const now = Date.now();
  const hits = (registerHits.get(ip) || []).filter((t) => now - t < REGISTER_WINDOW_MS);

  if (hits.length >= REGISTER_LIMIT) {
    return res.status(429).json({
      ok: false,
      error: 'ลงทะเบียนบ่อยเกินไป กรุณารอสักครู่แล้วลองใหม่',
    });
  }

  hits.push(now);
  registerHits.set(ip, hits);
  next();
}

/**
 * POST /register — เปิดให้เจ้าของที่พักลงทะเบียนเองผ่านฟอร์มหน้าเว็บ
 *
 * เปิดสาธารณะโดยตั้งใจ (ไม่ต้องมี API key) เพราะเจ้าของที่พักต้องกรอกเองได้
 * ความปลอดภัยมาจาก 3 ชั้นแทน:
 *   1. ทุกรายการเข้ามาเป็น verified:false บอทจะยังไม่บอกว่า "ยืนยันแล้ว"
 *   2. ต้องผ่านแอดมินกดยืนยันก่อนถึงเผยแพร่
 *   3. จำกัดจำนวนต่อ IP + ช่องดักบอท (honeypot)
 */
app.post('/register', rateLimitRegister, async (req, res) => {
  const body = req.body || {};
  const errors = [];

  // ช่องดักบอท: มนุษย์มองไม่เห็นช่องนี้ ถ้ามีค่า = บอทกรอกมา
  // ตอบ 201 หลอกไปเฉย ๆ ไม่ต้องบอกว่าจับได้ แต่ไม่บันทึกอะไรลงฐานข้อมูล
  if (String(body.website || '').trim()) {
    console.log('[register] ทิ้งรายการที่น่าจะเป็นบอท (honeypot)');
    return res.status(201).json({ ok: true, message: 'รับข้อมูลแล้ว', data: { id: 'KL-000' } });
  }

  const name = String(body.name || '').trim();
  const accountNumber = String(body.accountNumber || '').trim();
  const accountName = String(body.accountName || '').trim();
  const phone = String(body.phone || '').trim();
  const reporterName = String(body.reporterName || '').trim();
  const reporterRole = String(body.reporterRole || '').trim();

  if (name.length < 2) errors.push('ชื่อที่พัก: ต้องมีอย่างน้อย 2 ตัวอักษร');
  if (digitsOnly(accountNumber).length < 8) errors.push('เลขบัญชี: ต้องมีอย่างน้อย 8 หลัก');
  if (accountName.length < 2) errors.push('ชื่อบัญชี: ต้องระบุชื่อเจ้าของบัญชี');
  if (digitsOnly(phone).length < 9) errors.push('เบอร์โทร: กรอกไม่ครบ');
  if (reporterName.length < 2) errors.push('ชื่อผู้กรอกข้อมูล: ต้องระบุ');
  if (!reporterRole) errors.push('ความเกี่ยวข้องกับที่พัก: ต้องระบุ');

  // ไม่มีความยินยอม = เก็บข้อมูลไม่ได้ตาม PDPA
  if (body.consent !== true) errors.push('ต้องติ๊กยอมรับหนังสือยินยอมก่อนส่งข้อมูล');

  const gps = body.gps || {};
  const lat = Number(gps.lat);
  const lng = Number(gps.lng);
  const hasGps = Number.isFinite(lat) && Number.isFinite(lng);
  if (gps.lat !== undefined && !hasGps) errors.push('gps: lat/lng ต้องเป็นตัวเลข');

  if (errors.length) return res.status(400).json({ ok: false, errors });

  // กันลงทะเบียนซ้ำด้วยเลขบัญชีเดียวกัน
  const dupe = db.all().find((r) => digitsOnly(r.accountNumber) === digitsOnly(accountNumber));
  if (dupe) {
    return res.status(409).json({
      ok: false,
      error: 'เลขบัญชีนี้มีอยู่ในระบบแล้ว',
      existing: { id: dupe.id, name: dupe.name, verified: dupe.verified },
    });
  }

  const record = await db.insert({
    name,
    aliases: Array.isArray(body.aliases) ? body.aliases.map(String) : [],
    bankName: String(body.bankName || '').trim(),
    accountNumber,
    accountName,
    facebookPage: String(body.facebookPage || '').trim(),
    phone,
    gps: hasGps ? { lat, lng } : null,
    area: String(body.area || body.beach || '').trim(),
    category: String(body.category || '').trim(),
    verified: false,

    // ผู้แจ้งข้อมูล — เก็บไว้ให้แอดมินติดต่อกลับ ไม่เผยแพร่ต่อสาธารณะ
    reporterName,
    reporterRole,

    // หลักฐานการให้ความยินยอมตาม PDPA
    // ต้องพิสูจน์ได้ว่าใครยินยอมกับข้อความเวอร์ชันไหน เมื่อไหร่
    consentAt: new Date().toISOString(),
    consentVersion: appConfig.consentVersion,
    consentIp: req.ip || null,
  });

  console.log(`[register] เพิ่ม ${record.id} ${record.name} (รอยืนยัน)`);
  res.status(201).json({
    ok: true,
    message: 'ลงทะเบียนสำเร็จ สถานะ "รอยืนยัน" ผู้ดูแลจะตรวจสอบก่อนเผยแพร่',
    data: record,
  });
});

/** GET /admin/pending — รายการที่รอผู้ดูแลตรวจสอบ */
app.get('/admin/pending', requireAdminKey, (req, res) => {
  const pending = db.all().filter((r) => r.verified !== true);
  res.json({ ok: true, count: pending.length, data: pending });
});

/** DELETE /admin/:id — ลบถาวร ใช้ตอนปฏิเสธ หรือเจ้าของขอถอนความยินยอม */
app.delete('/admin/:id', requireAdminKey, async (req, res) => {
  const removed = await db.remove(req.params.id);
  if (!removed) return res.status(404).json({ ok: false, error: 'ไม่พบ id นี้' });
  console.log(`[admin] ลบ ${req.params.id}`);
  res.json({ ok: true });
});

/** PATCH /admin/verify/:id  body: { verified: true, verifiedBy: "ชื่อผู้ตรวจ" } */
app.patch('/admin/verify/:id', requireAdminKey, async (req, res) => {
  const verified = req.body?.verified !== false;
  const updated = await db.update(req.params.id, {
    verified,
    verifiedAt: verified ? new Date().toISOString().slice(0, 10) : null,
    verifiedBy: verified ? String(req.body?.verifiedBy || 'ผู้ดูแลระบบ') : null,
  });
  if (!updated) return res.status(404).json({ ok: false, error: 'ไม่พบ id นี้' });
  res.json({ ok: true, data: updated });
});

// ---------------------------------------------------------------------------
// ตัวจัดการ error รวม
// ---------------------------------------------------------------------------
app.use((err, req, res, next) => {
  // ลายเซ็นจาก LINE ไม่ถูกต้อง = คนอื่นยิงเข้ามาเอง หรือ Channel secret ผิด
  if (err && /signature/i.test(err.message || '')) {
    console.warn('[webhook] ลายเซ็นไม่ถูกต้อง — ตรวจ LINE_CHANNEL_SECRET');
    return res.status(401).send('Invalid signature');
  }
  // JSON ที่ส่งมาผิดรูปแบบ = ความผิดของฝั่งที่เรียก ต้องตอบ 4xx ไม่ใช่ 500
  if (err && err.status >= 400 && err.status < 500) {
    console.warn('[error] คำขอผิดรูปแบบ:', err.type || err.message);
    return res.status(err.status).json({ ok: false, error: 'รูปแบบข้อมูลที่ส่งมาไม่ถูกต้อง' });
  }
  console.error('[error]', err);
  res.status(500).json({ ok: false, error: 'internal error' });
});

app.listen(PORT, () => {
  console.log(`🏝️  kohlarn-verify-bot รันอยู่ที่ http://localhost:${PORT}`);
  console.log(`    ที่พักในฐานข้อมูล: ${db.all().length} รายการ (ยืนยันแล้ว ${db.verified().length})`);
  console.log(`    webhook path: /webhook`);
  console.log(`    ฟอร์มลงทะเบียน: http://localhost:${PORT}/`);
  console.log(`    หน้าผู้ดูแล:     http://localhost:${PORT}/admin.html`);
  if (appConfig.orgName.startsWith('[')) {
    console.log('');
    console.log('    ⚠️  ยังไม่ได้ตั้ง ORG_NAME / ORG_CONTACT ใน .env');
    console.log('        หนังสือยินยอม PDPA จะไม่สมบูรณ์จนกว่าจะระบุผู้ควบคุมข้อมูล');
  }
});
