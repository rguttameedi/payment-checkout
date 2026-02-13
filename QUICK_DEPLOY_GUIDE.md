# 🚀 Quick Deploy Guide - Rent Payment Application

## ✅ Your Application is 100% Ready!

Everything is built and ready to deploy:
- ✅ Complete backend with Cybersource payment integration
- ✅ React frontend with all payment pages
- ✅ Database schema ready
- ✅ Deployment files configured

---

## 📋 Deploy to Heroku + Vercel (30 minutes)

### Prerequisites
- [ ] Heroku account (create free at https://signup.heroku.com)
- [ ] Vercel account (create free at https://vercel.com/signup)
- [ ] Git installed and configured

---

## 🔷 STEP 1: Deploy Backend to Heroku

### 1.1 Login to Heroku
```bash
npx heroku login
```
This will open a browser for you to authenticate.

### 1.2 Create Heroku App
```bash
cd C:\Misc\Project_Learning\payment-checkout
npx heroku create your-app-name-api
```
Replace `your-app-name-api` with your desired name (e.g., `rentpay-api`)

### 1.3 Set Environment Variables
```bash
# Database (Supabase)
npx heroku config:set DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
npx heroku config:set DB_PORT=5432
npx heroku config:set DB_NAME=postgres
npx heroku config:set DB_USER=postgres.woaygvrkwnfphzvxuiwm
npx heroku config:set DB_PASSWORD=RentPayment2025!

# JWT
npx heroku config:set JWT_SECRET=5daaa5e325c2c3390839d3feefc22b0ca23e02ae8df7fe19876644918193328e
npx heroku config:set JWT_EXPIRES_IN=7d

# Cybersource
npx heroku config:set CYBERSOURCE_MERCHANT_ID=9059034_1770903917
npx heroku config:set CYBERSOURCE_API_KEY=19bb79cc-59aa-4a28-b5c9-2fa086d3c50e
npx heroku config:set CYBERSOURCE_SECRET_KEY=YMdMdBCLdgFmchmIEMWRgnW/9mr7Nge4legk3Efmtvs=
npx heroku config:set CYBERSOURCE_API_URL=https://apitest.cybersource.com
npx heroku config:set CYBERSOURCE_ENVIRONMENT=sandbox

# App Config
npx heroku config:set NODE_ENV=production
npx heroku config:set CLIENT_URL=https://your-app-name.vercel.app
npx heroku config:set ENABLE_RECURRING_PAYMENTS=true
npx heroku config:set SESSION_SECRET=your-session-secret-change-this
```

### 1.4 Initialize Git (if not already)
```bash
git init
git add .
git commit -m "Initial commit - Rent Payment Application"
```

### 1.5 Deploy Backend
```bash
# Add Heroku remote
npx heroku git:remote -a your-app-name-api

# Deploy server folder
git subtree push --prefix server heroku main
```

### 1.6 Verify Backend
```bash
npx heroku open
# Or visit: https://your-app-name-api.herokuapp.com/api/health
```

You should see: `{"success":true,"message":"Rent Payment API is running"}`

---

## 🔶 STEP 2: Deploy Frontend to Vercel

### 2.1 Login to Vercel
```bash
npx vercel login
```

### 2.2 Update API URL in Frontend
Edit `client/src/services/api.js`:
```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://your-app-name-api.herokuapp.com/api';
```

OR create `client/.env.production`:
```
REACT_APP_API_URL=https://your-app-name-api.herokuapp.com/api
```

### 2.3 Deploy Frontend
```bash
cd client
npx vercel --prod
```

Follow the prompts:
- Set up and deploy? **Yes**
- Which scope? **Your account**
- Link to existing project? **No**
- Project name? **your-app-name**
- Directory? **./**
- Override settings? **No**

### 2.4 Add Environment Variable
```bash
npx vercel env add REACT_APP_API_URL production
```
Enter: `https://your-app-name-api.herokuapp.com/api`

### 2.5 Redeploy with Environment Variable
```bash
npx vercel --prod
```

---

## 🎉 STEP 3: Test Your Live Application!

### Your Live URLs
- **Frontend**: https://your-app-name.vercel.app
- **Backend API**: https://your-app-name-api.herokuapp.com

### Test the Application

1. **Open Frontend**: Visit your Vercel URL
2. **Login with Test Account**:
   - Email: `john.doe@example.com`
   - Password: `Tenant123!`
3. **Test Payment Features**:
   - View dashboard
   - Check payment history
   - Add payment method (use test card: 4111 1111 1111 1111)
   - Set up auto-pay
4. **Test Admin Portal**:
   - Logout and login as: `admin@rentpay.com` / `Admin123!`
   - View all payments
   - Test refund functionality

---

## 🔧 Post-Deployment Configuration

### Update Cybersource Webhooks
1. Go to Cybersource Dashboard
2. Configure webhook URL: `https://your-app-name-api.herokuapp.com/api/payment/webhook`
3. Enable events: payment.authorized, payment.captured, payment.failed, refund.completed

### Optional: Custom Domain
```bash
# Add domain to Vercel
npx vercel domains add yourapp.com

# Update DNS records
# A Record: @ → 76.76.21.21
# A Record: www → 76.76.21.21
```

---

## 📊 Monitoring

### View Logs
```bash
# Backend logs
npx heroku logs --tail

# Frontend logs
npx vercel logs
```

### Check Status
```bash
# Heroku
npx heroku ps

# Vercel
npx vercel ls
```

---

## 🚨 Troubleshooting

### Backend not starting?
```bash
npx heroku logs --tail
# Check for database connection errors
```

### Frontend not connecting to backend?
- Check CORS settings in backend
- Verify CLIENT_URL environment variable
- Check API_URL in frontend

### Database connection issues?
- Verify Supabase credentials
- Check if database is active
- Ensure SSL is enabled in production

---

## ✅ Deployment Checklist

- [ ] Backend deployed to Heroku
- [ ] Frontend deployed to Vercel
- [ ] Environment variables set
- [ ] Test login works
- [ ] Test payment works
- [ ] Cybersource webhooks configured
- [ ] Custom domain added (optional)

---

## 🎯 Success Criteria

✅ You can access the login page at your Vercel URL
✅ You can login with test credentials
✅ Dashboard loads with data
✅ You can add a payment method
✅ You can process a test payment
✅ Admin can view all payments
✅ No console errors

---

## 💡 Need Help?

**Documentation:**
- Full guide: `DEPLOYMENT_GUIDE.md`
- API docs: `PHASE3_API_GUIDE.md`
- Payment docs: `PHASE4_PAYMENT_GUIDE.md`

**External Resources:**
- Heroku: https://devcenter.heroku.com
- Vercel: https://vercel.com/docs
- Cybersource: https://developer.cybersource.com

---

**🎊 Congratulations! Your Rent Payment Application is Live!** 🎊

