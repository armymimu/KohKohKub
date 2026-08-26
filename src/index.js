/**
 * เซิร์ฟเวอร์หลัก (Phase 4: Privacy, Security & Anti-Poisoning Architecture)
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

const lineClient = new messagingApi.MessagingApiClient({
  channelAccessToken: CHANNEL_ACCESS_TOKEN,
});

// ---------------------------------------------------------------------------
// Rate Limiting (In-Memory IP Limiter)
// ---------------------------------------------------------------------------
const rateLimitHits = new Map();
function createRateLimiter(maxHits, windowMs, errorMessage) {
  return (req, res, next) => {
    const ip = req.ip || 'unknown';
    const now = Date.now();
    const key = `${req.baseUrl || req.path}:${ip}`;
    const hits = (rateLimitHits.get(key) || []).filter((t) => now - t < windowMs);

    if (hits.length >= maxHits) {
      return res.status(429).json({ ok: false, error: errorMessage });
    }

    hits.push(now);
    rateLimitHits.set(key, hits);
    next();
  };
}

const checkLimiter = createRateLimiter(60, 60 * 1000, 'คำขอมากเกินไป กรุณารอสักครู่');
const reportLimiter = createRateLimiter(5, 60 * 60 * 1000, 'คุณส่งรายงานบ่อยเกินไป กรุณารอ 1 ชั่วโมง');

// ---------------------------------------------------------------------------
// LINE webhook (แหล่งข้อมูลเดียวที่ได้รับอนุญาตให้บันทึกลง Identity Graph)
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

  // LINE Webhook มีลายเซ็นถูกต้อง = บันทึกความจำลง Identity Graph ได้
  const messages = await buildReply(event.message.text, { recordGraph: true });
  console.log(`[chat] "${event.message.text}" -> ตอบ ${messages.length} ข้อความ`);
  return lineClient.replyMessage({ replyToken: event.replyToken, messages });
}

// ---------------------------------------------------------------------------
// Express JSON & Static Assets
// ---------------------------------------------------------------------------
app.use(express.json({ limit: '100kb' }));
app.use(express.static(path.join(__dirname, '..', 'public')));

// ---------------------------------------------------------------------------
// CORS: จำกัดขอบเขตเฉพาะ /api/* และ /widget.js (ไม่เปิดครอบ /admin/*)
// ---------------------------------------------------------------------------
function publicApiCors(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
  res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(200);
  next();
}

app.get('/consent', (req, res) => {
  res.json({
    version: appConfig.consentVersion,
    short: consent.shortConsent,
    full: consent.fullConsentText(),
  });
});

app.get('/health', async (req, res) => {
  const g = await graph.getGraphStats();
  const s = sightings.stats();
  const isPg = require('./postgres').isPostgres();
  res.json({
    ok: true,
    storage: isPg ? 'postgres' : 'local-json-fallback',
    databaseConnected: isPg,
    saltSource: sightings.getSaltSource(),
    hasPermanentSalt: sightings.getSaltSource() === 'env',
    accommodations: db.all().length,
    graphEntities: g.totalEntities,
    graphEdges: g.totalEdges,
    totalDisputes: g.totalReports,
    totalQueries: s.queries,
    uptimeSeconds: Math.floor(process.uptime()),
    timestamp: new Date().toISOString(),
  });
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
// Public API & Widget API (CORS & Rate Limited)
// ---------------------------------------------------------------------------

/** 
 * GET /api/check?q=...
 * สำคัญ: เป็น READ-ONLY 100% ไม่มีการบันทึก Node หรือ Edge ลงกราฟจาก GET นี้ 
 */
app.get('/api/check', publicApiCors, checkLimiter, async (req, res) => {
  const q = String(req.query.q || '').trim();
  if (!q) return res.status(400).json({ ok: false, error: 'missing query parameter q' });

  const extraction = extractAllEntities(q);
  const { allEntities, accounts } = extraction;

  // อ่านอย่างเดียว ไม่ recordEntitiesAndEdges
  const network = await graph.inspectNetwork(allEntities.map((e) => e.key));
  const result = search(db.all(), q);

  const isVerified = result.match && result.match.verified === true;
  const hasVerifiedDisputes = network.verifiedReports > 0;

  res.json({
    ok: true,
    query: q,
    verified: isVerified,
    match: isVerified ? result.match : null,
    disputeAlert: hasVerifiedDisputes,
    disputeCount: network.verifiedReports,
    pendingDisputes: network.pendingReports,
    notice: hasVerifiedDisputes
      ? `มีผู้แจ้งข้อพิพาทในระบบ (${network.verifiedReports} รายการที่ตรวจสอบแล้ว)`
      : null,
    connectedNetwork: network.networkSummary,
  });
});

/** 
 * POST /api/report
 * รับเรื่องร้องเรียนเข้าคิวรอตรวจ (Pending Moderation Queue)
 */
app.post('/api/report', publicApiCors, reportLimiter, async (req, res) => {
  const body = req.body || {};

  // Honeypot check
  if (String(body.website || '').trim()) {
    return res.status(201).json({ ok: true, message: 'รับเรื่องแล้ว' });
  }

  const target = String(body.target || '').trim();
  const category = String(body.category || '').trim();
  const details = String(body.details || '').trim();
  const contact = String(body.contact || '').trim();

  if (!target || target.length < 5) {
    return res.status(400).json({ ok: false, error: 'กรุณาระบุเลขบัญชีหรือเบอร์โทรที่ต้องการแจ้ง' });
  }
  if (!category) {
    return res.status(400).json({ ok: false, error: 'กรุณาเลือกหมวดหมู่ข้อพิพาท' });
  }
  if (!details || details.length < 10) {
    return res.status(400).json({ ok: false, error: 'กรุณาระบุรายละเอียดเหตุการณ์อย่างน้อย 10 ตัวอักษร' });
  }
  if (!contact || contact.length < 5) {
    return res.status(400).json({ ok: false, error: 'กรุณาระบุเบอร์โทรหรืออีเมลของผู้แจ้งเพื่อการตรวจสอบ' });
  }

  const extraction = extractAllEntities(target);
  if (extraction.allEntities.length === 0) {
    return res.status(400).json({ ok: false, error: 'ไม่พบเลขบัญชีหรือเบอร์โทรในข้อมูลที่ส่งมา' });
  }

  const keys = extraction.allEntities.map((e) => e.key);
  const ok = await graph.submitPendingReport(keys, category, details, contact, req.ip);

  res.json({
    ok,
    message: ok
      ? 'ส่งเรื่องเรียบร้อย ข้อมูลจะถูกส่งเข้าคิวให้ผู้ดูแลตรวจสอบหลักฐานก่อนเผยแพร่'
      : 'เกิดข้อผิดพลาดในการบันทึก',
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
// Admin & Registration (Protected with ADMIN_API_KEY)
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

app.get('/admin/reports/pending', requireAdminKey, async (req, res) => {
  const reports = await graph.getPendingReports();
  res.json({ ok: true, count: reports.length, data: reports });
});

app.patch('/admin/reports/verify/:id', requireAdminKey, async (req, res) => {
  const ok = await graph.approveReport(req.params.id);
  if (!ok) return res.status(404).json({ ok: false, error: 'ไม่พบรายงานนี้' });
  res.json({ ok: true, message: 'อนุมัติรายงานข้อพิพาทเรียบร้อย ข้อมูลถูกนำเข้ากราฟความเสี่ยงแล้ว' });
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
  const isPg = require('./postgres').isPostgres();
  const saltSource = sightings.getSaltSource();

  console.log(`    ฐานข้อมูล: ${isPg ? '✅ PostgreSQL (ถาวร)' : '⚠️ Local JSON (ข้อมูลจะหายเมื่อรีสตาร์ท)'}`);
  console.log(`    Salt ความจำ: ${saltSource === 'env' ? '✅ SIGHTING_SALT จาก .env' : '⚠️ สุ่มใหม่ในเครื่อง (ควรตั้ง SIGHTING_SALT บน Railway)'}`);
  console.log(`    ที่พักในฐานข้อมูล: ${db.all().length} รายการ (ยืนยันแล้ว ${db.verified().length})`);
});
