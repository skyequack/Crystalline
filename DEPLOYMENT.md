# Deployment Instructions

## Quick Start Guide

### Option 1: Vercel Deployment (Recommended)

#### Step 1: Prepare Database

1. **Create a PostgreSQL Database:**

   - Use [Neon](https://neon.tech) (recommended - free tier)
   - Or [Supabase](https://supabase.com)
   - Or [Railway](https://railway.app)

2. **Get Connection String:**
   ```
   postgresql://username:password@host:5432/database?sslmode=require
   ```

#### Step 2: Deploy to Vercel

1. **Push to GitHub:**

   ```powershell
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin YOUR_GITHUB_REPO_URL
   git push -u origin main
   ```

2. **Import to Vercel:**

   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Vercel will auto-detect Next.js

3. **Add Environment Variables:**
   In Vercel dashboard, add these:

   ```
   DATABASE_URL=your_postgresql_connection_string
   NEXTAUTH_SECRET=generate_random_32_char_string
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXT_PUBLIC_COMPANY_NAME=Crystalline Glass & Aluminum
   NEXT_PUBLIC_COMPANY_PHONE=+971-XX-XXXXXXX
   NEXT_PUBLIC_COMPANY_EMAIL=info@crystalline.ae
   NEXT_PUBLIC_COMPANY_ADDRESS=Dubai, UAE
   ```

   Generate NEXTAUTH_SECRET:

   ```powershell
   node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
   ```

4. **Deploy:**

   - Click "Deploy"
   - Wait for build to complete

5. **Run Database Migrations:**

   Option A - Via Vercel CLI:

   ```powershell
   npm i -g vercel
   vercel login
   vercel link
   vercel env pull .env.local
   npx prisma migrate deploy
   ```

   Option B - Run seed command after first deploy:

   - The build process will run `prisma generate` automatically
   - You need to manually seed via Vercel CLI or database client

6. **Seed Database:**

   ```powershell
   # Using Vercel CLI
   vercel env pull
   npm run seed
   ```

   Or connect to your database directly and run seed script.

---

### Option 2: Docker Deployment

#### Step 1: Create Dockerfile

Already created in project root.

#### Step 2: Create docker-compose.yml

```yaml
version: "3.8"

services:
  db:
    image: postgres:15-alpine
    environment:
      POSTGRES_USER: crystalline
      POSTGRES_PASSWORD: your_secure_password
      POSTGRES_DB: crystalline
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      DATABASE_URL: postgresql://crystalline:your_secure_password@db:5432/crystalline
      NEXTAUTH_SECRET: generate_random_secret
      NEXTAUTH_URL: http://localhost:3000
      NEXT_PUBLIC_COMPANY_NAME: Crystalline Glass & Aluminum
      NEXT_PUBLIC_COMPANY_PHONE: +971-XX-XXXXXXX
      NEXT_PUBLIC_COMPANY_EMAIL: info@crystalline.ae
      NEXT_PUBLIC_COMPANY_ADDRESS: Dubai, UAE
    depends_on:
      - db
    command: sh -c "npx prisma migrate deploy && npm run seed && npm start"

volumes:
  postgres_data:
```

#### Step 3: Deploy

```powershell
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f app

# Stop
docker-compose down
```

---

### Option 3: VPS/Cloud Server (Ubuntu)

#### Step 1: Install Prerequisites

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install PostgreSQL
sudo apt install -y postgresql postgresql-contrib

# Install Nginx
sudo apt install -y nginx

# Install PM2 (process manager)
sudo npm install -g pm2
```

#### Step 2: Set Up PostgreSQL

```bash
# Switch to postgres user
sudo -u postgres psql

# Create database and user
CREATE DATABASE crystalline;
CREATE USER crystalline_user WITH PASSWORD 'your_secure_password';
GRANT ALL PRIVILEGES ON DATABASE crystalline TO crystalline_user;
\q
```

#### Step 3: Deploy Application

```bash
# Clone repository
cd /var/www
git clone YOUR_REPO_URL crystalline
cd crystalline

# Install dependencies
npm ci --only=production

# Create .env file
nano .env
# Add your environment variables

# Run migrations
npx prisma migrate deploy

# Seed database
npm run seed

# Build application
npm run build

# Start with PM2
pm2 start npm --name "crystalline" -- start
pm2 save
pm2 startup
```

#### Step 4: Configure Nginx

```bash
sudo nano /etc/nginx/sites-available/crystalline
```

Add:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable and restart:

```bash
sudo ln -s /etc/nginx/sites-available/crystalline /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### Step 5: Set Up SSL (Optional but Recommended)

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Can login with default credentials
- [ ] Change default passwords immediately
- [ ] Create production admin account
- [ ] Delete or disable demo accounts
- [ ] Test quotation creation
- [ ] Test Excel download
- [ ] Verify calculations are correct
- [ ] Set up database backups
- [ ] Configure monitoring (optional)
- [ ] Update company information in settings

---

## Maintenance Commands

### Update Application

**Vercel:**

```powershell
git pull origin main
git push
# Vercel auto-deploys
```

**Docker:**

```powershell
git pull
docker-compose down
docker-compose build
docker-compose up -d
```

**VPS:**

```bash
cd /var/www/crystalline
git pull
npm ci
npm run build
pm2 restart crystalline
```

### Database Backup

**PostgreSQL:**

```bash
# Backup
pg_dump -U crystalline_user crystalline > backup_$(date +%Y%m%d).sql

# Restore
psql -U crystalline_user crystalline < backup_20231206.sql
```

**Automated Backups (Cron):**

```bash
crontab -e
# Add:
0 2 * * * pg_dump -U crystalline_user crystalline > /backups/crystalline_$(date +\%Y\%m\%d).sql
```

---

## Environment Variables Reference

| Variable                    | Required | Description                  | Example                             |
| --------------------------- | -------- | ---------------------------- | ----------------------------------- |
| DATABASE_URL                | Yes      | PostgreSQL connection string | postgresql://user:pass@host:5432/db |
| NEXTAUTH_SECRET             | Yes      | Secret for JWT encryption    | Random 32+ char string              |
| NEXTAUTH_URL                | Yes      | Application URL              | https://app.vercel.app              |
| NEXT_PUBLIC_COMPANY_NAME    | No       | Company name in Excel        | Crystalline Glass                   |
| NEXT_PUBLIC_COMPANY_PHONE   | No       | Phone in Excel header        | +971-XX-XXX-XXXX                    |
| NEXT_PUBLIC_COMPANY_EMAIL   | No       | Email in Excel header        | info@company.ae                     |
| NEXT_PUBLIC_COMPANY_ADDRESS | No       | Address in Excel header      | Dubai, UAE                          |

---

## Troubleshooting

### Build Fails on Vercel

1. Check build logs in Vercel dashboard
2. Verify all environment variables are set
3. Ensure DATABASE_URL is correct
4. Check Node.js version in package.json engines

### Database Connection Issues

1. Verify DATABASE_URL format
2. Check database is accessible from Vercel
3. Ensure SSL mode is enabled for cloud databases
4. Test connection locally first

### Excel Download Not Working

1. Check browser console for errors
2. Verify ExcelJS is in dependencies (not devDependencies)
3. Test API endpoint directly: `/api/quotations/[id]/download`
4. Check server logs

---

## Security Best Practices

1. **Change Default Passwords** immediately after deployment
2. **Use Strong NEXTAUTH_SECRET** (32+ random characters)
3. **Enable HTTPS** (automatic with Vercel)
4. **Rotate Database Passwords** regularly
5. **Backup Database** daily
6. **Monitor Access Logs** for suspicious activity
7. **Keep Dependencies Updated** regularly
8. **Limit Admin Accounts** to essential personnel only

---

## Performance Optimization

1. **Database Indexes:** Already configured in Prisma schema
2. **Image Optimization:** Use next/image for any images you add
3. **Caching:** Enable Vercel Edge Caching
4. **Database Connection Pooling:** Use Prisma connection pool (already configured)
5. **CDN:** Vercel provides automatic CDN

---

## Monitoring (Optional)

### Vercel Analytics

Enable in Vercel dashboard for free analytics.

### Database Monitoring

Use your database provider's dashboard (Neon, Supabase, etc.)

### Error Tracking

Consider adding [Sentry](https://sentry.io):

```bash
npm install @sentry/nextjs
```

---

## Support

If you encounter issues:

1. Check application logs
2. Review this deployment guide
3. Check database connectivity
4. Verify environment variables
5. Test locally first before deploying

---

**Deployment Status:** Ready for Production ✅
