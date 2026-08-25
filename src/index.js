/**
 * เซิร์ฟเวอร์หลัก (Phase 3: Postgres + Identity Graph + Universal API & Widget)
 *
 *   POST /webhook          <- LINE Webhook
 *   POST /register         <- ลงทะเบียนที่พักใหม่
 *   POST /api/report       <- รับรายงานเคสโดนโกงจริง (เพิ่มน้ำหนักความเสี่ยงในกราฟ)
 *   GET  /api/check        <- ตรวจสอบข้อมูลสาธารณะ (เปิดให้เว็บอื่น/วิดเจ็ตเรียกใช้)
 *   GET  /api/stats        <- ข้อมูลสถิติ Real-time & Identity Graph
 *   GET  /stats            <- หน้าแสดงสถิติสาธารณะ
 */

require('dotenv').config();

const express = require('express');
const { middleware, messagingApi } = require('@line/bot-sdk');
const path = require('path');

const db = require('./db');
const { buildReply } = require('./bot');
const { digitsOnly, search } = require('./matcher');
const appConfig = require('./config');
const consent = require('./consent');
const sightings = require('./sightings');
const { initPostgres } = require('./postgres');
const graph = require('./graph');
const { extractAllEntities } = require('./extractor');

const PORT = process.env.PORT || 3000;
const CHANNEL_ACCESS_TOKEN = process.env.LINE_CHANNEL_ACCESS_TOKEN || '';
const CHANNEL_SECRET = process.env.LINE_CHANNEL_SECRET || '';
const ADMIN_API_KEY = process.env.ADMIN_API_KEY || '';

const app = express();
app.set('trust proxy', 1);

// CORS for public API & widget
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, x-api-key');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
});

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
});

// ---------------------------------------------------------------------------
// LINE webhook
// ---------------------------------------------------------------------------
const lineSignatureCheck = CHANNEL_SECRET
  ? middleware({ channelSecret: CHANNEL_SECRET })
  : (req, res) => res.status(503).send('ยังไม่ได้ตั้ง LINE_CHANNEL_SECRET ในไฟล์ .env');

app.post('/webhook', lineSignatureCheck, async (req, res) => {
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
    const flex = require('./flexMessages');
    return lineClient.replyMessage({
      replyToken: event.replyToken,
      messages: [flex.buildHelpFlex(), { type: 'text', text: helpText() }],
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

  const messages = await buildReply(event.message.text);
  console.log(`[chat] "${event.message.text}" -> ตอบ ${messages.length} ข้อความ`);
  return lineClient.replyMessage({ replyToken: event.replyToken, messages });
}

// ---------------------------------------------------------------------------
// Express JSON & Static Assets
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

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
// SEO & Static Pages
// ---------------------------------------------------------------------------
const PUBLIC_PAGES = [
  '/',
  '/check-account.html',
  '/hotel-scam.html',
  '/car-rental-scam.html',
  '/ticket-scam.html',
  '/investment-scam.html',
  '/loan-scam.html',
  '/shopping-scam.html',
  '/freeze-account.html',
  '/job-scam.html',
  '/scammed.html',
  '/koh-larn.html',
  '/stats.html',
  '/register.html',
];

app.get('/stats', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'stats.html'));
});

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

/** ข้อมูลสถิติแบบครบถ้วนสำหรับหน้าเว็บ & แดชบอร์ด */
app.get('/site-config', async (req, res) => {
  const id = appConfig.lineOaId;
  const s = sightings.stats();
  const g = await graph.getGraphStats();
  res.json({
    lineOaId: id || null,
    addFriendUrl: id ? `https://line.me/R/ti/p/${encodeURIComponent(id)}` : null,
    siteName: appConfig.siteName,
    categories: appConfig.categories,
    verifiedCount: db.verified().length,
    queryCount: s.queries,
    accountCount: s.accounts,
    graphEntities: g.totalEntities,
    graphEdges: g.totalEdges,
    totalReports: g.totalReports,
  });
});

// ---------------------------------------------------------------------------
// Public API & Widget API
// ---------------------------------------------------------------------------

/** GET /api/check?q=... — เปิดให้ Widget หรือเว็บอื่นเรียกตรวจสอบ */
app.get('/api/check', async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ ok: false, error: 'missing query parameter q' });

  const extraction = extractAllEntities(q);
  const { allEntities, accounts, phones } = extraction;

  if (allEntities.length > 0) {
    await graph.recordEntitiesAndEdges(allEntities);
  }

  const network = await graph.inspectNetwork(allEntities.map((e) => e.key));
  const result = search(db.all(), q);

  let targetStat = null;
  if (accounts.length) {
    targetStat = sightings.record(accounts[0].digits);
  }

  const isVerified = result.match && result.match.verified === true;
  const isRiskAlert = network.hasRiskPropagation || network.maxReports > 0;

  res.json({
    ok: true,
    query: q,
    verified: isVerified,
    match: isVerified ? result.match : null,
    riskAlert: isRiskAlert,
    riskReason: isRiskAlert ? `ตรวจพบความเชื่อมโยงกับมิจฉาชีพในเครือข่าย (${network.maxReports} รายงาน)` : null,
    stat: targetStat,
    connectedNetwork: network.networkSummary,
  });
});

/** POST /api/report — รับรายงานเคสโดนโกงจริงเพื่อเพิ่มน้ำหนักใน Identity Graph */
app.post('/api/report', async (req, res) => {
  const { target, category, details } = req.body || {};
  if (!target || !category) {
    return res.status(400).json({ ok: false, error: 'กรุณาระบุข้อมูลที่ต้องการรายงานและหมวดหมู่' });
  }

  const extraction = extractAllEntities(target);
  if (extraction.allEntities.length === 0) {
    return res.status(400).json({ ok: false, error: 'ไม่พบเลขบัญชีหรือเบอร์ติดต่อในข้อมูลที่ส่งมา' });
  }

  const keys = extraction.allEntities.map((e) => e.key);
  await graph.recordEntitiesAndEdges(extraction.allEntities);
  const ok = await graph.submitScamReport(keys, category, details, req.ip);

  res.json({
    ok,
    message: ok ? 'บันทึกรายงานเข้าสู่ระบบ Identity Graph เรียบร้อย ข้อมูลนี้จะช่วยเตือนคนอื่นๆ ทันที' : 'เกิดข้อผิดพลาด',
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

// ---------------------------------------------------------------------------
// Admin & Registration
// ---------------------------------------------------------------------------
function requireAdminKey(req, res, next) {
  if (!ADMIN_API_KEY) {
    return res.status(503).json({
      ok: false,
      error: 'ยังไม่ได้ตั้ง ADMIN_API_KEY ใน .env — ปิดการใช้งานส่วนผู้ดูแลไว้เพื่อความปลอดภัย',
    });
  }
  const given = req.get('x-api-key') || '';
  const a = Buffer.from(given);
  const b = Buffer.from(ADMIN_API_KEY);
  const ok = a.length === b.length && require('crypto').timingSafeEqual(a, b);
  if (ok) return next();
  return res.status(401).json({ ok: false, error: 'x-api-key ไม่ถูกต้อง' });
}

app.post('/register', async (req, res) => {
  const body = req.body || {};
  if (String(body.website || '').trim()) {
    return res.status(201).json({ ok: true, message: 'รับข้อมูลแล้ว', data: { id: 'KL-000' } });
  }

  const name = String(body.name || '').trim();
  const accountNumber = String(body.accountNumber || '').trim();
  const accountName = String(body.accountName || '').trim();
  const phone = String(body.phone || '').trim();
  const reporterName = String(body.reporterName || '').trim();
  const reporterRole = String(body.reporterRole || '').trim();

  if (name.length < 2) return res.status(400).json({ ok: false, error: 'ชื่อที่พักสั้นเกินไป' });
  if (digitsOnly(accountNumber).length < 8) return res.status(400).json({ ok: false, error: 'เลขบัญชีไม่ถูกต้อง' });

  const record = await db.insert({
    name,
    aliases: Array.isArray(body.aliases) ? body.aliases.map(String) : [],
    bankName: String(body.bankName || '').trim(),
    accountNumber,
    accountName,
    facebookPage: String(body.facebookPage || '').trim(),
    phone,
    gps: body.gps || null,
    area: String(body.area || body.beach || '').trim(),
    category: String(body.category || '').trim(),
    verified: false,
    reporterName,
    reporterRole,
    consentAt: new Date().toISOString(),
    consentVersion: appConfig.consentVersion,
    consentIp: req.ip || null,
  });

  res.status(201).json({ ok: true, message: 'ลงทะเบียนสำเร็จ', data: record });
});

app.get('/admin/pending', requireAdminKey, (req, res) => {
  const pending = db.all().filter((r) => r.verified !== true);
  res.json({ ok: true, count: pending.length, data: pending });
});

app.delete('/admin/:id', requireAdminKey, async (req, res) => {
  const removed = await db.remove(req.params.id);
  if (!removed) return res.status(404).json({ ok: false, error: 'ไม่พบ id นี้' });
  res.json({ ok: true });
});

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
// Server Startup & DB Sync
// ---------------------------------------------------------------------------
app.listen(PORT, async () => {
  console.log(`🏝️  kohlarn-verify-bot รันอยู่ที่ http://localhost:${PORT}`);
  await initPostgres();
  await db.syncFromPostgres();
  console.log(`    ที่พักในฐานข้อมูล: ${db.all().length} รายการ (ยืนยันแล้ว ${db.verified().length})`);
});
