# 🚀 Diksuchi OAuth Setup Guide for ProjectHub

## 📋 Overview

This guide will help you configure and use the Diksuchi OAuth authentication system in ProjectHub. The system supports both traditional email/password login and OAuth authentication.

## ✅ What Has Been Implemented

### Backend Changes:
1. ✅ Updated User model with OAuth fields (`oauthId`, `name`)
2. ✅ Made password optional for OAuth users
3. ✅ Added RSA public key verification (RS256) for OAuth tokens
4. ✅ Created OAuth routes for token exchange (`/api/oauth/token`)
5. ✅ Updated auth middleware to handle both OAuth and regular JWT tokens
6. ✅ Modified profile endpoints to handle OAuth users
7. ✅ Added `public.pem` file for RSA verification

### Frontend Changes:
1. ✅ Created OAuth utilities with PKCE flow (`src/utils/auth.js`)
2. ✅ Added OAuth callback page (`src/pages/Callback.jsx`)
3. ✅ Updated API client to handle OAuth access tokens
4. ✅ Added "Continue with Diksuchi" button on Login page
5. ✅ Updated Profile page to prevent email changes for OAuth users
6. ✅ Added callback route to router (`/callback`)
7. ✅ Updated auth store with `fetchUser` method

## 🔧 Configuration Steps

### 1. Backend Configuration

#### Environment Variables (`.env`):
```env
# Diksuchi OAuth Configuration
DIKSUCHI_AUTH_SERVER_URL=http://localhost:3000

# Optional: Provide public key as environment variable (or use public.pem file)
# DIKSUCHI_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw7mHYUpne0qWi6cczSLa...
```

#### Public Key File:
The RSA public key is located at: `backend/public.pem`

**To update with your Diksuchi server's public key:**
1. Get the `public.pem` file from your Diksuchi OAuth server
2. Replace the contents of `backend/public.pem` with your server's public key
3. Or set `DIKSUCHI_PUBLIC_KEY` environment variable with base64 encoded key

### 2. Frontend Configuration

#### Create `.env` file in frontend folder:
```env
VITE_API_URL=http://localhost:5000/api
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id

# Diksuchi OAuth Configuration
VITE_DIKSUCHI_AUTH_SERVER_URL=http://localhost:3000
VITE_DIKSUCHI_CLIENT_ID=projectshub
VITE_DIKSUCHI_REDIRECT_URI=http://localhost:5173/callback
```

**Important:** Update these values based on your Diksuchi server configuration:
- `VITE_DIKSUCHI_AUTH_SERVER_URL`: Your Diksuchi OAuth server URL
- `VITE_DIKSUCHI_CLIENT_ID`: Your registered client ID in Diksuchi
- `VITE_DIKSUCHI_REDIRECT_URI`: Must match the redirect URI registered in Diksuchi

### 3. Register Your Application in Diksuchi

Contact your Diksuchi OAuth server administrator to register ProjectHub:

**Required Information:**
- **Application Name**: ProjectHub (or projectshub)
- **Redirect URI**: `http://localhost:5173/callback` (development)
- **Redirect URI (Production)**: `https://yourdomain.com/callback`
- **Scopes**: `openid profile email`

## 🔄 How It Works

### Login Flow:

1. **User clicks "Continue with Diksuchi"**
   - Frontend generates PKCE code verifier and challenge
   - User is redirected to Diksuchi OAuth server

2. **User authenticates on Diksuchi**
   - Diksuchi validates credentials
   - User approves the application

3. **Diksuchi redirects back to ProjectHub**
   - Authorization code is included in URL
   - Callback page receives the code

4. **Token Exchange**
   - Backend exchanges code for access token
   - Token is verified using RSA public key

5. **User Sync**
   - Backend creates/updates user in database
   - User is logged in and redirected to dashboard

### Authentication Flow:

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   Browser   │      │  ProjectHub  │      │  Diksuchi   │
│             │      │   Backend    │      │   OAuth     │
└──────┬──────┘      └──────┬───────┘      └──────┬──────┘
       │                    │                      │
       │ 1. Click OAuth     │                      │
       │─────────────────────────────────────────>│
       │                    │                      │
       │ 2. Redirect to login                     │
       │<─────────────────────────────────────────│
       │                    │                      │
       │ 3. User logs in    │                      │
       │─────────────────────────────────────────>│
       │                    │                      │
       │ 4. Redirect with code                    │
       │<─────────────────────────────────────────│
       │                    │                      │
       │ 5. Exchange code   │                      │
       │──────────────────>│                      │
       │                    │ 6. Verify code       │
       │                    │───────────────────>│
       │                    │                      │
       │                    │ 7. Return token      │
       │                    │<──────────────────│
       │                    │                      │
       │ 8. Return token    │                      │
       │<───────────────────│                      │
       │                    │                      │
       │ 9. Store token &   │                      │
       │    redirect        │                      │
       └────────────────────┴──────────────────────┘
```

## 🔐 Security Features

### PKCE (Proof Key for Code Exchange)
- Prevents authorization code interception attacks
- Code verifier stored in sessionStorage (temporary)
- Code challenge sent to OAuth server

### RSA Public Key Verification
- Tokens verified with asymmetric cryptography
- No shared secrets needed
- Secure RS256 algorithm

### Token Storage
- OAuth access token: localStorage (`access_token`)
- Regular JWT token: localStorage (`token`)
- Code verifier: sessionStorage (temporary, auto-removed)

### User Data Protection
- OAuth users cannot change email addresses
- Passwords not required for OAuth users
- Automatic user creation/sync on login

## 📝 API Endpoints

### OAuth Endpoints:

#### Token Exchange (Backend Proxy)
```http
POST /api/oauth/token
Content-Type: application/json

{
  "code": "authorization_code",
  "redirect_uri": "http://localhost:5173/callback",
  "code_verifier": "pkce_verifier",
  "client_id": "projectshub"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "Bearer",
    "expires_in": 3600
  }
}
```

### Auth Endpoints (Updated):

#### Get User Profile
```http
GET /api/auth/me
Authorization: Bearer <access_token>
```

**Response:**
```json
{
  "success": true,
  "message": "User profile fetched",
  "data": {
    "_id": "user_id",
    "oauthId": "oauth_user_id",
    "name": "John Doe",
    "username": "johndoe",
    "email": "john@example.com",
    "role": "user",
    "avatar": "avatar_url",
    "bio": "User bio",
    "wallet": 0,
    "favorites": [],
    "isVerified": true,
    "purchasedProjects": []
  }
}
```

## 🧪 Testing the OAuth Flow

### Development Testing:

1. **Start Diksuchi OAuth Server** (if running locally):
   ```bash
   # Follow Diksuchi server's setup instructions
   cd path/to/diksuchi-server
   npm start
   ```

2. **Start ProjectHub Backend**:
   ```bash
   cd backend
   npm start
   ```

3. **Start ProjectHub Frontend**:
   ```bash
   cd frontend
   npm run dev
   ```

4. **Test Login Flow**:
   - Navigate to `http://localhost:5173/login`
   - Click "Continue with Diksuchi"
   - Login with Diksuchi credentials
   - Verify redirect to dashboard
   - Check user profile

### Verify Implementation:

✅ **Backend Checks:**
- [ ] Backend server starts without errors
- [ ] `public.pem` file exists and contains valid RSA public key
- [ ] OAuth routes registered in server.js
- [ ] Environment variables configured

✅ **Frontend Checks:**
- [ ] Frontend builds and runs without errors
- [ ] Login page shows "Continue with Diksuchi" button
- [ ] OAuth button has proper styling
- [ ] Callback route is registered

✅ **OAuth Flow Checks:**
- [ ] Clicking OAuth button redirects to Diksuchi
- [ ] After login, redirects back to `/callback`
- [ ] Token is stored in localStorage
- [ ] User is redirected to dashboard
- [ ] User profile shows correct data

## 🐛 Troubleshooting

### Common Issues:

#### 1. "Public key not configured"
**Solution:** Ensure `backend/public.pem` exists or `DIKSUCHI_PUBLIC_KEY` env var is set

#### 2. "Token exchange failed"
**Solution:** Check backend console for detailed error. Verify:
- Diksuchi server is running
- `DIKSUCHI_AUTH_SERVER_URL` is correct
- Client ID matches registered application

#### 3. "Not authorized, token failed"
**Solution:** 
- Verify public key matches Diksuchi server's private key
- Check token expiration
- Ensure proper RS256 algorithm

#### 4. "Cannot change email for OAuth users"
**Solution:** This is expected behavior. OAuth users' emails are managed by Diksuchi.

#### 5. Redirect URI mismatch
**Solution:** Ensure redirect URI in frontend .env matches exactly with what's registered in Diksuchi

## 📚 Files Modified/Created

### Backend:
- ✏️ `models/User.js` - Added OAuth fields
- ✏️ `middleware/auth.js` - RSA verification
- ➕ `routes/oauthRoutes.js` - Token exchange
- ✏️ `controllers/authController.js` - OAuth user handling
- ➕ `public.pem` - RSA public key
- ✏️ `server.js` - OAuth routes registration
- ✏️ `.env` - OAuth configuration

### Frontend:
- ➕ `src/utils/auth.js` - OAuth utilities
- ➕ `src/pages/Callback.jsx` - OAuth callback
- ✏️ `src/lib/api.js` - Token handling
- ✏️ `src/store/authStore.js` - fetchUser method
- ✏️ `src/pages/Login.jsx` - OAuth button
- ✏️ `src/pages/Profile.jsx` - OAuth user handling
- ✏️ `src/App.jsx` - Callback route
- ✏️ `.env.example` - OAuth configuration

## 🎯 Next Steps

1. **Get Diksuchi Public Key**
   - Contact Diksuchi administrator
   - Replace `backend/public.pem` content

2. **Register Application**
   - Get Client ID from Diksuchi
   - Update frontend `.env` with Client ID

3. **Test Integration**
   - Follow testing steps above
   - Verify complete OAuth flow

4. **Production Setup**
   - Update redirect URIs for production domain
   - Update OAuth configuration in environment variables
   - Test on staging environment first

## 📞 Support

For issues related to:
- **ProjectHub OAuth Integration**: Check this guide
- **Diksuchi OAuth Server**: Contact Diksuchi administrator
- **Token Issues**: Verify public key and configuration

## 🎉 Success!

You now have a complete dual-authentication system:
- ✅ Traditional email/password login
- ✅ OAuth login with Diksuchi
- ✅ Secure token verification
- ✅ User profile management

Happy coding! 🚀
