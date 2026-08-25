/**
 * ตรรกะการค้นหา/จับคู่ข้อความที่ผู้ใช้พิมพ์เข้ามา กับฐานข้อมูลที่พัก
 *
 * รองรับ 3 แบบ
 *   1. เลขบัญชีธนาคาร  เช่น "123-4-56789-0" หรือ "1234567890"
 *   2. ชื่อที่พัก        เช่น "ตาแหวนซีวิว"  (สะกดเพี้ยนนิดหน่อยก็ยังเจอ)
 *   3. ชื่อบัญชี         เช่น "นาย สมชาย เกาะล้าน"
 */

// คำที่พบบ่อยแต่ไม่ช่วยแยกแยะ ตัดทิ้งก่อนเทียบชื่อ
const NOISE_WORDS = [
  'รีสอร์ท', 'รีสอร์ต', 'รีสอร์', 'resort',
  'โฮมสเตย์', 'homestay',
  'บังกะโล', 'bungalow',
  'เกสต์เฮาส์', 'เกสเฮ้าส์', 'guesthouse', 'guest house',
  'โรงแรม', 'hotel',
  'พูลวิลล่า', 'วิลล่า', 'villa', 'pool',
  'ที่พัก', 'บ้านพัก',
  'เกาะล้าน', 'kohlarn', 'koh larn', 'kohlan',
];

/** ทำข้อความให้อยู่ในรูปมาตรฐานก่อนเทียบ */
function normalize(text, { stripNoise = false } = {}) {
  let s = String(text || '')
    .toLowerCase()
    .normalize('NFC')
    .replace(/[​-‏﻿]/g, ''); // ลบอักขระล่องหน

  if (stripNoise) {
    for (const w of NOISE_WORDS) {
      s = s.split(w).join('');
    }
  }

  // ลบทุกอย่างที่ไม่ใช่ตัวอักษรไทย/อังกฤษ/ตัวเลข
  return s.replace(/[^฀-๿a-z0-9]/g, '');
}

/** เหลือแต่ตัวเลข ใช้กับเลขบัญชี/เบอร์โทร */
function digitsOnly(text) {
  return String(text || '').replace(/\D/g, '');
}

/** ดึงกลุ่มตัวเลขยาว ๆ (>= 8 หลัก) ออกจากข้อความ = น่าจะเป็นเลขบัญชี */
function extractAccountNumbers(text) {
  const found = String(text || '').match(/[\d][\d\s\-.]{6,}[\d]/g) || [];
  return found.map(digitsOnly).filter((d) => d.length >= 8);
}

/** ความคล้ายของสองข้อความ 0..1 (Dice coefficient บน bigram) */
function similarity(a, b) {
  if (!a || !b) return 0;
  if (a === b) return 1;
  if (a.length < 2 || b.length < 2) return a === b ? 1 : 0;

  const bigrams = (s) => {
    const out = new Map();
    for (let i = 0; i < s.length - 1; i++) {
      const g = s.slice(i, i + 2);
      out.set(g, (out.get(g) || 0) + 1);
    }
    return out;
  };

  const A = bigrams(a);
  const B = bigrams(b);
  let hits = 0;
  for (const [g, countA] of A) {
    const countB = B.get(g) || 0;
    hits += Math.min(countA, countB);
  }
  return (2 * hits) / (a.length - 1 + (b.length - 1));
}

/** คะแนนความตรงของชื่อ: เท่ากันเป๊ะ > อันหนึ่งอยู่ในอีกอัน > คล้ายกัน */
function nameScore(query, candidate) {
  const q = normalize(query);
  const c = normalize(candidate);
  if (!q || !c) return 0;
  if (q === c) return 1;
  if (q.length >= 4 && (c.includes(q) || q.includes(c))) return 0.9;

  const qs = normalize(query, { stripNoise: true });
  const cs = normalize(candidate, { stripNoise: true });
  if (qs && cs) {
    if (qs === cs) return 0.95;
    if (qs.length >= 4 && (cs.includes(qs) || qs.includes(cs))) return 0.85;
  }

  return Math.max(similarity(q, c), similarity(qs, cs));
}

const MATCH_THRESHOLD = 0.62;     // ถือว่า "เจอ"
const SUGGEST_THRESHOLD = 0.42;   // ถือว่า "ใกล้เคียง อาจหมายถึง..."

/**
 * ค้นหาที่พักจากข้อความผู้ใช้
 * @returns {{ kind: 'account'|'name'|'none', match: object|null, score: number, suggestions: object[] }}
 */
function search(records, text) {
  const query = String(text || '').trim();
  if (!query) return { kind: 'none', match: null, score: 0, suggestions: [] };

  // --- 1) ลองจับเลขบัญชีก่อน เพราะแม่นที่สุด ---
  const typedNumbers = extractAccountNumbers(query);
  for (const typed of typedNumbers) {
    for (const rec of records) {
      const recAccount = digitsOnly(rec.accountNumber);
      if (!recAccount) continue;
      if (recAccount === typed || recAccount.includes(typed) || typed.includes(recAccount)) {
        return { kind: 'account', match: rec, score: 1, suggestions: [] };
      }
    }
  }

  // --- 2) เทียบชื่อที่พัก / ชื่อเล่น / ชื่อบัญชี / เพจ ---
  const scored = records
    .map((rec) => {
      const candidates = [rec.name, ...(rec.aliases || []), rec.accountName, rec.facebookPage];
      const score = Math.max(...candidates.map((c) => nameScore(query, c)));
      return { rec, score };
    })
    .sort((a, b) => b.score - a.score);

  const best = scored[0];

  if (best && best.score >= MATCH_THRESHOLD) {
    return { kind: 'name', match: best.rec, score: best.score, suggestions: [] };
  }

  const suggestions = scored
    .filter((s) => s.score >= SUGGEST_THRESHOLD)
    .slice(0, 3)
    .map((s) => s.rec);

  return {
    kind: 'none',
    match: null,
    score: best ? best.score : 0,
    // ถ้าผู้ใช้พิมพ์เลขบัญชีมาแล้วไม่เจอ อย่าเดาชื่อให้ เดี๋ยวเข้าใจผิด
    suggestions: typedNumbers.length ? [] : suggestions,
  };
}

module.exports = {
  normalize,
  digitsOnly,
  extractAccountNumbers,
  similarity,
  nameScore,
  search,
  MATCH_THRESHOLD,
};
