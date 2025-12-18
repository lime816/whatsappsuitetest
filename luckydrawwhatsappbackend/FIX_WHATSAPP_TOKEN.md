# 🔧 Fix WhatsApp Access Token Error

## ❌ Current Error

```
(#10) Application does not have permission for this action
```

This means your WhatsApp access token is expired or doesn't have the required permissions.

## ✅ Solution: Get a New Access Token

### Step 1: Go to Meta for Developers

1. Visit: https://developers.facebook.com/apps
2. Select your WhatsApp Business App
3. Go to **WhatsApp** → **API Setup**

### Step 2: Generate New Token

1. Find the **Temporary access token** section
2. Click **Generate Token** or **Copy** if one is already shown
3. Copy the new token (starts with `EAAA...`)

**Note**: Temporary tokens expire after 24 hours!

### Step 3: Update Your .env File

Open `e:\Nano\luckydrawwhatsappbackend\.env` and update:

```env
WHATSAPP_ACCESS_TOKEN="YOUR_NEW_TOKEN_HERE"
```

Replace the old token with the new one you just copied.

### Step 4: Restart Server

```bash
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 5: Test Again

Send "Join" to your WhatsApp Business number.

---

## 🔑 Get a Permanent Token (Recommended)

Temporary tokens expire every 24 hours. For production, you need a permanent token.

### Option 1: System User Token (Recommended)

1. Go to **Business Settings** → **System Users**
2. Create a new System User
3. Assign it to your WhatsApp Business App
4. Generate a permanent token with these permissions:
   - `whatsapp_business_messaging`
   - `whatsapp_business_management`

### Option 2: Use Meta Business Suite

1. Go to https://business.facebook.com
2. Navigate to your Business Account
3. Go to **System Users**
4. Create/Edit a system user
5. Generate token for WhatsApp app

---

## 🧪 Test Your Token

After updating the token, test with:

```bash
# Test via curl
curl -X POST http://localhost:3001/api/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{"message": "Join", "phoneNumber": "+1234567890"}'
```

Or send "Join" directly to your WhatsApp Business number.

---

## ✅ Expected Result

After fixing the token, you should see:

```
🎯 Starting Lucky Draw flow for 919446355323
✅ Sent welcome message to 919446355323
```

And the user receives:
```
Welcome to 3rd Eye Security Systems. Please enter your name to join contest.
```

---

## 🔍 Verify Token is Working

Check your server logs for:
- ✅ No OAuth errors
- ✅ "Sent welcome message" appears
- ✅ User receives WhatsApp message

---

## 📝 Quick Checklist

- [ ] Go to Meta for Developers
- [ ] Generate new access token
- [ ] Update `.env` file with new token
- [ ] Restart server (`npm run dev`)
- [ ] Test by sending "Join"
- [ ] Verify user receives welcome message

---

## ⚠️ Important Notes

1. **Temporary tokens expire in 24 hours** - Get a permanent token for production
2. **Don't commit tokens to Git** - They're in `.gitignore`
3. **Test in sandbox first** - Before using with real customers
4. **Check phone number verification** - Make sure your test number is verified

---

## 🆘 Still Not Working?

### Check These:

1. **Token Format**: Should start with `EAAA...`
2. **Phone Number ID**: Correct in `.env`
3. **Business Account**: App is linked to WhatsApp Business Account
4. **Permissions**: Token has `whatsapp_business_messaging` permission
5. **Sandbox Mode**: If testing, use sandbox test numbers

### Get Help:

- Check Meta for Developers documentation
- Verify your app is approved for messaging
- Check WhatsApp Business API status

---

**Quick Fix**: Just get a new token from Meta for Developers and update your `.env` file! 🚀
