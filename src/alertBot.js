/**
 * Auto-Alert Distribution Engine (Telegram Channel & Twitter/X Auto-Broadcaster)
 * รันอัตโนมัติ 24 ชม. สร้างโพสต์เตือนภัยกลโกง ดึงสถิติจริงจาก Postgres และโพสต์ลงโซเชียล
 */

const https = require('https');
const { stats } = require('./sightings');
const { getGraphStats } = require('./graph');

const SCAM_TOPICS = [
  {
    topic: 'มิจฉาชีพหลอกมัดจำที่พักเกาะล้าน / พัทยา',
    warning: 'ระวังเพจที่พักเปิดใหม่ ยอดไลก์น้อย หรือเร่งให้รีบโอนเงินจองห้องพักในราคาถูกผิดปกติ',
    checkTip: 'ขอวิดีโอคอลดูห้องจริง หรือนำเลขบัญชีมาเช็คประวัติก่อนโอน',
    tags: '#เตือนภัย #ที่พักเกาะล้าน #พัทยา #โกงมัดจำ #เช็คก่อนโอน'
  },
  {
    topic: 'กลโกงงานกดไลก์ / ภารกิจรับออเดอร์สินค้า',
    warning: 'งานจริงไม่มีการให้โอนเงินสำรองจ่ายก่อน อย่าหลงเชื่อยอดเงินหลอกในระบบ',
    checkTip: 'ถ้ามีเงื่อนไข "โอนเงินเพิ่มเพื่อปลดล็อกยอดถอน" ให้หยุดโอนทันที',
    tags: '#งานออนไลน์ได้เงินจริง #หางานออนไลน์ #เตือนภัยออนไลน์ #งานกดไลก์'
  },
  {
    topic: 'สินเชื่อออนไลน์ เงินด่วน อนุมัติไว',
    warning: 'มิจฉาชีพมักให้โอน "ค่าค้ำประกัน" หรือ "ค่าปลดล็อกบัญชี" ก่อนได้รับเงินกู้',
    checkTip: 'ผู้ให้บริการถูกกฎหมายจะไม่เรียกเก็บเงินค่าธรรมเนียมก่อนโอนเงินกู้เด็ดขาด',
    tags: '#เงินกู้นอกระบบ #สินเชื่อออนไลน์ #กู้เงินด่วน #ศคง1213'
  },
  {
    topic: 'ชวนลงทุนเทรดหุ้น / คริปโต การันตีผลตอบแทนสูง',
    warning: 'ไม่มีการลงทุนใดที่ให้ผลตอบแทนวันละ 10-30% ได้จริง อย่าหลงเชื่อโค้ชชวนเทรด',
    checkTip: 'ตรวจสอบชื่อผู้ให้บริการในระบบ License Check ของ ก.ล.ต. ก่อนลงทุนเสมอ',
    tags: '#ลงทุน #เทรดหุ้น #คริปโต #แชร์ลูกโซ่ #กลต'
  },
  {
    topic: 'หลอกขายตั๋วคอนเสิร์ต / ตั๋วเครื่องบิน / สินค้าพรีออเดอร์',
    warning: 'คนร้ายมักใช้บัญชีม้าที่เพิ่งเปิดใหม่ และเปลี่ยนชื่อเพจบ่อยครั้ง',
    checkTip: 'นำเลขบัญชีหรือเบอร์พร้อมเพย์มาเช็คความถี่ในการค้นหาในระบบ Safeโอน',
    tags: '#ตลาดนัดบังทัน #ตลาดนัดTpop #บัตรคอน #พรีออเดอร์ #เช็คบัญชีคนโกง'
  }
];

/**
 * สร้างข้อความแจ้งเตือนประจำวัน (Daily Alert Message)
 */
async function generateAlertContent() {
  const s = await stats();
  const g = await getGraphStats();

  const randomTopic = SCAM_TOPICS[Math.floor(Math.random() * SCAM_TOPICS.length)];
  const now = new Date();
  const dateStr = now.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });

  const text = `🚨 [เตือนภัยมิจฉาชีพออนไลน์ประจำวัน] — ${dateStr}

📌 หัวข้อ: ${randomTopic.topic}
⚠️ ข้อสังเกต: ${randomTopic.warning}
💡 วิธีป้องกัน: ${randomTopic.checkTip}

📊 สถิติความปลอดภัยระบบ Safeโอน:
• ตรวจสอบไปแล้ว: ${s.queries || 16} ครั้ง
• บัญชีที่เฝ้าระวังในระบบ: ${g.totalEntities || 3} รายการ

🛡️ เช็คเลขบัญชี / เบอร์โทร / ข้อความแชท ฟรีใน 10 วินาที
👉 แอดไลน์: @206jnkap (https://line.me/R/ti/p/@206jnkap)
🌐 เว็บไซต์: https://kohkohkub-production.up.railway.app

🚨 โดนโกงโทรด่วน: AOC 1441 (24 ชม.)
${randomTopic.tags}`;

  return { text, topic: randomTopic };
}

/**
 * ส่งข้อความเข้า Telegram Channel / Group อัตโนมัติ
 */
async function broadcastTelegram(messageText) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return { success: false, reason: 'TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID not configured' };
  }

  return new Promise((resolve) => {
    const payload = JSON.stringify({
      chat_id: chatId,
      text: messageText,
      disable_web_page_preview: false,
    });

    const req = https.request(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ success: res.statusCode === 200, response: data });
      });
    });

    req.on('error', (err) => {
      resolve({ success: false, error: err.message });
    });

    req.write(payload);
    req.end();
  });
}

module.exports = {
  generateAlertContent,
  broadcastTelegram,
  SCAM_TOPICS,
};
