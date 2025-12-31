# Diksuchi OAuth Integration - Implementation Guide

## 📋 Overview
This guide shows you how to integrate Diksuchi OAuth authentication into your ProjectHub application.

---

## 🔑 What You Need from Diksuchi OAuth Server

### 1. **Public Key (RSA)**
- Get the **public.pem** file from Diksuchi Auth Server
- This is used to verify JWT tokens signed by Diksuchi
- The public key uses **RS256** algorithm

### 2. **OAuth Configuration**
- **Client ID**: `projectshub` (or your registered app name)
- **Redirect URI**: `http://localhost:5173/callback` (your callback URL)
- **Auth Server URL**: `http://localhost:3000` (Diksuchi server URL)
- **Scopes**: `openid profile email`

### 3. **Token Details**
- Tokens are signed with **RS256** (RSA with SHA-256)
- Issuer: `auth.diksuchi.com`
- Token includes:
  - `sub` (user ID)
  - `email`
  - `apps` (object with app roles)
  - `iat`, `exp` (issued at, expiration)

---

## 📁 Files Created/Modified

### **Backend Files**

#### 1. **backend/public.pem** (NEW)
```
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw7mHYUpne0qWi6cczSLa
U1CFZCWsSVstGTAjkPxihqwHRZb22e4+XPyoMUt6IhPSHiKi3Is8rBG/nM23FTW5
fJAwXb0G8egvJudR8iRuLHEqeOw1iQbvvYQ9eNjKgX7AyGWSnHl6Nq7cLe7l6Gmd
L2HalIUviIhAHYfUTyGmOZEgnyziGpue5gsMmBCNgUtt3qeMry9Lzox+CCyt38pC
w10+FGwkKVu3rpwrp60XyhvcETe/lDN86NSFz3LSPf2V66pfc7CQHJtqQYF+cJX1
Xnef+0qapIuMEXOtEumBTzr7ambCPK2+eiKUyVyNbRYTZqv2OGljnnL6Rlj/kVk4
YQIDAQAB
-----END PUBLIC KEY-----
```
**Purpose**: Verify JWT tokens from Diksuchi

#### 2. **backend/middleware/auth.js** (MODIFIED)
**Key Changes**:
- Import User model and file system modules
- Load RSA public key from file or environment
- Verify tokens using **RS256** algorithm (not HS256)
- Added `syncOAuthUser` middleware to create/sync users in database
- Modified `protect` middleware to combine token verification + user sync

**New Functions**:
```javascript
- getPublicKey() - Loads RSA public key
- verifyToken() - Verifies JWT with RSA public key
- syncOAuthUser() - Syncs OAuth user to database
- protect() - Combined middleware
```

#### 3. **backend/models/User.js** (MODIFIED)
**Added Fields**:
```javascript
oauthId: {
    type: String,
    unique: true,
    sparse: true,
    index: true,
},
name: {
    type: String,
    trim: true,
    maxlength: [50, 'Name cannot exceed 50 characters'],
},
```

**Modified**:
- Password is now optional for OAuth users
- Check: `required: function() { return !this.oauthId; }`

#### 4. **backend/routes/oauthRoutes.js** (NEW)
**Purpose**: Proxy token exchange to avoid CORS issues

**Endpoint**:
```javascript
POST /api/oauth/token
```

**Handles**:
- Code exchange for access token
- Communicates with Diksuchi Auth Server

#### 5. **backend/controllers/authController.js** (MODIFIED)
**Updated Functions**:
- `getMe()` - Returns complete user data with OAuth info
- `updateProfile()` - Handles OAuth users, prevents email changes for OAuth users

#### 6. **backend/.env** (MODIFIED)
**Added**:
```env
# Diksuchi Auth Server RSA Public Key
DIKSUCHI_PUBLIC_KEY=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAw7mHYUpne0qWi6cczSLa...
```

### **Frontend Files**

#### 7. **frontend/src/utils/auth.js** (NEW)
**OAuth Utilities**:
- `generateCodeVerifier()` - PKCE verifier
- `generateCodeChallenge()` - PKCE challenge
- `login()` - Initiates OAuth flow
- `handleCallback()` - Handles OAuth callback
- `getToken()` - Get stored token
- `isAuthenticated()` - Check auth status
- `logout()` - Clear auth data
- `decodeToken()` - Decode JWT (client-side only)
- `getCurrentUser()` - Get user from token

**Storage Keys**:
- `access_token` - OAuth access token
- `code_verifier` - PKCE verifier (session)

#### 8. **frontend/src/pages/Callback.jsx** (NEW)
**Purpose**: OAuth callback handler page

**Flow**:
1. Receives authorization code
2. Exchanges code for token
3. Stores token in localStorage
4. Redirects to dashboard

#### 9. **frontend/src/lib/api.js** (MODIFIED)
**Request Interceptor Update**:
```javascript
const token = localStorage.getItem('access_token') || localStorage.getItem('token');
```
Now checks both OAuth token and regular token

**Response Interceptor Update**:
Clears both `access_token` and `token` on 401

#### 10. **frontend/src/pages/Login.jsx** (MODIFIED)
**Added OAuth Login Button**:
```javascript
import { login as oauthLogin } from '../utils/auth';

const handleOAuthLogin = () => {
    oauthLogin(); // Redirects to Diksuchi
};
```

#### 11. **frontend/src/store/authStore.js** (MODIFIED)
**Added**:
```javascript
fetchUser: async () => {
    const { data } = await api.get('/auth/me');
    set({ user: data.data, isAuthenticated: true });
    return data.data;
}
```

#### 12. **frontend/src/pages/Profile.jsx** (MODIFIED)
**Changes**:
- Fetches user data on mount using `fetchUser()`
- Fixed response handling: `response.data.data` instead of `response.data.user`
- Shows OAuth email (read-only for OAuth users)
- Prevents email changes for OAuth users

---

## 🔧 Implementation Steps

### **Step 1: Backend Setup**

1. **Install Dependencies** (if not already):
```bash
cd backend
npm install jsonwebtoken
```

2. **Get Public Key from Diksuchi**:
   - Contact Diksuchi admin or get from their server
   - Save as `backend/public.pem`
   - OR add to `.env` as `DIKSUCHI_PUBLIC_KEY`

3. **Update .env**:
```env
# Add this section
DIKSUCHI_PUBLIC_KEY=your_base64_public_key_here
```

4. **Update User Model** (`backend/models/User.js`):
   - Add `oauthId` field
   - Add `name` field
   - Make password optional for OAuth users

5. **Update Auth Middleware** (`backend/middleware/auth.js`):
   - Replace JWKS/jose with jsonwebtoken + RSA
   - Add `syncOAuthUser` middleware
   - Update `protect` middleware

6. **Create OAuth Routes** (`backend/routes/oauthRoutes.js`):
   - Create new route file
   - Add token exchange endpoint

7. **Register OAuth Routes** in `server.js`:
```javascript
import oauthRoutes from './routes/oauthRoutes.js';
app.use('/api/oauth', oauthRoutes);
```

8. **Update Auth Controller** (`backend/controllers/authController.js`):
   - Update `getMe()` to return complete user data
   - Update `updateProfile()` to handle OAuth users

### **Step 2: Frontend Setup**

1. **Create OAuth Utils** (`frontend/src/utils/auth.js`):
   - Copy the entire auth.js file
   - Update these constants:
     ```javascript
     const AUTH_SERVER_URL = 'your_diksuchi_server_url';
     const CLIENT_ID = 'your_client_id';
     const REDIRECT_URI = 'your_redirect_uri';
     ```

2. **Create Callback Page** (`frontend/src/pages/Callback.jsx`):
   - Copy the Callback component
   - Add route in your router

3. **Update API Client** (`frontend/src/lib/api.js`):
   - Update request interceptor to check `access_token`
   - Update response interceptor to clear both tokens

4. **Update Auth Store** (`frontend/src/store/authStore.js`):
   - Add `fetchUser()` method

5. **Update Login Page** (`frontend/src/pages/Login.jsx`):
   - Add OAuth login button
   - Import and use `oauthLogin()`

6. **Update Profile Page** (`frontend/src/pages/Profile.jsx`):
   - Add user fetch on mount
   - Fix response handling
   - Handle OAuth users (read-only email)

7. **Add Callback Route** in your router:
```jsx
<Route path="/callback" element={<Callback />} />
```

---

## 🔄 OAuth Flow

### **Login Flow**:
```
1. User clicks "Login with Diksuchi"
   ↓
2. Frontend generates PKCE challenge
   ↓
3. Redirects to Diksuchi Auth Server
   ↓
4. User authenticates on Diksuchi
   ↓
5. Diksuchi redirects back with authorization code
   ↓
6. Callback page exchanges code for token (via backend proxy)
   ↓
7. Token stored in localStorage as 'access_token'
   ↓
8. User redirected to dashboard
```

### **API Request Flow**:
```
1. User makes API request
   ↓
2. Axios interceptor adds token to Authorization header
   ↓
3. Backend receives request with token
   ↓
4. verifyToken middleware verifies with RSA public key
   ↓
5. syncOAuthUser middleware finds/creates user in database
   ↓
6. req.user._id and req.dbUser populated
   ↓
7. Controller proceeds with user data
```

---

## 🛡️ Security Features

1. **PKCE (Proof Key for Code Exchange)**:
   - Prevents authorization code interception
   - Code verifier stored in sessionStorage
   - Code challenge sent to auth server

2. **RSA Public Key Verification**:
   - Tokens verified with public key
   - No shared secrets needed
   - Secure asymmetric cryptography

3. **Token Storage**:
   - Access token in localStorage
   - Code verifier in sessionStorage (temporary)
   - Automatic cleanup on logout

4. **User Sync**:
   - Automatic user creation on first login
   - Links OAuth ID to database user
   - Prevents duplicate accounts

---

## 📝 Configuration Checklist

### **From Diksuchi OAuth Server**:
- [ ] Public Key (public.pem)
- [ ] Client ID
- [ ] Redirect URI configured
- [ ] Scopes enabled (openid, profile, email)

### **Backend**:
- [ ] public.pem file in backend folder
- [ ] DIKSUCHI_PUBLIC_KEY in .env (optional)
- [ ] User model updated
- [ ] Auth middleware updated
- [ ] OAuth routes created
- [ ] Routes registered in server.js

### **Frontend**:
- [ ] auth.js utils created
- [ ] Callback page created
- [ ] API client updated
- [ ] Auth store updated
- [ ] Login page updated
- [ ] Profile page updated
- [ ] Callback route added

---

## 🧪 Testing

1. **Test OAuth Login**:
   - Click "Login with Diksuchi"
   - Should redirect to Diksuchi
   - After login, should redirect back
   - Token should be in localStorage
   - User should see dashboard

2. **Test API Calls**:
   - Make authenticated requests
   - Check backend logs for token verification
   - Check user sync logs

3. **Test Profile**:
   - View profile page
   - Update name
   - Check email is read-only for OAuth users

---

## 🐛 Troubleshooting

### **"Unsupported alg value"**:
- ✅ Fixed: Use jsonwebtoken with RSA, not JWKS

### **"jwt audience invalid"**:
- ✅ Fixed: Removed audience check or use correct audience

### **"No token provided"**:
- ✅ Fixed: API client checks both `access_token` and `token`

### **"User not found"**:
- ✅ Fixed: syncOAuthUser creates user automatically

### **Profile not showing name/email**:
- ✅ Fixed: fetchUser on mount, correct response path

---

## 📦 Dependencies

### Backend:
```json
{
  "jsonwebtoken": "^9.0.2"
}
```

### Frontend:
```json
{
  "react-router-dom": "^6.x",
  "axios": "^1.x",
  "zustand": "^4.x",
  "react-hot-toast": "^2.x"
}
```

---

## 🎯 Summary

**What was implemented**:
1. ✅ RSA public key verification (RS256)
2. ✅ OAuth user sync to database
3. ✅ PKCE authorization flow
4. ✅ Token proxy to avoid CORS
5. ✅ Automatic user creation
6. ✅ Profile management for OAuth users

**Key Files**:
- Backend: `middleware/auth.js`, `routes/oauthRoutes.js`, `models/User.js`, `public.pem`
- Frontend: `utils/auth.js`, `pages/Callback.jsx`, `lib/api.js`

**What you need from Diksuchi**:
1. Public key (public.pem)
2. Client ID
3. Configured redirect URI
4. Auth server URL

---

Ready to implement! 🚀
