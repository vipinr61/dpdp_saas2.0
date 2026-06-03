# Troubleshooting Login Issues

If you're unable to login, follow these steps:

## Step 1: Test Supabase Connection

Visit: `/debug`

This page will check:
- ✓ Supabase client initialization
- ✓ Configuration (URL & API key)
- ✓ Auth users in Supabase
- ✓ Database access

**What to expect:**
- All checkmarks should be green
- Should see `admin@techsecure.com` and `analyst@techsecure.com` listed

**If failed:**
- Check browser console (F12 → Console tab)
- Check network tab for errors
- Verify `.env` file has correct Supabase URL and key

## Step 2: Test Authentication Directly

Visit: `/test-auth`

Click "Test Login" button. This will:
- Check current session
- Attempt login with `admin@techsecure.com` / `password123`
- Show detailed error messages if it fails
- Auto-redirect to dashboard if successful

**What you might see:**

### Success
```
Login succeeded! User: admin@techsecure.com
(Then redirects to dashboard in 2 seconds)
```

### Error: Invalid credentials
- Credentials are wrong
- Supabase auth is not recognizing the user
- **Fix:** Verify demo users were created in Supabase

### Error: Network error
- Supabase URL is unreachable
- Internet connectivity issue
- **Fix:** Check network connection, verify firewall allows Supabase

### Error: API key invalid
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` is wrong
- **Fix:** Check `.env` file, copy correct key from Supabase dashboard

## Step 3: Try Regular Login

Visit: `/login`

With enhanced error messages:
- Shows what step failed
- Displays error details
- Better debugging info

## Step 4: If Still Stuck

### Check These:

1. **Verify Demo Users Exist**
   ```bash
   # In Supabase dashboard:
   - Go to Authentication > Users
   - Should see admin@techsecure.com
   - Should see analyst@techsecure.com
   ```

2. **Verify .env Configuration**
   ```bash
   # In project root:
   cat .env
   # Should show:
   # NEXT_PUBLIC_SUPABASE_URL=https://...
   # NEXT_PUBLIC_SUPABASE_ANON_KEY=...
   ```

3. **Check Browser Console** (F12)
   - Open DevTools
   - Go to Console tab
   - Look for red errors
   - Look for network errors
   - Copy full error message

4. **Check Network Tab** (F12)
   - Open DevTools
   - Go to Network tab
   - Click "Test Login" again
   - Look for failed requests
   - Check requests to `supabase` domain

5. **Try Different Browser**
   - Chrome, Firefox, Safari
   - Try incognito/private window
   - Clear cookies and cache

## Common Issues & Solutions

### Issue: "Invalid credentials"

**Cause:** User doesn't exist in Supabase Auth

**Solution:**
1. Go to Supabase dashboard
2. Authentication > Users
3. Click "Add user"
4. Email: `admin@techsecure.com`
5. Password: `password123`
6. Repeat for analyst account
7. Try login again

### Issue: "Please provide a valid JWT"

**Cause:** API key is invalid or missing

**Solution:**
1. Go to Supabase project settings
2. Copy the correct Anon key
3. Update `.env` file
4. Restart dev server
5. Try again

### Issue: "Failed to fetch"

**Cause:** Network issue or Supabase unreachable

**Solution:**
1. Check internet connection
2. Try different network (wifi vs mobile hotspot)
3. Check if firewall blocks Supabase
4. Try from different location

### Issue: "Session not created"

**Cause:** Login worked but redirect failed

**Solution:**
1. Check browser dev tools for JavaScript errors
2. Try manual redirect: visit `/dashboard`
3. If dashboard loads, auth is working
4. Check middleware configuration

### Issue: Blank page after login

**Cause:** Dashboard page not loading

**Solution:**
1. Check console for errors
2. Verify you're logged in: visit `/test-auth` > Check Session
3. Check browser network tab for failed requests
4. Try refreshing page

## Debug Information to Collect

If you need help, gather:

1. **Error message** - Copy exact text
2. **Console errors** - F12 → Console → Copy all red text
3. **Network errors** - F12 → Network → Take screenshot
4. **Browser info** - What browser? Version?
5. **Steps taken** - What exactly did you try?
6. **Test results** - What did `/debug` and `/test-auth` show?

## Quick Test Commands

If you have access to terminal:

```bash
# Test if Supabase URL is reachable
curl -I https://gbpwfsmnmnopbhpafzsl.supabase.co

# Check env file
cat .env

# Rebuild app
npm run build

# Run dev server
npm run dev
```

## Still Not Working?

1. Visit `/debug` - Share what it shows
2. Visit `/test-auth` - Share error message
3. Open F12 console - Share any red errors
4. Try `/dashboard` directly - Does it work or show error?

## Expected Behavior

When everything works:

1. Visit application at `/` or `/login`
2. See login page
3. Enter `admin@techsecure.com` / `password123`
4. Click "Sign In"
5. See "Signing in..." briefly
6. Redirect to `/dashboard`
7. See dashboard with data

If any step fails, report where it fails + the error message.
