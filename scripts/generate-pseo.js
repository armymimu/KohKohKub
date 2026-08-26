/**
 * Programmatic SEO (pSEO) Matrix Generator
 * สร้างหน้า SEO 120+ หน้า (15 ธนาคาร x 7 รูปแบบโกง + 5 แพลตฟอร์ม)
 */

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

const BANKS = [
  { id: 'kbank', name: 'กสิกรไทย (KBank)', hotline: '02-888-8888 กด 01', app: 'K PLUS' },
  { id: 'scb', name: 'ไทยพาณิชย์ (SCB)', hotline: '02-777-7575', app: 'SCB EASY' },
  { id: 'bbl', name: 'กรุงเทพ (BBL)', hotline: '1333 หรือ 02-645-5555 กด *3', app: 'Bualuang mBanking' },
  { id: 'ktb', name: 'กรุงไทย (KTB)', hotline: '02-111-1111 กด 108', app: 'Krungthai NEXT' },
  { id: 'bay', name: 'กรุงศรีอยุธยา (BAY)', hotline: '1572 กด 5', app: 'KMA krungsri app' },
  { id: 'ttb', name: 'ทีทีบี (ttb)', hotline: '1428 กด 03', app: 'ttb touch' },
  { id: 'gsb', name: 'ออมสิน (GSB)', hotline: '1115 กด 6', app: 'MyMo' },
  { id: 'uob', name: 'ยูโอบี (UOB)', hotline: '02-344-9555', app: 'UOB TMRW' },
  { id: 'cimb', name: 'ซีไอเอ็มบี ไทย (CIMB)', hotline: '02-626-7777', app: 'CIMB THAI Digital Banking' },
  { id: 'kkp', name: 'เกียรตินาคินภัทร (KKP)', hotline: '02-165-5555', app: 'KKP Mobile' },
  { id: 'baac', name: 'ธ.ก.ส. (BAAC)', hotline: '02-555-0555', app: 'BAAC Mobile' },
  { id: 'ghb', name: 'อาคารสงเคราะห์ (ธอส.)', hotline: '02-645-9000', app: 'GHB ALL GEN' },
  { id: 'lhbank', name: 'แลนด์ แอนด์ เฮ้าส์ (LH Bank)', hotline: '1327', app: 'LHB You' },
  { id: 'promptpay', name: 'พร้อมเพย์ (PromptPay)', hotline: 'สายด่วน AOC 1441 (ทุกธนาคาร)', app: 'แอปธนาคารทุกแห่ง' },
  { id: 'truemoney', name: 'ทรูมันนี่ วอลเล็ท (TrueMoney)', hotline: '1240 กด 6 (ตลอด 24 ชม.)', app: 'TrueMoney Wallet' },
];

const SCAMS = [
  { id: 'hotel', name: 'จองที่พัก / รีสอร์ทปลอม', keyword: 'โกงที่พัก' },
  { id: 'car', name: 'เช่ารถ / มัดจำรถเช่า', keyword: 'โกงเช่ารถ' },
  { id: 'shopping', name: 'ซื้อของออนไลน์ / โอนแล้วบล็อก', keyword: 'โกงซื้อของ' },
  { id: 'ticket', name: 'ตั๋วคอนเสิร์ต / บัตรแฟนมีต', keyword: 'โกงบัตรคอน' },
  { id: 'job', name: 'งานเสริม / ภารกิจกดไลก์ได้เงิน', keyword: 'หลอกทำงาน' },
  { id: 'invest', name: 'หลอกลงทุน / เทรดหุ้น / แชร์ลูกโซ่', keyword: 'หลอกลงทุน' },
  { id: 'loan', name: 'เงินกู้ออนไลน์ / ค่าค้ำประกันก่อนกู้', keyword: 'โกงเงินกู้' },
];

const PLATFORMS = [
  { id: 'shopee', name: 'Shopee (ช้อปปี้)', tips: 'หลอกให้แอดไลน์ไปโอนเงินตรงนอกระบบ ไม่ผ่านระบบ Shopee Guarantee' },
  { id: 'lazada', name: 'Lazada (ลาซาด้า)', tips: 'ส่งลิงก์ปลอม หลอกให้จ่ายเงินค่าธรรมเนียมหรือโอนตรงเข้าบัญชีบุคคล' },
  { id: 'facebook-market', name: 'Facebook Marketplace', tips: 'โพสต์ขายสินค้าราคาถูกผิดปกติ โอนมัดจำแล้วบล็อกเฟซหนี' },
  { id: 'tiktok-shop', name: 'TikTok Shop', tips: 'ชวนกดลิงก์ไปสั่งซื้อในแชทไลน์ส่วนตัวเพื่อเลี่ยงระบบคุ้มครอง' },
  { id: 'instagram', name: 'Instagram (IG Shop)', tips: 'ก๊อปรูปรีวิวร้านดัง ซื้อยอดฟอลหลอกตา โอนเงินแล้วปิดบัญชีหนี' },
];

function generateHtml({ filename, title, h1, lead, desc, keywords, canonical, contentHtml }) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${title} — Safeโอน (SafeOne)</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${keywords}">
<meta name="google-site-verification" content="bekxyZQFU9h4x3o58e7xqFy2l9aZZv5w18AJ9d31zxw">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="article">
<link rel="canonical" href="${canonical}">
<style>
  :root { --ink:#141b24; --muted:#5f6b7a; --line:#e2e7ee; --brand:#0a7d5a; --lineGreen:#06c755; --danger:#c0392b; --warning:#d97706; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,"Segoe UI","Noto Sans Thai",Tahoma,sans-serif; color:var(--ink); background:#fff; line-height:1.65; }
  .wrap { max-width: 680px; margin: 0 auto; padding: 0 18px; }
  header { background: linear-gradient(160deg,#0a7d5a,#0d5561); color:#fff; padding: 40px 0 34px; text-align:center; }
  h1 { font-size: 26px; margin: 0 0 10px; line-height:1.35; }
  .lead { font-size: 15px; opacity:.95; margin: 0 0 20px; }
  .cta { display:inline-block; background: var(--lineGreen); color:#fff; text-decoration:none; font-size:16px; font-weight:800; padding:12px 28px; border-radius:99px; }
  .box-card { border:1px solid var(--line); border-radius:14px; padding:18px; background:#f8fafb; margin:20px 0; }
  .step-list { counter-reset:step; list-style:none; padding:0; }
  .step-list li { position:relative; padding-left:38px; margin-bottom:14px; font-size:15px; }
  .step-list li::before { counter-increment:step; content:counter(step); position:absolute; left:0; top:0; width:26px; height:26px; border-radius:50%; background:var(--brand); color:#fff; text-align:center; line-height:26px; font-weight:bold; font-size:13px; }
  .alert-red { background:#fdecec; border-left:4px solid var(--danger); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:14px; }
  .alert-yellow { background:#fffbeb; border-left:4px solid var(--warning); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:14px; }
  .ad-slot { margin:22px 0; padding:14px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; text-align:center; font-size:13px; color:var(--muted); }
  a { color: var(--brand); }
  footer { border-top:1px solid var(--line); margin-top:40px; padding:24px 0 40px; color:var(--muted); font-size:14px; }
  nav.links { display:flex; gap:10px; flex-wrap:wrap; margin-bottom:12px; font-size:13px; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>${h1}</h1>
    <p class="lead">${lead}</p>
    <a class="cta" id="addFriend" href="#">➕ เช็คเลขบัญชีฟรีใน LINE</a>
  </div>
</header>

<div class="wrap">
  <div class="ad-slot">
    <b>🛡️ Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</b><br>
    ตรวจประวัติบัญชีก่อนโอนเงินทุกครั้ง ฟรี 24 ชั่วโมง
  </div>

  ${contentHtml}

  <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:12px;padding:16px;text-align:center;margin:24px 0;">
    <h3 style="margin:0 0 6px;">ปลอดภัยไว้ก่อน — เช็คก่อนโอนเงินทุกครั้ง</h3>
    <p style="margin:0 0 10px;font-size:13px;color:var(--muted);">วางเลขบัญชีในไลน์ รู้ประวัติและข้อควรระวังทันทีใน 3 วินาที</p>
    <a class="cta" style="font-size:14px;padding:10px 22px;" href="#" id="shareLine">📤 แชร์ข้อมูลนี้ให้เพื่อน</a>
  </div>
</div>

<footer>
  <div class="wrap">
    <nav class="links">
      <a href="/">หน้าแรก</a>
      <a href="/check-account.html">เช็คเลขบัญชี</a>
      <a href="/freeze-account.html">วิธีอายัดบัญชี 1441</a>
      <a href="/stats.html">สถิติระบบ</a>
      <a href="/register.html">ลงทะเบียนร้านค้า</a>
    </nav>
    <p>© 2026 Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</p>
  </div>
</footer>

<script>
fetch('/site-config').then(r=>r.json()).then(c=>{
  if(c.addFriendUrl) document.querySelectorAll('#addFriend').forEach(el=>el.href=c.addFriendUrl);
  const s = document.getElementById('shareLine');
  if(s) s.href = 'https://line.me/R/msg/text/?' + encodeURIComponent(document.title + ' ' + window.location.href);
}).catch(()=>{});
</script>
</body>
</html>`;
}

const allGeneratedFiles = [];

// 1. Generate Bank x Scam Matrix (15 x 7 = 105 pages)
for (const b of BANKS) {
  for (const s of SCAMS) {
    const filename = `check-${b.id}-${s.id}.html`;
    const title = `เช็คบัญชี${b.name} ${s.name} โดนโกงทำอย่างไร`;
    const h1 = `เช็คเลขบัญชี ${b.name}<br>กรณี ${s.name}`;
    const lead = `ตรวจสอบประวัติบัญชี ${b.name} ก่อนโอนเงิน พร้อมวิธีอายัดเงินทันที`;
    const desc = `เช็คเลขบัญชีธนาคาร ${b.name} ป้องกัน${s.keyword} วิธีแจ้งความออนไลน์ และเบอร์ติดต่อศูนย์รับแจ้งเหตุภัยทางการเงิน ${b.name} (${b.hotline})`;
    const keywords = `เช็คบัญชี${b.name},${s.keyword},โดนโกง${b.name},อายัดบัญชี${b.name},เบอร์แจ้งความ${b.name},Safeโอน`;

    const contentHtml = `
    <h2>วิธีตรวจสอบเลขบัญชี ${b.name} ก่อนโอนเงิน</h2>
    <ol class="step-list">
      <li><b>นำเลขบัญชี ${b.name}</b> ส่งเข้ามาใน LINE บอท Safeโอน</li>
      <li><b>ระบบตรวจเช็ค Identity Graph:</b> ค้นหาประวัติความเชื่อมโยงกับเบอร์โทรและช่องทางติดต่อที่เคยมีผู้แจ้งข้อพิพาท</li>
      <li><b>ตรวจสอบชื่อบัญชี:</b> ชื่อผู้รับโอนต้องตรงกับชื่อเจ้าของกิจการหรือร้านค้า ไม่ใช่ชื่อคนแปลกหน้า</li>
    </ol>

    <div class="box-card">
      <h3 style="margin-top:0;">🚨 ศูนย์รับแจ้งเหตุภัยทางการเงิน ${b.name}</h3>
      <p>หากคุณโอนเงินเข้าบัญชี ${b.name} แล้วพบว่าเป็นมิจฉาชีพ ให้รีบดำเนินการทันที:</p>
      <ul>
        <li><b>เบอร์ Hotline ด่วน ${b.name}:</b> <span style="font-size:18px;color:#dc2626;font-weight:bold;">${b.hotline}</span> (แจ้งระงับธุรกรรมชั่วคราว)</li>
        <li><b>แอปธนาคาร:</b> เปิดแอป ${b.app} เพื่อดูสลิปและบันทึกรหัสอ้างอิงธุรกรรม</li>
        <li><b>สายด่วนศูนย์ AOC:</b> โทร <b>1441</b> (ตลอด 24 ชั่วโมง)</li>
      </ul>
    </div>

    <div class="alert-red">
      <b>3 ขั้นตอนเร่งด่วนเมื่อโอนเงินผิด/โดนโกง:</b><br>
      1. โทร ${b.hotline} เพื่อขอรหัส Bank Case ID ระงับบัญชีปลายทาง<br>
      2. แจ้งความออนไลน์ที่ <a href="https://thaipoliceonline.go.th" target="_blank" rel="noopener">thaipoliceonline.go.th</a> ภายใน 72 ชั่วโมง<br>
      3. นำหลักฐานเข้าพบพนักงานสอบสวนตามสถานีตำรวจที่นัดหมาย
    </div>`;

    fs.writeFileSync(
      path.join(publicDir, filename),
      generateHtml({ filename, title, h1, lead, desc, keywords, canonical: `/${filename}`, contentHtml }),
      'utf8'
    );
    allGeneratedFiles.push(`/${filename}`);
  }
}

// 2. Generate Platform Pages (5 pages)
for (const p of PLATFORMS) {
  const filename = `scam-${p.id}.html`;
  const title = `เตือนภัยกลโกง ${p.name} เช็คเลขบัญชีก่อนโอนเงิน`;
  const h1 = `เตือนภัยโดนโกงบน<br>${p.name}`;
  const lead = `วิธีซื้อขายอย่างปลอดภัยบน ${p.name} และจุดสังเกตบัญชีม้า`;
  const desc = `รวมกลโกงยอดฮิตบน ${p.name} วิธีตรวจสอบคนขาย เช็คเลขบัญชีก่อนโอนเงิน ป้องกันการโอนแล้วบล็อกหนี`;
  const keywords = `โกง${p.name},หลอกโอนเงิน${p.name},เช็คคนขาย${p.name},เพจปลอม${p.name},Safeโอน`;

  const contentHtml = `
  <h2>กลโกงที่พบบ่อยบน ${p.name}</h2>
  <div class="box-card">
    <p><b>รูปแบบอันตราย:</b> ${p.tips}</p>
    <p><b>ข้อควรระวัง:</b> มิจฉาชีพมักสร้างโปรไฟล์ปลอม รีวิวปลอม และดึงผู้ซื้อออกจากระบบชำระเงินมาตรฐานของแพลตฟอร์ม เพื่อหลอกให้โอนเงินตรงเข้าบัญชีส่วนตัว</p>
  </div>

  <h2>กฎเหล็กเพื่อความปลอดภัยบน ${p.name}</h2>
  <ol class="step-list">
    <li><b>อย่าโอนเงินนอกระบบ:</b> ชำระเงินผ่านระบบของแพลตฟอร์มเท่านั้น เพื่อให้มีระบบคุ้มครองผู้ซื้อ</li>
    <li><b>นำเลขบัญชีมาเช็คใน Safeโอน:</b> หากผู้ขายขอให้โอนมัดจำหรือโอนตรง ให้ตรวจประวัติใน LINE ก่อนเสมอ</li>
    <li><b>ถ่ายวิดีโอขณะเปิดพัสดุ:</b> ไว้เป็นหลักฐานกรณีสินค้าไม่ตรงปกหรือไม่ได้รับของ</li>
  </ol>`;

  fs.writeFileSync(
    path.join(publicDir, filename),
    generateHtml({ filename, title, h1, lead, desc, keywords, canonical: `/${filename}`, contentHtml }),
    'utf8'
  );
  allGeneratedFiles.push(`/${filename}`);
}

console.log(`✅ Generated ${allGeneratedFiles.length} programmatic SEO landing pages successfully!`);

// Output list of pages for sitemap
fs.writeFileSync(
  path.join(__dirname, '..', 'data', 'generated-pages.json'),
  JSON.stringify(allGeneratedFiles, null, 2),
  'utf8'
);
