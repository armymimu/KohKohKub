# สร้างหนังสือยินยอมแบบกระดาษ แล้วเปิดให้ดูทันที

[Console]::OutputEncoding = [Text.Encoding]::UTF8
$root = Split-Path -Parent $PSScriptRoot

Push-Location $root
node scripts/make-consent-form.js
Pop-Location

$file = Join-Path $root 'docs\consent-form.txt'
if (Test-Path $file) {
    Write-Host ''
    Write-Host 'เปิดไฟล์ให้แล้ว สั่งพิมพ์ได้เลย (Ctrl+P)' -ForegroundColor Green
    Write-Host 'พิมพ์ 2 ชุดต่อที่พัก 1 แห่ง — เก็บไว้เอง 1 ให้เจ้าของที่พัก 1' -ForegroundColor White
    Start-Process notepad.exe $file
}
Write-Host ''
Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
