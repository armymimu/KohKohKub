# 🤖 คู่มือเปิดระบบ Auto-Bot เตือนภัยลง Telegram & Twitter/X (รันอัตโนมัติ 24 ชม.)

ระบบนี้ถูกออกแบบมาเพื่อ **โปรโมตและดึงคนเข้า LINE @206jnkap ตลอด 24 ชม. โดยที่คุณไม่ต้องเปิดหน้า ไม่ต้องโพสต์มือ และไม่ต้องคุยกับใคร**

---

## 📡 1. ปล่อย Auto-Tweet ลง X (Twitter) ฟรี 100% ผ่าน RSS Feed

เราสร้าง RSS Feed อัตโนมัติไว้ที่:
👉 **`https://kohkohkub-production.up.railway.app/feed.xml`**

### วิธีตั้งค่าให้ทวีตลง Twitter อัตโนมัติใน 3 นาที:
1. สมัครเว็บ [IFTTT.com](https://ifttt.com) หรือ [Make.com](https://make.com) หรือ [Buffer.com](https://buffer.com) (ฟรี)
2. สร้าง Automation:
   * **IF (เงื่อนไข):** RSS Feed → ใส่ลิงก์ `https://kohkohkub-production.up.railway.app/feed.xml`
   * **THEN (การกระทำ):** Twitter / X → Post a tweet (เลือกเนื้อหาจาก RSS Description)
3. **ผลลัพธ์:** ทุกวันระบบจะทวีตเตือนภัยกลโกงพร้อมสถิติจริงและแฮชแท็ก ดึงคนจาก Twitter เข้า LINE และเว็บเราตลอดทั้งวัน!

---

## ✈️ 2. ปล่อย Auto-Broadcast ลง Telegram Channel / Group

ระบบมีฟังก์ชันส่งข้อความเข้าช่อง Telegram อัตโนมัติ:

### วิธีเปิดใช้งานบน Railway:
1. สร้าง Bot ใน Telegram ผ่าน [@BotFather](https://t.me/botfather) → จะได้ `TOKEN`
2. ดึง Bot เข้า Channel หรือ Group ของคุณ แล้วตั้งเป็น Admin
3. นำค่ามาใส่ใน **Railway Environment Variables**:
   * `TELEGRAM_BOT_TOKEN` = `โทเคนที่ได้จาก BotFather`
   * `TELEGRAM_CHAT_ID` = `@ชื่อแชนแนลของคุณ` (เช่น `@SafeOneAlert`)

---

## ⏰ 3. ตั้งเวลาโพสต์อัตโนมัติทุกวัน (Free Scheduled Cron)

คุณสามารถใช้บริการตั้งเวลายิงฟรี เช่น [cron-job.org](https://cron-job.org):
* **URL:** `https://kohkohkub-production.up.railway.app/api/cron/broadcast`
* **Schedule:** ทุกวันเวลา 09:00 น. และ 18:00 น.
* ระบบจะสุ่มกลโกงยอดฮิต ดึงสถิติจริงจาก PostgreSQL แล้วยิงเข้า Telegram/โซเชียลทันที!
