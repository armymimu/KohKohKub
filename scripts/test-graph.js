const graph = require('../src/graph');
const { extractAllEntities } = require('../src/extractor');
const { buildReply } = require('../src/bot');

(async () => {
  console.log('--- TEST 1: วางแชทครั้งแรก (ผูกบัญชี 111-1-11111-1 กับ LINE @badguy99) ---');
  const chat1 = 'โอนมัดจำ 111-1-11111-1 ติดต่อ line @badguy99 เบอร์ 081-222-3333';
  await buildReply(chat1);

  console.log('\n--- TEST 2: มีผู้เสียหายแจ้งรายงานว่า LINE @badguy99 หลอกลวง ---');
  const ext = extractAllEntities('line @badguy99');
  await graph.submitScamReport(ext.allEntities.map(e => e.key), 'โอนแล้วไม่ได้ของ', 'หลอกขายของ', '127.0.0.1');

  console.log('\n--- TEST 3: มิจฉาชีพเปลี่ยนไปใช้บัญชีใหม่ 222-2-22222-2 แต่ยังใช้ LINE @badguy99 เดิม ---');
  const chat3 = 'สนใจโอนเข้า 222-2-22222-2 แอดไลน์ @badguy99 ได้เลยครับ';
  const replies = await buildReply(chat3);
  for (const m of replies) {
    if (m.type === 'flex') console.log(`[FLEX ALERT] ${m.altText}`);
    else console.log(m.text);
    console.log('---');
  }
})();
