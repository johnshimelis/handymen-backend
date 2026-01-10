# 🚀 Render Deployment Guide - Ethio Handy Backend

Complete step-by-step guide to deploy your backend on Render. Includes all environment variables and configuration needed.

**Repository**: Your code is already on GitHub ✅

## Prerequisites

- ✅ GitHub repository pushed (already done)
- ✅ Render account (sign up at https://render.com if needed)
- ✅ MongoDB Atlas database (or connection string ready)
- ✅ Google OAuth credentials (Client ID and Secret)

---

## Step 1: Create a Render Account

1. Go to [https://render.com](https://render.com)
2. Click **"Get Started for Free"** or **"Sign Up"**
3. Sign up using your GitHub account (recommended for easier integration)
4. Verify your email if required

---

## Step 2: Create a New Web Service

1. **Login to Render Dashboard**
   - Go to [https://dashboard.render.com](https://dashboard.render.com)

2. **Create New Web Service**
   - Click the **"+ New"** button (top right)
   - Select **"Web Service"**

3. **Connect Your Repository**
   - Select **"Connect GitHub"** or **"Public Git repository"**
   - If connecting GitHub:
     - Authorize Render to access your GitHub account
     - Search for your repository: `handymen-backend` (or your repo name)
     - Click **"Connect"**
   - If using public repo:
     - Enter your repository URL: `https://github.com/johnshimelis/handymen-backend`

---

## Step 3: Configure Web Service

Fill in the following configuration:

### Basic Settings:
- **Name**: `ethio-handy-backend` (or your preferred name)
  - ⚠️ **Important**: Note this name - you'll need it for the callback URL!
- **Region**: Choose closest to your users (e.g., `Oregon (US West)` or `Singapore (Asia Pacific)`)
- **Branch**: `main` (or your default branch)
- **Root Directory**: 
  - ✅ **Leave empty** if `backend` folder is the root of your GitHub repo
  - OR enter `backend` if your repo structure is: `repo/backend/...` and you want to deploy from the backend subdirectory

### Build & Deploy:
- **Runtime**: `Node` (Auto-detected)
- **Build Command**: `npm install` (leave default)
- **Start Command**: `npm start` (leave default)
- **Node Version**: `18` or `20` (Render auto-detects from package.json)

### Plan:
- **Free Plan**: Good for testing (may spin down after inactivity)
- **Starter Plan** ($7/month): Always-on, better for production

---

## Step 4: Set Environment Variables

Click on **"Environment"** tab or scroll down to **"Environment Variables"** section.

### Add all the following environment variables:

#### Server Configuration:
```
NODE_ENV=production
PORT=10000
```
*(Note: Render automatically sets PORT, but you can set it as backup)*

#### MongoDB Connection:
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ethio-handy?retryWrites=true&w=majority
```
*(Replace with your actual MongoDB Atlas connection string)*

#### JWT Configuration:
```
JWT_SECRET=your-super-secret-jwt-key-minimum-32-characters-long-for-production
JWT_EXPIRE=7d
```

#### Session Secret:
```
SESSION_SECRET=your-super-secret-session-key-for-production-minimum-32-chars
```

#### OTP Configuration:
```
OTP_EXPIRE_MINUTES=10
```

#### File Upload:
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

#### Commission Rate:
```
COMMISSION_RATE=10
```

#### Google OAuth Configuration:
```
GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-oauth-client-secret
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback
```
*(Replace `your-app-name` with your actual Render service name)*

#### Frontend URL:
```
FRONTEND_URL=https://your-frontend-domain.com
```
*(Or `http://localhost:8080` for testing. Update when frontend is deployed)*

---

## Step 5: Advanced Settings (Optional)

### Health Check:
- **Health Check Path**: `/api/health`
- Render will use this to verify your service is running

### Auto-Deploy:
- ✅ **Auto-Deploy**: Enabled (default)
  - Deploys automatically on every push to `main` branch

---

## Step 6: Create the Service

1. Click **"Create Web Service"** button
2. Render will:
   - Clone your repository
   - Run `npm install`
   - Start your service with `npm start`
3. Watch the **"Events"** tab for build logs
4. Wait for deployment to complete (usually 2-5 minutes)

---

## Step 7: Verify Deployment

1. Once deployed, you'll see your service URL:
   - Example: `https://ethio-handy-backend.onrender.com`

2. **Test Health Endpoint**:
   - Open: `https://your-app-name.onrender.com/api/health`
   - Should return: `{"success":true,"message":"Server is running"}`

3. **Check Logs**:
   - Go to **"Logs"** tab to see application logs
   - Verify MongoDB connection is successful
   - Check for any errors

---

## Step 8: Update Google OAuth Callback URL

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services** > **Credentials**
3. Click on your OAuth 2.0 Client ID
4. Under **"Authorized redirect URIs"**, add:
   ```
   https://your-app-name.onrender.com/api/auth/google/callback
   ```
5. Click **"Save"**

---

## Step 9: Update Frontend API URL

Update your frontend code to point to the Render backend:

In your frontend `.env` or API configuration:
```env
VITE_API_URL=https://your-app-name.onrender.com/api
# or
REACT_APP_API_URL=https://your-app-name.onrender.com/api
```

---

## Troubleshooting

### Service keeps crashing:
- Check **Logs** tab for errors
- Verify all environment variables are set correctly
- Ensure MongoDB URI is correct and accessible
- Check that PORT is correctly configured

### MongoDB connection fails:
- Verify MongoDB Atlas network access allows Render IPs (0.0.0.0/0)
- Check MongoDB URI credentials
- Ensure database name is correct

### Build fails:
- Check that `package.json` has correct scripts
- Verify Node.js version compatibility (Render uses Node 18+ by default)
- Check build logs for specific errors

### Service spins down (Free Plan):
- First request after inactivity takes 30-60 seconds (cold start)
- Consider upgrading to Starter plan for always-on service

---

## Production Checklist

- [ ] All environment variables set
- [ ] MongoDB connection working
- [ ] Health endpoint responding
- [ ] Google OAuth callback URL updated
- [ ] Frontend API URL updated
- [ ] CORS settings allow frontend domain
- [ ] Service is running on production URL
- [ ] Logs show no errors

---

## Useful Render URLs

- **Dashboard**: https://dashboard.render.com
- **Documentation**: https://render.com/docs
- **Status Page**: https://status.render.com

---

## Next Steps After Deployment

1. **Test all API endpoints** using your frontend or Postman
2. **Monitor logs** for the first few days
3. **Set up custom domain** (optional, paid feature)
4. **Enable automatic backups** for MongoDB Atlas
5. **Set up monitoring/alerts** (optional)

---

**Your backend should now be live on Render!** 🚀

