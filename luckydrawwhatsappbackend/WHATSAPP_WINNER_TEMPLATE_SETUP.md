# 🏆 WhatsApp Winner Notification Template Setup

## 📋 **Template Overview**

**Template Name:** `lucky_draw_winner`  
**Category:** `MARKETING`  
**Language:** `en_US` (English - US)  
**Purpose:** Notify participants that they have won a prize in the Elanadu Lucky Draw Contest

---

## 🎯 **Template Structure**

### **Header**
```
Congratulations! 🎉
```

### **Body**
```
Hello {{1}},

We're thrilled to inform you that you have won the {{2}} prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!
```

### **Footer**
```
3rd Eye Team | Thank you for your participation.
```

### **Variables**
1. **{{1}}** → `recipient_name` (Winner's name)
2. **{{2}}** → `prize_position` (1st, 2nd, 3rd, etc.)

---

## 🔧 **WhatsApp Business Manager Setup**

### **Step 1: Create Template in WhatsApp Business Manager**

1. **Login to WhatsApp Business Manager**
   - Go to [business.facebook.com](https://business.facebook.com)
   - Navigate to WhatsApp Manager

2. **Create New Template**
   - Click "Message Templates" → "Create Template"
   - Template Name: `lucky_draw_winner`
   - Category: `MARKETING`
   - Language: `English (US)`

3. **Configure Components**

   **Header:**
   - Type: `Text`
   - Content: `Congratulations! 🎉`

   **Body:**
   ```
   Hello {{1}},

   We're thrilled to inform you that you have won the {{2}} prize in the Elanadu Lucky Draw Contest!

   Our team will contact you soon with details on how to claim your prize.

   Thank you for participating and being part of the celebration!
   ```

   **Footer:**
   - Content: `3rd Eye Team | Thank you for your participation.`

4. **Submit for Review**
   - Review all content for compliance
   - Submit template for WhatsApp approval
   - Wait for approval (usually 24-48 hours)

---

## 📱 **API Usage Examples**

### **Single Winner Notification**

```bash
curl -X POST http://localhost:3002/api/winner-notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "recipientPhone": "919876543210",
    "recipientName": "Rahul",
    "prizePosition": "1st"
  }'
```

### **Bulk Winner Notifications**

```bash
curl -X POST http://localhost:3002/api/winner-notifications/bulk \
  -H "Content-Type: application/json" \
  -d '{
    "winners": [
      {
        "phoneNumber": "919876543210",
        "name": "Rahul",
        "position": "1st"
      },
      {
        "phoneNumber": "919876543211", 
        "name": "Priya",
        "position": "2nd"
      },
      {
        "phoneNumber": "919876543212",
        "name": "Amit",
        "position": "3rd"
      }
    ]
  }'
```

### **Template Information**

```bash
curl -X GET http://localhost:3002/api/winner-notifications/template-info
```

### **Parameter Validation**

```bash
curl -X POST http://localhost:3002/api/winner-notifications/validate \
  -H "Content-Type: application/json" \
  -d '{
    "recipientName": "Rahul",
    "prizePosition": "1st"
  }'
```

---

## 🎯 **Example Message Output**

**Input:**
- `recipient_name` = "Rahul"
- `prize_position` = "1st"

**Rendered Message:**
```
Congratulations! 🎉

Hello Rahul,

We're thrilled to inform you that you have won the 1st prize in the Elanadu Lucky Draw Contest!

Our team will contact you soon with details on how to claim your prize.

Thank you for participating and being part of the celebration!

3rd Eye Team | Thank you for your participation.
```

---

## 🔗 **Integration with Lucky Draw System**

### **Automatic Winner Notification Flow**

1. **Contest Draw Completion**
   - Winners are selected in the draw process
   - Winner data is saved to database

2. **Notification Trigger**
   - System calls winner notification service
   - Template message is sent to each winner

3. **Notification Tracking**
   - Message delivery status is logged
   - Failed notifications are retried

### **Integration Code Example**

```javascript
// In your draw completion handler
const WinnerNotificationService = require('./services/winnerNotificationService');
const winnerService = new WinnerNotificationService();

async function notifyWinners(winners) {
  const notifications = winners.map(winner => ({
    phoneNumber: winner.participant.phoneNumber,
    name: winner.participant.name,
    position: winner.prize === 'first' ? '1st' : 
             winner.prize === 'second' ? '2nd' : '3rd'
  }));

  const results = await winnerService.sendBulkWinnerNotifications(notifications);
  console.log('Winner notifications sent:', results);
}
```

---

## ⚙️ **Environment Variables Required**

Add these to your `.env` file:

```env
# WhatsApp API Configuration
WHATSAPP_ACCESS_TOKEN=your_whatsapp_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
```

---

## 🚨 **Important Notes**

### **Template Approval Requirements**
- ✅ **No spammy content** - Professional, celebratory tone
- ✅ **Clear purpose** - Contest winner notification only
- ✅ **Accurate information** - No misleading claims
- ✅ **Proper formatting** - Clean, readable structure

### **Compliance Guidelines**
- Only send to actual contest winners
- Ensure recipients have opted in to communications
- Include clear identification (3rd Eye Team)
- Provide context about the contest

### **Rate Limiting**
- WhatsApp has rate limits for template messages
- Built-in 1-second delay between bulk messages
- Monitor delivery status and handle failures

### **Testing**
- Test template with WhatsApp test numbers first
- Verify all variables render correctly
- Check message formatting on different devices

---

## 📊 **API Endpoints**

| Method | Endpoint | Purpose |
|--------|----------|---------|
| `POST` | `/api/winner-notifications/send` | Send single winner notification |
| `POST` | `/api/winner-notifications/bulk` | Send bulk winner notifications |
| `GET` | `/api/winner-notifications/template-info` | Get template information |
| `POST` | `/api/winner-notifications/validate` | Validate parameters |

---

## 🎉 **Next Steps**

1. **Submit template for WhatsApp approval**
2. **Wait for approval confirmation**
3. **Test with sample data**
4. **Integrate with your draw completion flow**
5. **Monitor delivery and engagement metrics**

---

**Template Status:** ⏳ **Pending WhatsApp Approval**  
**Implementation:** ✅ **Ready for Use**  
**Testing:** 🧪 **Ready for Testing**

---

**Created:** November 6, 2025  
**Last Updated:** November 6, 2025
