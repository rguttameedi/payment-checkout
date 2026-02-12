# 🚀 Deployment Guide - Make Your Payment Page Live!

This guide will show you how to deploy your payment checkout page so others can access it online.

---

## 📋 Table of Contents

1. [Test Enhanced Version Locally](#test-enhanced-version)
2. [Deploy to Render (FREE & Easy)](#deploy-to-render)
3. [Deploy to Heroku (Popular Option)](#deploy-to-heroku)
4. [Deploy to Railway (Fast & Simple)](#deploy-to-railway)
5. [Custom Domain Setup](#custom-domain)

---

## 🧪 Test Enhanced Version Locally

Before deploying, let's test the enhanced version with all the new fields!

### Step 1: Update Your Default Page

**Option A: Replace the current page**
1. Rename your current `index.html` to `index-simple.html` (backup)
2. Rename `index-enhanced.html` to `index.html`

**Option B: Test both versions**
- Simple version: http://localhost:3000/
- Enhanced version: http://localhost:3000/index-enhanced.html

### Step 2: Restart Server

```bash
# Stop the server (Ctrl+C)
# Start it again
node server.js
```

### Step 3: Test the New Features

Visit http://localhost:3000 and try:
- ✅ Email field
- ✅ Phone number formatting
- ✅ Complete billing address
- ✅ State dropdown
- ✅ Amount display updates

---

## 🌐 Deploy to Render (RECOMMENDED - FREE & Easy!)

Render is the easiest way for beginners to deploy Node.js apps for FREE!

### Prerequisites
- Create a GitHub account: https://github.com
- Create a Render account: https://render.com

### Step 1: Prepare Your Files

**Create a `.gitignore` file** (tells Git what NOT to upload):

Create a new file named `.gitignore` in your project folder with:
```
node_modules/
.env
*.log
```

**Create a `package.json`** (if you don't have one):

Create a file named `package.json`:
```json
{
  "name": "cybersource-payment-checkout",
  "version": "1.0.0",
  "description": "Simple payment checkout with Cybersource",
  "main": "server.js",
  "scripts": {
    "start": "node server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "axios": "^1.6.0"
  },
  "engines": {
    "node": ">=16.x"
  }
}
```

### Step 2: Upload to GitHub

**Method 1: GitHub Desktop (Easiest for Beginners)**

1. **Download GitHub Desktop**: https://desktop.github.com/
2. **Install and sign in** with your GitHub account
3. **Create a new repository**:
   - Click "File" → "New Repository"
   - Name: `payment-checkout`
   - Local Path: Browse to your project folder
   - Click "Create Repository"
4. **Commit your files**:
   - Check all files you want to upload
   - Add a message: "Initial commit"
   - Click "Commit to main"
5. **Publish to GitHub**:
   - Click "Publish repository"
   - Uncheck "Keep this code private" (or keep it private if you prefer)
   - Click "Publish Repository"

**Method 2: Using Git Command Line**

```bash
# In your project folder
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/payment-checkout.git
git push -u origin main
```

### Step 3: Deploy on Render

1. **Go to Render Dashboard**: https://dashboard.render.com/
2. **Click "New +"** → **"Web Service"**
3. **Connect your GitHub repository**:
   - Click "Connect GitHub"
   - Select your `payment-checkout` repository
4. **Configure the service**:
   - **Name**: `payment-checkout` (or any name you like)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.js`
   - **Plan**: FREE
5. **Add Environment Variables** (IMPORTANT!):
   - Click "Advanced"
   - Add these:
     - Key: `NODE_ENV`, Value: `production`
     - Key: `PORT`, Value: `3000`
6. **Click "Create Web Service"**

### Step 4: Wait for Deployment

- Render will build and deploy your app (takes 3-5 minutes)
- You'll get a URL like: `https://payment-checkout-xyz.onrender.com`
- **Important**: Free tier spins down after inactivity - first load may be slow

### Step 5: Test Your Live Site!

- Visit your Render URL
- Try a test payment
- Share the link with others!

---

## 🔵 Deploy to Heroku (Popular Option)

Heroku is another popular platform (has free tier with limitations).

### Prerequisites
- Create account: https://signup.heroku.com/
- Install Heroku CLI: https://devcenter.heroku.com/articles/heroku-cli

### Steps:

1. **Login to Heroku**:
   ```bash
   heroku login
   ```

2. **Create Heroku app**:
   ```bash
   heroku create your-payment-app
   ```

3. **Update server.js** to use Heroku's port:
   ```javascript
   const PORT = process.env.PORT || 3000;
   ```

4. **Deploy**:
   ```bash
   git add .
   git commit -m "Prepare for Heroku"
   git push heroku main
   ```

5. **Open your app**:
   ```bash
   heroku open
   ```

---

## 🚄 Deploy to Railway (Fast & Simple)

Railway is super beginner-friendly!

1. **Visit**: https://railway.app/
2. **Sign up** with GitHub
3. **Click "New Project"** → "Deploy from GitHub repo"
4. **Select your repository**
5. **Railway auto-detects** Node.js and deploys!
6. **Get your URL** from the dashboard

That's it! Railway handles everything automatically.

---

## 🌐 Custom Domain Setup

Want your own domain like `payments.yourcompany.com`?

### Step 1: Buy a Domain
- Namecheap: https://www.namecheap.com
- Google Domains: https://domains.google
- GoDaddy: https://www.godaddy.com

### Step 2: Connect to Render/Heroku/Railway

**For Render:**
1. Go to your service dashboard
2. Click "Settings" → "Custom Domains"
3. Click "Add Custom Domain"
4. Enter your domain
5. Add the provided DNS records to your domain registrar

**For Heroku:**
1. Go to app settings
2. Click "Add domain"
3. Follow DNS instructions

**For Railway:**
1. Go to service settings
2. Click "Custom Domain"
3. Follow instructions

---

## 🔒 Important Security Notes

### Before Going Live:

1. **Move Credentials to Environment Variables**

   Create a `.env` file:
   ```
   MERCHANT_ID=your_merchant_id
   API_KEY_ID=your_api_key_id
   SECRET_KEY=your_secret_key
   ```

   Update `server.js`:
   ```javascript
   require('dotenv').config();

   const CYBERSOURCE_CONFIG = {
     merchantId: process.env.MERCHANT_ID,
     apiKeyId: process.env.API_KEY_ID,
     secretKey: process.env.SECRET_KEY,
     runEnvironment: 'apitest.cybersource.com'
   };
   ```

   Install dotenv:
   ```bash
   npm install dotenv
   ```

2. **Add Environment Variables to Hosting Platform**

   In Render/Heroku/Railway dashboard:
   - Add your credentials as environment variables
   - Never commit `.env` to Git!

3. **Enable HTTPS**
   - All platforms (Render/Heroku/Railway) provide free SSL
   - Your site will automatically use HTTPS

4. **For Production**:
   - Remove `rejectUnauthorized: false`
   - Change `apitest.cybersource.com` to `api.cybersource.com`
   - Use production Cybersource credentials

---

## 📊 Monitoring Your Live Site

### Check if your site is up:

- **UptimeRobot**: https://uptimerobot.com (FREE monitoring)
- Get email alerts if your site goes down
- Ping your site every 5 minutes

### View Logs:

**Render:**
```bash
# In Render dashboard, click "Logs"
```

**Heroku:**
```bash
heroku logs --tail
```

**Railway:**
```bash
# View logs in Railway dashboard
```

---

## ⚡ Quick Comparison

| Platform | Free Tier | Ease of Use | Speed | Best For |
|----------|-----------|-------------|-------|----------|
| **Render** | ✅ Yes | ⭐⭐⭐⭐⭐ Easy | Medium | Beginners |
| **Railway** | ✅ Yes | ⭐⭐⭐⭐⭐ Easy | Fast | Quick deploys |
| **Heroku** | ⚠️ Limited | ⭐⭐⭐⭐ Good | Medium | Popular choice |

**My Recommendation for Beginners: Use Render or Railway!**

---

## 🆘 Common Deployment Issues

### "Application Error" on Render/Heroku
- Check logs for errors
- Make sure `package.json` has correct dependencies
- Verify `start` script is correct

### "Module not found"
- Run `npm install` before deploying
- Check that dependencies are in `package.json`

### Site loads but payment fails
- Check environment variables are set correctly
- Verify Cybersource credentials
- Check logs for error messages

### Free tier sleeps after inactivity (Render)
- Site wakes up on first request (may take 30 seconds)
- Upgrade to paid tier for always-on service

---

## 🎉 You're Ready to Deploy!

1. ✅ Choose a platform (I recommend **Render**)
2. ✅ Upload your code to GitHub
3. ✅ Deploy to hosting platform
4. ✅ Add environment variables
5. ✅ Test your live site
6. ✅ Share with the world!

---

**Need help?** Let me know which deployment method you want to try! 🚀
