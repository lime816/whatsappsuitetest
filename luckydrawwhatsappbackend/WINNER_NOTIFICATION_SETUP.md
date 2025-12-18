# Winner Notification WhatsApp Template Setup

This document provides instructions for setting up the WhatsApp message template for winner notifications in the Elanadu Lucky Draw system.

## 📋 Template Information

**Template Name:** `elanadu_mega_draw_winner`
**Category:** MARKETING
**Language:** English (en)

## 📝 Template Content

```
Hello {{1}},

We're thrilled to inform you that you have won the {{2}} prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!
```

## 🔧 WhatsApp Business Manager Setup

### Step 1: Create the Template

1. Go to [WhatsApp Business Manager](https://business.facebook.com/wa/manage/message-templates/)
2. Navigate to **Message Templates**
3. Click **Create Template**
4. Fill in the following details:
   - **Template Name:** `elanadu_mega_draw_winner`
   - **Category:** Marketing
   - **Language:** English

### Step 2: Add Template Content

**Body Text:**
```
Hello {{1}},

We're thrilled to inform you that you have won the {{2}} prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!
```

**Variables:**
- `{{1}}` - Winner's name (e.g., "Rahul Kumar")
- `{{2}}` - Prize position (e.g., "1st", "2nd", "3rd")

### Step 3: Submit for Approval

1. Review the template content
2. Submit for WhatsApp approval
3. Wait for approval (usually 24-48 hours)

## 🚀 Implementation Features

### Automatic Winner Notification

The system automatically sends winner notifications when a Mega Draw is completed:

1. **Template Message First:** Attempts to send using the approved WhatsApp template
2. **Text Fallback:** If template fails, sends as plain text message
3. **Bulk Processing:** Handles multiple winners with rate limiting
4. **Error Handling:** Comprehensive logging and error recovery

### API Endpoints

#### Send Single Winner Notification
```bash
POST /api/winner-notifications/send
Content-Type: application/json

{
  "recipientPhone": "+919876543210",
  "recipientName": "Rahul Kumar",
  "prizePosition": "1st",
  "useTextFallback": true
}
```

#### Send Bulk Winner Notifications
```bash
POST /api/winner-notifications/bulk
Content-Type: application/json

{
  "winners": [
    {
      "phoneNumber": "+919876543210",
      "name": "Winner 1",
      "position": "1st"
    },
    {
      "phoneNumber": "+919876543211", 
      "name": "Winner 2",
      "position": "2nd"
    }
  ],
  "useTextFallback": true
}
```

#### Send Text Message Only
```bash
POST /api/winner-notifications/send-text
Content-Type: application/json

{
  "recipientPhone": "+919876543210",
  "recipientName": "Rahul Kumar", 
  "prizePosition": "1st"
}
```

## 🧪 Testing

### Test Interface

Access the test interface at: `http://localhost:3001/api/test-winner-notification`

The test interface provides:
- Template message testing
- Text message testing  
- Template information display
- Real-time result feedback

### Manual Testing

1. **Test Template Message:**
   ```bash
   curl -X POST http://localhost:3001/api/winner-notifications/send \
     -H "Content-Type: application/json" \
     -d '{
       "recipientPhone": "+919876543210",
       "recipientName": "Test User",
       "prizePosition": "1st",
       "useTextFallback": true
     }'
   ```

2. **Test Text Message:**
   ```bash
   curl -X POST http://localhost:3001/api/winner-notifications/send-text \
     -H "Content-Type: application/json" \
     -d '{
       "recipientPhone": "+919876543210", 
       "recipientName": "Test User",
       "prizePosition": "1st"
     }'
   ```

## 🔄 Integration with Main Application

The main application automatically integrates with the WhatsApp backend service:

1. **Primary Method:** Calls WhatsApp backend service API
2. **Fallback Method:** Direct WhatsApp API call if backend unavailable
3. **Environment Variable:** Set `REACT_APP_WHATSAPP_BACKEND_URL` to backend URL

### Environment Configuration

Add to your main application's `.env` file:
```env
REACT_APP_WHATSAPP_BACKEND_URL=http://localhost:3001
```

## 📊 Monitoring and Logs

### Success Indicators
- ✅ Template message sent successfully
- ✅ Text fallback sent successfully
- ✅ Bulk notifications processed

### Error Handling
- ❌ Template not approved/found
- ❌ Invalid phone number format
- ❌ WhatsApp API rate limiting
- ❌ Network connectivity issues

### Log Monitoring
```bash
# View real-time logs
tail -f logs/whatsapp-backend.log

# Search for winner notifications
grep "winner notification" logs/whatsapp-backend.log
```

## 🔒 Security Considerations

1. **Phone Number Validation:** All phone numbers are validated and formatted
2. **Rate Limiting:** Built-in delays between bulk messages
3. **Error Sanitization:** Sensitive information not exposed in error messages
4. **Access Control:** API endpoints should be secured in production

## 🚨 Troubleshooting

### Common Issues

1. **Template Not Found Error**
   - Verify template is approved in WhatsApp Business Manager
   - Check template name matches exactly: `elanadu_mega_draw_winner`

2. **Invalid Phone Number**
   - Ensure phone numbers include country code
   - Format: `+919876543210` (no spaces or special characters)

3. **Message Delivery Failed**
   - Check WhatsApp Business Account status
   - Verify access token is valid
   - Ensure recipient has WhatsApp installed

4. **Rate Limiting**
   - System includes 1-second delays between messages
   - For high volume, consider implementing queue system

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=whatsapp:*
LOG_LEVEL=debug
```

## 📈 Performance Optimization

1. **Batch Processing:** Process winners in batches of 10-20
2. **Queue System:** Implement Redis queue for high volume
3. **Retry Logic:** Automatic retry for failed messages
4. **Monitoring:** Track delivery rates and response times

## 🔄 Future Enhancements

1. **Message Templates:** Support for multiple template variations
2. **Scheduling:** Delayed message sending
3. **Analytics:** Delivery and engagement tracking
4. **Personalization:** Dynamic content based on winner data
5. **Multi-language:** Support for regional languages

---

For technical support or questions, contact the development team or refer to the WhatsApp Business API documentation.
