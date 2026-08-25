/**
 * สมองของบอท: รับข้อความ 1 ข้อความ แล้วตัดสินใจว่าจะตอบอะไรกลับ
 * รองรับทั้ง LINE Flex Message (การ์ดสวยงาม) และ Text Message
 */

const db = require('./db');
const { search, extractAccountNumbers } = require('./matcher');
const sightings = require('./sightings');
const scam = require('./scampatterns');
const msg = require('./messages');
const flex = require('./flexMessages');

const LINE_TEXT_LIMIT = 4900;

function toTextMessage(text) {
  const t = String(text);
  return { type: 'text', text: t.length > LINE_TEXT_LIMIT ? `${t.slice(0, LINE_TEXT_LIMIT)}…` : t };
}

/**
 * @param {string} userText ข้อความที่ผู้ใช้พิมพ์เข้ามา
 * @returns {Array} ข้อความที่จะตอบกลับ (สูงสุด 5 ข้อความ)
 */
function buildReply(userText) {
  const text = String(userText || '').trim();
  const replies = [];

  if (!text || msg.isHelp(text)) {
    replies.push(flex.buildHelpFlex());
    replies.push(toTextMessage(msg.helpText()));
    return replies.slice(0, 5);
  }

  if (msg.isList(text)) {
    return [toTextMessage(msg.listText(db.verified()))];
  }

  const risky = msg.hasRiskKeyword(text);
  const result = search(db.all(), text);
  const accounts = extractAccountNumbers(text);

  // --- สแกมหารายได้ (งานเสริม ลงทุน เงินกู้ ดรอปชิป แชร์ลูกโซ่) ---
  const scamHit = scam.detect(text);
  if (scamHit) {
    replies.push(
      flex.buildWarningFlex(
        scamHit.label,
        'ตรวจพบรูปแบบข้อความที่มีความเสี่ยงสูง',
        scamHit.mechanic.join('\n'),
        accounts[0] || ''
      )
    );

    if (accounts.length) {
      const stat = sightings.record(accounts[0]);
      replies.push(toTextMessage(msg.sightingText(stat)));
    }

    replies.push(toTextMessage(scam.officialChecks(scamHit.type)));
    return replies.slice(0, 5);
  }

  // --- กรณีที่ผู้ใช้ส่งเลขบัญชีมา = เคสหลักของระบบ ---
  if (accounts.length) {
    const stat = sightings.record(accounts[0]);

    if (result.match && result.match.verified) {
      replies.push(flex.buildVerifiedFlex(result.match, stat));
      replies.push(toTextMessage(msg.sightingText(stat)));
    } else {
      replies.push(flex.buildCautionFlex(accounts[0], stat));
    }

    replies.push(toTextMessage(msg.searchLinksText(accounts[0])));
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // --- กรณีค้นด้วยชื่อร้าน/ที่พัก ---
  if (result.match && result.match.verified) {
    replies.push(flex.buildVerifiedFlex(result.match));
  } else if (result.match) {
    replies.push(toTextMessage(msg.pendingText(result.match)));
  } else {
    replies.push(toTextMessage(msg.notFoundText(result.suggestions)));
  }

  if (risky || !result.match) {
    replies.push(toTextMessage(msg.riskWarningText()));
  }

  return replies.slice(0, 5);
}

module.exports = { buildReply };
