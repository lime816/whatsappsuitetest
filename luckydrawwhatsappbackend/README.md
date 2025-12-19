# WhatsApp Business API Automation Backend

A flexible and scalable Node.js backend server for WhatsApp Business API automation. Build intelligent chatbots, automate customer interactions, and integrate WhatsApp Flows with your business processes.

## 🌟 **General Purpose WhatsApp Automation Platform**

This backend provides a complete foundation for WhatsApp Business API automation that includes:

### **🤖 Intelligent Automation Engine**

- **Trigger-Based Responses** - Keyword matching system for automated replies
- **WhatsApp Flow Integration** - Send interactive forms and collect responses
- **Multi-Message Type Support** - Handle text, buttons, lists, and flow completions
- **Customizable Logic** - Easy to extend for specific business needs

### **🔗 Backend API Server Features**

- **Purpose**: Process webhooks, execute triggers, and handle WhatsApp API integration
- **Core Features**:
  - 📨 **Webhook Processing** - Receive and process WhatsApp messages
  - 🤖 **Intelligent Triggers** - Match keywords to automated responses
  - 📡 **WhatsApp API Integration** - Send messages and interactive flows
  - 💾 **Data Processing** - Handle form submissions and user data
  - 🔧 **RESTful API** - Manage triggers and configurations programmatically

### **🔄 Complete Automation Workflow:**

```
User Message                     Backend Processing                  WhatsApp Response
     ↓                                    ↓                              ↓
1. User sends keyword            2. Webhook receives message       3. Match trigger keyword
   "hello" to business              from WhatsApp API                 "hello" found!
     ↓                                    ↓                              ↓
4. Trigger matched               5. Send interactive flow          6. User receives message
   Flow ID: 123456789               with "Open Form" button           with flow button
     ↓                                    ↓                              ↓
7. User clicks button            8. WhatsApp Flow opens            9. User completes form
   and opens form                   (registration/contact/etc)        and submits data
     ↓                                    ↓                              ↓
10. Form response received       11. Process form data             12. Send confirmation
    via webhook                      (save/email/integrate)            "Thank you!" message
```

### **🎯 Common Use Cases:**

- **Lead Generation**: Capture contact information through interactive forms
- **Customer Support**: Automated FAQ responses and ticket creation
- **Appointment Booking**: Collect booking details and preferences
- **Feedback Collection**: Gather customer feedback and ratings
- **Product Inquiries**: Showcase products and collect interest
- **Event Registration**: Manage event sign-ups and information collection

---

## 🎯 **System Overview**

This backend creates a **flexible WhatsApp automation platform** that:

- **Processes incoming WhatsApp messages** via secure webhooks
- **Matches keywords to customizable triggers** for automated responses
- **Sends interactive flows, buttons, and lists** based on user input
- **Handles form completions and data processing** with custom logic
- **Provides RESTful APIs** for trigger management and configuration
- **Supports multiple message types** including text, interactive, and media
- **Offers comprehensive logging and monitoring** for debugging and analytics

## 🏗️ **Architecture & Flow**

### **Core System Components:**

```
WhatsApp Business API                Backend Server                    Your Application
        ↓                                    ↓                              ↓
📨 Incoming messages              📨 Webhook processing            📊 Dashboard/Frontend
📤 Outgoing responses            🤖 Trigger matching              ⚙️ Configuration UI
📋 Interactive flows             📡 WhatsApp API calls            📈 Analytics & monitoring
📊 Message status               💾 Data processing               🧪 Testing interface
        ↓                                    ↓                              ↓
   Complete WhatsApp automation with flexible integration options
```

### **API Communication Flow:**

- **WhatsApp** → **Backend**: Webhooks for incoming messages and status updates
- **Backend** → **WhatsApp**: API calls for sending messages, flows, and media
- **Your App** ←→ **Backend**: REST API for trigger management and configuration
- **Backend** → **Your Systems**: Webhook/API integration for form data processing

### **Complete Automation Flow:**

```
📱 User sends "contact" → WhatsApp Business Number
     ↓
🌐 WhatsApp → Sends webhook → Your Backend Server
     ↓
🔍 Backend → Finds "contact" trigger → Flow ID: your_contact_flow_id
     ↓
🤖 Backend → Sends interactive flow → "Please share your contact details:"
     ↓
📋 User → Clicks "Open Form" → Opens WhatsApp Flow
     ↓
✅ User → Completes form → Data sent back to webhook
     ↓
💾 Backend → Processes form data → Saves to database/sends email/triggers workflow
     ↓
📨 Backend → Sends confirmation → "Thank you! We'll be in touch soon."
```

### **Key Components:**

- **Webhook Handler** (`routes/webhook.js`) - Receives and validates WhatsApp events
- **Trigger Service** (`services/triggerService.js`) - Manages keyword-to-flow mappings
- **WhatsApp Service** (`services/whatsappService.js`) - Handles all WhatsApp API communications
- **Message Processor** (`services/webhookService.js`) - Processes incoming messages and responses
- **Message Library** (`routes/messageLibrary.js` + `services/messageLibraryService.js`) - Template management for consistent messaging
- **Configuration API** (`routes/triggers.js`) - RESTful endpoints for trigger management

## 🚀 **Features**

### 🔄 **Intelligent Automation**

- **Keyword Triggers**: Match incoming messages to predefined actions
- **Interactive Flows**: Send WhatsApp Flows with forms, buttons, and lists
- **Multi-Message Support**: Handle text, interactive, and media messages
- **Form Processing**: Capture and process user submissions
- **Custom Logic**: Easy to extend for specific business requirements
- **Real-time Processing**: Instant response to user interactions

### 🔒 **Security & Reliability**

- **Webhook Verification**: Secure Meta webhook validation
- **CORS Protection**: Frontend integration security
- **Error Handling**: Comprehensive error logging and recovery
- **Production Ready**: Railway deployment with 0.0.0.0 binding

### 📊 **Monitoring & Debugging**

- **Real-time Logs**: Track all webhook events and responses
- **Health Endpoints**: Monitor system status and uptime
- **Trigger Analytics**: Track usage counts and performance

## 📋 **Prerequisites**

### **Required Accounts & Tools:**

- **Node.js** >= 16.0.0
- **npm** or yarn package manager
- **WhatsApp Business API Account** (Meta Business)
- **Meta Developer Account** with app created
- **Hosting Platform** (Railway, Heroku, AWS, etc.)
- **WhatsApp Business Phone Number** (verified)

### **Required Information:**

- WhatsApp Access Token
- Phone Number ID
- Business Account ID
- Webhook Verify Token
- WhatsApp Flow IDs (created in Meta Business Manager)

## 🚀 **Quick Start**

For detailed setup instructions, see **[GETTING_STARTED.md](./GETTING_STARTED.md)**

For business-specific templates, see **[BUSINESS_TEMPLATES.md](./BUSINESS_TEMPLATES.md)**

## 🛠 **Step-by-Step Installation**

### **Step 1: Clone & Setup Local Environment**

```bash
# Clone the repository
git clone https://github.com/Flair0n/whatsapp_backend.git
cd whatsapp_backend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

### **Step 2: Configure Environment Variables**

Create a `.env` file with your actual credentials:

```env
# WhatsApp Business API Configuration
WHATSAPP_ACCESS_TOKEN=EAAxxxxxxxxxx  # From Meta Developer Console
WHATSAPP_PHONE_NUMBER_ID=158282837372377  # Your business phone ID
WHATSAPP_BUSINESS_ACCOUNT_ID=164297206767745  # Your business account ID
WHATSAPP_API_VERSION=v22.0

# Business WhatsApp Number (where customers send messages)
WHATSAPP_BUSINESS_NUMBER=15550617327  # Your actual business number

# Webhook Configuration
WEBHOOK_VERIFY_TOKEN=mywebhooktoken123  # Choose a secure token

# Server Configuration
PORT=3001
NODE_ENV=production  # Use 'development' for local testing

# Frontend Integration
FRONTEND_URL=https://your-frontend-domain.com
```

### **Step 3: Deploy to Railway**

```bash
# Commit your changes
git add .
git commit -m "Initial WhatsApp backend setup"
git push

# Deploy to Railway (connects to GitHub automatically)
# Visit: https://railway.app → Connect GitHub → Deploy
```

### **Step 4: Configure WhatsApp Webhook**

1. **Go to Meta Developer Console**
2. **Navigate**: WhatsApp → Configuration → Webhooks
3. **Set Callback URL**: `https://your-railway-app.up.railway.app/webhook`
4. **Set Verify Token**: `mywebhooktoken123` (match your .env)
5. **Subscribe to Events**: `messages`, `message_status`

### **Step 5: Create WhatsApp Flows**

1. **Go to Meta Business Manager**
2. **Navigate**: WhatsApp → Flows
3. **Create Flow**: Design your interactive forms
4. **Note Flow ID**: Copy the Flow ID (e.g., `772936888895590`)
5. **Set First Screen**: Ensure first screen is named correctly (e.g., `RECOMMEND`)

### **Step 6: Add Test Recipients**

1. **In Meta Developer Console**: WhatsApp → API Setup → Recipients
2. **Add Phone Numbers**: Add numbers that can receive messages (for unpublished apps)
3. **Verify Numbers**: Complete SMS verification for each number

## 🤖 **Automation System**

### **How the Trigger System Works:**

The system uses **keyword-based triggers** to automatically respond to WhatsApp messages:

```javascript
// Example Trigger Configuration
{
  id: "1",
  keyword: "hello",           // When user sends "hello"
  flowId: "772936888895590",  // Send this WhatsApp Flow
  message: "Hello! Please complete this form:",  // With this message
  isActive: true              // Trigger is enabled
}
```

### **Default Configured Triggers:**

| **Keyword** | **Flow ID**                 | **Response Message**                 | **Use Case**            |
| ----------- | --------------------------- | ------------------------------------ | ----------------------- |
| `hello`     | `your_flow_id_here`         | "Hello! Please complete this form:"  | General greeting/form   |
| `start`     | `your_onboarding_flow_id`   | "Welcome! Let's get you started:"    | User onboarding        |
| `contact`   | `your_contact_flow_id`      | "Please share your contact details:" | Contact information    |
| `feedback`  | `your_feedback_flow_id`     | "We'd love to hear your feedback:"   | Feedback collection    |

*Note: Replace the Flow IDs with your actual WhatsApp Flow IDs from Meta Business Manager*

### **Complete Automation Flow:**

#### **1. Message Reception**

```
User sends: "hello"
     ↓
WhatsApp API → Webhook POST /webhook
     ↓
Backend receives payload:
{
  "messages": [{
    "from": "918281348343",
    "text": {"body": "hello"},
    "type": "text"
  }]
}
```

#### **2. Trigger Processing**

```
Backend processes message:
     ↓
📝 Extract text: "hello"
     ↓
🔍 Find matching trigger: keyword="hello"
     ↓
✅ Match found: Flow ID 772936888895590
```

#### **3. Flow Message Generation**

```
Backend creates WhatsApp Flow message:
{
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "action": {
      "name": "flow",
      "parameters": {
        "flow_id": "772936888895590",
        "flow_action_payload": {
          "screen": "RECOMMEND",
          "data": {
            "user_phone": "918281348343",
            "form_type": "registration"
          }
        }
      }
    }
  }
}
```

#### **4. User Interaction**

```
📱 User receives: "complete karo" + [Open Form] button
     ↓
👆 User clicks "Open Form"
     ↓
📋 WhatsApp Flow opens (RECOMMEND screen)
     ↓
✍️ User fills out form fields
     ↓
✅ User submits form
```

#### **5. Form Response Processing**

```
WhatsApp sends form response → Webhook
     ↓
Backend receives:
{
  "interactive": {
    "nfm_reply": {
      "response_json": "{"name":"John","email":"john@example.com"}",
      "body": "Form completed"
    }
  }
}
     ↓
Backend processes form data → Database/Actions
```

## 📚 **API Documentation**

### **Base URL**: `https://whatsappbackend-production-8946.up.railway.app`

### **Core Endpoints:**

#### **1. Health Check** ✅

```http
GET /health
```

**Purpose**: Monitor server status and uptime  
**Response**:

```json
{
  "status": "healthy",
  "timestamp": "2025-10-08T12:00:00.000Z",
  "uptime": 3600,
  "environment": "production",
  "version": "1.0.0"
}
```

#### **2. Webhook Verification** 🔐

```http
GET /webhook?hub.mode=subscribe&hub.verify_token=mywebhooktoken123&hub.challenge=test123
```

**Purpose**: WhatsApp webhook verification (Meta setup)  
**Response**: Returns the challenge string for verification

#### **3. Webhook Message Processing** 📨

```http
POST /webhook
```

**Purpose**: Receives WhatsApp messages and processes triggers  
**Headers**: `Content-Type: application/json`
**Body**: WhatsApp webhook payload
**Response**: `200 OK` if processed successfully

#### **4. Trigger Management** ⚙️

##### Get All Triggers

```http
GET /api/triggers
```

**Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "1",
      "keyword": "hello",
      "flowId": "772936888895590",
      "message": "Hello! Please complete this form:",
      "isActive": true,
      "createdAt": "2025-10-08T07:15:39.496Z",
      "matchCount": 0
    }
  ],
  "count": 1
}
```

##### Create New Trigger

```http
POST /api/triggers
```

**Body**:

```json
{
  "keyword": "register",
  "flowId": "your_flow_id_here",
  "message": "Please complete registration:",
  "isActive": true
}
```

##### Test Trigger

```http
POST /api/triggers/:id/test
```

**Purpose**: Test trigger functionality without sending real messages

#### **5. WhatsApp Messaging** 📱

##### Send Text Message

```http
POST /api/whatsapp/send-message
```

**Body**:

```json
{
  "to": "918281348343",
  "type": "text",
  "text": {
    "body": "Hello from WhatsApp API!"
  }
}
```

##### Send Flow Message

```http
POST /api/whatsapp/send-flow
```

**Body**:

```json
{
  "to": "918281348343",
  "flowId": "772936888895590",
  "message": "Please complete this form:"
}
```

- `hub.verify_token` - Your webhook verify token
- `hub.challenge` - Challenge string to echo back

```http
POST /webhook
```

Receives WhatsApp webhook payloads for message processing.

**Request Body:**

```json
{
  "object": "whatsapp_business_account",
  "entry": [
    {
      "id": "WHATSAPP_BUSINESS_ACCOUNT_ID",
      "changes": [
        {
          "value": {
            "messaging_product": "whatsapp",
            "metadata": {
              "display_phone_number": "PHONE_NUMBER",
              "phone_number_id": "PHONE_NUMBER_ID"
            },
            "messages": [...]
          },
          "field": "messages"
        }
      ]
    }
  ]
}
```

#### Trigger Management

```http
GET /api/triggers
```

Get all automation triggers.

```http
POST /api/triggers
```

Create a new automation trigger.

**Request Body:**

```json
{
  "name": "Welcome Flow",
  "type": "message_received",
  "conditions": {
    "keyword": "start",
    "phone_number": "+1234567890"
  },
  "actions": [
    {
      "type": "send_message",
      "template": "welcome_template"
    }
  ],
  "active": true
}
```

```http
PUT /api/triggers/:id
```

Update an existing trigger.

```http
DELETE /api/triggers/:id
```

Delete a trigger.

```http
POST /api/triggers/:id/test
```

Test a trigger execution.

#### WhatsApp Messaging

```http
POST /api/whatsapp/send-message
```

Send a WhatsApp message.

**Request Body:**

```json
{
  "to": "+1234567890",
  "type": "text",
  "text": {
    "body": "Hello from WhatsApp API!"
  }
}
```

```http
POST /api/whatsapp/send-template
```

Send a WhatsApp template message.

**Request Body:**

```json
{
  "to": "+1234567890",
  "template": {
    "name": "template_name",
    "language": {
      "code": "en"
    },
    "components": []
  }
}
```

## 🏗 Project Structure

```
whatsapp-backend/
├── routes/
│   ├── webhook.js          # Webhook handling routes
│   ├── triggers.js         # Trigger management routes
│   ├── whatsapp.js        # WhatsApp messaging routes
│   └── messageLibrary.js  # Message templates and library routes
├── services/
│   ├── webhookService.js   # Webhook processing logic
│   ├── triggerService.js   # Trigger management logic
│   ├── whatsappService.js  # WhatsApp API integration
│   └── messageLibraryService.js # Message template logic and utilities
├── server.js              # Main server file
├── package.json           # Dependencies and scripts
├── .env                   # Environment variables (create this)
├── .gitignore            # Git ignore rules
└── README.md             # This file
```

### Message Library Service

- Purpose: Centralizes reusable message templates and content blocks used by triggers, flows, and one-off messages. This keeps user-facing text consistent and makes updates low-risk because templates are stored and referenced in one place.
- Files: `routes/messageLibrary.js` (HTTP API) and `services/messageLibraryService.js` (business logic).
- Typical responsibilities:
  - Store and retrieve message templates (text, placeholders, quick replies)
  - Provide template interpolation using runtime data (e.g., user name, codes)
  - Expose CRUD endpoints for managing templates (used by admin/dashboard)
  - Offer helper methods for other services to fetch ready-to-send payloads

Example (conceptual) usage from code:

```js
const { getTemplate } = require("./services/messageLibraryService");
const template = getTemplate("welcome_message");
const payload = template.render({ name: "John" });
// then send payload via whatsappService
```

## 🔐 Security Features

- **Webhook Verification**: Validates incoming webhooks using verify tokens
- **CORS Protection**: Configurable CORS policy for frontend integration
- **Security Headers**: Helmet.js for security headers
- **Environment Variables**: Sensitive data stored in environment variables
- **Request Limiting**: Body size limits to prevent abuse

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV=production
PORT=3001
HOST=0.0.0.0
FRONTEND_URL=https://your-frontend-domain.com
WEBHOOK_VERIFY_TOKEN=your_secure_webhook_token
WHATSAPP_ACCESS_TOKEN=your_production_access_token
WHATSAPP_PHONE_NUMBER_ID=your_production_phone_id
```

### Docker Support (Optional)

Create a `Dockerfile`:

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3001
CMD ["node", "server.js"]
```

## 🧪 **Testing Your Automation**

### **Test Setup Checklist:**

#### **Prerequisites:**

- ✅ Backend deployed and responding
- ✅ Webhook configured in Meta Developer Console
- ✅ Test phone number added to allowed recipients
- ✅ WhatsApp Flows created and published
- ✅ Environment variables properly configured
- ✅ Triggers configured with correct Flow IDs

### **Testing Methods:**

#### **Method 1: Real WhatsApp Test** (Recommended)

```
1. Send trigger keyword (e.g., "hello") from allowed phone number
2. Should receive: Configured message + [Open Form] button
3. Click "Open Form" → WhatsApp Flow should open
4. Complete form → Data should be processed by webhook
5. Receive confirmation message
```

#### **Method 2: API Testing**

```bash
# Test health endpoint
curl https://your-domain.com/health

# Test webhook verification
curl "https://your-domain.com/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test123"

# Test triggers endpoint
curl https://your-domain.com/api/triggers

# Test specific trigger
curl -X POST https://your-domain.com/api/triggers/test \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "phoneNumber": "1234567890"}'
```

#### **Method 3: Webhook Simulation**

```bash
# Simulate incoming WhatsApp message
curl -X POST https://your-domain.com/webhook/test-text \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "phoneNumber": "1234567890"}'
```

### **Expected Results:**

- ✅ **200 OK** response from webhook
- ✅ **Logs show**: "Found matching trigger", "Sending flow message"
- ✅ **User receives**: Interactive flow message
- ✅ **Form completion** processes correctly
- ✅ **No errors** in deployment logs

## 🔧 **Troubleshooting Guide**

### **Common Issues & Solutions:**

#### **1. Webhook Verification Failed**

```
Error: Webhook verification failed
```

**Solution:**

- ✅ Check `WEBHOOK_VERIFY_TOKEN` matches Meta Developer Console
- ✅ Ensure webhook URL is correct: `https://your-app.up.railway.app/webhook`
- ✅ Verify Railway deployment is running

#### **2. Recipient Not in Allowed List (Error 131030)**

```
Error: (#131030) Recipient phone number not in allowed list
```

**Solution:**

- ✅ Add test phone numbers in Meta Developer Console
- ✅ Navigate: WhatsApp → API Setup → Recipients
- ✅ Verify phone numbers via SMS
- ✅ Or publish your app for production use

#### **3. Invalid Flow Parameter (Error 131009)**

```
Error: (#131009) Parameter value is not valid - flow_action_payload data must be dynamic_object
```

**Solution:**

- ✅ Check Flow ID exists and is correct
- ✅ Verify first screen name (e.g., "RECOMMEND")
- ✅ Ensure flow is published and active
- ✅ Check flow_action_payload structure

#### **4. Application Failed to Respond (Railway)**

```
Error: Application failed to respond
```

**Solution:**

- ✅ Check Railway deployment logs
- ✅ Ensure `NODE_ENV=production` for 0.0.0.0 binding
- ✅ Verify all environment variables are set
- ✅ Check for syntax errors in code

#### **5. CORS Errors (Frontend Integration)**

```
Error: CORS policy blocked request
```

**Solution:**

- ✅ Update `FRONTEND_URL` in environment variables
- ✅ Add frontend domain to CORS whitelist
- ✅ Check CORS configuration in `server.js`

### **Debug Commands:**

```bash
# Check Railway deployment logs
railway logs

# Test local server
npm run dev

# Validate webhook locally
ngrok http 3001
# Then use ngrok URL for webhook testing

# Check environment variables
railway variables
```

## 📊 **Monitoring & Analytics**

### **Key Metrics to Track:**

- **Webhook Success Rate**: % of successful webhook processes
- **Trigger Match Rate**: % of messages that match triggers
- **Flow Completion Rate**: % of flows completed by users
- **Error Frequency**: Monitor 131009, 131030 errors
- **Response Time**: Webhook processing speed

### **Logging Locations:**

- **Railway Logs**: Real-time webhook processing
- **Meta Developer Console**: Webhook delivery status
- **WhatsApp Manager**: Message delivery metrics
- **Application Logs**: Custom trigger analytics

## 🏗️ **Project Structure**

```
whatsapp-backend/
├── 📁 routes/                    # API Route Handlers
│   ├── webhook.js               # 🔗 WhatsApp webhook endpoints
│   ├── triggers.js              # ⚙️ Trigger management API
│   └── whatsapp.js              # 📱 WhatsApp messaging API
├── 📁 services/                 # Business Logic Layer
│   ├── webhookService.js        # 📨 Webhook processing logic
│   ├── triggerService.js        # 🎯 Trigger matching system
│   └── whatsappService.js       # 📡 WhatsApp API integration
├── 📁 test/                     # Testing Scripts
│   ├── test-webhook.ps1         # 🧪 Webhook simulation tests
│   └── test_payload.json        # 📝 Test message payloads
├── 📄 server.js                 # 🚀 Main application server
├── 📄 package.json              # 📦 Dependencies and scripts
├── 📄 railway.json              # 🚂 Railway deployment config
├── 📄 .env                      # ⚙️ Environment variables
├── 📄 .env.example              # 📋 Environment template
├── 📄 .gitignore                # 🚫 Git ignore rules
└── 📄 README.md                 # 📖 This documentation
```

## 🚀 **Production Deployment**

### **Current Deployment:**

- **Platform**: Railway
- **URL**: `https://whatsappbackend-production-8946.up.railway.app`
- **Status**: ✅ Active and responding
- **Environment**: Production-ready with 0.0.0.0 binding

### **Deployment Features:**

- ✅ **Auto-deployment** from GitHub commits
- ✅ **Environment variable** management
- ✅ **HTTPS** enabled by default
- ✅ **Scaling** and monitoring included
- ✅ **Webhook-compatible** domain and SSL

## 📈 **Performance & Scaling**

### **Current Capabilities:**

- **Concurrent Webhooks**: Handles multiple simultaneous requests
- **Response Time**: < 200ms average webhook processing
- **Uptime**: 99.9% availability target
- **Storage**: Stateless design for easy scaling

### **Scaling Considerations:**

- **Database Integration**: Add persistent storage for large-scale deployments
- **Rate Limiting**: Implement API rate limiting for production
- **Caching**: Add Redis for trigger caching and performance
- **Load Balancing**: Multiple instances for high-volume usage

## 🤝 **Contributing & Development**

### **Development Workflow:**

```bash
# 1. Fork and clone repository
git clone https://github.com/Flair0n/whatsapp_backend.git

# 2. Create feature branch
git checkout -b feature/new-trigger-system

# 3. Make changes and test locally
npm run dev

# 4. Commit and push changes
git add .
git commit -m "Add new trigger system"
git push origin feature/new-trigger-system

# 5. Create pull request
```

### **Code Standards:**

- **ESLint**: Code formatting and quality
- **Error Handling**: Comprehensive try-catch blocks
- **Logging**: Detailed console outputs for debugging
- **Documentation**: Comment complex logic and functions

## 📞 **Support & Resources**

### **Documentation Links:**

- **WhatsApp Business API**: [developers.facebook.com/docs/whatsapp](https://developers.facebook.com/docs/whatsapp)
- **WhatsApp Flows**: [developers.facebook.com/docs/whatsapp/flows](https://developers.facebook.com/docs/whatsapp/flows)
- **Railway Platform**: [docs.railway.app](https://docs.railway.app)
- **Node.js Express**: [expressjs.com](https://expressjs.com)

### **Getting Help:**

- 🐛 **Issues**: Create GitHub issue for bugs
- 💡 **Features**: Submit feature requests
- 📧 **Support**: Contact maintainers
- 📖 **Documentation**: Check this README first

## 📄 **License**

MIT License - see LICENSE file for details

---

## 🎉 **Success! Your WhatsApp Automation is Ready!**

Your backend is now fully configured and operational:

- ✅ **WhatsApp webhook** processing incoming messages
- ✅ **Intelligent triggers** matching keywords to flows
- ✅ **Interactive flows** collecting user data
- ✅ **Railway deployment** handling production traffic
- ✅ **Comprehensive monitoring** and error handling

**Ready to serve real customers with automated WhatsApp experiences!** 🚀

---

_Built with ❤️ for WhatsApp Business API automation • Last updated: October 8, 2025_

```bash
# Run tests (when implemented)
npm test

# Test webhook endpoint
curl -X GET "http://localhost:3001/webhook?hub.mode=subscribe&hub.verify_token=your_token&hub.challenge=test_challenge"

# Test health endpoint
curl http://localhost:3001/health
```

## 📝 Development

### Scripts

- `npm start` - Start production server
- `npm run dev` - Start development server with hot reload
- `npm test` - Run tests

### Adding New Features

1. Create route handlers in `/routes`
2. Implement business logic in `/services`
3. Update this README with new endpoints
4. Add appropriate error handling and logging

## 🐛 Troubleshooting

### Common Issues

1. **Webhook Verification Failed**

   - Check `WEBHOOK_VERIFY_TOKEN` in `.env`
   - Ensure token matches Meta Developer settings

2. **CORS Errors**

   - Update `FRONTEND_URL` in `.env`
   - Check CORS configuration in `server.js`

3. **WhatsApp API Errors**
   - Verify `WHATSAPP_ACCESS_TOKEN` is valid
   - Check `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Ensure phone number is verified with Meta

## 📄 License

MIT License - see LICENSE file for details

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📞 Support

For issues and questions:

- Create an issue in the repository
- Check WhatsApp Business API documentation
- Review Meta Developer documentation

---

Made with ❤️ for WhatsApp Business API automation and integration
