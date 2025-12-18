# 🚨 URGENT FIX - SUPABASE_URL Missing

## Test Results
```
✅ SUPABASE_SERVICE_ROLE_KEY = Set (good!)
❌ SUPABASE_URL = MISSING (this is the problem!)
```

## The Problem
Your `.env` file has the wrong variable name for the URL.

You probably have:
```env
REACT_APP_SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
```

But it needs to be:
```env
SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
```

## Quick Fix

Open your `.env` file and make sure you have EXACTLY this:

```env
SUPABASE_URL=https://ehflkroljxvxedkbygno.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

**Important:**
- ❌ NOT `REACT_APP_SUPABASE_URL`
- ✅ YES `SUPABASE_URL`
- No quotes needed
- No spaces around the `=`

## Correct Format

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
SUPABASE_SERVICE_ROLE_KEY=your_actual_service_role_key
```

## Test After Fixing

Run this to verify:
```bash
node test-env.js
```

Should show:
```
✅ SUPABASE_URL: Set
✅ SUPABASE_SERVICE_ROLE_KEY: Set
```

Then start the server:
```bash
npm run dev
```

## Common Mistakes

❌ `REACT_APP_SUPABASE_URL` - Wrong! This is for React frontend
❌ `SUPABASE_URL="https://..."` - Don't use quotes for URL
❌ `SUPABASE_URL = https://...` - Don't use spaces around =
✅ `SUPABASE_URL=https://...` - Correct!

---

**Action Required:** 
1. Open `.env` file
2. Change `REACT_APP_SUPABASE_URL` to `SUPABASE_URL`
3. Remove quotes if any
4. Save
5. Run `node test-env.js` to verify
6. Run `npm run dev`
