/**
 * ทดสอบคำตอบของบอทในเครื่อง โดยไม่ต้องต่อ LINE
 *
 *   node scripts/test-chat.js                 <- รันชุดทดสอบมาตรฐาน
 *   node scripts/test-chat.js "ตาแหวนซีวิว"   <- ทดสอบข้อความเดียว
 */

const { buildReply } = require('../src/bot');

const samples = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'ตาแหวนซีวิว',
      'ตาแหวน ซีวิว รีสอร์ท',
      'tawaen seaview',
      '123-4-56789-0',
      '1234567890',
      'จะโอนมัดจำให้ 999-9-99999-9 ชื่อ นายมิจฉาชีพ',
      'รีสอร์ทลุงโกงแน่นอน',
      'รายการ',
      'ช่วยเหลือ',
    ];

for (const text of samples) {
  console.log('\n' + '='.repeat(60));
  console.log('ผู้ใช้พิมพ์: ' + text);
  console.log('-'.repeat(60));
  for (const m of buildReply(text)) {
    console.log(m.text);
    console.log('---');
  }
}
