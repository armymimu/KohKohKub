# ตัวช่วยเปิดใช้งาน — เปิดเซิร์ฟเวอร์ + ngrok ให้อัตโนมัติ
# แล้วบอก Webhook URL ที่ต้องเอาไปวางใน LINE (พร้อม copy ให้เลย)

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot

Write-Host ''
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host '   เปิดใช้งานบอทตรวจสอบที่พักเกาะล้าน' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ''

function Fail($message) {
    Write-Host ''
    Write-Host $message -ForegroundColor Red
    Write-Host ''
    Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
    exit 1
}

# --- ตรวจของที่ต้องมี ---------------------------------------------------
if (-not (Get-Command node -ErrorAction SilentlyContinue)) {
    Fail "ยังไม่ได้ติดตั้ง Node.js`nโหลดที่ https://nodejs.org (เลือกปุ่ม LTS) ติดตั้งแล้วรันไฟล์นี้ใหม่"
}
if (-not (Get-Command ngrok -ErrorAction SilentlyContinue)) {
    Fail "ยังไม่ได้ติดตั้ง ngrok`nโหลดที่ https://ngrok.com/download"
}
if (-not (Test-Path (Join-Path $root '.env'))) {
    Fail "ยังไม่ได้ตั้งค่า`nกรุณาดับเบิลคลิกไฟล์  1-SETUP.bat  ก่อน"
}
if (-not (Test-Path (Join-Path $root 'node_modules'))) {
    Write-Host 'ติดตั้งส่วนประกอบครั้งแรก รอสักครู่...' -ForegroundColor Yellow
    Push-Location $root
    npm install --silent
    Pop-Location
}

$port = 3000
$portLine = Select-String -Path (Join-Path $root '.env') -Pattern '^\s*PORT\s*=\s*(\d+)' -ErrorAction SilentlyContinue
if ($portLine) { $port = [int]$portLine.Matches[0].Groups[1].Value }

# --- ปิดของเก่าที่ค้างอยู่ ------------------------------------------------
Get-Process ngrok -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# --- เปิดเซิร์ฟเวอร์ -------------------------------------------------------
Write-Host "เปิดเซิร์ฟเวอร์ที่พอร์ต $port ..." -ForegroundColor White
Start-Process powershell -ArgumentList @(
    '-NoExit', '-Command',
    "`$Host.UI.RawUI.WindowTitle='เซิร์ฟเวอร์บอท - ห้ามปิดหน้าต่างนี้'; Set-Location '$root'; node src/index.js"
)

# --- เปิด ngrok -----------------------------------------------------------
Write-Host 'เปิดอุโมงค์ ngrok ...' -ForegroundColor White
Start-Process powershell -ArgumentList @(
    '-NoExit', '-Command',
    "`$Host.UI.RawUI.WindowTitle='ngrok - ห้ามปิดหน้าต่างนี้'; ngrok http $port"
)

# --- รอ ngrok บอก URL สาธารณะ ---------------------------------------------
Write-Host 'รอ ngrok ตอบกลับ ...' -ForegroundColor White
$publicUrl = $null
for ($i = 0; $i -lt 30 -and -not $publicUrl; $i++) {
    Start-Sleep -Seconds 1
    try {
        $tunnels = Invoke-RestMethod -Uri 'http://127.0.0.1:4040/api/tunnels' -TimeoutSec 2
        $publicUrl = ($tunnels.tunnels | Where-Object { $_.proto -eq 'https' } | Select-Object -First 1).public_url
    } catch { }
}

if (-not $publicUrl) {
    Fail "ngrok ยังไม่ตอบ`nดูหน้าต่างชื่อ 'ngrok' ว่ามี error อะไรไหม`nถ้าขึ้นเรื่อง authtoken ให้รันคำสั่งนี้ก่อน: ngrok config add-authtoken <รหัสของคุณ>"
}

$webhook = "$publicUrl/webhook"
try { Set-Clipboard -Value $webhook } catch { }

Write-Host ''
Write-Host '=============================================' -ForegroundColor Green
Write-Host '   พร้อมใช้งานแล้ว' -ForegroundColor Green
Write-Host '=============================================' -ForegroundColor Green
Write-Host ''
Write-Host ' Webhook URL (คัดลอกใส่คลิปบอร์ดให้แล้ว):' -ForegroundColor White
Write-Host ''
Write-Host "   $webhook" -ForegroundColor Yellow
Write-Host ''
Write-Host ' เอาไปวางที่ไหน:' -ForegroundColor White
Write-Host '   1. เปิด https://developers.line.biz/console/'
Write-Host '   2. เลือก Channel ของคุณ -> แท็บ Messaging API'
Write-Host '   3. หัวข้อ Webhook settings -> กด Edit'
Write-Host '   4. วางด้วยการกด Ctrl+V -> กด Update -> กด Verify'
Write-Host '   5. เปิดสวิตช์ Use webhook ให้เป็นสีเขียว'
Write-Host ''
Write-Host ' จากนั้นสแกน QR code ในหน้าเดียวกัน เพิ่มบอทเป็นเพื่อน แล้วพิมพ์คุยได้เลย' -ForegroundColor White
Write-Host ''
Write-Host ' หมายเหตุ: ห้ามปิดหน้าต่างสีดำ 2 อันที่เพิ่งเปิดขึ้นมา' -ForegroundColor DarkYellow
Write-Host '           ปิดเมื่อไหร่ บอทหยุดทำงานทันที' -ForegroundColor DarkYellow
Write-Host '           เปิดใหม่ครั้งหน้า URL จะเปลี่ยน ต้องเอาอันใหม่ไปวางอีกรอบ' -ForegroundColor DarkYellow
Write-Host ''
Read-Host 'กด Enter เพื่อปิดหน้าต่างนี้ (อีก 2 หน้าต่างยังทำงานต่อ)'
