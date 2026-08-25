const { buildReply } = require('../src/bot');

const text = process.argv.slice(2).join(' ');
const messages = buildReply(text);

messages.forEach((m, i) => {
  if (i > 0) console.log('');
  if (m.type === 'flex') {
    console.log(`[FLEX การ์ด] ${m.altText}`);
  } else {
    console.log(m.text);
  }
});
