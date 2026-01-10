# 🔐 Update Google OAuth Callback URL for Render Deployment

This guide shows you exactly how to update the Google OAuth callback URL in Google Cloud Console to work with your Render deployment.

## 📍 Your Deployment URLs

- **Backend (Render):** `https://handymen-backend-1.onrender.com`
- **Frontend (Netlify):** `https://agelegaye.netlify.app`
- **Callback URL:** `https://handymen-backend-1.onrender.com/api/auth/google/callback`

---

## 🎯 Step-by-Step Instructions

### Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: **"House Rental"** (or your project name)
   - If not, click the project dropdown at the top and select it

### Step 2: Navigate to OAuth Credentials

1. In the left sidebar, expand **"APIs & Services"**
2. Click on **"Credentials"**
3. You should see your OAuth 2.0 Client IDs listed

### Step 3: Edit Your Client ID

1. Find the Client ID for **"Web application"** (it should show `159070728462-729nsihbcrgluubv3dmttokhoas0jfqm.apps.googleusercontent.com` in the URL or list)
2. **Click on the Client ID** to open the edit page

### Step 4: Add Render Callback URL

1. Scroll down to the **"Authorized redirect URIs"** section
2. You should see existing URIs like:
   - `http://localhost:8080`
   - `http://localhost:5000/api/auth/google/callback`

3. **Click the "+ Add URI" button**

4. **Enter the new URI:**
   ```
   https://handymen-backend-1.onrender.com/api/auth/google/callback
   ```
   ⚠️ **Important:** 
   - Use `https://` (not `http://`)
   - No trailing slash at the end
   - Match exactly: `https://handymen-backend-1.onrender.com/api/auth/google/callback`

5. The URI should appear in the list below

### Step 5: Keep Existing URIs (Optional)

You can keep the localhost URIs for local development, or remove them if you only want production:
- **Keep both:** Local development + Production
- **Remove localhost:** Production only

### Step 6: Save Changes

1. Scroll down to the bottom of the page
2. Click the **"Save"** button
3. Wait for confirmation (usually appears at the top)

### Step 7: Wait for Changes to Take Effect

- ⏱️ Changes can take **5 minutes to a few hours** to propagate
- You'll see a note on the page: *"Note: It may take five minutes to a few hours for settings to take effect"*

---

## ✅ Verification

After saving, your **"Authorized redirect URIs"** section should include:

```
✓ http://localhost:8080
✓ http://localhost:5000/api/auth/google/callback
✓ https://handymen-backend-1.onrender.com/api/auth/google/callback
```

---

## 🧪 Testing

1. Go to your frontend: https://agelegaye.netlify.app/login
2. Click **"Continue with Google"**
3. Should redirect to Google login
4. After authentication, should redirect back to your frontend
5. Should successfully log in

### If It Doesn't Work:

- ⏱️ **Wait 5-10 minutes** (Google may cache settings)
- 🔄 **Clear browser cache** and try again
- ✅ **Double-check the URL** matches exactly (no trailing slash, correct protocol)
- 🔍 **Check browser console** (F12) for error messages
- 📋 **Check Render logs** for any errors

---

## 📋 Quick Checklist

- [ ] Opened Google Cloud Console
- [ ] Selected correct project ("House Rental")
- [ ] Navigated to "APIs & Services" → "Credentials"
- [ ] Found and clicked on OAuth 2.0 Client ID
- [ ] Added new URI: `https://handymen-backend-1.onrender.com/api/auth/google/callback`
- [ ] Clicked "Save"
- [ ] Waited for confirmation
- [ ] Tested Google OAuth login on frontend

---

## 🎯 Your OAuth Configuration

**Client ID:** `159070728462-729nsihbcrgluubv3dmttokhoas0jfqm.apps.googleusercontent.com`

**Authorized Redirect URIs:**
- ✅ `http://localhost:8080` (for local development)
- ✅ `http://localhost:5000/api/auth/google/callback` (for local development)
- ✅ `https://handymen-backend-1.onrender.com/api/auth/google/callback` (for production)

**Client Secret:** (Keep this secure - stored in Render environment variables)

---

## 🔒 Security Notes

- ✅ Never commit client secrets to GitHub
- ✅ Client secrets are stored securely in Render environment variables
- ✅ Only authorized redirect URIs can be used for OAuth
- ✅ Always use `https://` for production URLs

---

**Once you've added the callback URL and saved, Google OAuth should work with your Render deployment!** 🚀

