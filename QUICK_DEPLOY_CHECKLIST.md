# ✅ Quick Render Deployment Checklist

Use this checklist to ensure you don't miss any steps when deploying to Render.

## 📋 Pre-Deployment Checklist

- [ ] Code is pushed to GitHub
- [ ] All secrets removed from code (using placeholders)
- [ ] MongoDB Atlas database is set up
- [ ] MongoDB network access allows all IPs (0.0.0.0/0) or Render IPs
- [ ] Google OAuth credentials are ready
- [ ] Render account is created

---

## 🚀 Deployment Steps

### Step 1: Create Web Service on Render
- [ ] Go to Render Dashboard
- [ ] Click "+ New" → "Web Service"
- [ ] Connect GitHub repository
- [ ] Select your repository: `handymen-backend` (or your repo name)

### Step 2: Configure Service Settings
- [ ] **Name**: `ethio-handy-backend` (or your choice)
  - ⚠️ **Save this name** - needed for callback URLs!
- [ ] **Region**: Select closest to users
- [ ] **Branch**: `main`
- [ ] **Root Directory**: Leave empty (or `backend` if needed)
- [ ] **Build Command**: `npm install` (default)
- [ ] **Start Command**: `npm start` (default)
- [ ] **Health Check Path**: `/api/health`
- [ ] **Auto-Deploy**: ✅ Enabled

### Step 3: Add Environment Variables
Add each variable one by one in Render's Environment section:

- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000` (Render sets this automatically, but include as backup)
- [ ] `MONGODB_URI` = `mongodb+srv://USER:PASS@cluster.mongodb.net/ethio-handy?...`
- [ ] `JWT_SECRET` = `your-32-character-secret-key`
- [ ] `JWT_EXPIRE` = `7d`
- [ ] `SESSION_SECRET` = `different-32-character-secret-key`
- [ ] `OTP_EXPIRE_MINUTES` = `10`
- [ ] `MAX_FILE_SIZE` = `5242880`
- [ ] `UPLOAD_PATH` = `./uploads`
- [ ] `COMMISSION_RATE` = `10`
- [ ] `GOOGLE_CLIENT_ID` = `your-client-id.apps.googleusercontent.com`
- [ ] `GOOGLE_CLIENT_SECRET` = `your-client-secret`
- [ ] `GOOGLE_CALLBACK_URL` = `https://YOUR-SERVICE-NAME.onrender.com/api/auth/google/callback`
  - ⚠️ Replace `YOUR-SERVICE-NAME` with your actual service name from Step 2!
- [ ] `FRONTEND_URL` = `http://localhost:8080` (update later when frontend is deployed)

### Step 4: Create and Deploy
- [ ] Click "Create Web Service"
- [ ] Wait for build to complete (2-5 minutes)
- [ ] Watch "Events" tab for progress
- [ ] Check "Logs" tab for any errors

### Step 5: Verify Deployment
- [ ] Service shows "Live" status
- [ ] Health check passes: `https://YOUR-SERVICE-NAME.onrender.com/api/health`
- [ ] MongoDB connection successful (check logs)
- [ ] No errors in logs tab

### Step 6: Update Google OAuth
- [ ] Go to Google Cloud Console
- [ ] APIs & Services → Credentials
- [ ] Edit OAuth 2.0 Client ID
- [ ] Add Authorized redirect URI: `https://YOUR-SERVICE-NAME.onrender.com/api/auth/google/callback`
- [ ] Save changes

### Step 7: Update Frontend (When Ready)
- [ ] Update frontend API URL to: `https://YOUR-SERVICE-NAME.onrender.com/api`
- [ ] Update CORS if needed
- [ ] Test frontend → backend connection

---

## 🔍 Troubleshooting Quick Fixes

| Issue | Solution |
|-------|----------|
| Build fails | Check package.json, ensure Node version is compatible |
| Service crashes | Check logs for missing environment variables |
| MongoDB connection fails | Verify MONGODB_URI and network access (0.0.0.0/0) |
| Health check fails | Verify `/api/health` route exists |
| 503 Service Unavailable | Service might be spinning up (free plan), wait 30-60 seconds |

---

## 📝 Important Notes

1. **Service URL Format**: `https://YOUR-SERVICE-NAME.onrender.com`
   - Replace `YOUR-SERVICE-NAME` with your actual service name

2. **Google OAuth Callback**: Must exactly match Render URL
   - Format: `https://YOUR-SERVICE-NAME.onrender.com/api/auth/google/callback`

3. **Free Plan Limitations**:
   - Service spins down after 15 minutes of inactivity
   - First request after spin-down takes 30-60 seconds (cold start)
   - Consider Starter plan ($7/month) for always-on service

4. **Environment Variables**:
   - Can be updated anytime without redeployment
   - Changes take effect on next deployment
   - Secret values are encrypted on Render

5. **Logs**:
   - Access via "Logs" tab in Render dashboard
   - Real-time streaming available
   - Keep logs for debugging

---

## 🎯 Your Service URL Template

After deployment, your backend will be available at:
```
https://ethio-handy-backend.onrender.com/api
```

Example endpoints:
- Health: `https://ethio-handy-backend.onrender.com/api/health`
- Auth: `https://ethio-handy-backend.onrender.com/api/auth/send-otp`
- Handymen: `https://ethio-handy-backend.onrender.com/api/handymen/search`

---

**Ready to deploy? Follow `RENDER_DEPLOYMENT.md` for detailed step-by-step instructions!** 🚀


