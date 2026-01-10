# Google OAuth Setup Guide

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google+ API" and enable it
4. Create OAuth 2.0 credentials:
   - Go to "APIs & Services" > "Credentials"
   - Click "Create Credentials" > "OAuth client ID"
   - Choose "Web application"
   - Add authorized redirect URIs:
     - `http://localhost:5000/api/auth/google/callback` (development)
     - `https://yourdomain.com/api/auth/google/callback` (production)
   - Copy the Client ID and Client Secret

## Step 2: Update Environment Variables

Add these to your `backend/.env` file:

```env
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_CALLBACK_URL=/api/auth/google/callback
FRONTEND_URL=http://localhost:8080
SESSION_SECRET=your-session-secret-key
```

## Step 3: Install Dependencies

```bash
cd backend
npm install
```

## Step 4: Test Google Login

1. Start the backend server
2. Go to frontend login page
3. Click "Continue with Google"
4. You should be redirected to Google login
5. After authentication, you'll be redirected back with a token

## Notes

- The callback URL must match exactly what you configured in Google Cloud Console
- For production, update `FRONTEND_URL` and `GOOGLE_CALLBACK_URL` in `.env`
- Users authenticated via Google will have `isVerified: true` automatically

