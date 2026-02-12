# 💳 Cybersource Payment Checkout

A beginner-friendly payment checkout page using Cybersource as the payment processor.

## 🚀 Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Start the Server

```bash
npm start
```

or

```bash
node server.js
```

### 3. Open in Browser

Visit: **http://localhost:3000**

## 🧪 Test Payment

Use these test card numbers (Cybersource sandbox):

- **Card Number**: `4111111111111111`
- **Expiry**: `12 / 2025`
- **CVV**: `123`
- **Amount**: `10.00`

## 📁 Files

- **server.js** - Backend Node.js server
- **index.html** - Simple payment form
- **index-enhanced.html** - Full-featured form with billing address
- **package.json** - Project dependencies
- **CUSTOMIZATION-GUIDE.md** - How to customize colors/design
- **DEPLOYMENT-GUIDE.md** - How to deploy online

## 📚 Documentation

- [Customization Guide](CUSTOMIZATION-GUIDE.md) - Change colors, fonts, add logo
- [Deployment Guide](DEPLOYMENT-GUIDE.md) - Deploy to Render, Heroku, Railway

## ✅ Features

✨ **Simple Version** (index.html):
- Card payment form
- Real-time validation
- Auto-formatting card numbers
- Loading states
- Success/error messages

🚀 **Enhanced Version** (index-enhanced.html):
- All simple version features
- Email & phone fields
- Complete billing address
- State/country dropdowns
- Live amount display
- Phone number formatting

## 🔒 Security

⚠️ **Development Mode Only**
- SSL verification is disabled for testing
- Credentials are in the code (not recommended for production)

**For Production:**
1. Move credentials to environment variables
2. Enable SSL verification
3. Use production Cybersource credentials
4. Add proper error handling

## 🆘 Troubleshooting

### Server won't start
- Make sure Node.js is installed: `node --version`
- Run `npm install` first
- Check that port 3000 is not in use

### Payment fails
- Verify Cybersource credentials in server.js
- Check server logs for detailed error
- Try test card: `4111111111111111`

### "Module not found"
- Run `npm install express axios`

## 📝 License

ISC

---

**Built with ❤️ for beginners learning payment integration**
