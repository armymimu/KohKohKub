# ตัวช่วยตั้งค่าครั้งแรก — ถามค่าจาก LINE แล้วสร้างไฟล์ .env ให้อัตโนมัติ
# ผู้ใช้ไม่ต้องแก้ไฟล์เองด้วย Notepad

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'

Write-Host ''
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host '   ตั้งค่าบอทตรวจสอบที่พักเกาะล้าน (ครั้งแรก)' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ''

if (Test-Path $envFile) {
    Write-Host 'พบไฟล์ตั้งค่าเดิมอยู่แล้ว' -ForegroundColor Yellow
    $again = Read-Host 'ต้องการตั้งค่าใหม่ทับของเดิมไหม? (พิมพ์ y แล้วกด Enter = ใช่ / กด Enter เฉย ๆ = ไม่)'
    if ($again -ne 'y') {
        Write-Host 'ยกเลิก ไม่มีอะไรเปลี่ยน' -ForegroundColor Green
        Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
        exit 0
    }
}

Write-Host 'เตรียมค่า 2 อย่างจากเว็บ LINE Developers Console ก่อน' -ForegroundColor White
Write-Host '  https://developers.line.biz/console/'
Write-Host ''
Write-Host '  1) Channel secret        <- แท็บ Basic settings   (สั้น ~32 ตัวอักษร)'
Write-Host '  2) Channel access token  <- แท็บ Messaging API    (ยาวมาก 100+ ตัวอักษร)'
Write-Host ''
Write-Host 'วิธีวาง: คลิกขวาในหน้าต่างนี้ = วางข้อความที่ copy มา' -ForegroundColor DarkGray
Write-Host ''

$secret = (Read-Host 'วาง Channel secret แล้วกด Enter').Trim()
$token  = (Read-Host 'วาง Channel access token แล้วกด Enter').Trim()

if ([string]::IsNullOrWhiteSpace($secret) -or [string]::IsNullOrWhiteSpace($token)) {
    Write-Host ''
    Write-Host 'ยังใส่ไม่ครบทั้งสองค่า ลองรันใหม่อีกครั้ง' -ForegroundColor Red
    Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
    exit 1
}

# ความผิดพลาดที่พบบ่อยที่สุด: สลับที่กันสองค่า
# secret ปกติสั้น (~32) ส่วน token ยาวมาก (100+)
if ($secret.Length -gt $token.Length) {
    Write-Host ''
    Write-Host 'ดูเหมือนใส่สลับที่กัน (secret ต้องสั้นกว่า token มาก)' -ForegroundColor Yellow
    $swap = Read-Host 'ให้สลับให้อัตโนมัติไหม? (y = ใช่ / Enter = ไม่ ใช้ตามที่พิมพ์)'
    if ($swap -eq 'y') {
        $tmp = $secret; $secret = $token; $token = $tmp
        Write-Host 'สลับให้แล้ว' -ForegroundColor Green
    }
}

# สร้างรหัสลับสำหรับ API ลงทะเบียนที่พัก ให้อัตโนมัติ ผู้ใช้ไม่ต้องคิดเอง
$bytes = New-Object byte[] 24
[Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes)
$adminKey = [Convert]::ToBase64String($bytes) -replace '[^A-Za-z0-9]', ''

$content = @"
LINE_CHANNEL_ACCESS_TOKEN=$token
LINE_CHANNEL_SECRET=$secret
PORT=3000
ADMIN_API_KEY=$adminKey
"@

[IO.File]::WriteAllText($envFile, $content, (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Host 'บันทึกเรียบร้อย' -ForegroundColor Green
Write-Host "ไฟล์ตั้งค่าอยู่ที่ $envFile"
Write-Host ''
Write-Host 'ขั้นต่อไป: ดับเบิลคลิกไฟล์  2-START.bat' -ForegroundColor Cyan
Write-Host ''
Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
