# API Testing Guide

Step-by-step guide to test the Rent Payment Application API endpoints.

## Prerequisites

1. **PostgreSQL database** set up and running (see DATABASE_SETUP.md)
2. **Server running**: `cd server && npm start`
3. **API testing tool**: One of the following:
   - **Thunder Client** (VS Code extension - recommended for beginners)
   - **Postman** (standalone app)
   - **curl** (command line)
   - **REST Client** (VS Code extension)

## Server Setup

### Step 1: Update .env File

Edit `.env` and set your database password:

```env
DB_PASSWORD=your_actual_postgres_password
```

### Step 2: Start the Server

```bash
cd server
npm start
```

You should see:

```
════════════════════════════════════════════════
  🚀 Rent Payment API Server Started!
════════════════════════════════════════════════
  Environment: development
  Port: 3000
  URL: http://localhost:3000
  Health: http://localhost:3000/api/health
````

---

## API Endpoint Testing

### 1. Health Check (GET /api/health)

**Purpose:** Verify server is running

**Thunder Client / Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/health`
- Headers: None
- Body: None

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Rent Payment API is running",
  "timestamp": "2024-02-13T10:30:00.000Z",
  "environment": "development"
}
```

**curl:**
```bash
curl http://localhost:3000/api/health
```

---

### 2. Register New User (POST /api/auth/register)

**Purpose:** Create a new user account

**Thunder Client / Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/register`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-0100",
    "dateOfBirth": "1990-05-15",
    "role": "tenant"
  }
  ```

**Expected Response (201 Created):**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "tenant",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "555-0100",
    "date_of_birth": "1990-05-15",
    "status": "active",
    "created_at": "2024-02-13T10:30:00.000Z",
    "updated_at": "2024-02-13T10:30:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Save the token!** You'll need it for authenticated requests.

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe",
    "phone": "555-0100",
    "role": "tenant"
  }'
```

**Validation Errors:**

If you send invalid data, you'll get:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    {
      "field": "password",
      "message": "Password must be at least 8 characters long"
    }
  ]
}
```

**Duplicate Email:**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

---

### 3. Login (POST /api/auth/login)

**Purpose:** Login and get JWT token

**Thunder Client / Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/login`
- Headers:
  ```
  Content-Type: application/json
  ```
- Body (JSON):
  ```json
  {
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Login successful",
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "tenant",
    "first_name": "John",
    "last_name": "Doe",
    "status": "active",
    "last_login": "2024-02-13T10:35:00.000Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

**Invalid Credentials:**
```json
{
  "success": false,
  "error": "Invalid credentials",
  "details": "Email or password is incorrect"
}
```

---

### 4. Get Current User (GET /api/auth/me)

**Purpose:** Get logged-in user's profile

**Requires:** JWT token from login/register

**Thunder Client / Postman:**
- Method: `GET`
- URL: `http://localhost:3000/api/auth/me`
- Headers:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**Replace the token** with your actual token from login/register response!

**Expected Response (200 OK):**
```json
{
  "success": true,
  "user": {
    "id": 1,
    "email": "john.doe@example.com",
    "role": "tenant",
    "first_name": "John",
    "last_name": "Doe",
    "phone": "555-0100",
    "status": "active"
  }
}
```

**curl:**
```bash
curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

**No Token:**
```json
{
  "success": false,
  "error": "No authorization token provided"
}
```

**Invalid Token:**
```json
{
  "success": false,
  "error": "Invalid token"
}
```

---

### 5. Refresh Token (POST /api/auth/refresh)

**Purpose:** Get a new JWT token before current one expires

**Thunder Client / Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/refresh`
- Headers:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

### 6. Logout (POST /api/auth/logout)

**Purpose:** Logout (client-side token removal)

**Thunder Client / Postman:**
- Method: `POST`
- URL: `http://localhost:3000/api/auth/logout`
- Headers:
  ```
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  ```

**Expected Response (200 OK):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

## Testing Different User Roles

### Create Admin User

```json
{
  "email": "admin@rentpay.com",
  "password": "AdminPass123!",
  "firstName": "Admin",
  "lastName": "User",
  "role": "admin"
}
```

### Create Property Manager

```json
{
  "email": "manager@rentpay.com",
  "password": "ManagerPass123!",
  "firstName": "Property",
  "lastName": "Manager",
  "role": "property_manager"
}
```

---

## Thunder Client Collection (VS Code)

### Install Thunder Client

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "Thunder Client"
4. Click Install

### Create Collection

1. Open Thunder Client (click the lightning icon in sidebar)
2. Click "Collections" tab
3. Click "New Collection"
4. Name it "Rent Payment API"
5. Add requests:

**1. Health Check**
- Name: Health Check
- Method: GET
- URL: `http://localhost:3000/api/health`

**2. Register**
- Name: Register Tenant
- Method: POST
- URL: `http://localhost:3000/api/auth/register`
- Body: JSON
- Copy the register JSON from above

**3. Login**
- Name: Login
- Method: POST
- URL: `http://localhost:3000/api/auth/login`
- Body: JSON
- Copy the login JSON from above

**4. Get Me**
- Name: Get Current User
- Method: GET
- URL: `http://localhost:3000/api/auth/me`
- Headers: `Authorization: Bearer {{token}}`
- Use environment variable for token

---

## Common Issues & Solutions

### Error: "Unable to connect to database"

**Solution:**
1. Check PostgreSQL is running
2. Verify database exists: `psql -l`
3. Check .env file has correct credentials
4. Test connection: `psql -U postgres -d rent_payment_db`

### Error: "EADDRINUSE: address already in use :::3000"

**Solution:** Port 3000 is occupied
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill
```

Or change PORT in .env file.

### Error: "Validation failed"

**Solution:** Check request body matches required fields and format
- Email: Valid email format
- Password: Min 8 chars, 1 uppercase, 1 lowercase, 1 number
- All required fields present

---

## Next Steps

Once authentication is working:

✅ Auth system tested and working
➡️ **Next**: Test tenant endpoints (Phase 3)
- Create properties
- Add units
- Create leases
- Make rent payments

See full implementation plan for complete API documentation.
