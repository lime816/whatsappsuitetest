# 🚀 WhatsApp Backend Setup Guide

## ❌ Error Fix: "supabaseUrl is required"

You're seeing this error because the Supabase configuration is missing from your `.env` file.

## ✅ Quick Fix

### Step 1: Get Your Supabase Credentials

1. Go to your Supabase project dashboard
2. Click on **Settings** (gear icon) in the left sidebar
3. Click on **API** section
4. You'll see:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **Service Role Key** (anon key won't work - you need the service role key)

### Step 2: Update Your .env File

Open `e:\Nano\luckydrawwhatsappbackend\.env` and add these lines:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Replace with your actual values!**

### Step 3: Restart the Server

```bash
# Stop the server (Ctrl+C if running)
# Then restart:
npm run dev
```

## 📋 Complete .env File Template

Your `.env` file should look like this:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=YOUR_WHATSAPP_ACCESS_TOKEN
WHATSAPP_PHONE_NUMBER_ID=YOUR_PHONE_NUMBER_ID
WHATSAPP_BUSINESS_ACCOUNT_ID=YOUR_BUSINESS_ACCOUNT_ID
WHATSAPP_API_VERSION=v22.0
WHATSAPP_BUSINESS_NUMBER=YOUR_WHATSAPP_BUSINESS_NUMBER

# Webhook
WEBHOOK_VERIFY_TOKEN=YOUR_WEBHOOK_VERIFY_TOKEN

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## 🔍 Where to Find Supabase Credentials

### Option 1: Supabase Dashboard
```
1. Visit https://app.supabase.com
2. Select your project
3. Go to Settings → API
4. Copy:
   - Project URL → SUPABASE_URL
   - service_role key → SUPABASE_SERVICE_ROLE_KEY
```

### Option 2: From Your Main Backend
If you already have Supabase configured in your main backend (`e:\Nano\Nano\server\.env`), you can use the same credentials:

```bash
# Check your main backend .env file
cat e:\Nano\Nano\server\.env
```

Look for the `DATABASE_URL` - it contains your Supabase credentials.

## ⚠️ Important Notes

1. **Use Service Role Key**: The error specifically mentions "service role" - don't use the anon key
2. **Don't Commit .env**: The `.env` file is gitignored for security
3. **Same Database**: Use the same Supabase project as your main backend
4. **Port Conflict**: WhatsApp backend runs on port 3001 (same as main backend)

## 🔧 If You're Using the Same Database

Since you have a main backend at `e:\Nano\Nano\server`, you should use the **same Supabase credentials** for consistency.

### Extract from DATABASE_URL

Your main backend's `DATABASE_URL` looks like:
```
postgresql://postgres.xxxxx:[PASSWORD]@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

From this, your Supabase URL is:
```
https://xxxxx.supabase.co
```

## 🚀 After Adding Credentials

Once you add the Supabase credentials to your `.env` file:

```bash
npm run dev
```

You should see:
```
✅ Server running on port 3001
✅ Connected to Supabase
```

## 📝 Testing

Test the backend:
```bash
curl http://localhost:3001/health
```

Should return:
```json
{
  "status": "ok",
  "timestamp": "..."
}
```

## 🆘 Still Having Issues?

### Check if .env file exists
```bash
ls -la e:\Nano\luckydrawwhatsappbackend\.env
```

### Verify environment variables are loaded
Add this to your `server.js` temporarily:
```javascript
console.log('SUPABASE_URL:', process.env.SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set' : '❌ Missing');
```

### Make sure you're using the right .env file
The app looks for `.env` in the root of `luckydrawwhatsappbackend` folder.

---

## ✅ Summary

**To fix the error:**
1. Open `e:\Nano\luckydrawwhatsappbackend\.env`
2. Add:
   ```env
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
   ```
3. Restart: `npm run dev`

**Get credentials from:**
- Supabase Dashboard → Settings → API
- Or use same as main backend

Done! 🎉
