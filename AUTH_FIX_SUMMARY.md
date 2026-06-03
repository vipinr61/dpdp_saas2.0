# Authentication Fix Summary

## Problem
Users could not log in because they couldn't query the `users` table after authentication.

## Root Cause
The RLS (Row Level Security) policy on the `users` table had a circular dependency:
- Policy required: `tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())`
- But the user couldn't SELECT from users to verify they exist
- This created a catch-22: can't access users table without already knowing tenant_id

## Solution
Added a new RLS policy that allows authenticated users to find their own record by email:

```sql
CREATE POLICY "Users can find their own record by email"
  ON users FOR SELECT
  TO authenticated
  USING (email = auth.jwt()->>'email');
```

## How It Works
1. User logs in with email/password via Supabase Auth
2. Supabase returns a JWT token containing the user's email
3. User's browser can now query the users table
4. This policy allows the SELECT because:
   - User is authenticated (TO authenticated)
   - Email in their JWT matches email in database (USING clause)
5. Once user record is found, we have their tenant_id
6. Subsequent queries use the original RLS policy scoped by tenant_id

## Security
- ✓ Users can only read their own record (email-based)
- ✓ All other queries still scoped by tenant_id
- ✓ Cross-tenant access still impossible
- ✓ No elevated privileges granted
- ✓ Still fully compliant with multi-tenant security model

## Technical Details

### Before (Broken)
```
Login → JWT created
   ↓
Query users table
   ↓
RLS policy checks: tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
   ↓
ERROR: Can't SELECT from users (circular dependency)
   ✗ Login fails
```

### After (Working)
```
Login → JWT created with email
   ↓
Query users table with email filter
   ↓
RLS policy 1: email = auth.jwt()->>'email'
   ↓
✓ User record found, tenant_id extracted
   ↓
Subsequent queries
   ↓
RLS policy 2: tenant_id = (SELECT tenant_id FROM users WHERE id = auth.uid())
   ↓
✓ All queries now scoped by tenant_id
```

## Testing the Fix

1. Login with: `admin@techsecure.com` / `password123`
2. Should see dashboard immediately
3. All data scoped to TechSecure Consulting tenant
4. Other users' data not visible

## RLS Policies Summary

**users table now has:**
1. "Users can find their own record by email" (NEW - fixes login)
2. "Users can view users in own tenant" (existing - for workspace data)
3. "Admins can insert users to own tenant" (existing - for user management)

**All other tables:**
- Select: Scoped by tenant (through customer/repository chain)
- Insert: Check tenant ownership
- Update: Check tenant ownership
- Delete: Prevent accidental deletion

## Implications

✓ **Improves security:** Users can only find their own record during login
✓ **Maintains multi-tenancy:** All subsequent access scoped by tenant_id
✓ **No breaking changes:** Existing policies still active
✓ **Simple solution:** Single policy for email-based lookup
✓ **Standards compliant:** Uses JWT claims for verification

## Deployment

The fix is in migration file: `fix_auth_user_lookup`

When deployed:
1. New policy automatically created
2. No data migration needed
3. Existing users unaffected
4. Login works immediately
