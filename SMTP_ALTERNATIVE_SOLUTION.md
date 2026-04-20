# SMTP Alternative Solution

## Problem:
Gmail SMTP is causing 500 errors with Supabase. This is a common issue due to:
1. Gmail's security restrictions
2. App Password configuration issues
3. Supabase SMTP integration limitations

## ✅ Solution 1: Use Supabase's Built-in Email (Recommended for Testing)

### Steps:
1. Go to Supabase Dashboard → **Project Settings** → **Auth** → **SMTP Settings**
2. Click **"Disable Custom SMTP"** or toggle off custom SMTP
3. Supabase will use their default email service

### Limitations:
- Free tier: 3 emails per hour
- Emails might go to spam
- Good for development/testing only

### Advantages:
- Works immediately
- No configuration needed
- Reliable for testing

---

## ✅ Solution 2: Use a Proper Transactional Email Service

### Recommended Services:

#### 1. **Resend** (Best for Developers)
- Free tier: 3,000 emails/month
- Easy setup
- Great deliverability
- Modern API

**Setup:**
```
1. Sign up at https://resend.com
2. Verify your domain (or use resend.dev for testing)
3. Get API key
4. In Supabase SMTP settings:
   Host: smtp.resend.com
   Port: 465
   Username: resend
   Password: [Your Resend API Key]
```

#### 2. **SendGrid** (Most Popular)
- Free tier: 100 emails/day
- Reliable
- Good documentation

**Setup:**
```
1. Sign up at https://sendgrid.com
2. Create API key
3. In Supabase SMTP settings:
   Host: smtp.sendgrid.net
   Port: 587
   Username: apikey
   Password: [Your SendGrid API Key]
```

#### 3. **Mailgun** (Good for Scale)
- Free tier: 5,000 emails/month (first 3 months)
- Reliable
- Good analytics

**Setup:**
```
1. Sign up at https://mailgun.com
2. Verify domain
3. Get SMTP credentials
4. In Supabase SMTP settings:
   Host: smtp.mailgun.org
   Port: 587
   Username: [Your Mailgun SMTP username]
   Password: [Your Mailgun SMTP password]
```

---

## ✅ Solution 3: Fix Gmail SMTP (If You Must Use Gmail)

### Common Issues and Fixes:

#### Issue 1: App Password Not Working
**Fix:**
1. Go to https://myaccount.google.com/security
2. Make sure 2-Step Verification is ON
3. Delete old App Password
4. Generate NEW App Password
5. Use it immediately (don't wait)

#### Issue 2: "Less Secure Apps" Blocked
**Fix:**
- Gmail no longer supports "less secure apps"
- You MUST use App Passwords (requires 2FA)
- Regular password won't work

#### Issue 3: Account Locked
**Fix:**
1. Check https://myaccount.google.com/notifications
2. Unlock account if needed
3. Try from a different IP/location

---

## 🎯 Recommended Approach for Your Project:

### For Development (Now):
**Use Supabase's built-in email**
- Disable custom SMTP
- Test the flow
- Verify everything works

### For Production (Later):
**Use Resend or SendGrid**
- Better deliverability
- Higher limits
- Professional appearance
- Analytics and tracking

---

## 🔧 Quick Fix for Right Now:

1. **Disable Custom SMTP in Supabase**
   - Go to SMTP Settings
   - Toggle off or disable custom SMTP
   - Save changes

2. **Clear Browser Cache**
   ```
   Ctrl+Shift+Delete → Clear cache and cookies
   ```

3. **Restart Dev Server**
   ```bash
   # Stop server (Ctrl+C)
   npm run dev
   ```

4. **Test Forgot Password**
   - Go to forgot password page
   - Enter email
   - Check inbox (and spam)
   - Should receive email within 1-2 minutes

---

## 📊 Comparison Table:

| Service | Free Tier | Setup Difficulty | Deliverability | Best For |
|---------|-----------|------------------|----------------|----------|
| Supabase Built-in | 3/hour | ⭐ Easy | ⭐⭐ Fair | Testing |
| Gmail SMTP | 500/day | ⭐⭐⭐ Hard | ⭐⭐ Fair | Personal |
| Resend | 3,000/month | ⭐⭐ Medium | ⭐⭐⭐⭐⭐ Excellent | Production |
| SendGrid | 100/day | ⭐⭐ Medium | ⭐⭐⭐⭐ Good | Production |
| Mailgun | 5,000/month* | ⭐⭐⭐ Medium | ⭐⭐⭐⭐ Good | Scale |

*First 3 months only

---

## ✅ Action Items:

- [ ] Disable custom SMTP in Supabase
- [ ] Test with Supabase's built-in email
- [ ] Verify forgot password flow works
- [ ] Sign up for Resend or SendGrid
- [ ] Configure production SMTP
- [ ] Update email templates
- [ ] Test in production

---

**Status**: Use Supabase built-in email for now, switch to Resend/SendGrid for production
**Last Updated**: April 20, 2026
