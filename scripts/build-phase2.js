const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');

// Create exact HTML file verification too
fs.writeFileSync(
  path.join(publicDir, 'googlebekxyZQFU9h4x3o58e7xqFy2l9aZZv5w18AJ9d31zxw.html'),
  'google-site-verification: googlebekxyZQFU9h4x3o58e7xqFy2l9aZZv5w18AJ9d31zxw.html',
  'utf8'
);

function renderPage({ title, metaTitle, desc, keywords, canonical, headerH1, headerLead, contentHtml }) {
  return `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${metaTitle}</title>
<meta name="description" content="${desc}">
<meta name="keywords" content="${keywords}">
<meta name="google-site-verification" content="bekxyZQFU9h4x3o58e7xqFy2l9aZZv5w18AJ9d31zxw">
<meta property="og:title" content="${metaTitle}">
<meta property="og:description" content="${desc}">
<meta property="og:type" content="article">
<link rel="canonical" href="${canonical}">
<style>
  :root { --ink:#141b24; --muted:#5f6b7a; --line:#e2e7ee; --brand:#0a7d5a; --lineGreen:#06c755; --danger:#c0392b; --warning:#d97706; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,"Segoe UI","Noto Sans Thai",Tahoma,sans-serif; color:var(--ink); background:#fff; line-height:1.65; }
  .wrap { max-width: 680px; margin: 0 auto; padding: 0 18px; }
  header { background: linear-gradient(160deg,#0a7d5a,#0d5561); color:#fff; padding: 44px 0 38px; text-align:center; }
  h1 { font-size: 28px; margin: 0 0 12px; line-height:1.35; }
  .lead { font-size: 16px; opacity:.95; margin: 0 0 24px; }
  .cta { display:inline-block; background: var(--lineGreen); color:#fff; text-decoration:none; font-size:17px; font-weight:800; padding:14px 30px; border-radius:99px; box-shadow:0 4px 14px rgba(6,199,85,.4); }
  .cta:hover { opacity:.92; }
  .box-card { border:1px solid var(--line); border-radius:14px; padding:18px; background:#f8fafb; margin:22px 0; }
  .step-list { counter-reset:step; list-style:none; padding:0; }
  .step-list li { position:relative; padding-left:42px; margin-bottom:18px; }
  .step-list li::before { counter-increment:step; content:counter(step); position:absolute; left:0; top:0; width:28px; height:28px; border-radius:50%; background:var(--brand); color:#fff; text-align:center; line-height:28px; font-weight:bold; font-size:14px; }
  .alert-red { background:#fdecec; border-left:4px solid var(--danger); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:15px; }
  .alert-yellow { background:#fffbeb; border-left:4px solid var(--warning); padding:14px 16px; border-radius:8px; margin:20px 0; font-size:15px; }
  .ad-slot { margin:26px 0; padding:18px; background:#f8fafc; border:1px dashed #cbd5e1; border-radius:12px; text-align:center; font-size:13px; color:var(--muted); }
  .affiliate-box { background:linear-gradient(135deg,#f0fdf4,#e0f2fe); border:1px solid #bae6fd; border-radius:12px; padding:16px; margin:24px 0; text-align:center; }
  .share-bar { background:#f0fdf4; border:1px solid #bbf7d0; border-radius:12px; padding:16px; text-align:center; margin:28px 0; }
  ul { padding-left:20px; } li { margin-bottom:8px; }
  a { color: var(--brand); }
  footer { border-top:1px solid var(--line); margin-top:44px; padding:24px 0 44px; color:var(--muted); font-size:14px; }
  nav.links { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>${headerH1}</h1>
    <p class="lead">${headerLead}</p>
    <a class="cta" id="addFriend" href="#">➕ ตรวจสอบฟรีใน LINE</a>
  </div>
</header>

<div class="wrap">
  <div class="ad-slot" id="ad-top">
    <div style="font-weight:bold;color:#334155;margin-bottom:4px;">🛡️ Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</div>
    <span>ตรวจสอบเลขบัญชีและชื่อผู้รับก่อนโอนเงินทุกครั้ง ฟรี 24 ชั่วโมง</span>
  </div>

  ${contentHtml}

  <div class="affiliate-box">
    <div style="font-weight:bold;color:#0369a1;margin-bottom:6px;">🌟 บริการแนะนำเพื่อความปลอดภัยและการเดินทาง</div>
    <p style="margin:0 0 10px;font-size:14px;color:#334155;">จองที่พักและตั๋วเดินทางผ่านแพลตฟอร์มมาตรฐานที่มีระบบคุ้มครองผู้บริโภค ปลอดภัย 100%</p>
    <a href="https://www.agoda.com" target="_blank" rel="noopener sponsored" style="display:inline-block;background:#0284c7;color:#fff;padding:8px 18px;border-radius:20px;text-decoration:none;font-weight:bold;font-size:13px;">สำรวจที่พักและดีลราคาพิเศษ</a>
  </div>

  <div class="share-bar">
    <h3 style="margin:0 0 8px;">ส่งต่อหน้านี้ให้เพื่อนหรือคนในครอบครัว</h3>
    <p style="margin:0 0 12px;font-size:14px;color:var(--muted);">ช่วยกันแชร์เพื่อตัดวงจรมิจฉาชีพในโลกออนไลน์</p>
    <a class="cta" style="font-size:15px;padding:10px 24px;" href="#" id="shareLine">📤 แชร์หน้านี้ทาง LINE</a>
  </div>
</div>

<footer>
  <div class="wrap">
    <nav class="links">
      <a href="/">หน้าแรก</a>
      <a href="/check-account.html">เช็คเลขบัญชี</a>
      <a href="/hotel-scam.html">เตือนภัยที่พักปลอม</a>
      <a href="/car-rental-scam.html">โกงเช่ารถ</a>
      <a href="/ticket-scam.html">โกงตั๋วคอนเสิร์ต</a>
      <a href="/investment-scam.html">หลอกลงทุน</a>
      <a href="/loan-scam.html">หลอกกู้เงิน</a>
      <a href="/shopping-scam.html">โกงซื้อของออนไลน์</a>
      <a href="/freeze-account.html">วิธีอายัดบัญชี 1441</a>
      <a href="/stats.html">สถิติระบบ</a>
      <a href="/register.html">ลงทะเบียนร้านค้า</a>
    </nav>
    <p>© 2026 Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</p>
  </div>
</footer>

<script>
fetch('/site-config').then(r=>r.json()).then(c=>{
  if(c.addFriendUrl){
    document.querySelectorAll('#addFriend').forEach(el=>el.href=c.addFriendUrl);
  }
  const shareBtn = document.getElementById('shareLine');
  if(shareBtn){
    shareBtn.href = 'https://line.me/R/msg/text/?' + encodeURIComponent(document.title + ' ' + window.location.href);
  }
}).catch(()=>{});
</script>
</body>
</html>`;
}

// 1. check-account.html
const pCheck = renderPage({
  metaTitle: 'เช็คเลขบัญชีคนโกง ตรวจสอบบัญชีมิจฉาชีพ บัญชีม้า ฟรี — Safeโอน (SafeOne)',
  desc: 'เช็คเลขบัญชีคนโกง ตรวจสอบประวัติมิจฉาชีพ บัญชีม้า ก่อนโอนเงิน ตรวจสอบผ่าน LINE ตอบกลับทันทีใน 3 วินาที โอนปลอดภัย ทุกยอดเงิน',
  keywords: 'เช็คเลขบัญชีคนโกง,ตรวจสอบบัญชีคนโกง,เช็คบัญชีม้า,เช็คคนโกง,blacklistseller,เตือนภัยโอนเงิน,Safeโอน',
  canonical: '/check-account.html',
  headerH1: 'เช็คเลขบัญชีคนโกง<br>ตรวจสอบบัญชีมิจฉาชีพ',
  headerLead: 'วางเลขบัญชีในไลน์ รู้ผลทันทีใน 3 วินาที<br>Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน',
  contentHtml: `
  <h2>วิธีเช็คเลขบัญชีคนโกงง่ายๆ ใน 1 นาที</h2>
  <ol class="step-list">
    <li><b>ก๊อปปี้เลขบัญชี</b> ที่ผู้ขายหรือคู่สนทนาส่งมาให้</li>
    <li><b>ส่งเข้า LINE บอท "Safeโอน (SafeOne)"</b> ระบบจะค้นหาความถี่การถูกสอบถามและประวัติทันที</li>
    <li><b>กดลิงก์ตรวจสอบเชิงลึก</b> บอทจะสร้างทางลัดค้นหาใน Google, Blacklistseller และระบบตำรวจให้ทันที</li>
  </ol>
  <div class="box-card">
    <h3 style="margin-top:0;">สัญญาณอันตรายของ "บัญชีม้า" ที่พบบ่อย</h3>
    <ul>
      <li><b>ชื่อบัญชีไม่ตรงกับชื่อเพจหรือร้านค้า:</b> อ้างว่าเป็นบัญชีแอดมิน บัญชีส่วนตัว หรือบัญชีฝ่ายสต๊อก</li>
      <li><b>เป็นบัญชีเปิดใหม่:</b> ไม่เคยมีประวัติการซื้อขายมาก่อน หรือเพิ่งเปลี่ยนเลขบัญชีบ่อยๆ</li>
      <li><b>เร่งรัดให้รีบโอน:</b> อ้างว่าเหลือชิ้นสุดท้าย กำลังจะหลุดคิว หรือให้โปรโมชั่นเฉพาะ 10 นาทีนี้</li>
    </ul>
  </div>
  <div class="alert-red">
    <b>🚨 หากโอนเงินไปแล้ว และรู้ตัวว่าโดนโกง</b><br>
    รีบโทรติดต่อสายด่วน <b>1441</b> ศูนย์ AOC เพื่อแจ้งอายัดบัญชีคนร้ายทันที (โทรได้ 24 ชั่วโมง) และแจ้งความออนไลน์ที่ <a href="https://thaipoliceonline.go.th" target="_blank" rel="noopener">thaipoliceonline.go.th</a>
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'check-account.html'), pCheck, 'utf8');

// 2. hotel-scam.html
const pHotel = renderPage({
  metaTitle: 'เตือนภัยเพจที่พักปลอม หลอกโอนค่ามัดจำห้องพัก — Safeโอน (SafeOne)',
  desc: 'วิธีตรวจสอบเพจที่พักปลอม รีสอร์ทปลอม เกาะล้าน พัทยา เขาใหญ่ เชียงใหม่ เช็คเลขบัญชีมัดจำที่พักก่อนโอน ป้องกันโดนโกง 100%',
  keywords: 'เพจที่พักปลอม,โกงที่พักเกาะล้าน,โกงมัดจำที่พัก,รีสอร์ทปลอม,เช็คที่พักก่อนโอน,เพจปลอมพัทยา,Safeโอน',
  canonical: '/hotel-scam.html',
  headerH1: 'เตือนภัยเพจที่พักปลอม<br>หลอกโอนมัดจำห้องพัก',
  headerLead: 'มิจฉาชีพสร้างเพจปลอม ก๊อปรูปที่พักดัง หลอกโอนมัดจำ<br>ตรวจชื่อบัญชีและประวัติก่อนโอนเงินทุกครั้ง',
  contentHtml: `
  <h2>5 จุดสังเกต เพจที่พักปลอม vs เพจจริง</h2>
  <ul>
    <li><b>ดูความโปร่งใสของเพจ (Page Transparency):</b> เพจปลอมมักเพิ่งสร้างได้ไม่กี่วัน/กี่เดือน มีการเปลี่ยนชื่อเพจบ่อย และแอดมินอยู่ต่างประเทศ (เช่น เวียดนาม, กัมพูชา)</li>
    <li><b>ชื่อบัญชีธนาคาร:</b> ที่พักจริงมักใช้ชื่อบัญชีในนามบริษัท/ห้างหุ้นส่วน หรือชื่อเจ้าของที่ระบุชัดเจนในใบอนุญาต ไม่ใช่บัญชีชื่อคนแปลกหน้า</li>
    <li><b>โปรโมชั่นถูกเกินจริง:</b> ห้องพูลวิลล่าติดทะเล วิวหลักล้าน แต่ขายคืนละ 990 บาท พร้อมแถมอาหารทุกมื้อ</li>
    <li><b>ขอวิดีโอคอลไม่ได้:</b> บ่ายเบี่ยง อ้างว่าพนักงานติดงาน ไม่สะดวกเปิดกล้องถ่ายสถานที่จริงให้ดู</li>
    <li><b>เร่งให้โอนทันที:</b> อ้างว่ามีคนรอจองต่อ ถ้าไม่โอนภายใน 15 นาทีจะตัดสิทธิ์</li>
  </ul>
  <div class="box-card">
    <h3 style="margin-top:0;">💡 วิธีป้องกันที่ดีที่สุด</h3>
    <p>ก่อนโอนมัดจำที่พัก ให้ขอเบอร์โทรศัพท์บ้านหรือเบอร์ตรงของที่พักโทรตรวจสอบ หรือนำเลขบัญชีมาเช็คในบอท "Safeโอน (SafeOne)"</p>
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'hotel-scam.html'), pHotel, 'utf8');

// 3. car-rental-scam.html
const pCar = renderPage({
  metaTitle: 'เตือนภัยโกงเช่ารถ มอเตอร์ไซค์ รถตู้ หลอกมัดจำ — Safeโอน (SafeOne)',
  desc: 'ระวังเพจเช่ารถปลอม หลอกโอนเงินมัดจำค่าน้ำมัน ค่าประกันรถ เช็คเลขบัญชีผู้ให้เช่ารถก่อนโอน ปลอดภัย ไม่โดนลอยแพ',
  keywords: 'โกงเช่ารถ,เพจเช่ารถปลอม,โกงมัดจำรถเช่า,เช่ามอเตอร์ไซค์เกาะล้าน,เช่ารถเที่ยวเชียงใหม่,เช่ารถภูเก็ต',
  canonical: '/car-rental-scam.html',
  headerH1: 'เตือนภัยโกงเช่ารถ<br>หลอกโอนมัดจำก่อนรับรถ',
  headerLead: 'ระวังเพจปล่อยเช่ารถยนต์/มอเตอร์ไซค์ปลอม โอนมัดจำแล้วปิดเพจหนี<br>เช็คบัญชีก่อนโอนเพื่อความปลอดภัยในการเดินทาง',
  contentHtml: `
  <h2>กลโกงเพจเช่ารถที่นักท่องเที่ยวพบบ่อย</h2>
  <ol class="step-list">
    <li><b>โพสต์รูปรถหรู/รถใหม่ราคาถูก:</b> ปล่อยเช่ารถวันละ 500-800 บาท ไม่ต้องใช้บัตรเครดิต</li>
    <li><b>เรียกเก็บมัดจำจอง + มัดจำประกันล่วงหน้า:</b> เรียกเก็บ 1,000 - 3,000 บาท บอกว่าจะคืนให้ตอนส่งมอบรถ</li>
    <li><b>บล็อกการติดต่อเมื่อถึงวันรับรถ:</b> เมื่อเดินทางไปถึงสนามบินหรือท่าเรือ ติดต่อไม่ได้ ไม่มีรถมาส่งจริง</li>
  </ol>
  <div class="alert-yellow">
    <b>ข้อแนะนำ:</b> เลือกร้านเช่ารถที่มีหน้าร้านชัดเจนบน Google Maps มีรีวิวจากลูกค้าจริง หรือเลือกจ่ายเงินตอนรับรถจริงเท่านั้น
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'car-rental-scam.html'), pCar, 'utf8');

// 4. ticket-scam.html
const pTicket = renderPage({
  metaTitle: 'เตือนภัยโกงตั๋วคอนเสิร์ต บัตรแฟนมีต ตั๋วเดินทาง — Safeโอน (SafeOne)',
  desc: 'เช็คประวัติคนขายตั๋วคอนเสิร์ต บัตรคอน หลอกขายบัตรทิพย์ บัตรวน โอนแล้วบล็อกหนี ตรวจเลขบัญชีก่อนดีล ปลอดภัยชัวร์',
  keywords: 'โกงตั๋วคอนเสิร์ต,โกงบัตรคอน,บัตรทิพย์,โกงบัตรแฟนมีต,เช็คเลขบัญชีโกงบัตรคอน,ซื้อตั๋วต่อคนอื่น',
  canonical: '/ticket-scam.html',
  headerH1: 'เตือนภัยโกงบัตรคอนเสิร์ต<br>หลอกขายตั๋วทิพย์ โอนแล้วบล็อก',
  headerLead: 'ซื้อบัตรคอนเสิร์ตต่อใน X (Twitter) หรือ Facebook เสี่ยงโดนโกงสูงมาก<br>ตรวจสอบชื่อและเลขบัญชีก่อนโอนเงินทุกครั้ง',
  contentHtml: `
  <h2>กลโกงบัตรคอนเสิร์ตยอดฮิต</h2>
  <ul>
    <li><b>บัตรทิพย์ (ไม่มีบัตรจริง):</b> ก๊อปรูปบัตรของคนอื่นมาตัดต่อ ใส่ลายน้ำทับ แล้วนำมาโพสต์ขาย</li>
    <li><b>บัตรวน (ขายให้หลายคน):</b> มีบัตรใบเดียว แต่ส่งไฟล์หรือภาพให้คนซื้อ 10-20 คน ใครไปหน้างานก่อนคนนั้นเข้าได้</li>
    <li><b>อ้างว่ามีเครดิตดี:</b> สร้างรีวิวปลอม แคปแชทปลอมมาโพสต์ว่าเคยส่งบัตรจริง</li>
  </ul>
  <div class="box-card">
    <h3 style="margin-top:0;">วิธีเอาตัวรอดเมื่อต้องซื้อบัตรต่อ</h3>
    <ul>
      <li>นัดรับบัตรแบบตัวต่อตัว (Face-to-face) หรือจ่ายผ่านคนกลางที่น่าเชื่อถือ</li>
      <li>ขอให้ผู้ขายเขียนชื่อเฟซบุ๊กหรือวันที่ปัจจุบันลงบนกระดาษแล้วถ่ายคู่กับบัตรสดๆ</li>
      <li>นำเลขบัญชีและชื่อผู้ขายมาวางเช็คใน LINE @Safeโอน</li>
    </ul>
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'ticket-scam.html'), pTicket, 'utf8');

// 5. investment-scam.html
const pInvest = renderPage({
  metaTitle: 'เตือนภัยหลอกลงทุน เทรดหุ้น ปั่นยอดวิว แชร์ลูกโซ่ — Safeโอน (SafeOne)',
  desc: 'กลโกงชวนลงทุนกำไรสูง เทรดคริปโต ปั่นยอดไลก์ ภารกิจรับออเดอร์ เติมเงินปลดล็อคถอนไม่ได้ สัญญาณเตือนภัยมิจฉาชีพ',
  keywords: 'หลอกลงทุน,งานกดไลก์ได้เงิน,ภารกิจรับออเดอร์,แชร์ลูกโซ่,หลอกเทรดหุ้น,สแกมลงทุน',
  canonical: '/investment-scam.html',
  headerH1: 'เตือนภัยหลอกลงทุน<br>งานกดไลก์ / ภารกิจปั่นเงิน',
  headerLead: 'การันตีกำไรวันละ 500-3,000 บาท ไม่มีอยู่จริงในโลก<br>Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน',
  contentHtml: `
  <h2>กลไกการหลอกลวงแบบ "ทำภารกิจ / ลงทุนผลตอบแทนสูง"</h2>
  <ol class="step-list">
    <li><b>ให้ผลตอบแทนจริงในรอบแรก:</b> ให้กดไลก์หรือลงทุน 100 บาท แล้วโอนคืน 130 บาท เพื่อสร้างความเชื่อใจ</li>
    <li><b>ชวนเข้ากลุ่ม VIP ลงเงินก้อนใหญ่:</b> ให้ลงทุนหลักพันหรือหลักหมื่น อ้างว่าเป็นภารกิจพิเศษ</li>
    <li><b>อ้างระบบล็อค ต้องเติมเงินเพิ่ม:</b> พอจะถอนเงิน จะบอกว่า "ทำผิดขั้นตอน", "ยอดไม่ครบ", "ต้องเสียภาษีถอนเงิน"</li>
    <li><b>โอนเท่าไหร่ก็ถอนไม่ได้:</b> หลอกให้โอนเพิ่มเรื่อยๆ จนเหยื่อหมดตัวแล้วเตะออกจากกลุ่ม</li>
  </ol>
  <div class="alert-red">
    <b>🚨 จำกฎเหล็กข้อเดียว:</b> งานจริงไม่มีการให้ผู้ทำงานโอนเงินสำรองจ่ายก่อนเด็ดขาด!
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'investment-scam.html'), pInvest, 'utf8');

// 6. loan-scam.html
const pLoan = renderPage({
  metaTitle: 'เตือนภัยเงินกู้ออนไลน์ หลอกโอนค่ามัดจำ ค่าปลดล็อคยอด — Safeโอน (SafeOne)',
  desc: 'กู้เงินออนไลน์ อนุมัติไว ไม่เช็คบูโร ระวังโดนหลอกโอนค่าค้ำประกัน ค่าเปิดบัญชีก่อน เช็คความปลอดภัยก่อนตกเป็นเหยื่อ',
  keywords: 'เงินกู้ออนไลน์,กู้เงินด่วน,หลอกโอนค่ามัดจำเงินกู้,เงินกู้นอกระบบ,โกงเงินกู้,เช็คผู้ปล่อยกู้',
  canonical: '/loan-scam.html',
  headerH1: 'เตือนภัยเงินกู้ออนไลน์<br>หลอกโอนค่าค้ำประกันก่อนกู้',
  headerLead: 'กู้เงินแต่ต้องโอนเงินไปก่อน = โดนหลอก 100%<br>Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน',
  contentHtml: `
  <h2>สัญญาณเตือนภัยมิจฉาชีพเงินกู้</h2>
  <ul>
    <li><b>อนุมัติง่ายเกินจริง:</b> ไม่ดูเอกสารรายได้ ไม่เช็คเครดิตบูโร อนุมัติวงเงินหลักแสนภายใน 5 นาที</li>
    <li><b>มีค่าธรรมเนียมสารพัดชื่อ:</b> "ค่าเอกสาร", "ค่าค้ำประกัน", "ค่าแก้ไขเลขบัญชีที่กรอกผิด", "ค่าปลดล็อครหัส OTP"</li>
    <li><b>ข่มขู่ว่าจะดำเนินคดี:</b> หากเหยื่อไม่ยอมโอน จะขู่ว่าทำสัญญากู้แล้ว ผิดกฎหมาย จะส่งคนมาตามถึงบ้าน</li>
  </ul>
  <div class="alert-red">
    <b>ข้อเท็จจริง:</b> ไม่มีสถาบันการเงินหรือธนาคารใดในประเทศไทยที่เรียกเก็บเงินจากผู้กู้ก่อนโอนเงินกู้ให้ หากโดนเรียกเก็บเงิน ให้หยุดคุยและบล็อกทันที
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'loan-scam.html'), pLoan, 'utf8');

// 7. shopping-scam.html
const pShop = renderPage({
  metaTitle: 'เตือนภัยซื้อของออนไลน์ โดนโกง โอนแล้วบล็อก ส่งของไม่ตรงปก — Safeโอน (SafeOne)',
  desc: 'วิธีซื้อของออนไลน์ไม่ให้โดนโกง เช็คเลขบัญชีพ่อค้าแม่ค้าก่อนโอนเงิน ตรวจประวัติการส่งของ ป้องกันสินค้าไม่ตรงปก',
  keywords: 'โกงซื้อของออนไลน์,โอนแล้วบล็อก,สินค้าไม่ตรงปก,เช็คประวัติคนขาย,ซื้อของในเฟซบุ๊ก,Safeโอน',
  canonical: '/shopping-scam.html',
  headerH1: 'เตือนภัยซื้อของออนไลน์<br>โอนแล้วบล็อก ส่งของไม่ตรงปก',
  headerLead: 'ซื้อของผ่าน Facebook / IG / TikTok ระวังเพจปลอมยิงแอดขายสินค้าราคาถูก<br>Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน',
  contentHtml: `
  <h2>เช็กลิสต์ 4 ข้อก่อนโอนเงินซื้อของออนไลน์</h2>
  <ol class="step-list">
    <li><b>ตรวจดูคอมเมนต์ใต้โพสต์:</b> เพจโกงมักปิดกั้นคอมเมนต์ หรือมีแต่คอมเมนต์จากบัญชีอวตารที่ไม่มีตัวตนจริง</li>
    <li><b>ขอหลักฐานการมีสินค้า:</b> ให้ถ่ายรูปสินค้าคู่กับป้ายชื่อร้านและวันที่ปัจจุบัน</li>
    <li><b>ค้นหาเลขบัญชีใน Google:</b> นำเลขบัญชีไปค้นหาว่าเคยมีคนแจ้งประวัติฉ้อโกงหรือไม่</li>
    <li><b>เลือกจ่ายแบบเก็บเงินปลายทาง (COD):</b> เมื่อรับพัสดุ ให้ถ่ายวิดีโอตอนแกะกล่องไว้เป็นหลักฐานทุกครั้ง</li>
  </ol>`
});
fs.writeFileSync(path.join(publicDir, 'shopping-scam.html'), pShop, 'utf8');

// 8. freeze-account.html
const pFreeze = renderPage({
  metaTitle: 'วิธีอายัดบัญชีคนโกงทันที สายด่วน 1441 และขั้นตอนแจ้งความ — Safeโอน (SafeOne)',
  desc: 'โอนเงินโดนโกงทำอย่างไร ขั้นตอนโทรสายด่วน 1441 ศูนย์ AOC เพื่ออายัดบัญชีม้าทันทีภายใน 24 ชม. พร้อมขั้นตอนแจ้งความออนไลน์',
  keywords: 'อายัดบัญชีคนโกง,สายด่วน 1441,แจ้งความออนไลน์,ศูนย์ AOC,โดนหลอกโอนเงิน,thaipoliceonline',
  canonical: '/freeze-account.html',
  headerH1: 'วิธีอายัดบัญชีคนโกงทันที<br>สายด่วน 1441 และแจ้งความออนไลน์',
  headerLead: 'โอนเงินแล้วรู้ตัวว่าโดนหลอกโอนเงิน ยิ่งดำเนินการเร็ว ยิ่งมีโอกาสได้เงินคืน<br>Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน',
  contentHtml: `
  <h2>3 ขั้นตอนด่วนที่สุดหลังรู้ตัวว่าโดนหลอกโอนเงิน</h2>
  <ol class="step-list">
    <li><b>โทรสายด่วน 1441 ทันที (ศูนย์ AOC):</b> แจ้งเรื่องหลอกลวงออนไลน์ เจ้าหน้าที่จะประสานงานสั่งระงับ/อายัดบัญชีปลายทางและบัญชีแถวต่อๆ ไปชั่วคราว</li>
    <li><b>รับเลข Bank Case ID:</b> เจ้าหน้าที่จะออกรหัสแจ้งความชั่วคราวให้ นำรหัสนี้ไปแจ้งความอย่างเป็นทางการ</li>
    <li><b>แจ้งความออนไลน์ที่ thaipoliceonline.go.th:</b> ภายใน 72 ชั่วโมง เพื่อให้พนักงานสอบสวนออกหมายอายัดเงินในบัญชีจริง</li>
  </ol>
  <div class="box-card">
    <h3 style="margin-top:0;">หลักฐานที่ต้องเตรียมไว้</h3>
    <ul>
      <li>สลิปหลักฐานการโอนเงิน (มี QR Code / วันที่เวลาชัดเจน)</li>
      <li>ภาพหน้าจอการสนทนาทั้งหมดตั้งแต่ต้นจนจบ</li>
      <li>หน้าโปรไฟล์ หรือลิงก์เพจ/บัญชีของผู้กระทำความผิด</li>
      <li>เลขบัญชีและชื่อบัญชีของผู้รับเงิน</li>
    </ul>
  </div>`
});
fs.writeFileSync(path.join(publicDir, 'freeze-account.html'), pFreeze, 'utf8');

// 9. stats.html
const pStats = `<!DOCTYPE html>
<html lang="th">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>สถิติและความโปร่งใส — Safeโอน (SafeOne)</title>
<meta name="description" content="สถิติข้อมูลการตรวจสอบเลขบัญชี จำนวนผู้ใช้งาน และร้านค้าที่ได้รับการยืนยันความปลอดภัยในระบบ Safeโอน">
<meta name="google-site-verification" content="bekxyZQFU9h4x3o58e7xqFy2l9aZZv5w18AJ9d31zxw">
<link rel="canonical" href="/stats.html">
<style>
  :root { --ink:#141b24; --muted:#5f6b7a; --line:#e2e7ee; --brand:#0a7d5a; --lineGreen:#06c755; }
  * { box-sizing: border-box; }
  body { margin:0; font-family:-apple-system,"Segoe UI","Noto Sans Thai",Tahoma,sans-serif; color:var(--ink); background:#fff; line-height:1.65; }
  .wrap { max-width: 680px; margin: 0 auto; padding: 0 18px; }
  header { background: linear-gradient(160deg,#0a7d5a,#0d5561); color:#fff; padding: 44px 0 38px; text-align:center; }
  h1 { font-size: 28px; margin: 0 0 12px; line-height:1.35; }
  .lead { font-size: 16px; opacity:.95; margin: 0 0 24px; }
  .stats-grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(180px,1fr)); gap:16px; margin:28px 0; }
  .stat-card { background:#f8fafc; border:1px solid var(--line); border-radius:14px; padding:20px; text-align:center; }
  .stat-num { font-size:36px; font-weight:800; color:var(--brand); margin:8px 0; }
  .stat-label { font-size:14px; color:var(--muted); font-weight:bold; }
  .cta { display:inline-block; background: var(--lineGreen); color:#fff; text-decoration:none; font-size:17px; font-weight:800; padding:14px 30px; border-radius:99px; }
  .box-card { border:1px solid var(--line); border-radius:14px; padding:18px; background:#f8fafb; margin:22px 0; }
  a { color: var(--brand); }
  footer { border-top:1px solid var(--line); margin-top:44px; padding:24px 0 44px; color:var(--muted); font-size:14px; }
  nav.links { display:flex; gap:12px; flex-wrap:wrap; margin-bottom:14px; }
</style>
</head>
<body>

<header>
  <div class="wrap">
    <h1>สถิติและความโปร่งใส</h1>
    <p class="lead">Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</p>
    <a class="cta" id="addFriend" href="#">➕ ทดลองใช้งานใน LINE</a>
  </div>
</header>

<div class="wrap">
  <div class="stats-grid">
    <div class="stat-card">
      <div class="stat-label">ยอดตรวจสอบสะสม</div>
      <div class="stat-num" id="totalQueries">0</div>
      <div style="font-size:12px;color:var(--muted);">ครั้งที่มีการส่งข้อมูลตรวจ</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">บัญชีในฐานข้อมูลความจำ</div>
      <div class="stat-num" id="totalAccounts">0</div>
      <div style="font-size:12px;color:var(--muted);">บัญชีที่เคยมีคนถามถึง</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">ที่พัก/ร้านค้ายืนยันแล้ว</div>
      <div class="stat-num" id="verifiedCount">0</div>
      <div style="font-size:12px;color:var(--muted);">ตรวจสอบเอกสารถูกต้อง</div>
    </div>
  </div>

  <h2>หลักการทำงานเพื่อความเป็นส่วนตัว</h2>
  <div class="box-card">
    <p>🔒 <b>ความปลอดภัยระดับสูงสุด:</b> ระบบไม่มีการเก็บเลขบัญชีธนาคารจริงของผู้ใช้งาน ข้อมูลถูกเข้ารหัสแบบทางเดียว (HMAC-SHA256 พร้อม Salt ลับ) ทำให้ไม่สามารถย้อนกลับเป็นเลขบัญชีจริงได้แม้ฐานข้อมูลจะรั่วไหล</p>
    <p>🛡️ <b>Crowd Intelligence:</b> ความจำร่วมของระบบเติบโตขึ้นทุกครั้งที่มีการใช้งาน ช่วยปกป้องทุกคนในสังคมได้อย่างแม่นยำยิ่งขึ้น</p>
  </div>
</div>

<footer>
  <div class="wrap">
    <nav class="links">
      <a href="/">หน้าแรก</a>
      <a href="/check-account.html">เช็คเลขบัญชี</a>
      <a href="/hotel-scam.html">เตือนภัยที่พักปลอม</a>
      <a href="/scammed.html">โดนโกงทำยังไง</a>
      <a href="/stats.html">สถิติระบบ</a>
      <a href="/register.html">ลงทะเบียนร้านค้า</a>
    </nav>
    <p>© 2026 Safeโอน (SafeOne) — โอนปลอดภัย ทุกยอดเงิน</p>
  </div>
</footer>

<script>
fetch('/site-config').then(r=>r.json()).then(c=>{
  if(c.addFriendUrl){
    document.querySelectorAll('#addFriend').forEach(el=>el.href=c.addFriendUrl);
  }
  document.getElementById('totalQueries').textContent = (c.queryCount || 0).toLocaleString();
  document.getElementById('totalAccounts').textContent = (c.accountCount || 0).toLocaleString();
  document.getElementById('verifiedCount').textContent = (c.verifiedCount || 0).toLocaleString();
}).catch(()=>{});
</script>
</body>
</html>`;
fs.writeFileSync(path.join(publicDir, 'stats.html'), pStats, 'utf8');

console.log('✅ Generated verification file and all pages with Google Site Verification!');
