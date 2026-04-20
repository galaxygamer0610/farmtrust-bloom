# Rate Limit & Authentication Error Fix

## 🚨 Errors You're Seeing:
1. **429 (Too Many Requests)** - Supabase rate limiting
2. **ERR_CONNECTION_CLOSED** - Connection issues
3. **TypeError: Failed to fetch** - Network/API errors
4. **Auth callback type: null** - No auth tokens

## 🎯 Root Cause:
You've hit Supabase's rate limits by making too many authentication requests in a short time.

---

## ✅ IMMEDIATE SOLUTION (Do This Now):

### Step 1: Stop Everything
```bash
# Stop the dev server
Press Ctrl+C in terminal
```

### Step 2: Clear Browser Data
1. Press `Ctrl+Shift+Delete`
2. Select:
   - ✅ Cookies and other site data
   - ✅ Cached images and files
   - ✅ Site settings
3. Time range: **All time**
4. Click "Clear data"

### Step 3: Close All Browser Tabs
- Close ALL tabs related to your app
- Close the browser completely
- Wait 2 minutes

### Step 4: Wait for Rate Limit Reset
**IMPORTANT**: Wait **15-30 minutes** before trying again

Supabase rate limits:
- Auth requests: ~100 per hour
- Email sending: 3-4 per hour (free tier)

### Step 5: Restart Fresh
```bash
cd farmtrust-bloom
npm run dev
```

### Step 6: Test Carefully
- Open ONE browser tab only
- Don't refresh multiple times
- Don't click buttons repeatedly
- Wait for responses before clicking again

---

## 🔧 PERMANENT FIXES:

### Fix 1: Disable Custom SMTP (Use Supabase Email)

The SMTP configuration is causing issues. Disable it:

1. Go to Supabase Dashboard
2. Navigate to: **Project Settings → Auth → SMTP Settings**
3. Click **"Disable Custom SMTP"** or toggle it OFF
4. Save changes

This will use Supabase's built-in email (limited but reliable).

### Fix 2: Add Rate Limit Protection to Code

Update `auth-helpers.ts` to add delays between requests:

```typescript
// Add this helper function
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Use it before auth calls
await delay(1000); // Wait 1 second
const { data, error } = await supabase.auth.signUp(...);
```

### Fix 3: Prevent Double Requests

Check if React Strict Mode is causing double renders:

In `src/main.tsx`, if you see:
```tsx
<React.StrictMode>
  <App />
</React.StrictMode>
```

Change to:
```tsx
<App />
```

(Only for development - re-enable for production)

---

## 🎯 TESTING CHECKLIST:

After waiting 15-30 minutes:

- [ ] Browser data cleared
- [ ] All tabs closed
- [ ] Dev server restarted
- [ ] Custom SMTP disabled in Supabase
- [ ] Open ONE tab only
- [ ] Test signup (wait for response)
- [ ] Check email (including spam)
- [ ] Click verification link
- [ ] Complete onboarding

---

## 📊 Rate Limit Reference:

| Action | Free Tier Limit | Reset Time |
|--------|----------------|------------|
| Auth requests | ~100/hour | 1 hour |
| Email sending | 3-4/hour | 1 hour |
| API calls | 500/minute | 1 minute |
| Database queries | Unlimited | - |

---

## 🚫 WHAT NOT TO DO:

❌ Don't refresh the page repeatedly  
❌ Don't click buttons multiple times  
❌ Don't test with multiple browser tabs  
❌ Don't use custom SMTP with Gmail (causes issues)  
❌ Don't ignore rate limit errors  

---

## ✅ WHAT TO DO:

✅ Wait for rate limits to reset  
✅ Clear browser data completely  
✅ Use Supabase's built-in email  
✅ Test slowly and carefully  
✅ Check Supabase logs for errors  
✅ Use one browser tab at a time  

---

## 🔍 How to Check if Rate Limit is Reset:

1. Go to Supabase Dashboard
2. Navigate to: **Logs → Auth Logs**
3. Look for recent errors
4. If no errors in last 15 minutes, you're good to go

---

## 📞 Still Having Issues?

If problems persist after 30 minutes:

1. **Check Supabase Status**: https://status.supabase.com
2. **Check Auth Logs**: Supabase Dashboard → Logs → Auth
3. **Try Incognito Mode**: Test in private/incognito window
4. **Try Different Browser**: Chrome, Firefox, Edge
5. **Check Network**: Disable VPN, try different network

---

## 🎯 RECOMMENDED WORKFLOW:

For development:
1. Use Supabase built-in email (no SMTP)
2. Test with ONE account only
3. Don't spam signup/login
4. Wait between tests

For production:
1. Use proper email service (Resend, SendGrid)
2. Implement rate limiting on frontend
3. Add loading states to prevent double-clicks
4. Monitor Supabase logs

---

**Current Status**: Rate limited - wait 15-30 minutes  
**Next Action**: Clear browser data, wait, then test again  
**Last Updated**: April 20, 2026
