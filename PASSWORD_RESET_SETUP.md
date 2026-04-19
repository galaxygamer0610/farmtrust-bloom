# Password Reset Feature - Setup Guide

## Overview
The password reset feature has been successfully implemented using Supabase authentication. This guide explains how the feature works and how to configure email templates.

## Features Implemented

### 1. Forgot Password Link
- Added "Forgot Password?" link in the login modal
- Link appears only when user is in login mode
- Redirects to `/forgot-password` page

### 2. Forgot Password Page (`/forgot-password`)
- User enters their email address
- Validates email format
- Sends password reset link via Supabase
- Shows success message with instructions
- Option to resend email if not received

### 3. Reset Password Page (`/auth/reset-password`)
- User is redirected here from the email link
- Validates the reset token from URL
- User enters new password (minimum 6 characters)
- Password confirmation field
- Password strength indicator showing:
  - Minimum 6 characters (required)
  - Uppercase letter (recommended)
  - Number (recommended)
- Show/hide password toggle
- Updates password in Supabase database
- Redirects to home page after success

### 4. Auth Helper Functions
Updated `auth-helpers.ts` with:
- `resetPassword(email)` - Sends reset email
- `updatePassword(newPassword)` - Updates user password

## How It Works

### Flow Diagram
```
1. User clicks "Forgot Password?" in login modal
   ↓
2. Redirected to /forgot-password page
   ↓
3. User enters email and clicks "Send Reset Link"
   ↓
4. Supabase sends email with reset link
   ↓
5. User clicks link in email
   ↓
6. Redirected to /auth/reset-password with token
   ↓
7. User enters new password
   ↓
8. Password updated in Supabase database
   ↓
9. User redirected to home page to login
```

## Supabase Configuration

### Email Template Setup

1. **Go to Supabase Dashboard**
   - Navigate to: https://supabase.com/dashboard/project/qwwzjxdypoyzjbzvpseu
   - Go to Authentication → Email Templates

2. **Configure "Reset Password" Template**
   
   The default template should work, but you can customize it:

   **Subject:** Reset Your Password - KisanCred

   **Body:**
   ```html
   <h2>Reset Your Password</h2>
   <p>Hi there,</p>
   <p>We received a request to reset your password for your KisanCred account.</p>
   <p>Click the button below to reset your password:</p>
   <p><a href="{{ .ConfirmationURL }}" style="background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Reset Password</a></p>
   <p>Or copy and paste this link into your browser:</p>
   <p>{{ .ConfirmationURL }}</p>
   <p>If you didn't request this, you can safely ignore this email.</p>
   <p>This link will expire in 1 hour.</p>
   <p>Best regards,<br>The KisanCred Team</p>
   ```

3. **Verify Redirect URLs**
   - Go to Authentication → URL Configuration
   - Add to "Redirect URLs":
     - `http://localhost:5173/auth/reset-password` (for development)
     - `https://yourdomain.com/auth/reset-password` (for production)

4. **Test the Feature**
   - Go to your app's login page
   - Click "Forgot Password?"
   - Enter a valid email address
   - Check your email inbox
   - Click the reset link
   - Enter new password
   - Verify you can login with new password

## Security Features

1. **Token Expiration**: Reset links expire after 1 hour
2. **One-Time Use**: Each reset link can only be used once
3. **Email Verification**: Only verified email addresses can reset passwords
4. **Password Validation**: Minimum 6 characters required
5. **Secure Storage**: Passwords are hashed by Supabase (never stored in plain text)

## Database Updates

The password reset feature automatically updates:
- `auth.users` table - Updates the encrypted password
- No changes needed to your custom `farmers` table
- User session is maintained after password update

## Testing Checklist

- [ ] Click "Forgot Password?" link in login modal
- [ ] Enter email and submit
- [ ] Verify email is received
- [ ] Click reset link in email
- [ ] Verify redirect to reset password page
- [ ] Enter new password (test validation)
- [ ] Verify password strength indicator works
- [ ] Submit new password
- [ ] Verify success message
- [ ] Verify redirect to home page
- [ ] Login with new password
- [ ] Verify dashboard loads correctly

## Troubleshooting

### Email Not Received
1. Check spam/junk folder
2. Verify email address is correct
3. Check Supabase email logs in dashboard
4. Verify SMTP settings in Supabase (if using custom SMTP)

### Reset Link Not Working
1. Check if link has expired (1 hour limit)
2. Verify redirect URL is configured in Supabase
3. Check browser console for errors
4. Try requesting a new reset link

### Password Not Updating
1. Verify user has valid session from reset link
2. Check password meets minimum requirements (6 characters)
3. Check browser console for errors
4. Verify Supabase connection

## Files Modified/Created

### New Files
- `src/pages/ForgotPassword.tsx` - Forgot password page
- `src/pages/ResetPassword.tsx` - Reset password page
- `PASSWORD_RESET_SETUP.md` - This documentation

### Modified Files
- `src/components/AuthModal.tsx` - Added "Forgot Password?" link
- `src/App.tsx` - Added new routes for forgot/reset password
- `src/lib/auth-helpers.ts` - Already had reset functions

## Production Deployment

Before deploying to production:

1. Update redirect URLs in Supabase dashboard with production domain
2. Test the complete flow in production environment
3. Verify email delivery in production
4. Monitor Supabase logs for any issues
5. Consider adding rate limiting for password reset requests

## Support

If you encounter any issues:
1. Check Supabase dashboard logs
2. Check browser console for errors
3. Verify all environment variables are set correctly
4. Test with a different email address
5. Contact Supabase support if email delivery fails

---

**Implementation Date**: April 19, 2026
**Status**: ✅ Complete and Ready for Testing
