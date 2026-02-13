# 🚀 Free Deployment Guide - Render + Vercel

## 100% Free Deployment Strategy

- **Backend**: Render Free Tier (sleeps after 15min inactivity, wakes on first request)
- **Frontend**: Vercel Free Tier (always active)
- **Database**: Supabase (your existing database)
- **Cost**: $0/month

---

## Prerequisites

1. GitHub account (to connect to Render and Vercel)
2. Render account - Sign up free at https://render.com
3. Vercel account - Sign up free at https://vercel.com

---

## Part 1: Deploy Backend to Render (10 minutes)

### Step 1: Push Code to GitHub

```bash
cd C:\Misc\Project_Learning\payment-checkout

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Rent Payment Application"

# Create a new repository on GitHub and push
# Replace YOUR-USERNAME and YOUR-REPO with your actual GitHub details
git remote add origin https://github.com/YOUR-USERNAME/YOUR-REPO.git
git branch -M main
git push -u origin main
```

### Step 2: Create Render Web Service

1. Go to https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Configure the service:

   **Settings:**
   - **Name**: `rent-payment-api`
   - **Region**: `Singapore` (closest to your Supabase database)
   - **Branch**: `main`
   - **Root Directory**: `server`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: **Free**

### Step 3: Add Environment Variables

In the Render dashboard, go to "Environment" tab and add:

```
NODE_ENV=production
PORT=10000
DATABASE_URL=postgresql://postgres.woaygvrkwnfphzvxuiwm:RentPayment2025!@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres
DB_HOST=aws-1-ap-southeast-1.pooler.supabase.com
DB_PORT=5432
DB_NAME=postgres
DB_USER=postgres.woaygvrkwnfphzvxuiwm
DB_PASSWORD=RentPayment2025!
JWT_SECRET=5daaa5e325c2c3390839d3feefc22b0ca23e02ae8df7fe19876644918193328e
JWT_EXPIRES_IN=7d
CYBERSOURCE_MERCHANT_ID=9059034_1770903917
CYBERSOURCE_API_KEY=19bb79cc-59aa-4a28-b5c9-2fa086d3c50e
CYBERSOURCE_SECRET_KEY=YMdMdBCLdgFmchmIEMWRgnW/9mr7Nge4legk3Efmtvs=
CYBERSOURCE_API_URL=https://apitest.cybersource.com
CYBERSOURCE_ENVIRONMENT=sandbox
ENABLE_RECURRING_PAYMENTS=true
CLIENT_URL=https://your-app-name.vercel.app
SESSION_SECRET=your-session-secret-change-this-to-random-string
```

**Note**: You'll update `CLIENT_URL` after deploying the frontend in Part 2.

### Step 4: Deploy

1. Click **"Create Web Service"**
2. Render will automatically build and deploy
3. Wait for deployment to complete (~3-5 minutes)
4. Your backend will be available at: `https://rent-payment-api.onrender.com`

**Test it**: Visit `https://your-app-name.onrender.com/api/health`
- Should see: `{"success":true,"message":"Rent Payment API is running"}`

---

## Part 2: Deploy Frontend to Vercel (5 minutes)

### Step 1: Update API URL in Frontend

Edit `client/src/services/api.js`:

```javascript
const API_URL = process.env.REACT_APP_API_URL || 'https://rent-payment-api.onrender.com/api';
```

Replace `rent-payment-api` with your actual Render service name.

### Step 2: Commit Changes

```bash
git add .
git commit -m "Update API URL for production"
git push
```

### Step 3: Deploy to Vercel

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. Import your GitHub repository
4. Configure:
   - **Framework Preset**: `Create React App`
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`

5. Add environment variable:
   - **Key**: `REACT_APP_API_URL`
   - **Value**: `https://rent-payment-api.onrender.com/api` (your Render URL)

6. Click **"Deploy"**

### Step 4: Get Your Vercel URL

After deployment completes (~2-3 minutes), you'll get a URL like:
`https://your-app-name.vercel.app`

### Step 5: Update Backend CORS

1. Go back to Render dashboard
2. Update the `CLIENT_URL` environment variable to your Vercel URL:
   ```
   CLIENT_URL=https://your-app-name.vercel.app
   ```
3. Render will automatically redeploy

---

## Part 3: Test Your Live Application

1. **Open your Vercel URL**: `https://your-app-name.vercel.app`
2. **Test Login**:
   - Email: `john.doe@example.com`
   - Password: `Tenant123!`
3. **Test Features**:
   - View dashboard
   - Check payment history
   - Add payment method (test card: 4111 1111 1111 1111)
   - Set up auto-pay
4. **Test Admin**:
   - Login: `admin@rentpay.com` / `Admin123!`
   - View all payments
   - Test refund

---

## Important Notes

### Render Free Tier Limitations

- ⏱️ **Sleeps after 15 minutes** of inactivity
- 🚀 **First request takes ~30 seconds** to wake up (cold start)
- 💰 **750 hours/month free** (more than enough for testing)
- 🔄 After wake-up, runs at full speed

### Vercel Free Tier

- ✅ **Always active** (no sleep)
- ✅ **100 GB bandwidth/month**
- ✅ **Fast global CDN**
- ✅ **Automatic HTTPS**

### Cost Summary

- **Month 1-∞**: **$0** 🎉

---

## Troubleshooting

### Backend not responding?

- First request takes 30 seconds (cold start on free tier)
- Check Render logs: Dashboard → Your Service → Logs

### Frontend can't connect to backend?

- Verify `REACT_APP_API_URL` in Vercel environment variables
- Verify `CLIENT_URL` in Render environment variables match
- Check browser console for CORS errors

### Database connection errors?

- Verify all `DB_*` variables are set correctly in Render
- Ensure Session Pooler connection string is used
- Check Render logs for specific error messages

---

## Upgrade Options (Optional)

If you want to eliminate the 30-second cold start:

### Render Starter Plan ($7/month)

- No sleep/cold starts
- Always active
- Better performance

### Or Use Railway ($5/month)

- 500 hours of compute
- No cold starts
- Similar to old Heroku

---

## Success Checklist

- [ ] Backend deployed to Render and showing health check
- [ ] Frontend deployed to Vercel
- [ ] Can access login page
- [ ] Can login with test account
- [ ] Dashboard loads
- [ ] Can view payments
- [ ] Admin panel works

---

**🎉 Congratulations! Your application is live and 100% FREE!** 🎉

**Live URLs:**
- Frontend: `https://your-app-name.vercel.app`
- Backend: `https://rent-payment-api.onrender.com`
