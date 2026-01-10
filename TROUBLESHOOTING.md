# Troubleshooting Google OAuth

## ✅ Fix Applied

I've updated `backend/config/passport.js` to:
1. Load dotenv at the top of the file
2. Check if credentials exist before initializing Google Strategy
3. Show a warning if credentials are missing (instead of crashing)

## 🧪 Test the Server

Try starting the server again:

```bash
npm start
```

You should now see:
- ✅ MongoDB Connected
- 🚀 Server running on port 5000
- ⚠️  Warning about Google OAuth (if credentials missing) - but server will still start

## 🔍 If Server Still Doesn't Start

1. **Check .env file exists:**
   ```bash
   type .env
   ```
   Should show `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

2. **Verify environment variables are loaded:**
   ```bash
   node -e "import('dotenv').then(d => { d.config(); console.log('CLIENT_ID:', process.env.GOOGLE_CLIENT_ID); })"
   ```

3. **Check for other errors:**
   - MongoDB connection issues
   - Port 5000 already in use
   - Missing dependencies

## 📝 Current Configuration

- **Backend Port**: 5000
- **Frontend Port**: 8080
- **Google Callback**: `http://localhost:5000/api/auth/google/callback`
- **Google Client ID**: `159070728462-729nsihbcrgluubv3dmttokhoas0jfqm.apps.googleusercontent.com`

## ⚠️ Important: Google Cloud Console

Make sure in Google Cloud Console:
- **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback`
- **Authorized JavaScript origins**: 
  - `http://localhost:8080`
  - `http://localhost:5000`

---

The server should now start even if Google OAuth has issues. Google login will only work if credentials are properly configured.

