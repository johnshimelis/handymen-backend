# 🎨 Customize Google OAuth Consent Screen

The OAuth consent screen is currently showing "handymen-backend-1.onrender.com" which is not user-friendly. This guide shows you how to customize it to show your actual app name.

## 🎯 Goal

Change from:
- ❌ **"Sign in to handymen-backend-1.onrender.com"**

To:
- ✅ **"Sign in to EthioHandy"** or **"Sign in to Agelegaye"**

---

## 📝 Step-by-Step Instructions

### Step 1: Open Google Cloud Console

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Make sure you're in the correct project: **"House Rental"** (or your project name)
   - Click the project dropdown at the top if you need to switch

### Step 2: Navigate to OAuth Consent Screen

1. In the left sidebar, expand **"APIs & Services"**
2. Click on **"OAuth consent screen"** (NOT "Credentials")
   - This is different from where you edit the Client ID

### Step 3: Configure Consent Screen

You'll see a form with several sections:

#### **User Type**
- Select: **"External"** (unless you're using Google Workspace for internal use)
- Click **"Create"** if this is your first time setting it up

#### **App Information** (Required)

1. **App name:**
   ```
   EthioHandy
   ```
   (Or use "Agelegaye" if you prefer)

2. **User support email:**
   - Select your email from the dropdown (e.g., `bamlakshimelis106@gmail.com`)

3. **App logo** (Optional but recommended):
   - Click **"Upload logo"**
   - Upload your app logo (if you have one)
   - Recommended: 120x120px PNG or SVG
   - This will show on the consent screen

4. **App domain** (Optional):
   - **Homepage URL:** `https://agelegaye.netlify.app`
   - **Application home page:** `https://agelegaye.netlify.app`

5. **Authorized domains** (Optional):
   - Add: `netlify.app`
   - Add: `onrender.com`
   - These are the domains where your app is hosted

#### **Developer contact information** (Required)

- **Email addresses:**
  - Enter: `bamlakshimelis106@gmail.com` (or your support email)
  - Google will use this to contact you about your app

### Step 4: Save and Continue

1. Scroll down and click **"Save and Continue"**

### Step 5: Configure Scopes (Optional)

1. You'll see **"Scopes"** page
2. The required scopes should already be added:
   - ✅ `.../auth/userinfo.email`
   - ✅ `.../auth/userinfo.profile`
   - `openid`
3. Click **"Save and Continue"** (no changes needed usually)

### Step 6: Test Users (If App is Not Published)

If your app is in "Testing" mode:

1. Go to **"Test users"** section
2. Click **"+ Add Users"**
3. Add test email addresses (like `bamlakshimelis106@gmail.com`)
4. Only these users can sign in while the app is in testing mode
5. Click **"Save and Continue"**

### Step 7: Summary and Publish

1. Review the **"Summary"** page
2. If everything looks good:
   - For **Testing**: Click **"Back to Dashboard"** (users in test list can sign in)
   - For **Production**: Scroll down and click **"PUBLISH APP"** button
     - ⚠️ **Warning**: Publishing makes your app available to all Google users
     - You may need to complete verification if requesting sensitive scopes

---

## 🎨 Recommended Settings

### App Information:
```
App name: EthioHandy
(or: Agelegaye)

User support email: [Your email]
App logo: [Your logo if available]
Homepage URL: https://agelegaye.netlify.app
Application home page: https://agelegaye.netlify.app
Privacy policy URL: [Optional - create later]
Terms of service URL: [Optional - create later]
```

### Authorized domains:
```
netlify.app
onrender.com
```

---

## ⚠️ Important Notes

### Publishing Status

**Testing Mode** (Default):
- ✅ Only users you add as "Test users" can sign in
- ✅ Quick setup, no verification needed
- ❌ Limited to 100 test users
- ❌ Shows "Unverified" warning

**Production Mode**:
- ✅ Available to all Google users
- ✅ No user limit
- ❌ May require verification (depending on scopes)
- ❌ Can take several days for Google to review

### For Now (Recommended):

1. **Keep it in Testing mode**
2. **Add yourself as a test user**
3. **Change the app name to "EthioHandy"**
4. **Save all changes**

This way you can test immediately without waiting for Google's review process.

---

## 🔍 Verification

After saving:

1. **Wait 5-10 minutes** for changes to propagate
2. **Clear your browser cache** (or use incognito mode)
3. Try signing in again:
   - Go to: https://agelegaye.netlify.app/login
   - Click "Continue with Google"
4. You should now see:
   - ✅ **"Sign in to EthioHandy"** (instead of "handymen-backend-1.onrender.com")
   - ✅ Your app logo (if you uploaded one)

---

## 🚀 Quick Checklist

- [ ] Navigated to "OAuth consent screen" in Google Cloud Console
- [ ] Set App name to "EthioHandy" (or "Agelegaye")
- [ ] Added user support email
- [ ] Added homepage URL: `https://agelegaye.netlify.app`
- [ ] Added authorized domains: `netlify.app`, `onrender.com`
- [ ] Added developer contact email
- [ ] Added test user (if in Testing mode)
- [ ] Saved all changes
- [ ] Waited 5-10 minutes
- [ ] Tested Google OAuth sign-in

---

## 📸 What Users Will See

**Before:**
```
Sign in to handymen-backend-1.onrender.com
```

**After:**
```
Sign in to EthioHandy
```

Much more professional and user-friendly! 🎉

---

## 🔗 Direct Links

- **OAuth Consent Screen:** https://console.cloud.google.com/apis/credentials/consent
- **Credentials (Client ID):** https://console.cloud.google.com/apis/credentials

---

**After making these changes, your OAuth consent screen will look professional and branded!** ✨

