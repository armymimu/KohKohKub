/**
 * LINE Flex Message Builder (Professional & Legally Safe)
 */

const config = require('./config');

function getShareUrl(text) {
  const base = config.baseUrl || 'https://kohkohkub-production.up.railway.app';
  const shareText = `${text}\n👉 ตรวจสอบข้อมูลก่อนโอนได้ที่ ${base}`;
  return `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
}

/**
 * การ์ดสีเขียว: ยืนยันแล้วในระบบ (Verified)
 */
function buildVerifiedFlex(rec, stat) {
  const contents = [
    {
      type: 'text',
      text: rec.name,
      weight: 'bold',
      size: 'xl',
      wrap: true,
      color: '#1e293b',
    },
  ];

  if (rec.category || rec.area) {
    contents.push({
      type: 'text',
      text: `📍 ${rec.area || ''} ${rec.category ? `• ${rec.category}` : ''}`.trim(),
      size: 'xs',
      color: '#64748b',
      margin: 'xs',
    });
  }

  contents.push({ type: 'separator', margin: 'md' });

  contents.push({
    type: 'box',
    layout: 'vertical',
    margin: 'md',
    spacing: 'sm',
    contents: [
      {
        type: 'box',
        layout: 'baseline',
        contents: [
          { type: 'text', text: 'ธนาคาร', size: 'sm', color: '#64748b', flex: 2 },
          { type: 'text', text: rec.bankName || '-', size: 'sm', color: '#0f172a', weight: 'bold', flex: 4 },
        ],
      },
      {
        type: 'box',
        layout: 'baseline',
        contents: [
          { type: 'text', text: 'เลขบัญชี', size: 'sm', color: '#64748b', flex: 2 },
          { type: 'text', text: rec.accountNumber || '-', size: 'sm', color: '#059669', weight: 'bold', flex: 4 },
        ],
      },
      {
        type: 'box',
        layout: 'baseline',
        contents: [
          { type: 'text', text: 'ชื่อบัญชี', size: 'sm', color: '#64748b', flex: 2 },
          { type: 'text', text: rec.accountName || '-', size: 'sm', color: '#0f172a', weight: 'bold', flex: 4 },
        ],
      },
    ],
  });

  if (rec.phone) {
    contents.push({
      type: 'box',
      layout: 'baseline',
      margin: 'sm',
      contents: [
        { type: 'text', text: 'เบอร์ติดต่อ', size: 'sm', color: '#64748b', flex: 2 },
        { type: 'text', text: rec.phone, size: 'sm', color: '#0284c7', weight: 'bold', flex: 4 },
      ],
    });
  }

  contents.push({
    type: 'text',
    text: '⚠️ ตรวจสอบชื่อและเลขบัญชีให้ตรงกันทุกตัวอักษร หากไม่ตรงอย่าโอนเด็ดขาด',
    size: 'xxs',
    color: '#dc2626',
    wrap: true,
    margin: 'md',
  });

  const buttons = [];
  if (rec.phone) {
    buttons.push({
      type: 'button',
      style: 'secondary',
      height: 'sm',
      action: {
        type: 'uri',
        label: `📞 โทร ${rec.phone}`,
        uri: `tel:${rec.phone.replace(/[^0-9]/g, '')}`,
      },
    });
  }

  buttons.push({
    type: 'button',
    style: 'primary',
    color: '#059669',
    height: 'sm',
    action: {
      type: 'uri',
      label: '📤 แชร์ผลตรวจให้เพื่อน',
      uri: getShareUrl(`✅ ตรวจสอบแล้ว ${rec.name} บัญชีถูกต้อง: ${rec.accountNumber} (${rec.accountName})`),
    },
  });

  return {
    type: 'flex',
    altText: `✅ ตรวจสอบแล้ว: ${rec.name} เป็นข้อมูลที่ยืนยันแล้ว`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#059669',
        paddingTop: '14px',
        paddingBottom: '14px',
        contents: [
          {
            type: 'text',
            text: '✅ ผ่านการยืนยันข้อมูลแล้ว',
            weight: 'bold',
            color: '#ffffff',
            size: 'md',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        contents: contents,
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'xs',
        contents: buttons,
      },
    },
  };
}

/**
 * การ์ดสีแดง/ส้ม: แจ้งเตือนข้อควรระวัง / ข้อพิพาท / รูปแบบที่มีความเสี่ยง
 */
function buildWarningFlex(title, subtitle, detailsText, account = '') {
  const shareText = account
    ? `⚠️ โปรดระวัง! พบข้อควรระวังสำหรับข้อมูล ${account}`
    : `⚠️ ข้อควรระวังก่อนโอนเงิน: ${title}`;

  return {
    type: 'flex',
    altText: `⚠️ ข้อควรระวัง: ${title}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#dc2626',
        paddingTop: '14px',
        paddingBottom: '14px',
        contents: [
          {
            type: 'text',
            text: '🛑 ข้อควรระวัง / สัญญาณความเสี่ยง',
            weight: 'bold',
            color: '#ffffff',
            size: 'sm',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: title,
            weight: 'bold',
            size: 'lg',
            wrap: true,
            color: '#991b1b',
          },
          {
            type: 'text',
            text: subtitle,
            size: 'xs',
            color: '#64748b',
            wrap: true,
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'text',
            text: detailsText,
            size: 'xs',
            wrap: true,
            color: '#334155',
            margin: 'md',
          },
          {
            type: 'box',
            layout: 'vertical',
            backgroundColor: '#fee2e2',
            cornerRadius: '8px',
            paddingAll: '10px',
            margin: 'md',
            contents: [
              {
                type: 'text',
                text: '💡 แนะนำ: อย่าเพิ่งโอนเงิน ตรวจสอบชื่อ-สกุล และค้นหาใน Google เพิ่มเติม',
                size: 'xxs',
                color: '#b91c1c',
                wrap: true,
              },
            ],
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#dc2626',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📤 ส่งต่อให้เพื่อนช่วยดู',
              uri: getShareUrl(shareText),
            },
          },
        ],
      },
    },
  };
}

/**
 * การ์ดสีส้ม: ไม่พบในรายชื่อยืนยัน (Unknown / Caution)
 */
function buildCautionFlex(account, stat) {
  let statSummary = 'คุณเป็นคนแรกที่นำเลขนี้มาตรวจสอบ (ยังไม่มีประวัติในระบบ)';
  if (stat && stat.count > 1) {
    statSummary = `เคยมีผู้สอบถามข้อมูลนี้แล้ว ${stat.count} ครั้ง`;
  }

  const q = encodeURIComponent(`"${account}" โกง OR หลอกลวง`);
  const googleUrl = `https://www.google.com/search?q=${q}`;

  return {
    type: 'flex',
    altText: `ℹ️ ผลการตรวจเลขบัญชี ${account}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#d97706',
        paddingTop: '14px',
        paddingBottom: '14px',
        contents: [
          {
            type: 'text',
            text: '⚠️ ไม่อยู่ในรายชื่อผู้ขายยืนยัน',
            weight: 'bold',
            color: '#ffffff',
            size: 'md',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'text',
            text: `💳 เลขบัญชี: ${account}`,
            weight: 'bold',
            size: 'md',
            color: '#1e293b',
          },
          {
            type: 'text',
            text: `📊 สถิติ: ${statSummary}`,
            size: 'xs',
            color: '#475569',
            wrap: true,
          },
          { type: 'separator', margin: 'md' },
          {
            type: 'text',
            text: '📌 3 สิ่งที่ควรทำก่อนโอน:\n1. ขอวิดีโอคอลดูสถานที่หรือสินค้าจริง\n2. ชื่อบัญชีต้องตรงกับชื่อเจ้าของ/ร้าน\n3. ค้นประวัติใน Google ด้านล่าง',
            size: 'xs',
            wrap: true,
            color: '#334155',
            margin: 'md',
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'secondary',
            height: 'sm',
            action: {
              type: 'uri',
              label: '🔎 ค้นประวัติใน Google',
              uri: googleUrl,
            },
          },
          {
            type: 'button',
            style: 'primary',
            color: '#d97706',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📤 ส่งต่อให้เพื่อนช่วยดู',
              uri: getShareUrl(`⚠️ ช่วยดูเลขบัญชีนี้หน่อย ${account}`),
            },
          },
        ],
      },
    },
  };
}

/**
 * การ์ดแนะนำการใช้งาน (Help / Welcome)
 */
function buildHelpFlex() {
  return {
    type: 'flex',
    altText: `🛡️ วิธีใช้งาน ${config.siteName}`,
    contents: {
      type: 'bubble',
      size: 'mega',
      header: {
        type: 'box',
        layout: 'vertical',
        backgroundColor: '#0d9488',
        paddingTop: '16px',
        paddingBottom: '16px',
        contents: [
          {
            type: 'text',
            text: `🛡️ ${config.siteName}`,
            weight: 'bold',
            color: '#ffffff',
            size: 'lg',
          },
          {
            type: 'text',
            text: 'ระบบช่วยตรวจสอบความปลอดภัยก่อนโอนเงิน',
            size: 'xs',
            color: '#ccfbf1',
          },
        ],
      },
      body: {
        type: 'box',
        layout: 'vertical',
        spacing: 'md',
        contents: [
          {
            type: 'text',
            text: 'พิมพ์หรือวางข้อมูลเพื่อตรวจสอบได้ทันที:',
            weight: 'bold',
            size: 'sm',
            color: '#0f172a',
          },
          {
            type: 'box',
            layout: 'vertical',
            spacing: 'xs',
            contents: [
              { type: 'text', text: '• เลขบัญชีธนาคาร / พร้อมเพย์', size: 'xs', color: '#475569' },
              { type: 'text', text: '• ชื่อที่พัก / ร้านค้า / เพจเฟซบุ๊ก', size: 'xs', color: '#475569' },
              { type: 'text', text: '• ข้อความแชทที่คู่สนทนาส่งมา', size: 'xs', color: '#475569' },
            ],
          },
          { type: 'separator' },
          {
            type: 'text',
            text: '💡 พิมพ์ "รายการ" เพื่อดูรายชื่อที่พักที่ผ่านการยืนยันแล้ว',
            size: 'xxs',
            color: '#0d9488',
            wrap: true,
          },
        ],
      },
      footer: {
        type: 'box',
        layout: 'vertical',
        spacing: 'sm',
        contents: [
          {
            type: 'button',
            style: 'primary',
            color: '#0d9488',
            height: 'sm',
            action: {
              type: 'uri',
              label: '📤 แนะนำบอทให้เพื่อน',
              uri: getShareUrl('🛡️ ตรวจสอบเลขบัญชีก่อนโอนเงินฟรี ใช้งานผ่าน LINE ได้เลย!'),
            },
          },
        ],
      },
    },
  };
}

module.exports = {
  buildVerifiedFlex,
  buildWarningFlex,
  buildCautionFlex,
  buildHelpFlex,
};
