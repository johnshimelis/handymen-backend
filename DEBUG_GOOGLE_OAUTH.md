# Debugging Google OAuth

## Current Issue
Getting `auth_failed` error after Google authentication.

## What I've Added

1. **Enhanced Error Logging**: The callback now logs detailed error information
2. **Debug Logging**: Added console logs to track the OAuth flow

## How to Debug

1. **Restart your backend server:**
   ```bash
   npm start
   ```

2. **Try Google login again** and watch the backend console for:
   - "Google OAuth initiated" - when you click the button
   - "Google OAuth callback received" - when Google redirects back
   - Any error messages with details

3. **Check the console output** for:
   - Error messages
   - Stack traces
   - What step is failing

## Common Issues

### Issue 1: Passport Strategy Not Initialized
**Symptom**: No strategy found error
**Solution**: Make sure `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are in `.env`

### Issue 2: Database Connection Error
**Symptom**: Error saving/finding user
**Solution**: Check MongoDB connection

### Issue 3: Callback URL Mismatch
**Symptom**: redirect_uri_mismatch error
**Solution**: Verify Google Cloud Console has exact URL: `http://localhost:5000/api/auth/google/callback`

### Issue 4: User Creation Error
**Symptom**: Error in passport strategy callback
**Solution**: Check User model validation

## Next Steps

1. Try Google login
2. Check backend console for error messages
3. Share the error output so we can fix it

---

**The enhanced logging will help us identify the exact issue!**

