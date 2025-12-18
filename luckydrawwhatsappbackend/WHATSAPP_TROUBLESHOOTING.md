# 🔧 WhatsApp Template Troubleshooting Guide

## 🚨 **Common Issues & Solutions**

### **Issue 1: Template Not Working**

**Problem:** WhatsApp template messages are failing to send

**Possible Causes & Solutions:**

#### **1. Template Not Approved**
- ✅ **Check:** Is your template approved in WhatsApp Business Manager?
- 🔧 **Solution:** Use `hello_world` template for testing (pre-approved)

#### **2. Wrong Template Parameters**
- ✅ **Check:** Are you sending the correct number of parameters?
- 🔧 **Solution:** `hello_world` template only accepts 1 parameter

#### **3. Missing Environment Variables**
- ✅ **Check:** Are `WHATSAPP_ACCESS_TOKEN` and `WHATSAPP_PHONE_NUMBER_ID` set?
- 🔧 **Solution:** Add them to your `.env` file

#### **4. Invalid Phone Number Format**
- ✅ **Check:** Phone number should include country code (e.g., `919876543210`)
- 🔧 **Solution:** Use format without `+` sign for API calls

---

## 🧪 **Testing Steps**

### **Step 1: Check Configuration**
```bash
curl -X GET http://localhost:3002/api/test-whatsapp/config
```

**Expected Response:**
```json
{
  "success": true,
  "config": {
    "hasAccessToken": true,
    "hasPhoneNumberId": true,
    "isConfigured": true
  }
}
```

### **Step 2: Validate Phone Number**
```bash
curl -X POST http://localhost:3002/api/test-whatsapp/validate-phone \
  -H "Content-Type: application/json" \
  -d '{"phoneNumber": "919876543210"}'
```

### **Step 3: Send Test Message**
```bash
curl -X POST http://localhost:3002/api/test-whatsapp/send-test \
  -H "Content-Type: application/json" \
  -d '{
    "phoneNumber": "919876543210",
    "name": "Test User",
    "prize": "1st"
  }'
```

---

## 📱 **WhatsApp Template Formats**

### **hello_world Template (For Testing)**
```json
{
  "name": "hello_world",
  "language": {"code": "en_US"},
  "components": [
    {
      "type": "body",
      "parameters": [
        {"type": "text", "text": "Your Name Here"}
      ]
    }
  ]
}
```

### **lucky_draw_winner Template (Custom - Needs Approval)**
```json
{
  "name": "lucky_draw_winner", 
  "language": {"code": "en_US"},
  "components": [
    {
      "type": "body",
      "parameters": [
        {"type": "text", "text": "Winner Name"},
        {"type": "text", "text": "1st"}
      ]
    }
  ]
}
```

---

## 🔍 **Debugging Checklist**

### **Environment Variables**
```bash
# Check if variables are set
echo $WHATSAPP_ACCESS_TOKEN
echo $WHATSAPP_PHONE_NUMBER_ID
```

### **Phone Number Format**
- ✅ **Correct:** `919876543210` (country code + number)
- ❌ **Wrong:** `+919876543210` (don't use + in API calls)
- ❌ **Wrong:** `9876543210` (missing country code)

### **Access Token**
- Should start with `EAA...`
- Should be from WhatsApp Business App
- Should have `whatsapp_business_messaging` permission

### **Phone Number ID**
- Should be numeric (e.g., `123456789012345`)
- Found in WhatsApp Business Manager
- Must be verified and connected

---

## 🚨 **Common Error Messages**

### **Error: "Invalid parameter"**
**Cause:** Wrong number of parameters or incorrect format
**Solution:** Check template parameter count and types

### **Error: "Template does not exist"**
**Cause:** Template name is wrong or not approved
**Solution:** Use `hello_world` for testing or check template status

### **Error: "Invalid phone number"**
**Cause:** Phone number format is incorrect
**Solution:** Use country code format without `+` sign

### **Error: "Authentication failed"**
**Cause:** Invalid access token
**Solution:** Check token in WhatsApp Business Manager

---

## 🛠️ **Quick Fixes**

### **1. Switch to hello_world Template**
In `winnerNotificationService.js`, change:
```javascript
name: "hello_world"  // Instead of "lucky_draw_winner"
```

### **2. Fix Parameter Count**
For `hello_world`, use only 1 parameter:
```javascript
parameters: [
  {
    type: "text",
    text: `${recipientName} - ${prizePosition} Prize Winner`
  }
]
```

### **3. Check Environment Variables**
```javascript
console.log('Access Token:', process.env.WHATSAPP_ACCESS_TOKEN ? 'Set' : 'Missing');
console.log('Phone Number ID:', process.env.WHATSAPP_PHONE_NUMBER_ID ? 'Set' : 'Missing');
```

---

## 📞 **Test with Your Phone**

1. **Add your phone number** to the WhatsApp Business account
2. **Use your number** in test calls (with country code)
3. **Check WhatsApp** for incoming messages
4. **Verify delivery** in WhatsApp Business Manager

---

## 🎯 **Success Indicators**

### **API Response (Success):**
```json
{
  "success": true,
  "messageId": "wamid.xxx...",
  "recipientPhone": "919876543210"
}
```

### **WhatsApp Business Manager:**
- Message shows as "Delivered" 
- No error notifications
- Message appears in conversation

### **Recipient Phone:**
- Message received in WhatsApp
- Shows business name as sender
- Template formatting is correct

---

**💡 Tip:** Always test with `hello_world` template first before using custom templates!
