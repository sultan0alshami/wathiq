# Script to merge backup11 into main
# Run this in PowerShell where you can see the output

Write-Host "=== Step 1: Check current branch ===" -ForegroundColor Cyan
git branch --show-current
Write-Host ""

Write-Host "=== Step 2: Switch to main branch ===" -ForegroundColor Cyan
git checkout main
Write-Host ""

Write-Host "=== Step 3: Pull latest changes from remote ===" -ForegroundColor Cyan
git pull origin main
Write-Host ""

Write-Host "=== Step 4: Merge backup11 into main ===" -ForegroundColor Cyan
git merge backup11 --no-edit
Write-Host ""

Write-Host "=== Step 5: Push to remote main ===" -ForegroundColor Cyan
git push origin main
Write-Host ""

Write-Host "=== Step 6: Verify merge ===" -ForegroundColor Cyan
git log --oneline -5
Write-Host ""

Write-Host "=== Done! ===" -ForegroundColor Green
Write-Host "Check GitHub: https://github.com/sultan0alshami/wathiq/commits/main" -ForegroundColor Yellow

