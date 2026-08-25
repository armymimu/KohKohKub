/**
 * รับข้อความเดียวจาก argument แล้วพิมพ์คำตอบของบอทออกมา
 * ใช้โดย tools/test.ps1 (ไฟล์ 4-TEST-BOT.bat)
 *
 *   node scripts/reply.js "ตาแหวนซีวิว"
 */

const { buildReply } = require('../src/bot');

const text = process.argv.slice(2).join(' ');
const messages = buildReply(text);

messages.forEach((m, i) => {
  if (i > 0) console.log('');
  console.log(m.text);
});
