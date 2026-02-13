# 🚀 Deployment Guide - Phase 6

Complete guide to deploying your Rent Payment Application to production.

---

## 📋 Table of Contents

- [Deployment Architecture](#deployment-architecture)
- [Pre-Deployment Checklist](#pre-deployment-checklist)
- [Option 1: Heroku + Vercel (Recommended)](#option-1-heroku--vercel-recommended)
- [Option 2: AWS (Advanced)](#option-2-aws-advanced)
- [Option 3: DigitalOcean (Alternative)](#option-3-digitalocean-alternative)
- [Post-Deployment](#post-deployment)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## 🏗️ Deployment Architecture

**Recommended Setup:**

```
User Browser
    ↓
Frontend (Vercel/Netlify) → https://yourapp.com
    ↓
Backend API (Heroku/AWS) → https://api.yourapp.com
    ↓
Database (Supabase Production)
    ↓
Payment Gateway (Cybersource Production)
```

**Components:**
- **Frontend:** React app (Static hosting)
- **Backend:** Node.js API (PaaS or VPS)
- **Database:** PostgreSQL (Supabase or managed)
- **Payments:** Cybersource production account
- **SSL:** Automatic with Vercel/Heroku
- **Domain:** Your custom domain

---

## ✅ Pre-Deployment Checklist

### 1. Production Accounts Setup

- [ ] **Supabase Production Database**
  - Create new Supabase project for production
  - Or upgrade existing project
  - Note: Keep dev/prod databases separate!

- [ ] **Cybersource Production Account**
  - Apply for production merchant account
  - Get production API keys
  - Configure webhook URLs
  - Complete compliance requirements

- [ ] **Hosting Accounts**
  - [ ] Heroku account (Backend)
  - [ ] Vercel account (Frontend)
  - [ ] Domain registrar (e.g., Namecheap, GoDaddy)

- [ ] **Optional Services**
  - [ ] SendGrid (Email notifications)
  - [ ] Sentry (Error tracking)
  - [ ] LogDNA or Papertrail (Log management)

### 2. Code Preparation

- [ ] All tests passing
- [ ] Environment variables documented
- [ ] Database migrations ready
- [ ] Production secrets generated
- [ ] CORS configuration updated
- [ ] Error handling tested
- [ ] Security headers configured

### 3. Security Hardening

- [ ] Generate new JWT_SECRET (64+ characters)
- [ ] Generate new SESSION_SECRET
- [ ] Review rate limiting settings
- [ ] Enable HTTPS only
- [ ] Set secure cookie flags
- [ ] Review CORS whitelist
- [ ] Database SSL enforced

---

## 🎯 Option 1: Heroku + Vercel (Recommended)

**Best for:** Quick deployment, automatic scaling, minimal DevOps

**Cost:** ~$7-25/month (Heroku Basic) + Free (Vercel)

### Step 1: Deploy Backend to Heroku

#### 1.1 Install Heroku CLI

```bash
# Windows (with Chocolatey)
choco install heroku-cli

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

#### 1.2 Login to Heroku

```bash
heroku login
```

#### 1.3 Create Heroku App

```bash
cd C:\Misc\Project_Learning\payment-checkout

# Create app (choose unique name)
heroku create your-app-name-api

# This creates: https://your-app-name-api.herokuapp.com
```

#### 1.4 Add PostgreSQL Add-on (Optional)

```bash
# If not using Supabase, add Heroku Postgres
heroku addons:create heroku-postgresql:mini

# Or continue with Supabase (recommended)
```

#### 1.5 Set Environment Variables

```bash
# Required variables
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET="YOUR-PRODUCTION-JWT-SECRET-64-CHARS"
heroku config:set SESSION_SECRET="YOUR-PRODUCTION-SESSION-SECRET"

# Database (Supabase production)
heroku config:set DB_HOST="your-production-db.supabase.co"
heroku config:set DB_PORT=5432
heroku config:set DB_NAME=postgres
heroku config:set DB_USER="your-production-user"
heroku config:set DB_PASSWORD="your-production-password"

# Cybersource (production)
heroku config:set CYBERSOURCE_MERCHANT_ID="your-production-merchant-id"
heroku config:set CYBERSOURCE_API_KEY="your-production-api-key"
heroku config:set CYBERSOURCE_SECRET_KEY="your-production-secret-key"
heroku config:set CYBERSOURCE_API_URL="https://api.cybersource.com"
heroku config:set CYBERSOURCE_ENVIRONMENT=production

# Frontend URL (will update after frontend deployed)
heroku config:set CLIENT_URL="https://yourapp.com"

# Payment processing
heroku config:set ENABLE_RECURRING_PAYMENTS=true
heroku config:set PAYMENT_RETRY_ATTEMPTS=3
heroku config:set PAYMENT_RETRY_DELAY_HOURS=24
```

#### 1.6 Create Heroku-Specific Files

Create `server/package.json` start script (if not already):

```json
{
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  }
}
```

#### 1.7 Deploy to Heroku

```bash
# Initialize git (if not already)
git init
git add .
git commit -m "Initial commit for Heroku deployment"

# Add Heroku remote
heroku git:remote -a your-app-name-api

# Create a subtree for server directory
git subtree push --prefix server heroku main

# Or if using main directory:
git push heroku main
```

#### 1.8 Run Database Migrations

```bash
# SSH into Heroku
heroku run bash

# Inside Heroku dyno
cd server
node scripts/setupDatabase.js

# Exit
exit
```

#### 1.9 Enable Dyno

```bash
# Scale web dyno
heroku ps:scale web=1

# Check status
heroku ps

# View logs
heroku logs --tail
```

#### 1.10 Test Backend

```bash
# Health check
curl https://your-app-name-api.herokuapp.com/api/health

# Should return:
# {"success":true,"message":"Rent Payment API is running"}
```

**✅ Backend Deployed!** API URL: `https://your-app-name-api.herokuapp.com`

---

### Step 2: Deploy Frontend to Vercel

#### 2.1 Install Vercel CLI

```bash
npm install -g vercel
```

#### 2.2 Login to Vercel

```bash
vercel login
```

#### 2.3 Update Frontend API URL

Edit `client/src/services/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL ||
                process.env.NODE_ENV === 'production'
                  ? 'https://your-app-name-api.herokuapp.com/api'
                  : 'http://localhost:3000/api';
```

Or create `client/.env.production`:

```env
REACT_APP_API_URL=https://your-app-name-api.herokuapp.com/api
```

#### 2.4 Build Frontend

```bash
cd client
npm run build
```

#### 2.5 Deploy to Vercel

```bash
# From client directory
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? Your account
# - Link to existing project? No
# - Project name? your-app-name
# - Directory? ./
# - Override settings? No

# Deploy to production
vercel --prod
```

#### 2.6 Configure Environment Variables in Vercel

```bash
# Via CLI
vercel env add REACT_APP_API_URL production

# Or via Vercel Dashboard:
# 1. Go to project settings
# 2. Environment Variables
# 3. Add: REACT_APP_API_URL = https://your-app-name-api.herokuapp.com/api
```

#### 2.7 Redeploy with Environment Variables

```bash
vercel --prod
```

**✅ Frontend Deployed!** App URL: `https://your-app-name.vercel.app`

---

### Step 3: Configure Custom Domain (Optional)

#### 3.1 Add Domain to Vercel

```bash
vercel domains add yourapp.com
```

Or via Vercel Dashboard:
1. Go to project settings
2. Domains
3. Add `yourapp.com` and `www.yourapp.com`

#### 3.2 Configure DNS

In your domain registrar (Namecheap, GoDaddy, etc.):

**Add A Records:**
```
Type: A
Host: @
Value: 76.76.21.21 (Vercel IP)

Type: A
Host: www
Value: 76.76.21.21
```

**Or CNAME:**
```
Type: CNAME
Host: www
Value: cname.vercel-dns.com
```

#### 3.3 Add Subdomain for API (Optional)

For cleaner URLs like `api.yourapp.com`:

**In Heroku:**
```bash
heroku domains:add api.yourapp.com
```

**In DNS:**
```
Type: CNAME
Host: api
Value: your-app-name-api.herokuapp.com
```

**Update Environment Variables:**
```bash
# Update backend
heroku config:set CLIENT_URL="https://yourapp.com"

# Update frontend
vercel env add REACT_APP_API_URL production
# Value: https://api.yourapp.com/api
```

#### 3.4 SSL Certificate

- Vercel: Automatic SSL (Let's Encrypt)
- Heroku: Automatic SSL with ACM
- Both handle certificate renewal automatically

**✅ Custom Domain Configured!**
- Frontend: `https://yourapp.com`
- Backend: `https://api.yourapp.com`

---

## 🔧 Option 2: AWS (Advanced)

**Best for:** Full control, enterprise requirements, scalability

**Services Needed:**
- EC2 or Elastic Beanstalk (Backend)
- S3 + CloudFront (Frontend)
- RDS PostgreSQL (Database)
- Route 53 (DNS)
- Certificate Manager (SSL)

### Quick Setup (Elastic Beanstalk)

```bash
# Install EB CLI
pip install awsebcli

# Initialize
cd server
eb init

# Create environment
eb create production-env

# Deploy
eb deploy

# Set environment variables
eb setenv NODE_ENV=production JWT_SECRET=your-secret ...
```

**Full AWS guide:** https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/create-deploy-nodejs.html

---

## 🌊 Option 3: DigitalOcean (Alternative)

**Best for:** Cost-effective, simple VPS

**Services:**
- Droplet (VPS)
- Managed PostgreSQL
- App Platform (Alternative to Heroku)

### DigitalOcean App Platform (Easiest)

1. Create DigitalOcean account
2. Go to App Platform
3. Connect GitHub repo
4. Select branch and directories
5. Set environment variables
6. Deploy

**Cost:** ~$5-12/month for basic setup

---

## 📊 Post-Deployment

### 1. Update Cybersource Webhooks

In Cybersource Dashboard:
```
Webhook URL: https://api.yourapp.com/api/payment/webhook
Events: payment.authorized, payment.captured, payment.failed, refund.completed
```

### 2. Test Production Environment

```bash
# Health check
curl https://api.yourapp.com/api/health

# Register test user
curl -X POST https://api.yourapp.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!","role":"tenant",...}'

# Login
curl -X POST https://api.yourapp.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"Test123!"}'

# Test dashboard
curl https://api.yourapp.com/api/tenant/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Verify Recurring Payments

```bash
# Check Heroku scheduler
heroku addons:create scheduler:standard

# Add job: Daily at 2:00 AM
# Command: cd server && node -e "require('./jobs/recurringPaymentProcessor').processNow()"

# Or verify cron job is running
heroku logs --tail | grep "Recurring Payment"
```

### 4. Security Audit

- [ ] SSL/HTTPS enforced
- [ ] Environment variables secure
- [ ] Database connections encrypted
- [ ] API rate limiting active
- [ ] CORS properly configured
- [ ] Helmet security headers enabled
- [ ] No secrets in code/logs

---

## 📈 Monitoring & Maintenance

### 1. Application Monitoring

**Heroku Native:**
```bash
# View logs
heroku logs --tail

# Metrics
heroku metrics

# Alerts
heroku alerts:create web response_time --app your-app-name-api
```

**External Services:**

**Sentry (Error Tracking):**
```bash
npm install @sentry/node

# In server.js
const Sentry = require("@sentry/node");
Sentry.init({ dsn: process.env.SENTRY_DSN });
```

**New Relic (APM):**
```bash
npm install newrelic

# Add to server.js
require('newrelic');
```

### 2. Database Monitoring

**Supabase Dashboard:**
- Monitor queries
- Check disk usage
- Review slow queries
- Set up alerts

**Automatic Backups:**
- Supabase: Automatic daily backups
- Enable Point-in-Time Recovery

### 3. Performance Monitoring

```bash
# Heroku - View metrics
heroku logs --tail | grep "response time"

# Set up alerts
heroku alerts:create web response_time_95th_percentile_ms \
  --threshold 1000 --app your-app-name-api
```

### 4. Uptime Monitoring

**Services:**
- **UptimeRobot** (Free): https://uptimerobot.com
- **Pingdom**
- **StatusCake**

Configure:
```
URL: https://yourapp.com
Interval: 5 minutes
Alert: Email + SMS
```

### 5. Log Management

**Free Options:**
- Heroku Logplex (7 days)
- Papertrail (free tier)
- Loggly

```bash
# Add Papertrail
heroku addons:create papertrail:choklad
heroku addons:open papertrail
```

---

## 🔄 Continuous Deployment

### GitHub Actions (Automatic Deploy)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Production

on:
  push:
    branches: [ main ]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Heroku
        uses: akhileshns/heroku-deploy@v3.12.12
        with:
          heroku_api_key: ${{secrets.HEROKU_API_KEY}}
          heroku_app_name: "your-app-name-api"
          heroku_email: "your-email@example.com"
          appdir: "server"

  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID}}
          vercel-project-id: ${{ secrets.PROJECT_ID}}
          working-directory: ./client
```

---

## 💰 Cost Breakdown

### Recommended Setup (Heroku + Vercel)

| Service | Plan | Cost/Month |
|---------|------|------------|
| Heroku (Backend) | Eco Dyno | $5 |
| Supabase (Database) | Pro | $25 |
| Vercel (Frontend) | Hobby | Free |
| Domain | Annual | ~$1/month |
| **Total** | | **~$31/month** |

### Enterprise Setup (AWS)

| Service | Plan | Cost/Month |
|---------|------|------------|
| EC2 t3.small | 24/7 | ~$15 |
| RDS db.t3.micro | PostgreSQL | ~$15 |
| S3 + CloudFront | Frontend | ~$1-5 |
| Route 53 | DNS | ~$1 |
| **Total** | | **~$32-36/month** |

---

## 🚨 Rollback Plan

### Heroku Rollback

```bash
# View releases
heroku releases

# Rollback to previous
heroku rollback

# Rollback to specific version
heroku rollback v42
```

### Vercel Rollback

```bash
# View deployments
vercel ls

# Promote previous deployment
vercel alias set previous-deployment-url.vercel.app yourapp.com
```

---

## ✅ Deployment Checklist

### Pre-Deploy
- [ ] Tests passing
- [ ] Production database ready
- [ ] Cybersource production account
- [ ] Environment variables prepared
- [ ] Domain purchased (optional)

### Deploy
- [ ] Backend deployed to Heroku/AWS
- [ ] Frontend deployed to Vercel/Netlify
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] SSL certificates active

### Post-Deploy
- [ ] Cybersource webhooks configured
- [ ] DNS records updated
- [ ] Monitoring enabled
- [ ] Backup strategy configured
- [ ] Error tracking setup
- [ ] Performance baseline established

### Testing
- [ ] Frontend loads
- [ ] Backend API responds
- [ ] User registration works
- [ ] Login works
- [ ] Payment processing works
- [ ] Auto-pay scheduler running
- [ ] Webhooks receiving events

---

## 🎉 You're Live!

Your Rent Payment Application is now deployed and ready for users!

**Next Steps:**
1. Add users and properties
2. Monitor performance
3. Collect user feedback
4. Iterate and improve

**Production URLs:**
- Frontend: `https://yourapp.com`
- Backend API: `https://api.yourapp.com`
- Documentation: This guide

---

**Need Help?**
- Heroku Docs: https://devcenter.heroku.com
- Vercel Docs: https://vercel.com/docs
- Supabase Docs: https://supabase.com/docs
- Cybersource Docs: https://developer.cybersource.com

**Congratulations on deploying your application! 🚀**
