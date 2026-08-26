/**
 * ฐานข้อมูลทางการจากหน่วยงานรัฐ (Official Regulatory Datasets)
 * 1. ก.ล.ต. (SEC Investor Alert & SEC Licensed Entities)
 * 2. ธปท. (Bank of Thailand Licensed Lenders & Non-banks)
 */

const SEC_INVESTOR_ALERTS = [
  { name: 'FX Trading Corp', alias: ['fxtrading', 'fx trading'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับอนุญาตให้ประกอบธุรกิจหลักทรัพย์/สินทรัพย์ดิจิทัล' },
  { name: 'Mining City', alias: ['miningcity', 'mining city'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับอนุญาตให้ประกอบธุรกิจสินทรัพย์ดิจิทัล' },
  { name: 'OmegaPro', alias: ['omegapro', 'omega pro'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับอนุญาตให้ประกอบธุรกิจหลักทรัพย์/ฟอเร็กซ์' },
  { name: 'OctaFX', alias: ['octafx', 'octa fx'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่มีใบอนุญาตประกอบธุรกิจนายหน้าซื้อขายหลักทรัพย์หรืออนุพันธ์ในไทย' },
  { name: 'IQ Option', alias: ['iqoption', 'iq option'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์ในประเทศไทย' },
  { name: 'Olymp Trade', alias: ['olymptrade', 'olymp trade'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจจาก ก.ล.ต.' },
  { name: 'eToro', alias: ['etoro'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์ในประเทศไทย' },
  { name: 'ExpertOption', alias: ['expertoption', 'expert option'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจจาก ก.ล.ต.' },
  { name: 'FBS', alias: ['fbs market', 'fbs'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์ในประเทศไทย' },
  { name: 'Exness', alias: ['exness'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์ในประเทศไทย' },
  { name: 'XM Global', alias: ['xm', 'xm broker', 'xm global'], type: 'alert', note: 'ก.ล.ต. แจ้งเตือน: ไม่ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์ในประเทศไทย' },
];

const SEC_LICENSED_ENTITIES = [
  { name: 'Bitkub Online (บิทคับ)', alias: ['bitkub', 'บิทคับ', 'บริษัท บิทคับ ออนไลน์ จำกัด'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ได้รับใบอนุญาตศูนย์ซื้อขายสินทรัพย์ดิจิทัล (Digital Asset Exchange) จาก ก.ล.ต.' },
  { name: 'InnovestX (อินโนเวสท์ เอกซ์)', alias: ['innovestx', 'scbs', 'อินโนเวสท์'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ได้รับใบอนุญาตประกอบธุรกิจหลักทรัพย์และสินทรัพย์ดิจิทัลถูกต้องจาก ก.ล.ต.' },
  { name: 'Zipmex', alias: ['zipmex', 'ซิปเม็กซ์'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ผู้ประกอบธุรกิจสินทรัพย์ดิจิทัล (โปรดตรวจสอบสถานะการเปิดบริการล่าสุดที่ sec.or.th)' },
  { name: 'Orbix Trade (ออร์บิกซ์)', alias: ['orbix', 'satang pro', 'สตางค์โปร'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ได้รับใบอนุญาตศูนย์ซื้อขายสินทรัพย์ดิจิทัลจาก ก.ล.ต.' },
  { name: 'Binance TH (กัลฟ์ ไบแนนซ์)', alias: ['binance th', 'gulf binance', 'ไบแนนซ์ ทีเอช'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ได้รับใบอนุญาตศูนย์ซื้อขายและนายหน้าสินทรัพย์ดิจิทัลจาก ก.ล.ต.' },
  { name: 'Upbit Thailand (อัพบิต)', alias: ['upbit', 'อัพบิต'], type: 'licensed', authority: 'ก.ล.ต.', note: 'ได้รับใบอนุญาตศูนย์ซื้อขายสินทรัพย์ดิจิทัลจาก ก.ล.ต.' },
];

const BOT_LICENSED_LENDERS = [
  { name: 'เงินติดล้อ (TIDLOR)', alias: ['เงินติดล้อ', 'tidlor', 'ติดล้อ'], type: 'licensed', authority: 'ธปท.', note: 'ผู้ให้บริการสินเชื่อที่ได้รับอนุญาตภายใต้การกำกับของธนาคารแห่งประเทศไทย (ธปท.)' },
  { name: 'เมืองไทย แคปปิตอล (MTC)', alias: ['เมืองไทยแคปปิตอล', 'mtc', 'เมืองไทย แคปปิตอล'], type: 'licensed', authority: 'ธปท.', note: 'ผู้ให้บริการสินเชื่อที่ได้รับอนุญาตภายใต้การกำกับของธนาคารแห่งประเทศไทย' },
  { name: 'ศรีสวัสดิ์ (SAWAD)', alias: ['ศรีสวัสดิ์', 'sawad', 'ศรีสวัสดิ์ เงินสดทันใจ'], type: 'licensed', authority: 'ธปท.', note: 'ผู้ให้บริการสินเชื่อที่ได้รับอนุญาตภายใต้การกำกับของธนาคารแห่งประเทศไทย' },
  { name: 'อิออน (AEON Thana Sinsap)', alias: ['aeon', 'อิออน', 'บัตรอิออน'], type: 'licensed', authority: 'ธปท.', note: 'สถาบันการเงิน/สินเชื่อส่วนบุคคลที่ได้รับอนุญาตจากกระทรวงการคลังและ ธปท.' },
  { name: 'อีซี่บาย (Umay+ / EASY BUY)', alias: ['umay', 'umay+', 'ยูเมะพลัส', 'easy buy', 'อีซี่บาย'], type: 'licensed', authority: 'ธปท.', note: 'ผู้ให้บริการสินเชื่อส่วนบุคคลที่ได้รับอนุญาตถูกต้องตามกฎหมาย' },
  { name: 'พรอมิส (Promise)', alias: ['promise', 'พรอมิส'], type: 'licensed', authority: 'ธปท.', note: 'ผู้ให้บริการสินเชื่อส่วนบุคคลที่ได้รับอนุญาตภายใต้การกำกับของ ธปท.' },
  { name: 'ไลน์ บีเค (LINE BK)', alias: ['line bk', 'ไลน์บีเค', 'ไลน์ บีเค'], type: 'licensed', authority: 'ธปท.', note: 'บริการสินเชื่อดิจิทัลภายใต้ความร่วมมือของธนาคารกสิกรไทย ได้รับอนุญาตจาก ธปท.' },
  { name: 'มันนี่ฮับ (Money Hub)', alias: ['money hub', 'มันนี่ฮับ', 'moneyhub'], type: 'licensed', authority: 'ธปท.', note: 'สินเชื่อส่วนบุคคลดิจิทัลที่ได้รับใบอนุญาตจากกระทรวงการคลังและ ธปท.' },
  { name: 'ฟินนิกซ์ (FINNIX)', alias: ['finnix', 'ฟินนิกซ์'], type: 'licensed', authority: 'ธปท.', note: 'แอปสินเชื่อดิจิทัลโดย บจก. มันนิกซ์ (SCBX) ได้รับอนุญาตจาก ธปท.' },
];

function findOfficialRecord(queryText) {
  const q = String(queryText || '').toLowerCase().trim();
  if (q.length < 2) return null;

  // 1. ตรวจรายชื่อเตือนภัย ก.ล.ต. (Investor Alert)
  for (const item of SEC_INVESTOR_ALERTS) {
    if (q.includes(item.name.toLowerCase()) || item.alias.some(a => q.includes(a.toLowerCase()))) {
      return {
        matched: true,
        type: 'alert',
        name: item.name,
        badge: '🚨 แจ้งเตือนจาก ก.ล.ต.',
        note: item.note,
        officialUrl: 'https://market.sec.or.th/public/idisc/th/InvestorAlert',
        source: 'สำนักงานคณะกรรมการกำกับหลักทรัพย์และตลาดหลักทรัพย์ (ก.ล.ต.)',
      };
    }
  }

  // 2. ตรวจรายชื่อผู้ได้รับใบอนุญาต ก.ล.ต. (SEC Licensed)
  for (const item of SEC_LICENSED_ENTITIES) {
    if (q.includes(item.name.toLowerCase()) || item.alias.some(a => q.includes(a.toLowerCase()))) {
      return {
        matched: true,
        type: 'licensed',
        name: item.name,
        badge: '✅ ได้รับใบอนุญาตจาก ก.ล.ต.',
        note: item.note,
        officialUrl: 'https://market.sec.or.th/public/idisc/th/FinancialFirm',
        source: 'สำนักงาน ก.ล.ต.',
      };
    }
  }

  // 3. ตรวจรายชื่อสินเชื่อที่ได้รับอนุญาต ธปท. (BOT Licensed)
  for (const item of BOT_LICENSED_LENDERS) {
    if (q.includes(item.name.toLowerCase()) || item.alias.some(a => q.includes(a.toLowerCase()))) {
      return {
        matched: true,
        type: 'licensed',
        name: item.name,
        badge: '✅ ได้รับใบอนุญาตจาก ธปท.',
        note: item.note,
        officialUrl: 'https://www.bot.or.th/th/our-roles/financial-institutions/check-license.html',
        source: 'ธนาคารแห่งประเทศไทย (ธปท.)',
      };
    }
  }

  return null;
}

module.exports = {
  findOfficialRecord,
  SEC_INVESTOR_ALERTS,
  SEC_LICENSED_ENTITIES,
  BOT_LICENSED_LENDERS,
};
