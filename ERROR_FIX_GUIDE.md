# Error Fix Guide - 406 & 500 Errors

## Errors Encountered:
- Failed to load resource: 406 (Not Acceptable)
- Failed to load resource: 500 (Internal Server Error)
- Uncaught (in promise) Error: Async navigation issue

## Root Causes:
1. SMTP configuration incomplete or incorrect
2. Supabase email templates not configured
3. Browser cache issues
4. Session validation timing issues

## ✅ Step-by-Step Fixes:

### Step 1: Fix SMTP Configuration in Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard/project/qwwzjxdypoyzjbzvpseu
2. Navigate to: **Project Settings → Auth → SMTP Settings**
3. Use these CORRECT settings:

```
Host: smtp.gmail.com
Port: 587
Minimum interval: 60
Username: YOUR_FULL_EMAIL@gmail.com  ← MUST be full email!
Password: [Your 16-character App Password]
```

**IMPORTANT**: Username must be your FULL Gmail address (e.g., aryan.m3268@gmail.com), NOT just "KisanCred"

### Step 2: Configure Email Templates

1. In Supabase Dashboard, go to: **Authentication → Email Templates**
2. Configure these templates:

**Confirm Signup Template:**
- Subject: `Verify your email - KisanCred`
- Make sure `{{ .ConfirmationURL }}` is present in the body

**Reset Password Template:**
- Subject: `Reset your password - KisanCred`
- Make sure `{{ .ConfirmationURL }}` is present in the body

### Step 3: Update Redirect URLs

1. Go to: **Authentication → URL Configuration**
2. Add these redirect URLs:

```
http://localhost:5173/auth/callback
http://localhost:5173/auth/reset-password
```

For production, also add:
```
https://yourdomain.com/auth/callback
https://yourdomain.com/auth/reset-password
```

### Step 4: Clear Browser Cache

1. Open DevTools (F12)
2. Go to Application tab
3. Clear Storage:
   - Local Storage
   - Session Storage
   - Cookies
4. Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac)

### Step 5: Restart Development Server

```bash
# Stop the current server (Ctrl+C)
cd farmtrust-bloom
npm run dev
```

### Step 6: Test the Flow

1. Go to http://localhost:5173
2. Click "Login / Sign Up"
3. Click "Forgot Password?"
4. Enter your email
5. Check your email inbox (and spam folder)
6. Click the reset link
7. Set new password

## 🔍 Debugging Tips:

### Check Supabase Logs:
1. Go to Supabase Dashboard
2. Navigate to: **Logs → Auth Logs**
3. Look for errors related to email sending

### Check Browser Console:
1. Open DevTools (F12)
2. Go to Console tab
3. Look for detailed error messages

### Check Network Tab:
1. Open DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Look for failed requests to Supabase

## 🚨 Common Issues:

### Issue 1: "Username is incorrect"
**Solution**: Change username from "KisanCred" to full email address

### Issue 2: "App Password not working"
**Solution**: 
1. Regenerate App Password in Google Account
2. Make sure 2-Step Verification is enabled
3. Use the new password without spaces

### Issue 3: "Emails not arriving"
**Solution**:
1. Check spam folder
2. Verify SMTP settings are saved
3. Check Supabase email logs
4. Try with a different email address

### Issue 4: "Reset link expired"
**Solution**:
- Reset links expire after 1 hour
- Request a new reset link
- Click the link immediately after receiving

## 📧 Alternative: Use Supabase's Built-in Email

If Gmail continues to have issues, you can temporarily use Supabase's built-in email service:

1. Go to SMTP Settings
2. Click "Disable Custom SMTP"
3. Supabase will use their default email service
4. Note: Limited to 3 emails per hour on free tier

## ✅ Verification Checklist:

- [ ] SMTP Host is `smtp.gmail.com`
- [ ] Port is `587`
- [ ] Username is FULL email address
- [ ] Password is 16-character App Password
- [ ] Email templates are configured
- [ ] Redirect URLs are added
- [ ] Browser cache is cleared
- [ ] Development server is restarted
- [ ] Test email is received

## 🎯 Expected Behavior After Fix:

1. User clicks "Forgot Password?"
2. Enters email and submits
3. Receives email within 1-2 minutes
4. Clicks link in email
5. Redirected to reset password page
6. Enters new password
7. Successfully logs in with new password

---

**Last Updated**: April 20, 2026
**Status**: Ready for testing after applying fixes
