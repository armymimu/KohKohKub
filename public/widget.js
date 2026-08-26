/**
 * CheckBeforePay Drop-in Widget (วิดเจ็ตฝังเว็บและกลุ่ม)
 * ใช้งานง่ายเพียงแปะ: <script src="https://kohkohkub-production.up.railway.app/widget.js"></script>
 */

(function() {
  const container = document.getElementById('check-before-pay-widget') || (function() {
    const div = document.createElement('div');
    div.id = 'check-before-pay-widget';
    document.currentScript ? document.currentScript.parentNode.insertBefore(div, document.currentScript) : document.body.appendChild(div);
    return div;
  })();

  const apiHost = (function() {
    const scripts = document.getElementsByTagName('script');
    for (let s of scripts) {
      if (s.src && s.src.includes('/widget.js')) {
        return s.src.replace('/widget.js', '');
      }
    }
    return 'https://kohkohkub-production.up.railway.app';
  })();

  container.innerHTML = `
    <div style="font-family:-apple-system,sans-serif;max-width:420px;border:1px solid #e2e8f0;border-radius:14px;padding:16px;background:#ffffff;box-shadow:0 4px 12px rgba(0,0,0,0.05);color:#0f172a;">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:10px;">
        <span style="font-size:20px;">🛡️</span>
        <div>
          <b style="font-size:15px;display:block;">เช็คก่อนโอน — ตรวจเลขบัญชี</b>
          <span style="font-size:11px;color:#64748b;">ระบบความปลอดภัยชุมชน</span>
        </div>
      </div>
      <div style="display:flex;gap:6px;">
        <input type="text" id="cbp-input" placeholder="พิมพ์เลขบัญชี หรือ เบอร์โทร..." style="flex:1;border:1px solid #cbd5e1;border-radius:8px;padding:8px 12px;font-size:14px;outline:none;" />
        <button id="cbp-btn" style="background:#0a7d5a;color:#fff;border:none;border-radius:8px;padding:8px 14px;font-size:14px;font-weight:bold;cursor:pointer;">เช็ค</button>
      </div>
      <div id="cbp-res" style="margin-top:10px;font-size:13px;display:none;"></div>
    </div>
  `;

  const btn = document.getElementById('cbp-btn');
  const input = document.getElementById('cbp-input');
  const res = document.getElementById('cbp-res');

  btn.addEventListener('click', async function() {
    const q = input.value.trim();
    if (!q) return;
    btn.disabled = true;
    btn.innerText = '...';
    res.style.display = 'block';
    res.innerHTML = '<span style="color:#64748b;">กำลังตรวจสอบ...</span>';

    try {
      const response = await fetch(`${apiHost}/api/check?q=${encodeURIComponent(q)}`);
      const data = await response.json();
      btn.disabled = false;
      btn.innerText = 'เช็ค';

      if (data.verified) {
        res.innerHTML = `<div style="background:#f0fdf4;border:1px solid #bbf7d0;padding:10px;border-radius:8px;color:#166534;">✅ <b>${data.match.name}</b> ได้รับการยืนยันแล้ว<br>บัญชี: ${data.match.accountNumber} (${data.match.bankName})</div>`;
      } else if (data.disputeAlert) {
        res.innerHTML = `<div style="background:#fef2f2;border:1px solid #fecaca;padding:10px;border-radius:8px;color:#991b1b;">⚠️ <b>${data.notice}</b><br><a href="${apiHost}/scammed.html" target="_blank" style="color:#dc2626;font-weight:bold;">ดูคำแนะนำ →</a></div>`;
      } else {
        res.innerHTML = `<div style="background:#fffbeb;border:1px solid #fde68a;padding:10px;border-radius:8px;color:#92400e;">⚠️ <b>ไม่อยู่ในรายชื่อผู้ขายยืนยัน</b><br><a href="${apiHost}/check-account.html" target="_blank" style="color:#b45309;">ตรวจประวัติเพิ่มเติมใน Google →</a></div>`;
      }
    } catch (e) {
      btn.disabled = false;
      btn.innerText = 'เช็ค';
      res.innerHTML = '<span style="color:#dc2626;">เกิดข้อผิดพลาดในการเชื่อมต่อ</span>';
    }
  });
})();
