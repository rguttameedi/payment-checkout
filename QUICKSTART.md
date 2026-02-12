# 🚀 QUICK START GUIDE

Welcome to your brand new Payment Checkout project!

## 📍 Your Project Location

```
C:\Misc\Project_Learning\payment-checkout\
```

## ⚡ Get Started in 3 Steps

### Step 1: Open Command Prompt Here

**Method 1 (Easy):**
1. Open File Explorer
2. Navigate to: `C:\Misc\Project_Learning\payment-checkout`
3. Click in the address bar
4. Type `cmd` and press Enter

**Method 2 (From anywhere):**
```bash
cd C:\Misc\Project_Learning\payment-checkout
```

### Step 2: Install Dependencies

```bash
npm install
```

Wait for it to finish (takes 30-60 seconds).

### Step 3: Start the Server

```bash
node server.js
```

You should see:
```
════════════════════════════════════════════════
  🚀 Payment Server is Running!
════════════════════════════════════════════════
  URL: http://localhost:3000
  Press Ctrl+C to stop the server
════════════════════════════════════════════════

✅ Cybersource credentials are already configured!
```

### Step 4: Open in Browser

Open your browser and go to:
```
http://localhost:3000
```

## 🧪 Test Payment

Use these test credentials:

```
Cardholder Name: John Doe
Card Number: 4111111111111111
Expiry Month: 12
Expiry Year: 2025
CVV: 123
Amount: 10.00
```

Click "Pay Now" and you should see a success message! 🎉

## 📁 What's Inside?

```
payment-checkout/
├── server.js                    ✅ Your working backend (credentials included!)
├── index.html                   ✅ Simple payment form
├── index-enhanced.html          ✅ Full-featured form with billing address
├── package.json                 ✅ Dependencies list
├── .gitignore                   ✅ For GitHub deployment
├── README.md                    ✅ Project documentation
├── CUSTOMIZATION-GUIDE.md       ✅ How to change colors/design
├── DEPLOYMENT-GUIDE.md          ✅ How to deploy online
└── QUICKSTART.md               ✅ This file!
```

## 🎨 Want to Customize?

Check out **[CUSTOMIZATION-GUIDE.md](CUSTOMIZATION-GUIDE.md)** to learn how to:
- Change colors and fonts
- Add your logo
- Customize the layout
- Add more fields

## 🌐 Want to Deploy Online?

Check out **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** to learn how to:
- Deploy to Render (FREE!)
- Deploy to Railway
- Deploy to Heroku
- Add a custom domain

## 💡 Two Versions Available

### Simple Version (Default)
Visit: `http://localhost:3000/`
- Basic card payment form
- Clean and minimal

### Enhanced Version (All Features)
Visit: `http://localhost:3000/index-enhanced.html`
- Email & phone fields
- Complete billing address
- State & country dropdowns
- Live amount display

## 🔧 Common Commands

**Start server:**
```bash
node server.js
```

**Stop server:**
Press `Ctrl + C` in Command Prompt

**Install dependencies:**
```bash
npm install
```

**Check Node.js version:**
```bash
node --version
```

## 🆘 Need Help?

### Problem: "node is not recognized"
**Solution:** Install Node.js from https://nodejs.org/

### Problem: "Cannot find module"
**Solution:** Run `npm install express axios`

### Problem: Payment fails
**Solution:** Check the Command Prompt for detailed error messages

### Problem: Port 3000 already in use
**Solution:** Either:
- Stop the other program using port 3000
- OR change the port in server.js (line 14: `const PORT = 3000;`)

## 🎯 Next Steps

1. ✅ Test the simple version
2. ✅ Test the enhanced version
3. 🎨 Customize the design (see CUSTOMIZATION-GUIDE.md)
4. 🌐 Deploy online (see DEPLOYMENT-GUIDE.md)
5. 🚀 Share with the world!

---

**You're all set!** 🎊

Your Cybersource credentials are already configured and ready to go!

Just run `npm install` then `node server.js` and you're ready to process payments!
