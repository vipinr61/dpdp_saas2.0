# Quick Start Guide - Privotek DPDP

## Getting Started in 5 Minutes

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Create Demo Users in Supabase

Go to your Supabase Dashboard:
1. Navigate to **Authentication > Users**
2. Click the **Add user** button
3. Create two demo accounts:

**Account 1 - Admin:**
- Email: `admin@techsecure.com`
- Password: `password123`

**Account 2 - Analyst:**
- Email: `analyst@techsecure.com`
- Password: `password123`

### Step 3: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 4: Login with Demo Credentials
- Email: `admin@techsecure.com`
- Password: `password123`

## What's Included

✅ **Complete database schema** with all tables and RLS policies  
✅ **5 mock customers** with industries and risk scores  
✅ **7 data repositories** with mixed connection statuses  
✅ **25+ PII findings** across multiple detection types  
✅ **Scan history** with completed scan records  
✅ **Multi-tenant isolation** with secure RLS  
✅ **Authentication system** with role-based access  
✅ **Production-ready UI** with all pages and features  

## Key Pages

| URL | Purpose |
|-----|---------|
| `/login` | Authentication |
| `/dashboard` | Overview & recent activity |
| `/customers` | Customer management |
| `/customers/[id]` | Customer workspace overview |
| `/customers/[id]/repositories` | Data source connections |
| `/customers/[id]/scans` | Scan history & execution |
| `/customers/[id]/inventory` | Finding search & filtering |
| `/customers/[id]/reports` | Assessment reports |
| `/settings` | Account settings |

## Demo Features

### Try These Workflows:

1. **Add a Customer**
   - Navigate to `/customers`
   - Click "Add Customer"
   - Fill in name and industry
   - See it appear in the list with a risk score

2. **Connect a Data Source**
   - Go to a customer workspace
   - Click "Repositories" tab
   - Click "Add Data Source"
   - Select repository type and enter details
   - Test connection (always succeeds in demo)

3. **Run a Scan**
   - Navigate to "Scans" tab
   - Click "Run DPDP Scan"
   - Watch status change from Running → Completed
   - See files scanned and PII found

4. **Explore Findings**
   - Go to "Inventory" tab
   - Search by file path
   - Filter by risk level (High, Medium, Low)
   - Filter by detection type (Aadhaar, PAN, etc.)
   - View confidence scores

5. **Generate a Report**
   - Navigate to "Reports" tab
   - Click "Generate Report"
   - Watch it appear in the list after 3 seconds
   - Click download icon (visual only)

## Database Structure

All data is organized by tenant for complete isolation:

```
TechSecure Consulting (Tenant)
├── Users (2)
│   ├── Rajesh Kumar (Admin)
│   └── Priya Sharma (Analyst)
└── Customers (5)
    ├── FinTech Solutions Ltd
    │   ├── Repositories (2)
    │   │   ├── Production Data Lake (S3)
    │   │   └── Finance Documents (OneDrive)
    │   ├── Scans (2)
    │   └── Findings (7)
    ├── HealthCare Digital Inc
    │   ├── Repositories (2)
    │   ├── Scans (1)
    │   └── Findings (9)
    └── ... (3 more customers)
```

## Deployment

### Deploy to Netlify

1. Push code to GitHub
2. Go to Netlify and click "New site from Git"
3. Select your repository
4. Build settings:
   - Build command: `npm run build`
   - Publish directory: `.next`
5. Add environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Deploy

### Deploy to Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Auto-deploys on git push

## Testing Checklist

- [ ] Login works with demo credentials
- [ ] Dashboard loads with stats and charts
- [ ] Can create new customer
- [ ] Can navigate customer workspace tabs
- [ ] Can connect data source
- [ ] Can run scan (status updates in real-time)
- [ ] Can search and filter findings
- [ ] Can generate and see reports
- [ ] Responsive design works on mobile
- [ ] No console errors

## Architecture

### Authentication
- Supabase Auth handles user login/logout
- User profile synced with `users` table
- Tenant ID stored in user record
- All queries filtered by tenant_id automatically

### Data Security
- Row Level Security (RLS) on all tables
- Users can only access their tenant's data
- No cross-tenant data leakage possible
- Policies verified on every database query

### Performance
- Optimized queries with indexes
- Lazy loading with pagination
- Skeleton loaders during fetch
- Real-time chart updates

## Customization

### Change Brand Colors
Edit `tailwind.config.ts`:
```typescript
const config = {
  theme: {
    extend: {
      colors: {
        emerald: { /* Change to your brand color */ }
      }
    }
  }
}
```

### Add New Detection Types
1. Update `Finding` type in `lib/types.ts`
2. Add detection type to database CHECK constraint
3. Update filter options in inventory page
4. Add to PII distribution chart

### Modify Demo Data
Edit migration files to change seeded customers, scans, and findings.

## Troubleshooting

**"Cannot find user" error**
- Verify you created auth users in Supabase dashboard
- Check email exactly matches

**"Permission denied" on data queries**
- RLS policies require authenticated user
- Verify you're logged in
- Check tenant_id matches your user

**Build fails**
```bash
# Clear and rebuild
rm -rf node_modules .next
npm install
npm run build
```

**Dev server won't start**
- Check port 3000 is available
- Verify .env has Supabase credentials
- Check Node.js version: `node --version`

## Next Steps

1. ✅ **Get it running** - Follow steps above
2. 🎨 **Brand it** - Update colors and logo
3. 📊 **Explore data** - Try all features
4. 🔌 **Integrate APIs** - Connect to real data sources
5. 🚀 **Deploy** - Push to production

## Support

For issues or questions:
- Check `README.md` for detailed documentation
- Review Supabase docs: https://supabase.com/docs
- Check browser console for error messages

---

**You're all set! Login and start assessing DPDP compliance.**
