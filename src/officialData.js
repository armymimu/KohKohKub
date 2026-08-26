/**
 * ช่องทางตรวจสอบสถานะทางการกับหน่วยงานรัฐ (Official Regulatory Direct Links)
 * ปลอดภัยทางกฎหมาย 100%: ไม่ยืนยันหรือกล่าวหาบริษัทใด แต่ส่งผู้ใช้ไปตรวจที่ฐานข้อมูลทางการแบบเรียลไทม์
 */

function getOfficialVerificationLinks(text) {
  const q = String(text || '').trim();
  const lower = q.toLowerCase();

  // ตรวจคำที่เกี่ยวข้องกับการลงทุน หุ้น คริปโต ฟอเร็กซ์ โบรกเกอร์
  const isInvestment = /ลงทุน|เทรด|หุ้น|คริปโต|crypto|forex|ฟอเร็กซ์|broker|โบรก|ปันผล|กองทุน/i.test(lower);

  // ตรวจคำที่เกี่ยวข้องกับเงินกู้ สินเชื่อ ยืมเงิน ดอกเบี้ย
  const isLoan = /กู้|สินเชื่อ|ยืมเงิน|กู้เงิน|ผ่อน|เงินด่วน/i.test(lower);

  if (!isInvestment && !isLoan) return null;

  if (isInvestment) {
    return {
      type: 'investment',
      title: '🔎 ตรวจสอบสถานะใบอนุญาตกับ ก.ล.ต.',
      description: 'เพื่อความปลอดภัยสูงสุด แนะนำให้ตรวจสอบชื่อบริษัท/โบรกเกอร์ ในระบบทางการของ ก.ล.ต. โดยตรง (ข้อมูลอัปเดตล่าสุดแบบเรียลไทม์):',
      links: [
        {
          label: '1. ตรวจค้นใบอนุญาตธุรกิจหลักทรัพย์/สินทรัพย์ดิจิทัล (ก.ล.ต.)',
          url: 'https://market.sec.or.th/LicenseCheck/Search',
        },
        {
          label: '2. รายชื่อผู้ที่มิใช่ผู้ประกอบธุรกิจภายใต้การกำกับดูแล (Investor Alert)',
          url: 'https://market.sec.or.th/public/idisc/th/InvestorAlert',
        },
      ],
      hotline: 'สายด่วน ก.ล.ต. โทร 1207',
    };
  }

  if (isLoan) {
    return {
      type: 'loan',
      title: '🔎 ตรวจสอบผู้ให้บริการสินเชื่อที่ได้รับอนุญาต (ธปท.)',
      description: 'ตรวจสอบว่าผู้ให้บริการเงินกู้/สินเชื่อนี้ ได้รับใบอนุญาตถูกต้องตามกฎหมายหรือไม่ ผ่านระบบของธนาคารแห่งประเทศไทย:',
      links: [
        {
          label: '1. ตรวจสอบใบอนุญาตสถาบันการเงินและสินเชื่อ (ระบบ ศคง. 1213)',
          url: 'https://app.bot.or.th/1213/FIPH/Collection/FIPH_LicenseCheck',
        },
        {
          label: '2. เว็บไซต์หลัก ธนาคารแห่งประเทศไทย',
          url: 'https://www.bot.or.th',
        },
      ],
      hotline: 'ศูนย์คุ้มครองผู้ใช้บริการทางการเงิน (ศคง.) ธปท. โทร 1213 (ตลอดเวลาทำการ)',
    };
  }

  return null;
}

module.exports = { getOfficialVerificationLinks };
