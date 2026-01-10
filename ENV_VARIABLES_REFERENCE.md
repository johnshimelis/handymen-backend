# Environment Variables Reference for Render

Copy and paste these into Render's Environment Variables section. Replace placeholder values with your actual credentials.

## 📋 Complete List of Environment Variables

### 1. Server Configuration
```
NODE_ENV=production
PORT=10000
```

### 2. MongoDB Atlas Connection
```
MONGODB_URI=mongodb+srv://YOUR_USERNAME:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/ethio-handy?retryWrites=true&w=majority
```
**How to get this:**
1. Go to MongoDB Atlas
2. Click "Connect" on your cluster
3. Select "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Replace `ethio-handy` with your database name if different

### 3. JWT Authentication
```
JWT_SECRET=generate-a-random-32-character-secret-key-here
JWT_EXPIRE=7d
```
**Generate JWT_SECRET:**
- Use: https://randomkeygen.com/ (CodeIgniter Encryption Keys section)
- Or: `openssl rand -base64 32` (in terminal)
- Minimum 32 characters

### 4. Session Secret
```
SESSION_SECRET=generate-another-random-32-character-secret-key
```
**Note:** Use a different secret than JWT_SECRET

### 5. OTP Configuration
```
OTP_EXPIRE_MINUTES=10
```

### 6. File Upload Settings
```
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```
*(Note: On Render, files in ./uploads will be ephemeral. Consider using cloud storage like AWS S3 for production)*

### 7. Commission Rate
```
COMMISSION_RATE=10
```
(Percentage as a number)

### 8. Google OAuth (Required)
```
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret-here
GOOGLE_CALLBACK_URL=https://your-app-name.onrender.com/api/auth/google/callback
```
**Important:** Replace `your-app-name` with your actual Render service name
**Example:** If your URL is `https://ethio-handy-backend.onrender.com`, use:
```
GOOGLE_CALLBACK_URL=https://ethio-handy-backend.onrender.com/api/auth/google/callback
```

### 9. Frontend URL (Required)
```
FRONTEND_URL=https://your-frontend-domain.com
```
**For testing:** `http://localhost:8080`
**For production:** Your deployed frontend URL (e.g., `https://ethio-handy.vercel.app`)

---

## 🔒 Security Checklist

- [ ] All secrets are unique and randomly generated
- [ ] No secrets are hardcoded in the repository
- [ ] MongoDB password is strong
- [ ] JWT_SECRET is at least 32 characters
- [ ] SESSION_SECRET is different from JWT_SECRET
- [ ] Google OAuth callback URL matches Render URL exactly

---

## 🎯 Quick Setup Steps

1. **Copy all variables above**
2. **Replace placeholders with your actual values**
3. **In Render Dashboard:**
   - Go to your service
   - Click "Environment" tab
   - Click "Add Environment Variable" for each
   - Paste name and value
   - Click "Save Changes"
4. **Redeploy** your service after adding variables

---

## 📝 Example Configuration (for reference)

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://ethiohandy_user:MySecurePass123@cluster0.abc123.mongodb.net/ethio-handy?retryWrites=true&w=majority
JWT_SECRET=MySuperSecretJWTKey2024!ChangeInProduction@32Chars
JWT_EXPIRE=7d
OTP_EXPIRE_MINUTES=10
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
COMMISSION_RATE=10
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnop.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-AbCdEfGhIjKlMnO
GOOGLE_CALLBACK_URL=https://ethio-handy-backend.onrender.com/api/auth/google/callback
FRONTEND_URL=https://ethio-handy-frontend.vercel.app
SESSION_SECRET=MySuperSecretSessionKey2024!DifferentFromJWT@32
```

**⚠️ Never commit real secrets to GitHub!**

