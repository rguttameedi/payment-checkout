# ⚡ Quick Demo Script - 10 Minutes

## Pre-Demo (2 minutes)
```bash
# Terminal 1: Start backend
cd C:\Misc\Project_Learning\payment-checkout\server
npm start

# Terminal 2: Start frontend
cd C:\Misc\Project_Learning\payment-checkout\client
npm start
```

## Demo (8 minutes)

### Minute 1-2: Visual Impact
1. Open: `leadership-demo.html`
2. Say: "Three models, one codebase, automatic adaptation"
3. Point out the field counts: 9, 16, 18

### Minute 3-4: Live DirectMerchant
1. Open browser: `http://localhost:3001`
2. Login (tenant)
3. Go to Payment Methods
4. Click "Add New Payment Method"
5. Say: "9 fields - perfect for simple checkout"
6. Open console, show logs

### Minute 5-6: Switch to ClientDirect
1. Open VS Code: `integrationConfig.js`
2. Show line 31
3. Change to: `INTEGRATION_MODELS.CLIENT_DIRECT`
4. Save (Ctrl+S)
5. Say: "Watch - one line change"
6. Go back to browser (auto-reloads)
7. Open form again
8. Say: "16 fields - 7 new ones appeared!"

### Minute 7-8: Switch to ResidentDirect
1. Back to VS Code
2. Change to: `INTEGRATION_MODELS.RESIDENT_DIRECT`
3. Save
4. Browser reloads
5. Open form
6. Say: "All 18 fields - including sensitive identity fields"

### Minute 9-10: Wrap Up
1. Show test results
2. Say: "All tested, all passing, production ready"
3. Hand out one-pagers
4. Take questions

## Key Phrases to Use

✅ "One line of code changes everything"
✅ "Same iframe, different configurations"
✅ "5 minutes instead of 5 weeks"
✅ "Token-based, secure, scalable"
✅ "Production ready today"

## Demo Backup

If live demo fails:
1. Fall back to leadership-demo.html
2. Show screenshots (take beforehand)
3. Still impressive!

---

**Practice this 2-3 times and you'll crush it! 🎉**
