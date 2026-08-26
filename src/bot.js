/**
 * สมองของบอท: ประมวลผลบทสนทนา (Conversation Extractor + Identity Graph)
 * ใช้ถ้อยคำที่เป็นกลาง ไม่ยืนยันข้อเท็จจริงแทนศาลหรือตำรวจ เพื่อความปลอดภัยทางกฎหมาย
 */

const db = require('./db');
const { search } = require('./matcher');
const sightings = require('./sightings');
const scam = require('./scampatterns');
const msg = require('./messages');
const flex = require('./flexMessages');
const { extractAllEntities } = require('./extractor');
const graph = require('./graph');
const { getOfficialVerificationLinks } = require('./officialData');

const LINE_TEXT_LIMIT = 4900;

function toTextMessage(text) {
  const t = String(text);
  return { type: 'text', text: t.length > LINE_TEXT_LIMIT ? `${t.slice(0, LINE_TEXT_LIMIT)}…` : t };
}

/**
 * @param {string} userText ข้อความที่ผู้ใช้พิมพ์เข้ามา
 * @param {object} options ตัวเลือกการประมวลผล เช่น { recordGraph: true }
 * @returns {Promise<Array>} ข้อความที่จะตอบกลับ (สูงสุด 5 ข้อความ)
 */
async function buildReply(userText, options = { recordGraph: true }) {
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
  const scamHit = scam.detect(text);

  // 1. สกัดข้อมูลตัวตนที่ถูก Mask และ Hash แล้ว
  const extraction = extractAllEntities(text);
  const { accounts, phones, lines, urls, promptpays, allEntities } = extraction;

  // 2. วิเคราะห์โครงข่ายตัวตน (Identity Graph Engine)
  let network = { directEntities: [], connectedEntities: [], verifiedReports: 0, pendingReports: 0, networkSummary: [] };
  if (allEntities.length > 0) {
    if (options.recordGraph) {
      await graph.recordEntitiesAndEdges(allEntities);
    }
    network = await graph.inspectNetwork(allEntities.map((e) => e.key));
  }

  // 3. กรณีมีรายงานข้อพิพาทที่ผ่านการตรวจสอบแล้ว (Verified Dispute Reports)
  if (network.verifiedReports > 0) {
    const summaryStr = network.networkSummary.length ? `\n• ${network.networkSummary.join('\n• ')}` : '';
    replies.push(
      flex.buildWarningFlex(
        '⚠️ มีประวัติข้อพิพาทในระบบ',
        `พบรายงานข้อพิพาทที่ได้รับการยืนยัน ${network.verifiedReports} รายการ`,
        `ระบบตรวจพบว่าข้อมูลนี้เชื่อมโยงกับรายการที่มีผู้แจ้งความเสียหาย:${summaryStr}\n\n⚠️ โปรดตรวจสอบหลักฐานและความถูกต้องอย่างละเอียดก่อนทำธุรกรรม`,
        accounts[0]?.digits || phones[0]?.digits || ''
      )
    );
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // กรณีมีรายงานที่อยู่ระหว่างตรวจสอบ (Pending Reports)
  if (network.pendingReports > 0) {
    replies.push(
      toTextMessage(
        `ℹ️ แจ้งเตือน: ข้อมูลนี้มีผู้ส่งเรื่องร้องเรียนเข้ามา ${network.pendingReports} รายการ (อยู่ระหว่างตรวจสอบข้อเท็จจริง — ยังไม่ใช่ข้อยุติ)\nโปรดใช้ความระมัดระวังในการโอนเงิน`
      )
    );
  }

  // 4. สแกมหารายได้ (งานเสริม ลงทุน เงินกู้ ดรอปชิป แชร์ลูกโซ่)
  if (scamHit) {
    replies.push(
      flex.buildWarningFlex(
        scamHit.label,
        'ข้อความมีลักษณะตรงกับรูปแบบที่มีความเสี่ยง',
        scamHit.mechanic.join('\n'),
        accounts[0]?.digits || ''
      )
    );

    if (accounts.length && options.recordGraph) {
      const stat = sightings.record(accounts[0].digits);
      replies.push(toTextMessage(msg.sightingText(stat)));
    }

    replies.push(toTextMessage(scam.officialChecks(scamHit.type)));
    return replies.slice(0, 5);
  }

  // 5. กรณีมีเลขบัญชี หรือ พร้อมเพย์
  if (accounts.length || promptpays.length) {
    const targetAccount = accounts[0]?.digits || promptpays[0]?.digits;
    const stat = options.recordGraph ? sightings.record(targetAccount) : null;
    const result = search(db.all(), targetAccount);

    if (result.match && result.match.verified) {
      replies.push(flex.buildVerifiedFlex(result.match, stat));
      if (stat) replies.push(toTextMessage(msg.sightingText(stat)));
    } else {
      replies.push(flex.buildCautionFlex(targetAccount, stat));
    }

    if (network.networkSummary.length > 0) {
      replies.push(toTextMessage(`ℹ️ ความเชื่อมโยงในระบบความจำ:\n• ${network.networkSummary.join('\n• ')}`));
    }

    replies.push(toTextMessage(msg.searchLinksText(targetAccount)));
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // 6. ลิงก์ตรวจสอบทางการกับ ก.ล.ต. / ธปท. (Official Regulatory Direct Links)
  const official = getOfficialVerificationLinks(text);
  if (official) {
    const linkLines = official.links.map((l) => `• ${l.label}:\n${l.url}`).join('\n\n');
    replies.push(
      toTextMessage(
        `${official.title}\n\n${official.description}\n\n${linkLines}\n\n📞 ${official.hotline}`
      )
    );
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // 7. กรณีค้นด้วยชื่อ หรือ เบอร์โทร
  const result = search(db.all(), text);
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
