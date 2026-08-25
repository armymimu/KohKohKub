# กรอกชื่อผู้ดูแลระบบและช่องทางติดต่อ ลงในไฟล์ .env
# ค่าสองตัวนี้จะไปปรากฏในหนังสือยินยอม PDPA จึงต้องกรอกก่อนเปิดให้คนนอกลงทะเบียน
# แก้เฉพาะ 2 บรรทัดนี้ ค่าอื่นใน .env ไม่ถูกแตะต้อง

$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot
$envFile = Join-Path $root '.env'

Write-Host ''
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host '   ข้อมูลผู้ดูแลระบบ (สำหรับหนังสือยินยอม)' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ''

if (-not (Test-Path $envFile)) {
    Write-Host 'ยังไม่ได้ตั้งค่า กรุณาดับเบิลคลิก 1-SETUP.bat ก่อน' -ForegroundColor Red
    Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
    exit 1
}

Write-Host 'ตาม PDPA ต้องบอกเจ้าของที่พักให้ชัดว่า ใครเก็บข้อมูลเขา และติดต่อกลับที่ไหน' -ForegroundColor White
Write-Host ''

$lines = @(Get-Content $envFile)
function CurrentValue($key) {
    $match = $lines | Where-Object { $_ -match "^\s*$key\s*=" } | Select-Object -First 1
    if ($match) { return ($match -replace "^\s*$key\s*=", '').Trim() }
    return ''
}

$currentName = CurrentValue 'ORG_NAME'
$currentContact = CurrentValue 'ORG_CONTACT'
$currentOa = CurrentValue 'LINE_OA_ID'
$currentBase = CurrentValue 'BASE_URL'
if ($currentName)    { Write-Host "ค่าปัจจุบัน ชื่อผู้ดูแล: $currentName" -ForegroundColor DarkGray }
if ($currentContact) { Write-Host "ค่าปัจจุบัน ช่องทางติดต่อ: $currentContact" -ForegroundColor DarkGray }
if ($currentOa)      { Write-Host "ค่าปัจจุบัน ไอดี LINE: $currentOa" -ForegroundColor DarkGray }
if ($currentBase)    { Write-Host "ค่าปัจจุบัน โดเมน: $currentBase" -ForegroundColor DarkGray }
Write-Host ''

Write-Host 'ตัวอย่าง: กลุ่มเช็คก่อนโอน หรือ นายสมชาย ใจดี' -ForegroundColor DarkGray
$name = (Read-Host 'ชื่อผู้ดูแลระบบ (กด Enter เฉย ๆ = ใช้ค่าเดิม)').Trim()
Write-Host ''
Write-Host 'ตัวอย่าง: check.transfer@gmail.com หรือ โทร 081-234-5678' -ForegroundColor DarkGray
$contact = (Read-Host 'ช่องทางติดต่อขอแก้ไข/ลบข้อมูล (กด Enter เฉย ๆ = ใช้ค่าเดิม)').Trim()
Write-Host ''
Write-Host 'ไอดีบอท ดูที่ LINE Console แท็บ Messaging API หัวข้อ Bot basic ID (ขึ้นต้นด้วย @)' -ForegroundColor DarkGray
$oa = (Read-Host 'ไอดี LINE Official Account (กด Enter เฉย ๆ = ใช้ค่าเดิม)').Trim()
Write-Host ''
Write-Host 'ใส่หลัง deploy แล้วเท่านั้น เช่น https://xxx.up.railway.app (ตอนนี้เว้นว่างได้)' -ForegroundColor DarkGray
$base = (Read-Host 'โดเมนจริงของเว็บ (กด Enter เฉย ๆ = ใช้ค่าเดิม)').Trim()

if (-not $name)    { $name = $currentName }
if (-not $contact) { $contact = $currentContact }
if (-not $oa)      { $oa = $currentOa }
if (-not $base)    { $base = $currentBase }

if (-not $name -or -not $contact) {
    Write-Host ''
    Write-Host 'ยังกรอกไม่ครบทั้งสองค่า ลองใหม่อีกครั้ง' -ForegroundColor Red
    Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
    exit 1
}

# เขียนทับเฉพาะบรรทัดที่มีอยู่ ถ้ายังไม่มีค่อยเพิ่มต่อท้าย
$seen = @{}
$out = foreach ($line in $lines) {
    if     ($line -match '^\s*ORG_NAME\s*=')    { $seen['ORG_NAME'] = $true;    "ORG_NAME=$name" }
    elseif ($line -match '^\s*ORG_CONTACT\s*=') { $seen['ORG_CONTACT'] = $true; "ORG_CONTACT=$contact" }
    elseif ($line -match '^\s*LINE_OA_ID\s*=')  { $seen['LINE_OA_ID'] = $true;  "LINE_OA_ID=$oa" }
    elseif ($line -match '^\s*BASE_URL\s*=')    { $seen['BASE_URL'] = $true;    "BASE_URL=$base" }
    else { $line }
}
if (-not $seen['ORG_NAME'])    { $out += "ORG_NAME=$name" }
if (-not $seen['ORG_CONTACT']) { $out += "ORG_CONTACT=$contact" }
if (-not $seen['LINE_OA_ID'])  { $out += "LINE_OA_ID=$oa" }
if (-not $seen['BASE_URL'])    { $out += "BASE_URL=$base" }

[IO.File]::WriteAllLines($envFile, $out, (New-Object Text.UTF8Encoding($false)))

Write-Host ''
Write-Host 'บันทึกแล้ว' -ForegroundColor Green
Write-Host "  ผู้ดูแล:   $name"
Write-Host "  ติดต่อ:    $contact"
Write-Host "  ไอดี LINE: $(if ($oa) { $oa } else { '(ยังไม่ได้ใส่)' })"
Write-Host "  โดเมน:     $(if ($base) { $base } else { '(ยังไม่ได้ deploy)' })"
Write-Host ''
Write-Host 'ถ้าเซิร์ฟเวอร์เปิดอยู่ ต้องปิดแล้วเปิดใหม่ (3-STOP แล้ว 2-START) ค่าถึงจะมีผล' -ForegroundColor DarkYellow
Write-Host ''
Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
