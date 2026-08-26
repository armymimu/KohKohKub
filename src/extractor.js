/**
 * Universal Conversation Extractor (Privacy-First & Hashed)
 * 
 * ความเป็นส่วนตัวตาม PDPA:
 * - ทุก Entity จะถูกแฮชทางเดียวด้วย HMAC-SHA256 + Secret Salt
 * - label ที่แสดงผลจะถูกเซ็นเซอร์ (Masked) เหลือเฉพาะ 3-4 ตัวท้าย
 * - ไม่มีข้อมูลเลขบัญชีหรือเบอร์โทรจริงถูกจัดเก็บในฐานข้อมูล
 */

const crypto = require('crypto');
const { getSalt } = require('./sightings');

function cleanDigits(s) {
  return String(s || '').replace(/\D/g, '');
}

function hashEntity(type, rawVal) {
  const norm = String(rawVal || '').trim().toLowerCase();
  const hash = crypto.createHmac('sha256', getSalt()).update(`${type}:${norm}`).digest('hex').slice(0, 32);
  return `${type}:${hash}`;
}

function maskDigits(digits) {
  const d = String(digits || '');
  if (d.length <= 4) return `***${d}`;
  return `***-***-${d.slice(-4)}`;
}

function maskLine(lineId) {
  const l = String(lineId || '');
  if (l.length <= 4) return '@***';
  return `${l.slice(0, 3)}***`;
}

function maskUrl(url) {
  try {
    const u = new URL(url.startsWith('http') ? url : `https://${url}`);
    return `${u.hostname}/***`;
  } catch (e) {
    return 'link/***';
  }
}

// 1. ดึงเลขบัญชีธนาคาร (10-12 หลัก และ 8-9 หลัก)
function extractBankAccounts(text) {
  const t = String(text || '');
  const matches = [];

  const hyphenPattern = /\b\d{3}[-\s]\d{1}[-\s]\d{5}[-\s]\d{1}\b|\b\d{3}[-\s]\d{6}[-\s]\d{1}\b|\b\d{3}[-\s]\d{3}[-\s]\d{4}\b/g;
  let m;
  while ((m = hyphenPattern.exec(t)) !== null) {
    const raw = m[0];
    const digits = cleanDigits(raw);
    if (digits.length >= 8 && digits.length <= 15 && !matches.some((x) => x.digits === digits)) {
      matches.push({
        type: 'account',
        digits, // ใช้เฉพาะใน session ตอบกลับตอนนั้น ไม่บันทึกลง disk
        label: maskDigits(digits),
        key: hashEntity('account', digits),
      });
    }
  }

  const pureDigitsPattern = /(?<!\d)(\d{10,12})(?!\d)/g;
  while ((m = pureDigitsPattern.exec(t)) !== null) {
    const raw = m[1];
    if (!/^(06|08|09)\d{8}$/.test(raw)) {
      if (!matches.some((x) => x.digits === raw)) {
        matches.push({
          type: 'account',
          digits: raw,
          label: maskDigits(raw),
          key: hashEntity('account', raw),
        });
      }
    }
  }

  return matches;
}

// 2. ดึงเบอร์โทรศัพท์ (08x, 09x, 06x, 02x)
function extractPhoneNumbers(text) {
  const t = String(text || '');
  const matches = [];
  const phonePattern = /(?:โทร|เบอร์|tel|phone)?\s*(?<!\d)(0[2689]\d{1}[-\s]?\d{3}[-\s]?\d{3,4})(?!\d)/gi;
  let m;
  while ((m = phonePattern.exec(t)) !== null) {
    const raw = m[1];
    const digits = cleanDigits(raw);
    if ((digits.length === 9 || digits.length === 10) && !matches.some((x) => x.digits === digits)) {
      matches.push({
        type: 'phone',
        digits,
        label: maskDigits(digits),
        key: hashEntity('phone', digits),
      });
    }
  }
  return matches;
}

// 3. ดึง LINE ID และ ลิงก์ LINE
function extractLineIds(text) {
  const t = String(text || '');
  const matches = [];

  const linePattern = /(?:line(?:\s*id)?|ไลน์)?\s*[:=\s]?\s*(@[a-zA-Z0-9._-]+)\b|(?:line(?:\s*id)?|ไลน์)\s*[:=]\s*([a-zA-Z0-9._-]{3,30})\b/gi;
  let m;
  while ((m = linePattern.exec(t)) !== null) {
    const val = (m[1] || m[2] || '').trim().toLowerCase();
    if (val && val !== '@line' && !matches.some((x) => x.val === val)) {
      const cleanVal = val.startsWith('@') ? val : `@${val}`;
      matches.push({
        type: 'line',
        val: cleanVal,
        label: maskLine(cleanVal),
        key: hashEntity('line', cleanVal),
      });
    }
  }

  const lineUrlPattern = /line\.me\/R\/ti\/p\/([@%a-zA-Z0-9._-]+)/gi;
  while ((m = lineUrlPattern.exec(t)) !== null) {
    const id = decodeURIComponent(m[1]).toLowerCase();
    if (!matches.some((x) => x.val === id)) {
      matches.push({
        type: 'line',
        val: id,
        label: maskLine(id),
        key: hashEntity('line', id),
      });
    }
  }

  return matches;
}

// 4. ดึง URLs และ เพจ Facebook
function extractUrls(text) {
  const t = String(text || '');
  const matches = [];
  const urlPattern = /(https?:\/\/[^\s]+|facebook\.com\/[^\s]+|fb\.com\/[^\s]+|fb\.me\/[^\s]+)/gi;
  let m;
  while ((m = urlPattern.exec(t)) !== null) {
    let url = m[1].replace(/[.,;!?)]+$/, '');
    if (!matches.some((x) => x.url === url)) {
      matches.push({
        type: 'url',
        url,
        label: maskUrl(url),
        key: hashEntity('url', url.toLowerCase()),
      });
    }
  }
  return matches;
}

// 5. ดึง PromptPay (เบอร์ 10 หลัก หรือ ปชช 13 หลัก)
function extractPromptPay(text) {
  const t = String(text || '');
  const matches = [];
  const ppPattern = /(?:พร้อมเพย์|promptpay|pp)\s*[:=\s]?\s*(?<!\d)(\d{10}|\d{13}|\d{1}[-\s]\d{4}[-\s]\d{5}[-\s]\d{2}[-\s]\d{1})(?!\d)/gi;
  let m;
  while ((m = ppPattern.exec(t)) !== null) {
    const digits = cleanDigits(m[1]);
    if (!matches.some((x) => x.digits === digits)) {
      matches.push({
        type: 'promptpay',
        digits,
        label: maskDigits(digits),
        key: hashEntity('promptpay', digits),
      });
    }
  }
  return matches;
}

function extractAllEntities(text) {
  const accounts = extractBankAccounts(text);
  const phones = extractPhoneNumbers(text);
  const lines = extractLineIds(text);
  const urls = extractUrls(text);
  const promptpays = extractPromptPay(text);

  const allEntities = [
    ...accounts,
    ...phones,
    ...lines,
    ...urls,
    ...promptpays,
  ];

  return {
    rawText: text,
    accounts,
    phones,
    lines,
    urls,
    promptpays,
    allEntities,
    totalFound: allEntities.length,
  };
}

module.exports = {
  extractBankAccounts,
  extractPhoneNumbers,
  extractLineIds,
  extractUrls,
  extractPromptPay,
  extractAllEntities,
  hashEntity,
};
