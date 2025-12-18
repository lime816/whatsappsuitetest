# 🔧 Fix Your .env File

## ❌ Current Issues

1. Variable names are wrong (REACT_APP_ prefix is for React frontend, not backend)
2. Using `anon` key instead of `service_role` key

## ✅ Correct Configuration

Replace the last two lines in your `.env` file with:

```env
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY_HERE
```

## 🔑 Get Your Service Role Key

### Step 1: Go to Supabase Dashboard
1. Visit https://app.supabase.com
2. Select your project (ehflkroljxvxedkbygno)
3. Click **Settings** (⚙️) in the left sidebar
4. Click **API**

### Step 2: Copy the Service Role Key
You'll see two keys:
- ❌ **anon / public** - This is what you have now (starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZmxrcm9sanh2eGVka2J5Z25vIiwicm9sZSI6ImFub24i...)
- ✅ **service_role** - This is what you need (much longer, starts with eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZmxrcm9sanh2eGVka2J5Z25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSI...)

**Copy the service_role key!**

## 📝 Updated .env File

Your complete `.env` file should look like this:

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN="EAAtfbJkXi80BP3GouZBuMZAOLexrR6jicnI4aNE7PpiN3XZBMzZBNc7i89JVGrdIskvMCOXToihc5ZBQwN02j4KsEQnLuersMF4zsh2rSte8OQn1HQJQL3ZCopxhhPsF2hUhkYFHOSnJimZCxiMZCldHrpiBK7UUadfSIVdJLPgREbhy3SCWzNGzewNZA8NX4u36ZAPM8QGlZAIe5CchlNBX89FLgk10CN0UTAp1geLS6ZCc5Qz1KUAg8gZChfXP1oLtAtm6HJeLZC36qG4iAtRWeZCEl3YGrVp"
WHATSAPP_PHONE_NUMBER_ID="158282837372377"
WHATSAPP_BUSINESS_ACCOUNT_ID="164297206767745"
WHATSAPP_API_VERSION="v22.0"
WHATSAPP_BUSINESS_NUMBER="+15550617327"

# Webhook
WEBHOOK_VERIFY_TOKEN="tokenverify"

# Server
PORT=3001
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZmxrcm9sanh2eGVka2J5Z25vIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MjM1NjgxOCwiZXhwIjoyMDc3OTMyODE4fQ.PASTE_YOUR_SERVICE_ROLE_KEY_HERE
```

## 🎯 What to Change

**Remove these lines:**
```env
REACT_APP_SUPABASE_URL="https://ehflkroljxvxedkbygno.supabase.co"
REACT_APP_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVoZmxrcm9sanh2eGVka2J5Z25vIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIzNTY4MTgsImV4cCI6MjA3NzkzMjgxOH0.45EVUSpoQ6SKqjSpFCsitbw3EJhVN3_JFkBDKC8TUVQ"
```

**Add these lines instead:**
```env
SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_ACTUAL_SERVICE_ROLE_KEY_FROM_DASHBOARD
```

## 🔍 How to Identify the Keys

**Anon Key (what you have now):**
- Decode it at https://jwt.io
- You'll see: `"role": "anon"`
- ❌ This won't work for backend

**Service Role Key (what you need):**
- Decode it at https://jwt.io  
- You'll see: `"role": "service_role"`
- ✅ This is what the backend needs

## 🚀 After Fixing

1. Save the `.env` file
2. Restart the server:
   ```bash
   npm run dev
   ```
3. Should work without errors!

---

**Quick Summary:**
- Remove `REACT_APP_` prefix
- Change `ANON_KEY` to `SERVICE_ROLE_KEY`
- Get the service_role key from Supabase Dashboard → Settings → API
