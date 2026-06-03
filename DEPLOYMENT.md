# Deployment Guide - Privotek DPDP

## Pre-Deployment Checklist

- [x] Database schema created and tested
- [x] Mock data seeded
- [x] Authentication system configured
- [x] All pages developed and tested
- [x] Build succeeds with no errors
- [x] Environment variables configured
- [x] Documentation complete

## Environment Variables

Required environment variables (already configured in `.env`):

```env
NEXT_PUBLIC_SUPABASE_URL=https://gbpwfsmnmnopbhpafzsl.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here
```

These are public variables and safe to expose in the frontend.

## Deployment Option 1: Netlify

### Prerequisites
- GitHub account with repository
- Netlify account

### Step-by-Step

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Privotek DPDP deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "New site from Git"
   - Select GitHub and your repository
   - Click Deploy

3. **Configure Build Settings**
   - Build command: `npm run build`
   - Publish directory: `.next`
   - Click Deploy

4. **Add Environment Variables**
   - Go to Site settings → Build & deploy → Environment
   - Add both `NEXT_PUBLIC_SUPABASE_*` variables
   - Re-deploy

5. **Create Demo Users**
   - Visit your deployed site
   - See login error (normal - users not created yet)
   - Go to Supabase dashboard → Authentication → Users
   - Create demo accounts:
     - Email: admin@techsecure.com, Password: password123
     - Email: analyst@techsecure.com, Password: password123
   - Refresh deployed site and login

### Verification
- Visit `https://your-site.netlify.app`
- Login with admin@techsecure.com / password123
- Test all features

## Deployment Option 2: Vercel

### Prerequisites
- GitHub account with repository
- Vercel account

### Step-by-Step

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial Privotek DPDP deployment"
   git push origin main
   ```

2. **Import to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "Add New..." → "Project"
   - Select GitHub repository
   - Click Import

3. **Configure Environment Variables**
   - In build settings, add:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - Click Deploy

4. **Create Demo Users**
   - Go to Supabase dashboard → Authentication → Users
   - Create demo accounts:
     - Email: admin@techsecure.com, Password: password123
     - Email: analyst@techsecure.com, Password: password123

5. **Verify Deployment**
   - Visit your Vercel URL
   - Login with demo credentials
   - Test all features

## Deployment Option 3: Docker

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

ENV NEXT_PUBLIC_SUPABASE_URL=https://gbpwfsmnmnopbhpafzsl.supabase.co
ENV NEXT_PUBLIC_SUPABASE_ANON_KEY=your-key-here

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

### Build & Run

```bash
docker build -t privotek-dpdp .
docker run -p 3000:3000 privotek-dpdp
```

## Deployment Option 4: Self-Hosted (VPS/EC2)

### Prerequisites
- VPS or EC2 instance
- Node.js 18+ installed
- PM2 for process management

### Setup

```bash
# SSH into server
ssh ubuntu@your-server-ip

# Install Node.js if not already installed
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone repository
git clone https://github.com/yourusername/privotek-dpdp.git
cd privotek-dpdp

# Install PM2 globally
npm install -g pm2

# Install dependencies
npm install

# Build application
npm run build

# Start with PM2
pm2 start npm --name "privotek" -- start
pm2 save
pm2 startup
```

### Configure Nginx Reverse Proxy

```nginx
upstream privotek {
    server localhost:3000;
}

server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        proxy_pass http://privotek;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

### Enable HTTPS with Let's Encrypt

```bash
sudo apt-get install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Post-Deployment Steps

### 1. Create Demo Users

Go to Supabase dashboard:
1. Navigate to Authentication > Users
2. Click "Add user"
3. Create first demo account:
   - Email: admin@techsecure.com
   - Password: password123
4. Create second demo account:
   - Email: analyst@techsecure.com
   - Password: password123

### 2. Test All Features

- [ ] Login works
- [ ] Dashboard loads
- [ ] Can create customer
- [ ] Can connect repository
- [ ] Can run scan
- [ ] Can view findings
- [ ] Can generate report

### 3. Monitor Performance

- Check Lighthouse score
- Monitor database queries
- Track API response times
- Monitor server resources

### 4. Security Checklist

- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Demo credentials will be changed
- [ ] Rate limiting configured
- [ ] CORS properly set
- [ ] SQL injection prevention active
- [ ] XSS protection active

### 5. Backup Strategy

```bash
# Daily backup of Supabase database
# Set up automated backups in Supabase dashboard

# Weekly code backup
# Use GitHub as primary backup

# Database snapshots
# Configure in Supabase dashboard
```

## Monitoring & Logging

### Application Logs
- Netlify: Dashboard > Deployments > Build logs
- Vercel: Dashboard > Deployments > Logs
- Self-hosted: `pm2 logs`

### Error Tracking
- Set up Sentry for error tracking
- Configure email alerts
- Monitor performance metrics

### Uptime Monitoring
- Use Uptime Robot
- Set up HTTP checks to main pages
- Configure email notifications

## Scaling Considerations

### For Development
- Current setup handles up to 1,000 concurrent users
- Single database instance sufficient

### For Production (High Traffic)
- Enable Supabase read replicas
- Implement caching layer (Redis)
- Use CDN for static assets
- Consider horizontal scaling

## Troubleshooting Deployment Issues

### Build Fails on Netlify/Vercel

```bash
# Clear cache and rebuild
# In deployment settings, clear build cache
# Re-deploy

# Or locally:
rm -rf .next node_modules
npm install
npm run build
```

### Database Connection Errors

- Verify Supabase credentials in environment variables
- Check Supabase project is active
- Verify RLS policies are enabled

### Login Not Working

- Ensure demo users created in Supabase Auth
- Verify user email exactly matches
- Check browser cookies are enabled
- Clear browser cache and try again

### Slow Performance

- Check database query performance
- Verify indexes are created
- Monitor network tab in browser DevTools
- Check Supabase dashboard for usage spikes

## Rollback Procedure

### Netlify

1. Go to Deploys section
2. Find previous successful deployment
3. Click "Publish deploy"

### Vercel

1. Go to Deployments tab
2. Find previous working deployment
3. Click on it and select "Promote to Production"

### Self-Hosted

```bash
# Rollback code
git revert <commit-hash>
git push

# Rebuild and restart
npm run build
pm2 restart privotek
```

## Update Procedure

### Update Dependencies

```bash
npm update
npm audit fix
npm run build
npm run dev
# Test locally
git push
# Automatic deployment triggers
```

### Update Database Schema

```sql
-- Carefully test changes locally first
-- Use migrations for any schema changes
-- Never modify data in production directly
```

## Cost Estimation

### Netlify
- Free tier: Unlimited builds, 300 minutes/month
- Pro: $19/month

### Vercel
- Free tier: Unlimited builds, 100 GB/month bandwidth
- Pro: $20/month

### Supabase
- Free tier: 500MB storage, 50MB/month uploads
- Pro: $25/month

### Total Monthly: $40-50/month for production-grade hosting

## Success Criteria

✓ Application accessible via web browser  
✓ Login works with demo credentials  
✓ All pages load without errors  
✓ Database queries execute successfully  
✓ Charts and tables display correctly  
✓ Forms submit and save data  
✓ Mobile responsive design works  
✓ HTTPS enabled (production)  
✓ Performance acceptable (<3s page load)  

---

**Deployment checklist complete. Ready for production!**
