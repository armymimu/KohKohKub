/**
 * สมองของบอท: รับข้อความ 1 ข้อความ แล้วตัดสินใจว่าจะตอบอะไรกลับ
 *
 * แยกออกมาจาก index.js เพื่อให้ทดสอบได้โดยไม่ต้องยิงผ่าน LINE จริง
 * (ดู scripts/test-chat.js)
 */

const db = require('./db');
const { search, extractAccountNumbers } = require('./matcher');
const sightings = require('./sightings');
const msg = require('./messages');

const LINE_TEXT_LIMIT = 4900; // ลิมิตจริงคือ 5000 ตัวอักษรต่อข้อความ เผื่อไว้หน่อย

function toTextMessage(text) {
  const t = String(text);
  return { type: 'text', text: t.length > LINE_TEXT_LIMIT ? `${t.slice(0, LINE_TEXT_LIMIT)}…` : t };
}

/**
 * @param {string} userText ข้อความที่ผู้ใช้พิมพ์เข้ามา
 * @returns {Array<{type:'text', text:string}>} ข้อความที่จะตอบกลับ (สูงสุด 5 ข้อความ)
 */
function buildReply(userText) {
  const text = String(userText || '').trim();
  const replies = [];

  if (!text) return [toTextMessage(msg.helpText())];

  if (msg.isHelp(text)) return [toTextMessage(msg.helpText())];

  if (msg.isList(text)) return [toTextMessage(msg.listText(db.verified()))];

  const risky = msg.hasRiskKeyword(text);
  const result = search(db.all(), text);
  const accounts = extractAccountNumbers(text);

  // --- กรณีที่ผู้ใช้ส่งเลขบัญชีมา = เคสหลักของระบบ ---
  // ตอบด้วยของที่มีประโยชน์ทันที แม้ยังไม่มีผู้ขายลงทะเบียนแม้แต่รายเดียว
  //   1. ความจำร่วม: เลขนี้เคยมีคนถามมาก่อนไหม เมื่อไหร่ กี่ครั้ง
  //   2. ลิงก์กดค้นต่อในเว็บรวมรายชื่อคนโกง
  //   3. เช็กลิสต์เตือนสติ
  if (accounts.length) {
    const stat = sightings.record(accounts[0]);

    if (result.match && result.match.verified) {
      replies.push(toTextMessage(msg.foundText(result.match)));
      replies.push(toTextMessage(msg.sightingText(stat)));
    } else {
      replies.push(toTextMessage(msg.accountUnknownText(stat)));
    }

    replies.push(toTextMessage(msg.searchLinksText(accounts[0])));
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // --- กรณีค้นด้วยชื่อร้าน/ที่พัก ---
  if (result.match && result.match.verified) {
    replies.push(toTextMessage(msg.foundText(result.match)));
  } else if (result.match) {
    replies.push(toTextMessage(msg.pendingText(result.match)));
  } else {
    replies.push(toTextMessage(msg.notFoundText(result.suggestions)));
  }

  // เจอคำว่า "โอนเงิน" / "มัดจำ" ฯลฯ -> เด้งข้อความเตือนสติเพิ่มอีกใบ
  // และถ้าไม่เจอข้อมูลในระบบเลย ก็เตือนด้วยเสมอ เพราะเป็นเคสเสี่ยงที่สุด
  if (risky || !result.match) {
    replies.push(toTextMessage(msg.riskWarningText()));
  }

  return replies.slice(0, 5);
}

module.exports = { buildReply };
