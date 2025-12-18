# 🚨 URGENT: Fix WhatsApp Access Token

## The Error
```
(#10) Application does not have permission for this action
```

## Quick Fix (5 minutes)

### Step 1: Get New Token
1. Go to: https://developers.facebook.com/apps
2. Select your app
3. Click **WhatsApp** → **API Setup**
4. Find **Temporary access token**
5. Click **Generate Token**
6. **COPY the new token**

### Step 2: Update .env
Open: `e:\Nano\luckydrawwhatsappbackend\.env`

Find this line:
```env
WHATSAPP_ACCESS_TOKEN="EAAtfbJkXi80BP3GouZBuMZAOLexrR6jicnI4aNE7PpiN3XZBMzZBNc7i89JVGrdIskvMCOXToihc5ZBQwN02j4KsEQnLuersMF4zsh2rSte8OQn1HQJQL3ZCopxhhPsF2hUhkYFHOSnJimZCxiMZCldHrpiBK7UUadfSIVdJLPgREbhy3SCWzNGzewNZA8NX4u36ZAPM8QGlZAIe5CchlNBX89FLgk10CN0UTAp1geLS6ZCc5Qz1KUAg8gZChfXP1oLtAtm6HJeLZC36qG4iAtRWeZCEl3YGrVp"
```

Replace with your NEW token:
```env
WHATSAPP_ACCESS_TOKEN="YOUR_NEW_TOKEN_HERE"
```

### Step 3: Restart
```bash
# Press Ctrl+C to stop server
npm run dev
```

### Step 4: Test
Send "Join" to your WhatsApp Business number.

## ✅ Success
You should see:
```
🎯 Starting Lucky Draw flow
✅ Sent welcome message
```

## 🔑 Why This Happens
- Temporary tokens expire every 24 hours
- You need to regenerate them daily
- For production, use a permanent System User token

---

**Do this NOW before testing the flow!** ⚡
