/**
 * สมองของบอท: ประมวลผลทั้งบทสนทนา (Conversation Extractor + Identity Graph)
 * สามารถวิเคราะห์ได้ทั้ง: เลขบัญชี, เบอร์โทร, LINE ID, พร้อมเพย์, ลิงก์เพจ
 */

const db = require('./db');
const { search } = require('./matcher');
const sightings = require('./sightings');
const scam = require('./scampatterns');
const msg = require('./messages');
const flex = require('./flexMessages');
const { extractAllEntities } = require('./extractor');
const graph = require('./graph');

const LINE_TEXT_LIMIT = 4900;

function toTextMessage(text) {
  const t = String(text);
  return { type: 'text', text: t.length > LINE_TEXT_LIMIT ? `${t.slice(0, LINE_TEXT_LIMIT)}…` : t };
}

/**
 * @param {string} userText ข้อความที่ผู้ใช้พิมพ์เข้ามา
 * @returns {Promise<Array>} ข้อความที่จะตอบกลับ (สูงสุด 5 ข้อความ)
 */
async function buildReply(userText) {
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

  // 1. สกัดข้อมูลตัวตนทั้งหมดจากบทสนทนา (Extract All Entities)
  const extraction = extractAllEntities(text);
  const { accounts, phones, lines, urls, promptpays, allEntities } = extraction;

  // 2. บันทึกและวิเคราะห์โครงข่ายตัวตน (Identity Graph Engine)
  let network = { hasRiskPropagation: false, networkSummary: [], maxReports: 0 };
  if (allEntities.length > 0) {
    // บันทึกความเชื่อมโยง
    await graph.recordEntitiesAndEdges(allEntities);
    // สำรวจเครือข่ายความเสี่ยง
    network = await graph.inspectNetwork(allEntities.map((e) => e.key));
  }

  // 3. ตรวจจับการส่งต่อความเสี่ยงจากเครือข่าย (Risk Propagation Alert)
  if (network.hasRiskPropagation || network.maxReports > 0) {
    const summaryStr = network.networkSummary.length ? network.networkSummary.join('\n• ') : '';
    replies.push(
      flex.buildWarningFlex(
        '⚠️ ตรวจพบความเชื่อมโยงกับมิจฉาชีพ',
        `พบรายงานข้อพิพาท/แจ้งเตือนในเครือข่ายตัวตนนี้ (${network.maxReports} รายงาน)`,
        `ระบบ Identity Graph ตรวจพบว่าข้อมูลนี้เชื่อมโยงกับประวัติที่ไม่ปลอดภัย:\n• ${summaryStr}\n\n🚨 ขอแนะนำอย่างยิ่งให้ระงับการโอนเงินทันที`,
        accounts[0]?.digits || phones[0]?.digits || ''
      )
    );
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // 4. สแกมหารายได้ (งานเสริม ลงทุน เงินกู้ ดรอปชิป แชร์ลูกโซ่)
  if (scamHit) {
    replies.push(
      flex.buildWarningFlex(
        scamHit.label,
        'ตรวจพบรูปแบบข้อความที่มีความเสี่ยงสูง',
        scamHit.mechanic.join('\n'),
        accounts[0]?.digits || ''
      )
    );

    if (accounts.length) {
      const stat = sightings.record(accounts[0].digits);
      replies.push(toTextMessage(msg.sightingText(stat)));
    }

    replies.push(toTextMessage(scam.officialChecks(scamHit.type)));
    return replies.slice(0, 5);
  }

  // 5. กรณีมีเลขบัญชี หรือ พร้อมเพย์
  if (accounts.length || promptpays.length) {
    const targetAccount = accounts[0]?.digits || promptpays[0]?.digits;
    const stat = sightings.record(targetAccount);
    const result = search(db.all(), targetAccount);

    if (result.match && result.match.verified) {
      replies.push(flex.buildVerifiedFlex(result.match, stat));
      replies.push(toTextMessage(msg.sightingText(stat)));
    } else {
      replies.push(flex.buildCautionFlex(targetAccount, stat));
    }

    if (network.networkSummary.length > 0) {
      replies.push(toTextMessage(`🕸️ ข้อมูลเชื่อมโยงที่พบร่วมกัน:\n• ${network.networkSummary.join('\n• ')}`));
    }

    replies.push(toTextMessage(msg.searchLinksText(targetAccount)));
    replies.push(toTextMessage(msg.riskWarningText()));
    return replies.slice(0, 5);
  }

  // 6. กรณีค้นด้วยชื่อ หรือ เบอร์โทร
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
