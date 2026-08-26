/**
 * Tourist Protection Pages (EN, RU, ZH) + Printable Counter Flyer Cards
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// 1. English Guide: /en/index.html
const enHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Check Thai Bank Account & Scam Warning for Tourists — SafeOne Thailand</title>
<meta name="description" content="Verify Thai bank accounts, hotel deposits, bike rentals, and tour bookings before transferring money in Thailand. Official Tourist Police 1155 hotline.">
<meta name="keywords" content="Thailand scam check, check Thai bank account, Koh Larn fake hotel, Pattaya villa scam, Tourist Police 1155, Thailand fraud">
<link rel="canonical" href="/en/">
<style>
  :root { --brand:#0a7d5a; --line:#e2e8f0; --ink:#0f172a; --muted:#64748b; --danger:#dc2626; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:#f8fafc; line-height:1.6; }
  .wrap { max-width:680px; margin:0 auto; padding:0 18px; }
  header { background:linear-gradient(150deg,#0a7d5a,#0f172a); color:#fff; padding:44px 0 38px; text-align:center; }
  h1 { font-size:26px; margin:0 0 10px; }
  .lead { font-size:15px; opacity:.95; margin:0 0 22px; }
  .cta { display:inline-block; background:#06c755; color:#fff; text-decoration:none; font-size:16px; font-weight:bold; padding:13px 30px; border-radius:99px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; margin:20px 0; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
  .alert-red { background:#fef2f2; border-left:4px solid var(--danger); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:14px; }
  .hotline-box { background:#e0f2fe; border:1px solid #bae6fd; border-radius:12px; padding:18px; text-align:center; margin:22px 0; }
  .hotline-num { font-size:32px; font-weight:800; color:#0284c7; margin:6px 0; }
  footer { border-top:1px solid var(--line); margin-top:40px; padding:24px 0 40px; color:var(--muted); font-size:13px; text-align:center; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>🛡️ SafeOne Thailand</h1>
    <p class="lead">Verify Thai Bank Accounts & Avoid Travel Scams Before Paying</p>
    <a class="cta" href="https://line.me/R/ti/p/@206jnkap">➕ Free Instant Verification on LINE</a>
  </div>
</header>

<div class="wrap">
  <div class="card">
    <h2 style="margin-top:0;">Top Scams Targeting Foreign Tourists in Thailand</h2>
    <ul>
      <li><b>Fake Island Villas & Resort Pages (Koh Larn / Pattaya / Phuket):</b> Scammers clone luxury resort Facebook/Instagram pages with fake booking discounts and demand bank deposit.</li>
      <li><b>Motorbike & Jet Ski Rental Deposit Scams:</b> Demanding bank transfer deposit before delivery and disappearing.</li>
      <li><b>Telegram / P2P Currency Exchange Traps:</b> Fake Thai bank transfer slips or receiving tainted money from mule accounts.</li>
    </ul>
  </div>

  <div class="hotline-box">
    <div style="font-weight:bold;color:#0369a1;">🚨 Emergency Contact for Foreigners in Thailand</div>
    <div class="hotline-num">Tourist Police 1155</div>
    <p style="margin:0;font-size:13px;color:#334155;">24/7 English, Chinese, Russian, and Japanese speaking officers</p>
  </div>

  <div class="card">
    <h2 style="margin-top:0;">3 Rules Before Transferring Money in Thailand</h2>
    <ol>
      <li><b>Check the Account Holder Name:</b> It must match the registered company name or hotel official entity, never an unknown individual name.</li>
      <li><b>Request Live Video Call:</b> Ask to see the hotel room or rental bike via live video call before sending deposit.</li>
      <li><b>Verify via SafeOne:</b> Paste the Thai bank account number or chat screenshot into LINE <a href="https://line.me/R/ti/p/@206jnkap"><b>@206jnkap</b></a>.</li>
    </ol>
  </div>

  <div class="alert-red">
    <b>Already transferred and suspect a scam?</b><br>
    Call <b>1155</b> (Tourist Police) or <b>1441</b> (Anti-Online Scam Operation Center) immediately with your transaction slip to freeze the recipient bank account.
  </div>
</div>

<footer>
  <div class="wrap">
    <p><a href="/">ภาษาไทย</a> · <a href="/en/">English</a> · <a href="/ru/">Русский</a> · <a href="/zh/">中文</a></p>
    <p>© 2026 SafeOne Thailand — Community Financial Safety Platform</p>
  </div>
</footer>
</body>
</html>`;

// 2. Russian Guide: /ru/index.html
const ruHtml = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Проверка тайских банковских счетов и защита от мошенников — SafeOne Таиланд</title>
<meta name="description" content="Бесплатная проверка тайских банковских счетов перед переводом денег. Аренда вилл на Ко Лане и в Паттайе, P2P обмен валют. Туристическая полиция 1155.">
<meta name="keywords" content="Таиланд мошенники, проверка счета Таиланд, аренда Ко Лан, Паттайя развод, туристическая полиция 1155, P2P обмен бат">
<link rel="canonical" href="/ru/">
<style>
  :root { --brand:#0a7d5a; --line:#e2e8f0; --ink:#0f172a; --muted:#64748b; --danger:#dc2626; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:#f8fafc; line-height:1.6; }
  .wrap { max-width:680px; margin:0 auto; padding:0 18px; }
  header { background:linear-gradient(150deg,#0a7d5a,#0f172a); color:#fff; padding:44px 0 38px; text-align:center; }
  h1 { font-size:26px; margin:0 0 10px; }
  .lead { font-size:15px; opacity:.95; margin:0 0 22px; }
  .cta { display:inline-block; background:#06c755; color:#fff; text-decoration:none; font-size:16px; font-weight:bold; padding:13px 30px; border-radius:99px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; margin:20px 0; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
  .alert-red { background:#fef2f2; border-left:4px solid var(--danger); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:14px; }
  .hotline-box { background:#e0f2fe; border:1px solid #bae6fd; border-radius:12px; padding:18px; text-align:center; margin:22px 0; }
  .hotline-num { font-size:32px; font-weight:800; color:#0284c7; margin:6px 0; }
  footer { border-top:1px solid var(--line); margin-top:40px; padding:24px 0 40px; color:var(--muted); font-size:13px; text-align:center; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>🛡️ SafeOne Таиланд</h1>
    <p class="lead">Проверка тайских банковских счетов перед переводом денег и арендой</p>
    <a class="cta" href="https://line.me/R/ti/p/@206jnkap">➕ Проверить бесплатно в LINE (@206jnkap)</a>
  </div>
</header>

<div class="wrap">
  <div class="card">
    <h2 style="margin-top:0;">Основные схемы обмана туристов в Паттайе и на Ко Лане</h2>
    <ul>
      <li><b>Фейковые виллы и отели в Telegram/VK:</b> Мошенники создают каналы с красивыми фото отелей на Ко Лане, требуют предоплату на тайский счет и удаляют переписку.</li>
      <li><b>P2P обмен валюты (USDT / Рубли на Баты):</b> Фальшивые чеки тайских банков или перевод "грязных" денег с дроп-аккаунтов, из-за чего ваш тайский счет могут заблокировать.</li>
      <li><b>Аренда байков и гидроциклов:</b> Требование предоплаты на карту без договора и адреса офиса.</li>
    </ul>
  </div>

  <div class="hotline-box">
    <div style="font-weight:bold;color:#0369a1;">🚨 Экстренная помощь туристам в Таиланде</div>
    <div class="hotline-num">Туристическая полиция: 1155</div>
    <p style="margin:0;font-size:13px;color:#334155;">Круглосуточно (русскоязычные и англоязычные операторы)</p>
  </div>

  <div class="alert-red">
    <b>Если вы уже перевели деньги мошеннику:</b><br>
    Немедленно звоните по номеру <b>1155</b> (Туристическая полиция) или <b>1441</b> (Центр борьбы с киберпреступностью AOC) для срочной блокировки счета получателя.
  </div>
</div>

<footer>
  <div class="wrap">
    <p><a href="/">ภาษาไทย</a> · <a href="/en/">English</a> · <a href="/ru/">Русский</a> · <a href="/zh/">中文</a></p>
    <p>© 2026 SafeOne Thailand</p>
  </div>
</footer>
</body>
</html>`;

// 3. Chinese Guide: /zh/index.html
const zhHtml = `<!DOCTYPE html>
<html lang="zh">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>泰国银行账户查询与防骗指南 — SafeOne 泰国</title>
<meta name="description" content="转账前免费查询泰国银行账户和PromptPay风险，芭提雅、格兰岛酒店预订防骗，旅游警察 1155 报警热线。">
<meta name="keywords" content="泰国转账防骗, 查询泰国银行账户, 格兰岛假酒店, 芭提雅租房骗局, 泰国旅游警察 1155, 小红书泰国防坑">
<link rel="canonical" href="/zh/">
<style>
  :root { --brand:#0a7d5a; --line:#e2e8f0; --ink:#0f172a; --muted:#64748b; --danger:#dc2626; }
  * { box-sizing:border-box; }
  body { margin:0; font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,sans-serif; color:var(--ink); background:#f8fafc; line-height:1.6; }
  .wrap { max-width:680px; margin:0 auto; padding:0 18px; }
  header { background:linear-gradient(150deg,#0a7d5a,#0f172a); color:#fff; padding:44px 0 38px; text-align:center; }
  h1 { font-size:26px; margin:0 0 10px; }
  .lead { font-size:15px; opacity:.95; margin:0 0 22px; }
  .cta { display:inline-block; background:#06c755; color:#fff; text-decoration:none; font-size:16px; font-weight:bold; padding:13px 30px; border-radius:99px; }
  .card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:20px; margin:20px 0; box-shadow:0 2px 8px rgba(0,0,0,0.03); }
  .alert-red { background:#fef2f2; border-left:4px solid var(--danger); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:14px; }
  .hotline-box { background:#e0f2fe; border:1px solid #bae6fd; border-radius:12px; padding:18px; text-align:center; margin:22px 0; }
  .hotline-num { font-size:32px; font-weight:800; color:#0284c7; margin:6px 0; }
  footer { border-top:1px solid var(--line); margin-top:40px; padding:24px 0 40px; color:var(--muted); font-size:13px; text-align:center; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>🛡️ SafeOne 泰国安全查</h1>
    <p class="lead">转账前核验泰国银行账户与商家信息，远离旅游诈骗</p>
    <a class="cta" href="https://line.me/R/ti/p/@206jnkap">➕ 在 LINE 免费查询（ID: @206jnkap）</a>
  </div>
</header>

<div class="wrap">
  <div class="card">
    <h2 style="margin-top:0;">泰国常见旅游与转账骗局（芭提雅 / 格兰岛）</h2>
    <ul>
      <li><b>小红书/微信假冒酒店：</b> 盗用格兰岛高端海景酒店图片，以低价吸引转账定金到泰国个人账户，付款后拉黑。</li>
      <li><b>快艇与出海游虚假预订：</b> 私人中介收取订金，到达码头后查无此船。</li>
      <li><b>私人换汇风险（P2P换汇）：</b> 收到涉案黑钱导致自身泰国银行卡被警方冻结。</li>
    </ul>
  </div>

  <div class="hotline-box">
    <div style="font-weight:bold;color:#0369a1;">🚨 泰国官方旅游紧急求助热线</div>
    <div class="hotline-num">旅游警察专线：1155</div>
    <p style="margin:0;font-size:13px;color:#334155;">24小时服务（配备中文接警翻译服务）</p>
  </div>

  <div class="alert-red">
    <b>如已转账遭遇诈骗：</b><br>
    请立即拨打 <b>1155</b>（泰国旅游警察）或 <b>1441</b>（反网络诈骗中心 AOC），凭转账水单申请紧急拦截冻结收款账户。
  </div>
</div>

<footer>
  <div class="wrap">
    <p><a href="/">ภาษาไทย</a> · <a href="/en/">English</a> · <a href="/ru/">Русский</a> · <a href="/zh/">中文</a></p>
    <p>© 2026 SafeOne Thailand</p>
  </div>
</footer>
</body>
</html>`;

// Ensure directories exist
fs.mkdirSync(path.join(publicDir, 'en'), { recursive: true });
fs.mkdirSync(path.join(publicDir, 'ru'), { recursive: true });
fs.mkdirSync(path.join(publicDir, 'zh'), { recursive: true });

fs.writeFileSync(path.join(publicDir, 'en', 'index.html'), enHtml, 'utf8');
fs.writeFileSync(path.join(publicDir, 'ru', 'index.html'), ruHtml, 'utf8');
fs.writeFileSync(path.join(publicDir, 'zh', 'index.html'), zhHtml, 'utf8');

// 4. Printable Counter Card / Flyer (HTML / PDF Ready for Hostels, Piers & Rental Shops)
const flyerHtml = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<title>ป้ายตั้งหน้าร้าน / Flyer — Safeโอน (SafeOne)</title>
<style>
  body { margin:0; font-family:-apple-system,sans-serif; background:#e2e8f0; display:flex; justify-content:center; padding:20px; }
  .page { width:210mm; min-height:297mm; background:#fff; padding:18mm; box-shadow:0 8px 24px rgba(0,0,0,0.1); border-radius:8px; box-sizing:border-box; text-align:center; color:#0f172a; }
  .badge { display:inline-block; background:#fee2e2; color:#dc2626; padding:8px 24px; border-radius:99px; font-weight:bold; font-size:18px; margin-bottom:16px; }
  h1 { font-size:34px; margin:0 0 12px; line-height:1.3; color:#0a7d5a; }
  h2 { font-size:22px; color:#334155; margin:0 0 24px; font-weight:normal; }
  .qr-box { border:3px dashed #0a7d5a; border-radius:24px; padding:24px; display:inline-block; margin:20px 0; background:#f0fdf4; }
  .qr-img { width:200px; height:200px; }
  .steps { text-align:left; background:#f8fafc; border:1px solid #cbd5e1; border-radius:16px; padding:20px; margin:24px 0; font-size:17px; }
  .hotline { background:#dc2626; color:#fff; border-radius:14px; padding:14px; font-size:20px; font-weight:bold; margin-top:20px; }
  @media print {
    body { background:#fff; padding:0; }
    .page { box-shadow:none; border-radius:0; width:100%; height:100%; }
    .no-print { display:none; }
  }
</style>
</head>
<body>

<div class="page">
  <div class="no-print" style="margin-bottom:14px;">
    <button onclick="window.print()" style="background:#0a7d5a;color:#fff;border:none;padding:10px 24px;font-size:16px;font-weight:bold;border-radius:8px;cursor:pointer;">🖨️ กดพิมพ์ป้ายนี้ (Print to PDF / Paper)</button>
  </div>

  <div class="badge">⚠️ เตือนภัยนักท่องเที่ยว / Tourist Scam Warning</div>
  <h1>เช็คก่อนโอนเงิน — ตรวจเลขบัญชีมิจฉาชีพ</h1>
  <h2>Check Thai Bank Account Before Transferring Money</h2>

  <div class="qr-box">
    <!-- QR Code to LINE @206jnkap -->
    <img class="qr-img" src="https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=https%3A%2F%2Fline.me%2FR%2Fti%2Fp%2F%40206jnkap" alt="QR Code LINE @206jnkap">
    <div style="margin-top:10px;font-size:20px;font-weight:800;color:#0a7d5a;">สแกนเพื่อเช็คฟรีใน LINE: @206jnkap</div>
  </div>

  <div class="steps">
    <b>📌 3 วิธีง่ายๆ ก่อนจ่ายเงินค่าที่พัก / รถเช่า / ทัวร์เกาะล้าน:</b>
    <ol style="margin:8px 0 0;padding-left:24px;">
      <li>สแกน QR Code ด้านบน เพื่อเปิด LINE บอท Safeโอน</li>
      <li>พิมพ์หรือวางเลขบัญชีที่ร้านให้โอน</li>
      <li>รู้ผลทันทีใน 3 วินาที ว่าเคยมีคนถามถึงหรือมีประวัติข้อพิพาทหรือไม่</li>
    </ol>
  </div>

  <div class="hotline">
    🚨 สายด่วนกรณีโดนโกง / Emergency: AOC 1441 · Tourist Police 1155
  </div>

  <p style="margin-top:18px;font-size:14px;color:#64748b;">
    ระบบความปลอดภัยภาคประชาชน — Safeโอน (SafeOne) Thailand · https://kohkohkub-production.up.railway.app
  </p>
</div>

</body>
</html>`;

fs.writeFileSync(path.join(publicDir, 'flyer.html'), flyerHtml, 'utf8');

console.log('✅ Generated Multilingual Guides (/en/, /ru/, /zh/) and Printable Counter Flyer (/flyer.html)!');
