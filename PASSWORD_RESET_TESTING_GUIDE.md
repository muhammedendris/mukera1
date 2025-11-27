# 🧪 Password Reset Testing Guide

## Quick Start - Testing via Browser (Recommended)

### Step 1: Access the Forgot Password Page
1. Open browser and go to: **http://localhost:3000/forgot-password**
2. Or click "Forgot Password?" on the login page

### Step 2: Request OTP
1. Enter your email address
2. Click "Send Reset Code"
3. Wait for success message

### Step 3: Check Your Email
- **From**: Internship Management System <muhammedendris565@gmail.com>
- **Subject**: Password Reset - OTP Code
- **Look for**: 6-digit code in highlighted box

### Step 4: Reset Your Password
1. Enter the 6-digit OTP
2. Enter new password (min 6 characters)
3. Confirm new password
4. Click "Reset Password"
5. You'll be redirected to login page

### Step 5: Test New Password
1. Login at: **http://localhost:3000/login**
2. Use your email + new password
3. Should login successfully ✅

---

## Testing via PowerShell Script

Run the automated test script:
```powershell
cd C:\Users\Hp\Desktop\INTENSHIP
.\test-password-reset.ps1
```

This will:
- Prompt for your email
- Send OTP request
- Wait for you to check email
- Reset password with OTP

---

## Testing via API (curl)

### Request OTP:
```bash
curl -X POST http://localhost:5000/api/auth/forgot-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your-email@example.com\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "If an account with that email exists, a password reset code has been sent."
}
```

### Reset Password:
```bash
curl -X POST http://localhost:5000/api/auth/reset-password ^
  -H "Content-Type: application/json" ^
  -d "{\"email\":\"your-email@example.com\",\"otp\":\"123456\",\"newPassword\":\"newpass123\"}"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Password has been reset successfully. You can now log in with your new password."
}
```

---

## Test Scenarios

### ✅ Valid Flow Tests

| Test Case | Input | Expected Result |
|-----------|-------|----------------|
| Valid email | existing@email.com | Success + Email sent |
| Valid OTP | 123456 (from email) | Password reset successful |
| Strong password | MyNewPass123 | Accepted |

### ❌ Error Flow Tests

| Test Case | Input | Expected Error |
|-----------|-------|----------------|
| Invalid OTP | 999999 | "Invalid OTP code" |
| Expired OTP | OTP after 10 min | "OTP has expired" |
| Short password | 12345 | "Password must be at least 6 characters" |
| Mismatched passwords | pass1 ≠ pass2 | "Passwords do not match" |
| Non-existent email | fake@email.com | Success (doesn't reveal) |

---

## Email Configuration

**Current Settings** (from .env):
- **Host**: smtp.gmail.com
- **Port**: 587
- **From**: muhammedendris565@gmail.com

⚠️ **Security Warning**:
- Using plain password in .env (should use App Password)
- Credentials are exposed in codebase

### How to Setup Gmail App Password:
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Enable 2-Step Verification
3. Search for "App passwords"
4. Generate new app password for "Mail"
5. Replace `EMAIL_PASSWORD` in `.env` with the 16-char code

---

## Monitoring Backend Logs

Watch for these log messages:

**When OTP is requested:**
```
Password reset OTP sent to user@email.com
```

**When password is reset:**
```
Password successfully reset for user: user@email.com
```

**If email fails:**
```
Email sending failed: [error details]
```

---

## Frontend Pages

- **Login**: http://localhost:3000/login
- **Register**: http://localhost:3000/register
- **Forgot Password**: http://localhost:3000/forgot-password
- **Dashboard**: http://localhost:3000/dashboard

---

## Implementation Files

### Backend
- **Model**: `backend/models/User.js:70-130`
- **Controller**: `backend/controllers/passwordResetController.js`
- **Email Service**: `backend/services/emailService.js`
- **Routes**: `backend/routes/auth.js:184-189`

### Frontend
- **Page**: `frontend/src/pages/ForgotPasswordPage.js`
- **API**: `frontend/src/services/api.js:34-36`
- **Route**: `frontend/src/App.js` (PublicRoute)

---

## Troubleshooting

### Problem: Email not received
**Solutions:**
- Check spam/junk folder
- Verify email credentials in `.env`
- Use Gmail App Password instead of regular password
- Check backend logs for SMTP errors

### Problem: "Invalid or expired OTP"
**Solutions:**
- OTP expires in 10 minutes
- Request a new OTP
- Ensure you're using the most recent OTP

### Problem: Port already in use
**Solutions:**
- Backend/Frontend already running (this is OK)
- Kill existing process: `taskkill /F /PID <pid>`

### Problem: Password not updating
**Solutions:**
- Check backend logs for errors
- Ensure MongoDB is running
- Verify OTP hasn't expired

---

## Security Features ✅

1. **OTP Expiration**: 10 minutes
2. **Password Hashing**: bcrypt with salt
3. **Email Validation**: Regex pattern matching
4. **Generic Messages**: Doesn't reveal if email exists
5. **Secure Fields**: `select: false` on OTP fields
6. **HTTPS Ready**: Can be deployed with SSL

---

## Next Steps

- [ ] Test basic flow (email → OTP → reset)
- [ ] Test error cases (wrong OTP, expired, etc.)
- [ ] Verify email delivery
- [ ] Test login with new password
- [ ] Setup Gmail App Password (recommended)
- [ ] Add `.env` to `.gitignore` (security)

---

## Support

If you encounter issues:
1. Check backend console logs
2. Check browser console (F12)
3. Verify MongoDB is running
4. Review this guide

**Current Status:**
- ✅ MongoDB: Running
- ✅ Backend: Running on port 5000
- ✅ Frontend: Running on port 3000
