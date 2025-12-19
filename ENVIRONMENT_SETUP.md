# 🔧 Environment Setup Guide

This guide will help you configure the environment variables for both the **Flow Builder Frontend** and **WhatsApp Backend API**.

## 📁 Project Structure

```
whatsappsuite/
├── luckydrawflowbuilder/     # React Frontend
│   ├── .env                  # Frontend environment variables
│   └── .env.example          # Frontend template
├── luckydrawwhatsappbackend/ # Node.js Backend  
│   ├── .env                  # Backend environment variables
│   └── .env.example          # Backend template
└── ENVIRONMENT_SETUP.md      # This guide
```

## 🚀 Quick Setup

### Step 1: Copy Environment Files

```bash
# Frontend
cd luckydrawflowbuilder
cp .env.example .env

# Backend
cd ../luckydrawwhatsappbackend
cp .env.example .env
```

### Step 2: Get WhatsApp Business API Credentials

1. **Go to Meta Developer Console**: https://developers.facebook.com
2. **Create/Select App** → Add WhatsApp Product
3. **Navigate to WhatsApp → API Setup**
4. **Copy these values**:
   - **Access Token** → `WHATSAPP_ACCESS_TOKEN`
   - **Phone Number ID** → `WHATSAPP_PHONE_NUMBER_ID`
   - **Business Account ID** → `WHATSAPP_BUSINESS_ACCOUNT_ID`
   - **App Secret** → `WHATSAPP_APP_SECRET`

### Step 3: Set Up Supabase Database

1. **Go to Supabase**: https://app.supabase.com
2. **Create New Project** (or use existing)
3. **Go to Settings → API**
4. **Copy these values**:
   - **Project URL** → `SUPABASE_URL`
   - **Service Role Key** → `SUPABASE_SERVICE_ROLE_KEY`

### Step 4: Configure Environment Files

#### Frontend (.env)
```env
# WhatsApp API
VITE_WHATSAPP_ACCESS_TOKEN=EAABsBCS1234...
VITE_WHATSAPP_PHONE_NUMBER_ID=158282837372377
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745
VITE_WHATSAPP_BUSINESS_NUMBER=15550617327

# Backend URL
VITE_BACKEND_URL=http://localhost:3001
```

#### Backend (.env)
```env
# WhatsApp API
WHATSAPP_ACCESS_TOKEN=EAABsBCS1234...
WHATSAPP_PHONE_NUMBER_ID=158282837372377
WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745
WHATSAPP_APP_SECRET=your_app_secret

# Database
SUPABASE_URL=https://abcdefg.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# Server
PORT=3001
FRONTEND_URL=http://localhost:5173
WEBHOOK_VERIFY_TOKEN=mySecureToken123
```

## 🔐 Security Checklist

- ✅ Never commit `.env` files to git
- ✅ Use different tokens for development/production
- ✅ Keep Service Role Key secure (has admin access)
- ✅ Use HTTPS URLs in production
- ✅ Rotate access tokens regularly

## 🧪 Testing Configuration

### Test Backend Health
```bash
curl http://localhost:3001/health
```

### Test WhatsApp Connection
```bash
curl http://localhost:3001/api/whatsapp/test-connection
```

### Test Frontend Build
```bash
cd luckydrawflowbuilder
npm run build
```

## 🚀 Production Deployment

### Frontend (Vercel/Netlify)
```env
VITE_WHATSAPP_ACCESS_TOKEN=your_production_token
VITE_BACKEND_URL=https://your-backend.railway.app
```

### Backend (Railway/Heroku)
```env
NODE_ENV=production
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend.vercel.app
```

## 🆘 Troubleshooting

### Common Issues

**"supabaseUrl is required"**
- Add `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` to backend `.env`

**CORS Error**
- Update `FRONTEND_URL` in backend `.env`
- Ensure frontend URL matches exactly

**Webhook Verification Failed**
- Check `WEBHOOK_VERIFY_TOKEN` matches in both files
- Verify webhook URL in Meta Developer Console

**Access Token Invalid**
- Regenerate token in Meta Developer Console
- Ensure token has required permissions

### Debug Commands

```bash
# Check environment variables are loaded
node -e "console.log(process.env.WHATSAPP_ACCESS_TOKEN ? 'Token loaded' : 'Token missing')"

# Test webhook locally with ngrok
npx ngrok http 3001
# Use ngrok URL in Meta Developer Console

# Check frontend build
npm run build && npm run preview
```

## 📞 Support

If you encounter issues:

1. Check this guide first
2. Verify all environment variables are set
3. Test with example values
4. Check Meta Developer Console for API errors
5. Review application logs for detailed error messages

---

**✅ Once configured, your WhatsApp automation system will be ready to:**
- Create flows visually in the frontend
- Deploy flows to WhatsApp Business API
- Process incoming messages via webhooks
- Automate responses with keyword triggers
- Handle form submissions and user data

🎉 **Happy automating!**