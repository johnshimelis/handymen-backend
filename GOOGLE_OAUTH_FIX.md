# 🔧 Google OAuth Fix - Important!

## ❌ Current Problem

Your Google Cloud Console has the **WRONG redirect URI**:
- ❌ Current: `http://localhost:8080/api/auth/google/callback` (Frontend - WRONG!)
- ✅ Should be: `http://localhost:5000/api/auth/google/callback` (Backend - CORRECT!)

## ✅ Fix Steps

### 1. Update Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to: **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID: `159070728462-729nsihbcrgluubv3dmttokhoas0jfqm`
4. Under **"Authorised redirect URIs"**:
   - **REMOVE**: `http://localhost:8080/api/auth/google/callback`
   - **ADD**: `http://localhost:5000/api/auth/google/callback`
5. Under **"Authorised JavaScript origins"**:
   - Keep: `http://localhost:8080` (Frontend - this is correct)
   - **ADD**: `http://localhost:5000` (Backend - also needed)
6. Click **"Save"**

### 2. Restart Backend Server

After updating Google Cloud Console, restart your backend:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm start
```

### 3. Test Again

1. Go to: `http://localhost:8080/login`
2. Click "Continue with Google"
3. It should work now! ✅

## 📋 Correct Configuration

**Authorized JavaScript origins:**
- `http://localhost:8080` (Frontend)
- `http://localhost:5000` (Backend)

**Authorized redirect URIs:**
- `http://localhost:5000/api/auth/google/callback` (Backend callback)

## ⚠️ Why This Matters

- **Frontend (8080)**: Serves the React app
- **Backend (5000)**: Handles OAuth callback and generates JWT token
- Google OAuth callback **MUST** go to the backend, not frontend!

## 🧪 Verify It's Working

After fixing, you should see:
1. Click "Continue with Google" → Redirects to Google login
2. Login with Google → Redirects back to backend
3. Backend processes auth → Redirects to frontend with token
4. Frontend receives token → User is logged in ✅

---

**The .env file has been updated. Now just fix the Google Cloud Console settings!**

