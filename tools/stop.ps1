# ปิดเซิร์ฟเวอร์และ ngrok ทั้งหมด

[Console]::OutputEncoding = [Text.Encoding]::UTF8

$node  = @(Get-Process node  -ErrorAction SilentlyContinue)
$ngrok = @(Get-Process ngrok -ErrorAction SilentlyContinue)

$node  | Stop-Process -Force -ErrorAction SilentlyContinue
$ngrok | Stop-Process -Force -ErrorAction SilentlyContinue

Write-Host ''
Write-Host "ปิดเรียบร้อย (เซิร์ฟเวอร์ $($node.Count) ตัว, ngrok $($ngrok.Count) ตัว)" -ForegroundColor Green
Write-Host 'บอทหยุดทำงานแล้ว เปิดใหม่ได้ที่ไฟล์ 2-START.bat' -ForegroundColor White
Write-Host ''
Read-Host 'กด Enter เพื่อปิดหน้าต่าง'
