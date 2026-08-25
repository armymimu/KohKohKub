const { buildReply } = require('../src/bot');

const samples = process.argv.slice(2).length
  ? process.argv.slice(2)
  : [
      'ตาแหวนซีวิว',
      'ตาแหวน ซีวิว รีสอร์ท',
      'tawaen seaview',
      '123-4-56789-0',
      '1234567890',
      'จะโอนมัดจำให้ 999-9-99999-9 โทร 081-999-8888 line @scammer99',
      'งานกดไลก์ ภารกิจรับเงิน',
      'รีสอร์ทลุงโกงแน่นอน',
      'รายการ',
      'ช่วยเหลือ',
    ];

(async () => {
  for (const text of samples) {
    console.log('\n' + '='.repeat(60));
    console.log('ผู้ใช้พิมพ์: ' + text);
    console.log('-'.repeat(60));
    const replies = await buildReply(text);
    for (const m of replies) {
      if (m.type === 'flex') {
        console.log(`[FLEX MESSAGE] ${m.altText}`);
      } else {
        console.log(m.text);
      }
      console.log('---');
    }
  }
})();
