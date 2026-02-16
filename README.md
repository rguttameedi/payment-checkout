# 🏠 Rent Payment Application - Learning & Test Project

A modern, full-stack rent payment application built for learning and testing purposes. Features premium UI/UX, payment processing integration, and flexible payment options.

## 🚀 Live Demo

- **Frontend**: `https://payment-checkout.vercel.app` *(Update after Vercel deployment)*
- **Backend API**: `https://rent-payment-api.onrender.com` *(Update after Render activation)*
- **GitHub**: [https://github.com/rguttameedi/payment-checkout](https://github.com/rguttameedi/payment-checkout)

> **Note**: Backend may take 30 seconds to wake up on first request (Render free tier sleeps when idle).

---

## ✨ Features

### 💰 Payment Features
- **Split Rent**: Split payments up to 4 installments
- **Roommate Split**: Share rent with multiple roommates
- **Flexible Payment Plans**: Weekly, bi-weekly, or monthly payments
- **Multiple Payment Methods**: Credit card and ACH/Bank account support
- **Recurring Payments**: Auto-pay scheduling
- **Partial Payments**: Pay what you can, track remaining balance

### 🎨 Premium UI/UX
- Modern gradient-based design with smooth animations
- Interactive dashboard with real-time balance tracking
- Premium card hover effects and transitions
- Responsive design for mobile and desktop
- Sequential loading animations
- Progress bars with shimmer effects

### 🔐 Security & Identity
- JWT-based authentication
- Identity verification (IDV)
- Address verification (ADV)
- Multi-factor authentication (MFA) support
- PCI-compliant payment processing via Cybersource

### 📊 Dashboard Features
- Real-time rent balance tracker
- Payment history with transaction details
- Lease information overview
- Auto-pay status management
- Current rent period progress visualization

---

## 🛠️ Tech Stack

### Frontend
- **React** 18+ (Functional components with hooks)
- **React Router** (Client-side routing)
- **Axios** (API communication)
- **CSS3** (Premium animations, gradients, transitions)

### Backend
- **Node.js** + **Express.js**
- **SQLite** (Development database)
- **PostgreSQL** (Production via Supabase)
- **JWT** (Authentication)
- **Cybersource API** (Payment processing)

### Deployment
- **Frontend**: Vercel (Always online, free)
- **Backend**: Render (Free tier)
- **Database**: Supabase (PostgreSQL)

---

## 📚 Documentation

Comprehensive documentation available:

- **[FIELD_VALIDATION_GUIDE.md](FIELD_VALIDATION_GUIDE.md)** - Modify field validations (frontend, backend, database)
- **[PREMIUM_DASHBOARD_UPGRADE.md](PREMIUM_DASHBOARD_UPGRADE.md)** - UI/UX design enhancements
- **[RENT_BALANCE_TRACKER.md](RENT_BALANCE_TRACKER.md)** - Balance card implementation
- **[PAYMENT_FEATURES.md](PAYMENT_FEATURES.md)** - Split rent features
- **[IDENTITY_VERIFICATION.md](IDENTITY_VERIFICATION.md)** - IDV, ADV, MFA
- **[DATABASE_SETUP.md](DATABASE_SETUP.md)** - Database schema
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Deployment instructions

---

## 🚀 Quick Start (Local Development)

### Prerequisites
- Node.js 16+ and npm
- Git

### 1. Clone Repository
```bash
git clone https://github.com/rguttameedi/payment-checkout.git
cd payment-checkout
```

### 2. Setup Backend
```bash
cd server
npm install

# Create .env file with your credentials:
# JWT_SECRET, CYBERSOURCE_MERCHANT_ID, etc.

npm start
# Server runs on http://localhost:50155
```

### 3. Setup Frontend
```bash
cd client
npm install

# Create .env file
echo "REACT_APP_API_URL=http://localhost:50155/api" > .env

npm start
# App runs on http://localhost:3000
```

### 4. Demo Login Credentials
```
Tenant: tenant@example.com / password123
Landlord: landlord@example.com / password123
```

---

## 🎯 Use Cases

This **learning and testing project** demonstrates:

1. **Payment Integration** - Tokenization, PCI compliance, error handling
2. **Full-Stack Development** - React + Express + PostgreSQL
3. **UI/UX Design** - Modern gradients, animations, responsive design
4. **Real-World Features** - Split payments, recurring billing, balance tracking

---

## 🤝 Purpose

Built for **learning, testing, and portfolio purposes**. This project serves as:

- A playground for testing payment integrations
- A reference for full-stack development patterns
- A demonstration of modern UI/UX techniques
- A base for building additional features

---

## 🎓 Learning Roadmap

Future enhancements planned:

- [ ] Maintenance request system
- [ ] Real-time notifications (WebSocket)
- [ ] Reward points for on-time payments
- [ ] Lease document management
- [ ] Messaging with property management
- [ ] Community announcements

---

## 📧 Contact

**GitHub**: [@rguttameedi](https://github.com/rguttameedi)

---

**Built with ❤️ for learning and testing**
