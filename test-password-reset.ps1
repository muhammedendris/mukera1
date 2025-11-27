# Password Reset API Testing Script
# This script demonstrates how to test the forgot/reset password functionality

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "PASSWORD RESET FUNCTIONALITY TEST" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Test Configuration
$BaseURL = "http://localhost:5000/api/auth"
$TestEmail = Read-Host "Enter your account email to test"

Write-Host "`n[STEP 1] Requesting Password Reset OTP..." -ForegroundColor Yellow
Write-Host "Sending request to: $BaseURL/forgot-password" -ForegroundColor Gray

# Step 1: Request OTP
$requestBody = @{
    email = $TestEmail
} | ConvertTo-Json

try {
    $response1 = Invoke-RestMethod -Uri "$BaseURL/forgot-password" `
        -Method POST `
        -Body $requestBody `
        -ContentType "application/json"

    Write-Host "`n✓ SUCCESS!" -ForegroundColor Green
    Write-Host "Response: $($response1.message)" -ForegroundColor Green
    Write-Host "`nCheck your email inbox for the 6-digit OTP code!" -ForegroundColor Cyan
} catch {
    Write-Host "`n✗ ERROR!" -ForegroundColor Red
    Write-Host "Error: $($_.Exception.Message)" -ForegroundColor Red
    exit
}

# Step 2: Reset Password with OTP
Write-Host "`n[STEP 2] Reset Password with OTP" -ForegroundColor Yellow
Write-Host "Check your email and enter the details below:" -ForegroundColor Gray

$OTP = Read-Host "`nEnter the 6-digit OTP from your email"
$NewPassword = Read-Host "Enter new password (min 6 characters)" -AsSecureString
$NewPasswordPlain = [Runtime.InteropServices.Marshal]::PtrToStringAuto(
    [Runtime.InteropServices.Marshal]::SecureStringToBSTR($NewPassword))

Write-Host "`nSending reset password request..." -ForegroundColor Yellow

$resetBody = @{
    email = $TestEmail
    otp = $OTP
    newPassword = $NewPasswordPlain
} | ConvertTo-Json

try {
    $response2 = Invoke-RestMethod -Uri "$BaseURL/reset-password" `
        -Method POST `
        -Body $resetBody `
        -ContentType "application/json"

    Write-Host "`n✓ PASSWORD RESET SUCCESSFUL!" -ForegroundColor Green
    Write-Host "Response: $($response2.message)" -ForegroundColor Green
    Write-Host "`nYou can now login with your new password at:" -ForegroundColor Cyan
    Write-Host "http://localhost:3000/login" -ForegroundColor White
} catch {
    Write-Host "`n✗ RESET FAILED!" -ForegroundColor Red
    Write-Host "Error: $($_.ErrorDetails.Message)" -ForegroundColor Red
}

Write-Host "`n========================================`n" -ForegroundColor Cyan
