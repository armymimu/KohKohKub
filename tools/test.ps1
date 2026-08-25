# ลองคุยกับบอทในเครื่อง โดยไม่ต้องต่อ LINE
# พิมพ์ข้อความแล้วดูว่าบอทจะตอบอะไร

[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot

Write-Host ''
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host '   ลองคุยกับบอท (ไม่ต้องต่อ LINE)' -ForegroundColor Cyan
Write-Host '=============================================' -ForegroundColor Cyan
Write-Host ''
Write-Host 'ลองพิมพ์ดู เช่น' -ForegroundColor DarkGray
Write-Host '   ตาแหวนซีวิว          <- ชื่อที่พักที่มีในระบบ' -ForegroundColor DarkGray
Write-Host '   123-4-56789-0        <- เลขบัญชีที่มีในระบบ' -ForegroundColor DarkGray
Write-Host '   จะโอนมัดจำ 999-9-99999-9   <- เคสน่าสงสัย' -ForegroundColor DarkGray
Write-Host '   รายการ               <- ดูที่พักทั้งหมด' -ForegroundColor DarkGray
Write-Host ''
Write-Host 'พิมพ์ ออก แล้วกด Enter เพื่อเลิก' -ForegroundColor DarkGray
Write-Host ''

Push-Location $root
while ($true) {
    $text = Read-Host 'คุณ'
    if ([string]::IsNullOrWhiteSpace($text)) { continue }
    if ($text -in @('ออก', 'exit', 'quit', 'q')) { break }

    Write-Host ''
    Write-Host '--- บอทตอบ ---------------------------------' -ForegroundColor Green
    node scripts/reply.js $text
    Write-Host '--------------------------------------------' -ForegroundColor Green
    Write-Host ''
}
Pop-Location

Write-Host 'จบการทดสอบ' -ForegroundColor Green
