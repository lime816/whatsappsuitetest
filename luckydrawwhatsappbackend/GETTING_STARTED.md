# 🚀 Getting Started with WhatsApp Automation Backend

This guide will help you set up and configure your WhatsApp automation backend for your specific business needs.

## 📋 Prerequisites

Before you begin, make sure you have:

- ✅ **Node.js** (version 16 or higher)
- ✅ **WhatsApp Business API Account** (Meta Business)
- ✅ **WhatsApp Business Phone Number** (verified)
- ✅ **Meta Developer Account** with app created
- ✅ **Hosting Platform** (Railway, Heroku, AWS, etc.)

## 🔧 Quick Setup

### 1. Environment Configuration

Copy `.env.example` to `.env` and fill in your credentials:

```bash
cp .env.example .env
```

**Required Variables:**
```env
WHATSAPP_ACCESS_TOKEN=your_access_token_here
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFY_TOKEN=your_secure_token_123
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Server

```bash
# Development
npm run dev

# Production
npm start
```

### 4. Configure Webhook

In Meta Developer Console:
- **Webhook URL**: `https://your-domain.com/webhook`
- **Verify Token**: Use the same token from your `.env` file
- **Subscribe to**: `messages` and `message_status`

## 🎯 Creating Your First Automation

### Step 1: Create a WhatsApp Flow

1. Go to **Meta Business Manager** → **WhatsApp** → **Flows**
2. Create a new flow (e.g., "Contact Form")
3. Design your form with the fields you need
4. **Copy the Flow ID** (you'll need this)

### Step 2: Add a Trigger

Use the API to create a trigger:

```bash
curl -X POST https://your-domain.com/api/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "contact",
    "flowId": "your_flow_id_here",
    "message": "Please share your contact details:",
    "isActive": true
  }'
```

### Step 3: Test Your Automation

1. Send "contact" to your WhatsApp Business number
2. You should receive the flow message
3. Complete the form to test the full workflow

## 🔧 Customization Examples

### Adding Custom Business Logic

Edit `services/webhookService.js` in the `processFormData` function:

```javascript
async function processFormData(phoneNumber, formData) {
  try {
    console.log(`💾 Processing form data for ${phoneNumber}:`, formData);
    
    // Example: Save to database
    await saveToDatabase(formData);
    
    // Example: Send email notification
    await sendEmailNotification(formData);
    
    // Example: Update CRM
    await updateCRM(phoneNumber, formData);
    
    console.log('✅ Form data processed successfully');
    
  } catch (error) {
    console.error('❌ Error processing form data:', error);
  }
}
```

### Adding Custom Triggers

```javascript
// Add to triggerService.js
const customTriggers = [
  {
    keyword: 'pricing',
    flowId: 'your_pricing_flow_id',
    message: 'Here are our current prices:',
    isActive: true
  },
  {
    keyword: 'support',
    flowId: 'your_support_flow_id',
    message: 'How can we help you today?',
    isActive: true
  }
];
```

## 📊 Common Use Cases

### 1. Lead Generation
- **Trigger**: "info" or "brochure"
- **Flow**: Contact form with name, email, phone
- **Action**: Save to CRM, send welcome email

### 2. Customer Support
- **Trigger**: "help" or "support"
- **Flow**: Issue category selection
- **Action**: Create support ticket, route to team

### 3. Appointment Booking
- **Trigger**: "book" or "appointment"
- **Flow**: Service selection, date/time picker
- **Action**: Save to calendar, send confirmation

### 4. Feedback Collection
- **Trigger**: "feedback" or "review"
- **Flow**: Rating and comment form
- **Action**: Save to database, notify management

## 🔌 API Endpoints

### Trigger Management
```bash
# List all triggers
GET /api/triggers

# Create new trigger
POST /api/triggers

# Update trigger
PUT /api/triggers/:id

# Delete trigger
DELETE /api/triggers/:id

# Test trigger
POST /api/triggers/test
```

### WhatsApp Operations
```bash
# Send text message
POST /api/whatsapp/send-text

# Send flow message
POST /api/whatsapp/send-flow

# Test connection
GET /api/whatsapp/test
```

## 🐛 Troubleshooting

### Common Issues

**1. Webhook Verification Failed**
- Check `WEBHOOK_VERIFY_TOKEN` matches Meta console
- Ensure webhook URL is accessible

**2. Messages Not Triggering**
- Verify triggers are active: `GET /api/triggers`
- Check webhook logs for incoming messages
- Test with exact keyword match

**3. Flow Not Sending**
- Verify Flow ID is correct
- Check WhatsApp API credentials
- Ensure recipient is in allowed list (for test apps)

### Debug Commands

```bash
# Check server health
curl https://your-domain.com/health

# Test webhook
curl -X POST https://your-domain.com/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "phoneNumber": "1234567890"}'

# List current triggers
curl https://your-domain.com/api/triggers
```

## 📈 Next Steps

1. **Add Database Integration** - Connect to your preferred database
2. **Implement Authentication** - Add API key authentication
3. **Set up Monitoring** - Add logging and error tracking
4. **Scale Your Triggers** - Create more sophisticated automation
5. **Integrate with Your Systems** - Connect to CRM, email, etc.

## 💡 Tips for Success

- **Start Simple**: Begin with basic text triggers before complex flows
- **Test Thoroughly**: Use the test endpoints before going live
- **Monitor Logs**: Keep an eye on webhook processing logs
- **User Experience**: Keep flows short and user-friendly
- **Error Handling**: Always have fallback messages for errors

## 📞 Support

- **Documentation**: Check the main README.md
- **API Reference**: Use `/health` endpoint to verify setup
- **Community**: Create issues for bugs or feature requests

---

**Ready to automate your WhatsApp interactions!** 🎉

Start with a simple "hello" trigger and expand from there. The system is designed to grow with your business needs.