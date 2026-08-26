const graph = require('../src/graph');
const { extractAllEntities } = require('../src/extractor');
const { buildReply } = require('../src/bot');

(async () => {
  console.log('--- TEST 1: วางแชทผ่าน LINE Webhook (ผูกบัญชี 111-1-11111-1 กับ LINE @badguy99) ---');
  const chat1 = 'โอนมัดจำ 111-1-11111-1 ติดต่อ line @badguy99 เบอร์ 081-222-3333';
  await buildReply(chat1, { recordGraph: true });

  console.log('\n--- TEST 2: มีผู้ส่งรายงานเข้ามา (ต้องเป็นสถานะ Pending รอแอดมินตรวจ) ---');
  const ext = extractAllEntities('line @badguy99');
  await graph.submitPendingReport(ext.allEntities.map(e => e.key), 'โอนแล้วไม่ได้ของ', 'หลอกขายของ', 'test@gmail.com', '127.0.0.1');

  const pending = await graph.getPendingReports();
  console.log(`รายการรอตรวจในคิวแอดมิน: ${pending.length} รายการ`);

  console.log('\n--- TEST 3: ก่อนแอดมินอนุมัติ — เช็คบัญชีที่เชื่อมกันจะยังไม่ติดธงแดง ---');
  const chat3 = 'สนใจโอนเข้า 222-2-22222-2 แอดไลน์ @badguy99 ได้เลยครับ';
  const repliesBefore = await buildReply(chat3, { recordGraph: true });
  for (const m of repliesBefore) {
    if (m.type === 'flex') console.log(`[FLEX การ์ด] ${m.altText}`);
    else console.log(m.text);
    console.log('---');
  }

  console.log('\n--- TEST 4: แอดมินตรวจสอบหลักฐานและกดอนุมัติรายงาน ---');
  if (pending.length > 0) {
    await graph.approveReport(pending[0].id);
    console.log('แอดมินอนุมัติรายงาน ID:', pending[0].id);
  }

  console.log('\n--- TEST 5: หลังแอดมินอนุมัติ — เช็คบัญชี 222-2-22222-2 จะขึ้นเตือนข้อพิพาทในเครือข่าย ---');
  const repliesAfter = await buildReply(chat3, { recordGraph: false });
  for (const m of repliesAfter) {
    if (m.type === 'flex') console.log(`[FLEX ALERT] ${m.altText}`);
    else console.log(m.text);
    console.log('---');
  }
})();
