# Privotek DPDP - DPDP Assessment Operating System

Your Data, Our Mission - A multi-tenant SaaS platform for conducting DPDP (Digital Personal Data Protection) Act assessments.

## Platform Overview

Privotek DPDP is an enterprise-grade assessment platform designed for cybersecurity consulting firms, GRC consultants, and MSSPs in India. It provides a complete workflow for:

- **Multi-tenant client management** - Manage multiple customer organizations within a single tenant
- **Data repository connections** - Connect AWS S3, OneDrive, and SharePoint data sources
- **DPDP scanning orchestration** - Run privacy scans and collect findings
- **Finding inventory** - Browse, filter, and analyze detected PII across all data sources
- **Report generation** - Create executive DPDP assessment reports

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **UI Components**: shadcn/ui (built on Radix UI)
- **Data Visualization**: Recharts
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Icons**: Lucide React

## Project Structure

```
/app
  /(app)                  # Protected app routes
    /layout.tsx           # App shell with sidebar
    /dashboard            # Global dashboard
    /customers            # Customer management
    /customers/[id]       # Customer workspace with tabs
      /repositories       # Data source connections
      /scans              # Scan history and orchestration
      /inventory          # Findings and data inventory
      /reports            # Generated assessment reports
    /settings             # User settings
  /login                  # Authentication
  /page.tsx               # Root redirector

/lib
  /types.ts               # TypeScript interfaces
  /supabase.ts            # Supabase client
  /auth-context.tsx       # Authentication context

/components/ui            # shadcn/ui components
```

## Features

### 1. Authentication
- Email/password login with Supabase Auth
- Multi-tenant user isolation
- Role-based access control (PlatformAdmin, ConsultantAdmin, ConsultantAnalyst, CustomerViewer)

### 2. Dashboard
- Summary stats: Active customers, active scans, critical risks
- Recent activity timeline
- Monthly assessment completion chart

### 3. Customer Management
- List all customers for your tenant
- Quick risk score indicators (High/Medium/Low)
- Create new customer engagements
- View detailed customer workspace

### 4. Customer Workspace
Organized as a tabbed interface with five main sections:

#### Overview Tab
- Risk Assessment Gauge (0-100 scale)
- PII Type Distribution Chart (Aadhaar, PAN, Passport, Email, Phone)
- DPDP Readiness Summary with AI-generated insights

#### Repositories Tab
- Connect data sources (AWS S3, OneDrive, SharePoint)
- View connection status and sync times
- Test connections before adding

#### Scans Tab
- View scan history with duration and results
- Run new DPDP scans on connected repositories
- Real-time status updates (Pending → Running → Completed)

#### Inventory Tab
- Browse all detected PII findings
- Search by file path
- Filter by risk level or detection type
- Paginated results (10 per page)
- Confidence scores for each finding

#### Reports Tab
- Generate executive DPDP assessment reports
- Download reports as PDF
- View report history with generation dates

### 5. Settings
- View account information
- Theme preferences
- Notification settings
- API configuration (future)

## Demo Data

The platform comes pre-loaded with realistic mock data:

- **1 Tenant**: TechSecure Consulting (Enterprise tier)
- **2 Demo Users**:
  - Rajesh Kumar (ConsultantAdmin) - admin@techsecure.com
  - Priya Sharma (ConsultantAnalyst) - analyst@techsecure.com
- **5 Customers**: Spanning Financial Services, Healthcare, Education, Retail, Logistics
- **7 Repositories**: Mixed connection statuses
- **5 Completed Scans**: With varying file counts and PII findings
- **25+ Findings**: Across multiple detection types with confidence scores

## Demo Credentials

All demo users use the password: `password123`

| Email | Password | Role |
|-------|----------|------|
| admin@techsecure.com | password123 | ConsultantAdmin |
| analyst@techsecure.com | password123 | ConsultantAnalyst |

## Setup Instructions

### Prerequisites
- Node.js 18+
- npm or yarn
- Supabase project with API credentials

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables

The `.env` file already contains Supabase credentials. Verify they're set:

```env
NEXT_PUBLIC_SUPABASE_URL=https://gbpwfsmnmnopbhpafzsl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### 3. Database Setup

Database migrations and seed data have already been applied via Supabase. The following tables exist:
- `tenants` - Organization accounts
- `users` - Platform users
- `customers` - Client organizations being assessed
- `repositories` - Data source connections
- `scans` - DPDP scan records
- `findings` - PII detection findings
- `reports` - Generated assessment reports

All tables have Row Level Security (RLS) enabled for multi-tenant data isolation.

### 4. Create Demo Users

To create demo users in Supabase Auth:

1. Go to your Supabase dashboard
2. Navigate to **Authentication > Users**
3. Click **Add User**
4. Create the following accounts:

**User 1:**
- Email: `admin@techsecure.com`
- Password: `password123`

**User 2:**
- Email: `analyst@techsecure.com`
- Password: `password123`

The user records are already seeded in the database and will automatically link when the auth users are created.

### 5. Run Development Server

```bash
npm run dev
```

The application will start at `http://localhost:3000`

### 6. Build for Production

```bash
npm run build
npm start
```

## Deployment

### Netlify (Recommended)

1. Push to GitHub
2. Connect repository to Netlify
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Set environment variables in Netlify dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Vercel

1. Push to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

## Architecture Highlights

### Multi-Tenancy
- All data is scoped by `tenant_id`
- RLS policies enforce tenant isolation
- Users can only access data within their tenant

### Authentication Flow
1. User logs in via email/password
2. Supabase Auth returns session
3. User profile fetched from `users` table
4. Auth context stores user state and tenant_id
5. All subsequent API calls scoped to tenant

### Data Access Pattern
```
User (authenticated) 
  → Tenant (via user.tenant_id)
    → Customers (filtered by tenant_id)
      → Repositories (via customer_id)
        → Scans (via repository_id)
          → Findings (via scan_id)
```

### RLS Security Model
- SELECT policies check if user belongs to tenant
- INSERT/UPDATE policies verify tenant ownership
- DELETE policies prevent accidental data loss
- All policies use `auth.uid()` for user verification

## Key Features

### Risk Scoring Algorithm
Risk scores (0-100) are calculated as:
- **High Risk (70+)**: Multiple high-confidence PII detections
- **Medium Risk (50-69)**: Mixed detection types or lower confidence
- **Low Risk (<50)**: Minimal sensitive data detected

### Scan Simulation
- Simulates realistic scan lifecycle: Pending → Running → Completed
- Generates random file counts (500-1500 files) and PII findings (10-60)
- Completes after 3-second delay for demo purposes
- In production, would integrate with actual Presidio scanning engine

### Performance Optimizations
- Sidebar collapses on mobile devices
- Loading skeletons for all async operations
- Pagination for large finding datasets
- Memoized chart components
- Optimized images and assets

## Customization

### Changing Brand Colors
Edit `tailwind.config.ts` to modify the color palette:
- Primary: Change emerald to your brand color
- Background: Adjust slate tones
- Semantic colors: Red, Yellow, Green remain for risk levels

### Adding New Data Types
1. Add detection type to `Finding` interface in `lib/types.ts`
2. Update detection_type CHECK constraint in database
3. Add filter option in inventory page
4. Update PII distribution chart logic

### Extending Repositories
1. Add new repository type to `type` field
2. Update connection logic in repositories page
3. Add new source icon in getSourceIcon function

## Testing

### Test Workflows
1. **Login**: Use demo credentials to authenticate
2. **Dashboard**: Verify stats load and chart displays
3. **Customers**: Add new customer, verify appears in list
4. **Repositories**: Connect a data source, test connection
5. **Scans**: Run scan, verify status updates
6. **Inventory**: Filter findings by risk level and type
7. **Reports**: Generate report, verify appears in list

### Data Verification
All data is queryable directly via Supabase console:
- Check tenants, users, customers tables
- Verify RLS policies are functioning
- Monitor findings and scan results
- Confirm user isolation by tenant

## Troubleshooting

### "Cannot find user" error
- Ensure you've created auth users matching the demo emails
- Verify user email exactly matches the auth account
- Check users table has record for that email

### "Permission denied" errors
- Verify RLS policies are enabled on all tables
- Check tenant_id matches authenticated user's tenant
- Ensure auth session is active

### Builds fail
- Run `npm install` to ensure dependencies
- Clear `.next` folder: `rm -rf .next`
- Check Node.js version is 18+

## Security Considerations

- All passwords should be changed in production
- Implement actual email verification
- Add rate limiting to authentication endpoints
- Use environment variables for sensitive config
- Enable HTTPS in production
- Implement session timeouts
- Add audit logging for sensitive operations

## Future Enhancements

- Integration with actual Presidio PII detection engine
- Real file scanning and parsing (PDF, Excel, etc.)
- Automated remediation workflows
- Data retention policies
- Compliance dashboard
- API access for integrations
- Third-party data source connectors
- Advanced filtering and export capabilities
- Real-time collaborative workspace

## Support & Documentation

For detailed Supabase documentation, visit: https://supabase.com/docs

## License

This project is proprietary software for Privotek DPDP. All rights reserved.

---

**Ready to assess DPDP compliance. Let's protect your data.**
