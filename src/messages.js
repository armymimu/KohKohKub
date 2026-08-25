/**
 * ข้อความตอบกลับทั้งหมดรวมไว้ที่นี่ที่เดียว
 * อยากแก้คำพูดของบอท แก้ไฟล์นี้ไฟล์เดียวพอ
 *
 * ระบบไม่ผูกกับพื้นที่ใดพื้นที่หนึ่ง — ใช้ตรวจเลขบัญชีของผู้ขายแบบไหนก็ได้ทั่วประเทศ
 */

const config = require('./config');

/**
 * ท้ายข้อความเตือน แนบลิงก์ชวนเพื่อนมาใช้บอท
 * นี่คือช่องทางกระจายตัวหลัก — คนที่เพิ่งเกือบโดนโกง มักส่งต่อให้เพื่อนทันที
 */
function inviteLine() {
  if (!config.lineOaId) return '';
  return `\n\n📤 ส่งต่อให้เพื่อนที่กำลังจะโอนเงิน\nhttps://line.me/R/ti/p/${encodeURIComponent(config.lineOaId)}`;
}

/** คำที่ถ้าเจอ = ผู้ใช้กำลังจะโอนเงิน ให้เตือนสติเพิ่ม */
const RISK_KEYWORDS = [
  'โอนเงิน', 'โอนแล้ว', 'โอนไป', 'จะโอน',
  'มัดจำ', 'ค่ามัดจำ', 'เงินมัดจำ',
  'จ่ายเงิน', 'ชำระเงิน', 'พร้อมเพย์', 'promptpay',
  'transfer', 'deposit',
];

const HELP_KEYWORDS = ['ช่วยเหลือ', 'วิธีใช้', 'help', 'เมนู', 'menu', 'เริ่ม', 'start'];
const LIST_KEYWORDS = ['รายการ', 'รายชื่อ', 'ที่ยืนยันแล้ว', 'list'];

function hasRiskKeyword(text) {
  const t = String(text || '').toLowerCase();
  return RISK_KEYWORDS.some((k) => t.includes(k.toLowerCase()));
}

function isHelp(text) {
  const t = String(text || '').trim().toLowerCase();
  return HELP_KEYWORDS.includes(t);
}

function isList(text) {
  const t = String(text || '').trim().toLowerCase();
  return LIST_KEYWORDS.includes(t);
}

/** วันที่แบบไทย 13/08/2569 */
function thaiDate(iso) {
  const d = new Date(iso);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  return `${day}/${month}/${d.getFullYear() + 543}`;
}

const helpText = () =>
  [
    `🛡️ ${config.siteName} — ตรวจเลขบัญชีก่อนโอนเงิน`,
    '',
    'วิธีใช้ — วางสิ่งที่อยากเช็กเข้ามาได้เลย',
    '• เลขบัญชีที่เขาให้โอน เช่น "123-4-56789-0"',
    '• ชื่อร้าน / ที่พัก / เพจที่กำลังคุยด้วย',
    '• ชื่อบัญชีผู้รับโอน',
    '',
    '• ข้อความที่เขาชวนคุณทำงาน/ลงทุน (ก๊อปมาวางได้เลย)',
    '',
    'ใช้ได้กับทุกอย่างที่ต้องโอนเงินก่อน',
    'ที่พัก ของออนไลน์ รถเช่า ทัวร์ ตั๋ว พรีออเดอร์',
    'งานเสริม ลงทุน เงินกู้ ดรอปชิป',
    '',
    '📌 กฎข้อเดียวที่กันได้เกือบทุกแบบ',
    'งานจริงไม่เคยให้คุณโอนเงินก่อน',
    '',
    'พิมพ์ "รายการ" = ดูผู้ขายที่ยืนยันแล้วในระบบ',
    '',
    '🔒 ระบบไม่เก็บเลขบัญชีที่คุณพิมพ์เข้ามา',
    'เก็บเฉพาะรหัสเข้ารหัสทางเดียวที่ถอดกลับไม่ได้',
    'เพื่อนับว่าเลขนั้นเคยมีคนถามมาก่อนกี่ครั้ง',
    '',
    '⚠️ บอทเป็นตัวช่วยเบื้องต้น ไม่ใช่การรับประกัน',
    'การไม่พบข้อมูล ไม่ได้แปลว่าเป็นมิจฉาชีพเสมอไป',
    'และการพบข้อมูล ก็ยังต้องตรวจสอบซ้ำก่อนโอนทุกครั้ง',
  ].join('\n');

const riskWarningText = () =>
  [
    '🛑 เตือนสติก่อนโอนเงิน',
    '',
    '1. ขอวิดีโอคอลให้เห็นของจริง/ห้องจริง แบบสด ๆ',
    '2. ชื่อบัญชีต้องสอดคล้องกับชื่อร้านหรือเจ้าของ ไม่ใช่ชื่อคนแปลกหน้า',
    '3. ค้นเลขบัญชี + ชื่อ ใน Google ก่อนเสมอ',
    '4. เพจใหม่ ยอดไลก์น้อย รูปน้อย ราคาถูกผิดปกติ = เสี่ยงสูง',
    '5. เร่งให้รีบโอน "ชิ้นสุดท้าย" "ราคานี้วันนี้เท่านั้น" = สัญญาณอันตราย',
    '6. เลือกช่องทางที่มีระบบคืนเงิน หรือจ่ายปลายทาง ดีกว่าโอนตรง',
    '',
    'ถ้าโอนไปแล้วสงสัยโดนโกง แจ้งความออนไลน์ได้ที่ thaipoliceonline.go.th',
    'หรือโทรสายด่วน 1441 (แจ้งเร็วมีโอกาสอายัดบัญชีทัน)',
  ].join('\n') + inviteLine();

/** ลิงก์ค้นหาเลขบัญชีในเว็บแจ้งเตือนคนโกง — ผู้ใช้กดเดียวเห็นผลทันที */
function searchLinksText(accountNumber, accountNameGuess) {
  const q = encodeURIComponent(`"${accountNumber}" โกง OR หลอกลวง OR มิจฉาชีพ`);
  const lines = [
    '🔎 กดตรวจสอบเลขบัญชีนี้ต่อได้เลย',
    '',
    '• ค้นทั้งอินเทอร์เน็ต:',
    `https://www.google.com/search?q=${q}`,
    '',
    '• เว็บรวมรายชื่อคนโกง (ค้นด้วยเลขบัญชี):',
    'https://www.blacklistseller.com',
    '',
    '• แจ้งความ/ตรวจบัญชีม้า ระบบตำรวจ:',
    'https://www.thaipoliceonline.go.th',
  ];
  if (accountNameGuess) {
    const qn = encodeURIComponent(`"${accountNameGuess}" โกง OR หลอกลวง`);
    lines.push('', '• ค้นจากชื่อบัญชี:', `https://www.google.com/search?q=${qn}`);
  }
  return lines.join('\n');
}

/**
 * ข้อความจากความจำร่วม — บอกว่าเลขบัญชีนี้เคยมีคนถามมาก่อนไหม
 * นี่คือส่วนที่ทำให้บอทมีประโยชน์แม้ยังไม่มีผู้ขายลงทะเบียนเลยสักราย
 */
function sightingText(stat) {
  if (!stat) return '';

  if (stat.isFirstEver) {
    return [
      '🆕 ไม่เคยมีใครถามถึงเลขบัญชีนี้มาก่อน',
      '',
      'คุณเป็นคนแรกที่เอาเลขนี้มาเช็ก แปลว่าบัญชีนี้ยังไม่มีประวัติในระบบ',
      'บัญชีของร้านที่เปิดขายมานาน มักมีคนเคยถามมาก่อนแล้ว',
      'ให้ระวังเป็นพิเศษ และตรวจตามข้อด้านล่างให้ครบ',
    ].join('\n');
  }

  if (stat.burst) {
    return [
      `🚨 ผิดปกติ: เลขนี้ถูกถามถึง ${stat.count} ครั้ง ภายในไม่กี่วัน`,
      '',
      `ครั้งแรกเมื่อ ${thaiDate(stat.firstSeen)}`,
      'รูปแบบนี้มักเกิดตอนมีคนหว่านหลอกหลายคนพร้อมกัน',
      'แนะนำอย่างยิ่งว่าอย่าเพิ่งโอน',
    ].join('\n');
  }

  if (stat.longLived) {
    return [
      `📊 เลขนี้มีคนถามมาแล้ว ${stat.count} ครั้ง ครั้งแรกเมื่อ ${thaiDate(stat.firstSeen)}`,
      '',
      'มีประวัติมานาน กระจายตัว ซึ่งเป็นลักษณะของบัญชีที่ใช้จริงมานาน',
      '⚠️ แต่ยังไม่ใช่การยืนยัน — มิจฉาชีพบางรายก็ใช้บัญชีเดิมนาน',
    ].join('\n');
  }

  return [
    `📊 เลขนี้มีคนถามมาแล้ว ${stat.count} ครั้ง ครั้งแรกเมื่อ ${thaiDate(stat.firstSeen)}`,
    '',
    'ยังบอกไม่ได้ว่าปลอดภัยหรือไม่ ต้องตรวจเพิ่มตามข้อด้านล่าง',
  ].join('\n');
}

function foundText(rec) {
  const lines = [
    `✅ ตรวจสอบแล้ว ${rec.name} เป็นข้อมูลที่ยืนยันแล้ว`,
    '',
    `🏦 ธนาคาร: ${rec.bankName || '-'}`,
    `💳 เลขบัญชี: ${rec.accountNumber || '-'}`,
    `👤 ชื่อบัญชี: ${rec.accountName || '-'}`,
  ];
  if (rec.category) lines.push(`🏷️ ประเภท: ${rec.category}`);
  if (rec.facebookPage) lines.push(`📘 เพจ: ${rec.facebookPage}`);
  if (rec.phone) lines.push(`📞 โทร: ${rec.phone}`);
  if (rec.area) lines.push(`📌 พื้นที่: ${rec.area}`);
  if (rec.gps && rec.gps.lat) {
    lines.push(`📍 พิกัด: https://maps.google.com/?q=${rec.gps.lat},${rec.gps.lng}`);
  }
  if (rec.verifiedAt) lines.push('', `🗓️ ยืนยันเมื่อ ${rec.verifiedAt} โดย ${rec.verifiedBy || 'ผู้ดูแลระบบ'}`);
  lines.push('', '⚠️ ถ้าเลขบัญชีที่เขาให้ ไม่ตรงกับด้านบน อย่าโอนเด็ดขาด');
  return lines.join('\n');
}

function pendingText(rec) {
  return [
    `⏳ พบชื่อ "${rec.name}" ในระบบ แต่ยังไม่ผ่านการยืนยัน`,
    '',
    'รายการนี้เพิ่งลงทะเบียนเข้ามา ผู้ดูแลยังตรวจสอบไม่เสร็จ',
    'กรุณาอย่าใช้เป็นหลักฐานยืนยันตัวตนในการโอนเงิน',
  ].join('\n');
}

/**
 * ผู้ใช้ส่งเลขบัญชีมา แต่ไม่ตรงกับผู้ขายที่ยืนยันแล้ว
 * รวมผลจากความจำร่วมไว้ในข้อความเดียว เพราะนี่คือคำตอบหลักที่เขาต้องการ
 */
function accountUnknownText(stat) {
  return [
    sightingText(stat),
    '',
    '— — —',
    'เลขบัญชีนี้ไม่อยู่ในรายชื่อผู้ขายที่ยืนยันแล้วของระบบ',
    'ซึ่งไม่ได้แปลว่าเป็นมิจฉาชีพ ผู้ขายส่วนใหญ่ยังไม่ได้ลงทะเบียน',
    'แต่แปลว่าเรายืนยันแทนคุณไม่ได้ ต้องตรวจเองตามด้านล่าง',
  ].join('\n');
}

function notFoundText(suggestions = []) {
  const lines = [
    '⚠️ ไม่พบข้อมูลนี้ในระบบ กรุณาตรวจสอบให้ดีก่อนโอนเงิน อาจเป็นมิจฉาชีพ',
  ];
  if (suggestions.length) {
    lines.push('', 'หรือคุณหมายถึง?');
    suggestions.forEach((s) => lines.push(`• ${s.name}`));
  }
  lines.push(
    '',
    'หมายเหตุ: ระบบยังไม่มีผู้ขายครบทุกราย',
    'การไม่พบข้อมูล ไม่ได้แปลว่าเป็นมิจฉาชีพเสมอไป',
    'แต่ให้ตรวจสอบเพิ่มก่อนโอนทุกครั้ง',
    '',
    '💡 ถ้ามีเลขบัญชีที่เขาให้โอน ส่งเลขบัญชีมาด้วยจะเช็กได้ละเอียดกว่า'
  );
  return lines.join('\n');
}

function listText(records) {
  if (!records.length) return 'ยังไม่มีผู้ขายที่ยืนยันแล้วในระบบ';
  const lines = [`🛡️ ผู้ขายที่ยืนยันแล้ว ${records.length} ราย`, ''];
  records.forEach((r, i) => lines.push(`${i + 1}. ${r.name}${r.area ? ` (${r.area})` : ''}`));
  lines.push('', 'พิมพ์ชื่อที่ต้องการ เพื่อดูเลขบัญชีที่ถูกต้อง');
  return lines.join('\n');
}

const nonTextText = () =>
  'ขออภัย ตอนนี้บอทอ่านได้เฉพาะข้อความตัวอักษร\nกรุณาพิมพ์หรือวางเลขบัญชีที่จะโอน';

module.exports = {
  RISK_KEYWORDS,
  thaiDate,
  searchLinksText,
  sightingText,
  accountUnknownText,
  hasRiskKeyword,
  isHelp,
  isList,
  helpText,
  riskWarningText,
  foundText,
  pendingText,
  notFoundText,
  listText,
  nonTextText,
};
