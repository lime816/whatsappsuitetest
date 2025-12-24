# WhatsApp Flow Builder

🎨 **Complete WhatsApp Business automation platform** with visual flow builder, webhook integration, and automated message triggers.

## ✨ Features

### 🎯 **Visual Flow Builder**

- **Drag & Drop Interface** - Intuitive component arrangement with smooth animations
- **Mobile-First Design** - Fully responsive, works on phones, tablets, and desktops
- **Real-time Preview** - See your flow as you build it with WhatsApp-style preview
- **Inline Editing** - Click any component to edit properties in a modal
- **JSON Export** - Download WhatsApp Flow API v7.2 compatible JSON

### 🚀 **Webhook Automation System**

- **Automated Triggers** - Set keywords that automatically send flows to users
- **Backend Integration** - Complete Node.js server with WhatsApp Business API
- **Real-time Testing** - Test your webhooks without using real WhatsApp
- **Flow Management** - Create, publish, and manage flows directly from the interface
- **QR Code Generation** - Generate QR codes that trigger specific flows

### 🔧 **Advanced Features**

- **Flow Deployment** - Deploy flows directly to WhatsApp Business API
- **Trigger Management** - Add/remove keyword triggers with custom messages
- **Backend Health Monitoring** - Real-time server status and connection monitoring
- **Debug Tools** - Comprehensive testing and debugging interface
- **Production Ready** - Complete setup instructions for deployment

## 🚀 Quick Start

### Frontend Setup

```bash
# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your WhatsApp Business API credentials

# Start dev server
npm run dev
```

### Backend Setup

```bash
# Navigate to backend directory
cd backend

# Install backend dependencies
npm install

# Configure backend environment
cp .env.example .env
# Edit backend/.env with your WhatsApp credentials

# Start backend server
npm start
```

### 🔧 Environment Configuration

Create `.env` files with your WhatsApp Business API credentials:

**Frontend (.env):**

```env
VITE_WHATSAPP_ACCESS_TOKEN=your_access_token
VITE_WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
VITE_WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
VITE_BACKEND_URL=http://localhost:3001
```

**Backend (backend/.env):**

```env
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WHATSAPP_APP_SECRET=your_app_secret
FRONTEND_URL=http://localhost:5174
PORT=3001
```

## 🛠️ Tech Stack

### Frontend

- **React 18** + **TypeScript** + **Vite**
- **Tailwind CSS** - Utility-first styling
- **Framer Motion** - Smooth animations
- **dnd-kit** - Drag and drop functionality
- **Zustand** - State management
- **Lucide React** - Beautiful icons

### Backend

- **Node.js** + **Express** - Server framework
- **WhatsApp Business API** - Official Meta API integration
- **CORS** + **Helmet** - Security middleware
- **Morgan** - HTTP request logging
- **Webhook Processing** - Real-time message handling

## 📦 Available Components

### Flow Building Components

- **Text Heading** - Display text subheadings and labels
- **Radio Buttons** - Single choice selection with multiple options
- **Text Area** - Multi-line text input fields
- **Dropdown** - Select from a dropdown list
- **Footer Button** - Navigation or completion actions

### Automation Features

- **Webhook Triggers** - Keyword-based flow activation
- **QR Code Generator** - Generate scannable codes for flows
- **Flow Testing** - Simulate webhook messages
- **Backend Integration** - Real-time server communication

## 🎯 How to Use

### Building Flows

1. **Create a Flow** - Start with the visual builder
2. **Add Components** - Drag components from the palette
3. **Configure Properties** - Click components to edit their settings
4. **Arrange Layout** - Drag to reorder components
5. **Preview & Test** - Use the WhatsApp-style preview
6. **Deploy Flow** - Publish directly to WhatsApp Business API

### Setting Up Webhooks

1. **Open Webhook Setup** - Click the "Webhooks" button in toolbar
2. **Configure Backend** - Ensure backend server is running
3. **Add Triggers** - Create keyword-based triggers (e.g., "hello" → flow)
4. **Test Integration** - Use the test webhook feature
5. **Deploy to Production** - Follow setup instructions for deployment

### Webhook Automation Flow

```
User sends "hello" via WhatsApp
        ↓
WhatsApp sends webhook to your server
        ↓
Backend matches "hello" to configured trigger
        ↓
System sends your flow to the user
        ↓
User completes the interactive form
```

## 📁 Project Structure

```
whatsapp-flow-builder/
├── src/                        # Frontend React application
│   ├── components/
│   │   ├── Canvas.tsx          # Main drag & drop canvas
│   │   ├── Palette.tsx         # Component palette
│   │   ├── WebhookSetup.tsx    # Webhook configuration UI
│   │   ├── WhatsAppPreview.tsx # Mobile preview panel
│   │   ├── QRCodeGenerator.tsx # QR code generation
│   │   ├── QRFlowInitiator.tsx # QR flow automation
│   │   ├── JsonPreviewPanel.tsx# JSON preview sidebar
│   │   ├── PropertyEditor.tsx  # Inline property editor
│   │   ├── PropertyEditorModal.tsx # Modal property editor
│   │   ├── ScreenSettings.tsx  # Screen configuration
│   │   ├── SortableItem.tsx    # Draggable wrapper components
│   │   ├── ConfirmDialog.tsx   # Delete confirmation dialogs
│   │   ├── Toast.tsx           # Notification components
│   │   ├── ToastContainer.tsx  # Toast management
│   │   ├── CreateFlowButton.tsx# Flow creation interface
│   │   └── SimpleFlowCreator.tsx# Simplified flow creation
│   ├── screens/
│   │   └── ScreenDesigner.tsx  # Main application layout
│   ├── pages/                  # Additional page components
│   ├── state/
│   │   └── store.ts            # Zustand state management
│   ├── utils/
│   │   ├── jsonBuilder.ts      # WhatsApp Flow JSON generator
│   │   ├── whatsappService.ts  # WhatsApp API integration
│   │   ├── whatsappSender.ts   # Flow sending utilities
│   │   ├── backendApiService.ts# Backend API communication
│   │   └── fileWriter.ts       # File download utilities
│   ├── types.ts                # TypeScript type definitions
│   ├── styles.css              # Global styles and Tailwind
│   ├── declarations.d.ts       # Type declarations
│   ├── env.d.ts                # Environment type definitions
│   └── index.tsx               # React app entry point
├── backend/                    # Node.js webhook server
│   ├── routes/
│   │   ├── webhook.js          # WhatsApp webhook endpoints
│   │   ├── triggers.js         # Trigger management API
│   │   └── whatsapp.js         # WhatsApp Business API routes
│   ├── services/
│   │   ├── webhookService.js   # Webhook processing logic
│   │   ├── triggerService.js   # Trigger management service
│   │   └── whatsappService.js  # WhatsApp Business API client
│   ├── server.js               # Express server setup
│   ├── package.json            # Backend dependencies
│   └── .env                    # Backend environment variables
├── public/
│   └── sample-flow.json        # Example flow output
├── dist/                       # Built frontend files (generated)
├── node_modules/               # Frontend dependencies (generated)
├── .env                        # Frontend environment variables
├── package.json                # Frontend dependencies and scripts
├── package-lock.json           # Dependency lock file
├── vite.config.ts              # Vite configuration
├── tsconfig.json               # TypeScript configuration
├── tsconfig.node.json          # Node TypeScript config
├── tailwind.config.js          # Tailwind CSS configuration
├── postcss.config.js           # PostCSS configuration
├── index.html                  # Main HTML template
├── .gitignore                  # Git ignore rules
└── README.md                   # Project documentation
```

## 🌐 API Endpoints

### Backend API Routes

- `GET /health` - Server health check
- `GET /webhook` - WhatsApp webhook verification
- `POST /webhook` - Receive WhatsApp messages
- `GET /api/triggers` - List all triggers
- `POST /api/triggers` - Create new trigger
- `DELETE /api/triggers/:id` - Delete trigger
- `POST /api/triggers/test` - Test trigger functionality

## 🚀 Deployment

### Backend Deployment (Heroku Example)

```bash
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set WHATSAPP_ACCESS_TOKEN=your_token
heroku config:set WHATSAPP_PHONE_NUMBER_ID=your_phone_id

# Deploy
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Vercel/Netlify)

```bash
# Build for production
npm run build

# Deploy to Vercel
vercel --prod

# Or deploy to Netlify
netlify deploy --prod --dir=dist
```

### WhatsApp Business API Setup

1. **Create Meta Business Account** - Register at business.facebook.com
2. **Set up WhatsApp Business** - Add WhatsApp product to your app
3. **Get Access Token** - Generate permanent access token
4. **Configure Webhook** - Point to your deployed backend URL
5. **Subscribe to Events** - Enable 'messages' webhook field

## 🔧 Configuration

### Webhook URL Configuration

Set your webhook URL in WhatsApp Business Manager:

```
https://your-backend-domain.com/webhook
```

### Required WhatsApp Permissions

- `whatsapp_business_messaging`
- `whatsapp_business_management`

## 📄 Sample Outputs

### Generated Flow JSON

The builder generates JSON compatible with WhatsApp Flow API v7.2:

```json
{
  "version": "7.2",
  "screens": [
    {
      "id": "WELCOME",
      "title": "Registration Form",
      "layout": {
        "type": "SingleColumnLayout",
        "children": [...]
      }
    }
  ]
}
```

### Webhook Trigger Example

```javascript
// User sends: "hello"
// System responds with flow message:
{
  "messaging_product": "whatsapp",
  "to": "918281348343",
  "type": "interactive",
  "interactive": {
    "type": "flow",
    "header": { "type": "text", "text": "Welcome!" },
    "body": { "text": "Please complete this form:" },
    "action": {
      "name": "flow",
      "parameters": {
        "flow_message_version": "3",
        "flow_token": "unique-token",
        "flow_id": "your-flow-id",
        "flow_cta": "Start Form",
        "flow_action": "navigate"
      }
    }
  }
}
```

## 🎨 Customization

### Styling

- Built with **Tailwind CSS** and custom WhatsApp theme
- Modify `tailwind.config.js` for color customization
- Custom animations with **Framer Motion**

### Adding New Components

1. Create component in `src/components/`
2. Add to component palette in `Palette.tsx`
3. Update JSON builder in `utils/jsonBuilder.ts`

## 🐛 Troubleshooting

### Common Issues

**Backend not connecting:**

- Check if server is running on port 3001
- Verify CORS configuration for your frontend URL
- Ensure environment variables are properly set

**Webhook not receiving messages:**

- Verify webhook URL is publicly accessible
- Check WhatsApp Business Manager webhook configuration
- Ensure webhook verification token matches

**Flow not sending:**

- Verify WhatsApp access token has proper permissions
- Check phone number ID is correct
- Ensure flow is published (not in DRAFT status)

## 📝 License

MIT License - Feel free to use this project for commercial and personal purposes.

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines and submit pull requests for any improvements.

## 📚 Architecture & Flow Documentation

### 🏗️ System Architecture

The WhatsApp Flow Builder is built with a modern, modular architecture that separates concerns into distinct layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (React + Vite)                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   UI Layer   │  │  State Layer │  │  Service     │     │
│  │ (Components) │←→│   (Zustand)  │←→│  Layer       │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│                Backend (Node.js + Express)                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  Webhook     │  │   Trigger    │  │  WhatsApp    │     │
│  │  Handler     │←→│   Service    │←→│   API        │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
                            ↕ Webhook Events
┌─────────────────────────────────────────────────────────────┐
│              WhatsApp Business Platform (Meta)              │
│         Manages flows, sends messages, receives events      │
└─────────────────────────────────────────────────────────────┘
```

### 🔄 Data Flow Overview

#### **1. Flow Creation Flow**

```
User Action → State Update → UI Re-render → JSON Generation
     ↓             ↓              ↓               ↓
  (Canvas)    (useFlowStore)  (React)      (jsonBuilder)
```

**Step-by-Step:**

1. **User Interaction**: User drags component from palette
2. **State Management**: Zustand store updates `screens` array
3. **UI Update**: React re-renders canvas with new component
4. **JSON Generation**: `jsonBuilder.ts` converts state to WhatsApp Flow JSON
5. **API Deployment**: Flow JSON sent to WhatsApp Business API

#### **2. Webhook Automation Flow**

```
WhatsApp Message → Backend Webhook → Trigger Matching → Flow Response
       ↓                  ↓                 ↓                  ↓
  (User sends)      (Express route)   (triggerService)   (WhatsApp API)
```

**Step-by-Step:**

1. **Message Received**: User sends message (e.g., "hello") on WhatsApp
2. **Webhook Event**: WhatsApp sends POST to `/webhook` endpoint
3. **Message Processing**: Backend extracts message text and sender info
4. **Trigger Matching**: System checks if message matches any keyword triggers
5. **Flow Retrieval**: Fetches associated flow ID from trigger database
6. **Message Construction**: Builds interactive flow message JSON
7. **API Call**: Sends flow message via WhatsApp Business API
8. **User Response**: User receives and completes interactive form

#### **3. Component Editing Flow**

```
Click Component → Open Editor → Update Properties → Save → Re-render
       ↓              ↓              ↓              ↓         ↓
   (Canvas)     (PropertyEditor)  (Local State)  (Store)  (Preview)
```

### 🧩 Core Components Explained

#### **State Management (store.ts)**

The application uses Zustand for centralized state management:

```typescript
FlowState {
  screens: Screen[]           // All screens in the flow
  selectedScreenId: string    // Currently active screen
  addScreen()                 // Create new screen
  removeScreen()              // Delete screen
  updateScreen()              // Modify screen properties
  addElement()                // Add component to screen
  updateElement()             // Modify component properties
  removeElement()             // Delete component
  moveElement()               // Reorder components via drag & drop
}
```

**Key Operations:**

- **Add Element**: Generates unique ID with `nanoid`, pushes to screen's elements array
- **Update Element**: Finds element by ID, merges updates, triggers re-render
- **Move Element**: Uses array splice to reorder elements for drag & drop

#### **JSON Builder (jsonBuilder.ts)**

Transforms internal state structure into WhatsApp Flow API v7.2 format:

**Input (Internal State):**

```typescript
{
  id: 'SCREEN_1',
  title: 'Welcome',
  elements: [
    { type: 'TextHeading', text: 'Hello!' },
    { type: 'TextInput', name: 'email', label: 'Email' },
    { type: 'Footer', action: 'complete' }
  ]
}
```

**Output (WhatsApp Flow JSON):**

```json
{
  "version": "7.2",
  "screens": [
    {
      "id": "SCREEN_1",
      "title": "Welcome",
      "terminal": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          { "type": "TextHeading", "text": "Hello!" },
          {
            "type": "Form",
            "name": "flow_path",
            "children": [
              { "type": "TextInput", "name": "email", "label": "Email" }
            ]
          },
          { "type": "Footer", "label": "Submit" }
        ]
      }
    }
  ]
}
```

**Key Transformations:**

1. **Form Wrapping**: Input components wrapped in `Form` element
2. **Terminal Detection**: Screens with `action: 'complete'` marked as terminal
3. **Routing Model**: Navigation between screens mapped to routing graph
4. **Property Mapping**: Internal property names converted to API field names

#### **Canvas Component (Canvas.tsx)**

The main workspace where users build flows:

**Features:**

- **Drag & Drop**: Uses `@dnd-kit` for smooth reordering
- **Component Preview**: Shows visual representation of each element
- **Inline Editing**: Click-to-edit with property modal
- **Real-time Validation**: Highlights required fields and errors

**Rendering Logic:**

```typescript
// For each element in screen:
1. Wrap in SortableItem (enables drag & drop)
2. Render Preview component (visual representation)
3. Attach PropertyEditor (inline editing panel)
4. Add delete button with confirmation dialog
```

#### **Property Editor (PropertyEditorInline.tsx)**

Dynamic form that adapts to selected component type:

```typescript
// Example: TextInput properties
{
  label: string; // Display label
  name: string; // Form field name
  required: boolean; // Validation flag
  inputType: "text" | "email" | "phone" | "number";
  helperText: string; // Optional help text
  minChars: number; // Min length
  maxChars: number; // Max length
}
```

**Dynamic Fields**: Editor automatically shows/hides fields based on component type

#### **WhatsApp Service (whatsappService.ts)**

Handles all WhatsApp Business API interactions:

```typescript
class WhatsAppService {
  // Create new flow on WhatsApp
  async createFlow(name, categories) → flowId

  // Update existing flow JSON
  async updateFlow(flowId, json) → success

  // Publish draft flow
  async publishFlow(flowId) → success

  // Send flow message to user
  async sendFlowMessage(to, flowId, message) → messageId

  // Get flow details
  async getFlow(flowId) → flowData
}
```

#### **Backend API Service (backendApiService.ts)**

Frontend communication with backend webhook server:

```typescript
class BackendApiService {
  // Trigger Management
  async getAllTriggers() → Trigger[]
  async createTrigger(keyword, flowId, message) → Trigger
  async updateTrigger(id, updates) → Trigger
  async deleteTrigger(id) → success

  // Health Checks
  async checkHealth() → status

  // Testing
  async testTrigger(keyword) → response
}
```

### 🔐 Authentication & Security

#### **Environment Variables**

**Frontend Security:**

- Access tokens stored in `.env` (not committed to git)
- Vite prefixes with `VITE_` for build-time injection
- Never exposed in client-side code

**Backend Security:**

- Webhook verification with app secret
- CORS configured for specific origins
- Helmet.js for HTTP header security
- Rate limiting on webhook endpoints

#### **WhatsApp Webhook Verification**

```typescript
// GET /webhook - Meta's verification challenge
1. Meta sends GET request with hub.challenge
2. Backend validates hub.verify_token
3. If valid, echo back hub.challenge
4. If invalid, return 403 Forbidden
```

### 🎯 Component Lifecycle

#### **Adding a New Component**

```
1. User clicks component in Palette
   ↓
2. Palette calls addElement(screenId, type)
   ↓
3. Store generates new element with defaults
   {
     id: nanoid(6),
     type: 'TextInput',
     label: 'New Input',
     name: 'new_input',
     required: false
   }
   ↓
4. Element pushed to screen.elements array
   ↓
5. React re-renders Canvas
   ↓
6. SortableItem wraps element
   ↓
7. Preview component renders based on type
   ↓
8. PropertyEditor becomes available
```

#### **Editing a Component**

```
1. User clicks component in Canvas
   ↓
2. PropertyEditorInline opens with current values
   ↓
3. User modifies field (e.g., label: "Email Address")
   ↓
4. onChange handler calls updateElement()
   ↓
5. Store merges updates: {...oldElement, ...updates}
   ↓
6. React re-renders with new values
   ↓
7. JSON preview updates automatically
```

#### **Deleting a Component**

```
1. User clicks delete icon
   ↓
2. ConfirmDialog shows warning
   ↓
3. User confirms deletion
   ↓
4. removeElement(screenId, elementId)
   ↓
5. Store filters out element from array
   ↓
6. Canvas re-renders without element
```

### 🔄 Webhook Processing Pipeline

#### **Backend Webhook Handler**

```javascript
// POST /webhook endpoint
1. Receive webhook from WhatsApp
   {
     entry: [{
       changes: [{
         value: {
           messages: [{
             from: "918281348343",
             text: { body: "hello" }
           }]
         }
       }]
     }]
   }
   ↓
2. Extract message data
   const message = entry[0].changes[0].value.messages[0]
   const text = message.text.body.toLowerCase()
   const from = message.from
   ↓
3. Load all triggers from database
   triggers = await triggerService.getAllTriggers()
   ↓
4. Find matching trigger
   match = triggers.find(t => t.keyword === text && t.isActive)
   ↓
5. If match found:
   - Get flow ID from trigger
   - Get custom message (or use default)
   - Call WhatsApp API to send flow
   ↓
6. Send response back to user
   await whatsappService.sendFlowMessage(from, flowId, message)
   ↓
7. Return 200 OK to WhatsApp (acknowledge receipt)
```

#### **Trigger Storage Format**

```typescript
interface FlowTrigger {
  id: string; // Unique identifier
  keyword: string; // Trigger word (e.g., "hello")
  flowId: string; // WhatsApp flow ID to send
  message?: string; // Custom message text
  isActive: boolean; // Enable/disable trigger
  createdAt: string; // Timestamp
  updatedAt: string; // Last modified
}
```

### 🎨 UI/UX Design Patterns

#### **Glass Morphism Theme**

```css
.glass-panel {
  background: rgba(30, 41, 59, 0.8);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
}
```

#### **WhatsApp Theme Colors**

```javascript
colors: {
  whatsapp: {
    50: '#E6F7F0',
    100: '#B3E8D1',
    500: '#25D366',  // Primary WhatsApp green
    600: '#1EBA54',
    700: '#17A044'
  }
}
```

#### **Animation Patterns**

- **Stagger Animations**: Components fade in sequentially
- **Drag Feedback**: Scale and shadow changes during drag
- **Page Transitions**: Smooth opacity and slide effects
- **Toast Notifications**: Slide in from top-right, auto-dismiss

### 🧪 Testing Workflows

#### **Manual Testing Flow**

```
1. Build Flow in UI
   ↓
2. Click "Create Flow on WhatsApp"
   → Sends JSON to WhatsApp API
   → Returns flow ID
   ↓
3. Go to Webhook Setup
   ↓
4. Add Trigger (e.g., keyword: "test")
   → Associates keyword with flow ID
   ↓
5. Use "Test Webhook" button
   → Simulates incoming message
   → Triggers flow without real WhatsApp
   ↓
6. Verify flow appears in test output
```

#### **QR Code Flow Testing**

```
1. Generate QR Code with flow ID
   ↓
2. QR contains WhatsApp deep link:
   https://wa.me/15550617327?text=flow_abc123
   ↓
3. User scans QR code
   ↓
4. Opens WhatsApp with pre-filled message
   ↓
5. User sends message
   ↓
6. Webhook triggers
   ↓
7. Flow sent automatically
```

### 📊 State Management Deep Dive

#### **Store Structure**

```typescript
// Global state tree
{
  screens: [
    {
      id: 'SCREEN_1',
      title: 'Welcome',
      terminal: false,
      elements: [
        { id: 'abc123', type: 'TextHeading', text: 'Welcome!' },
        { id: 'def456', type: 'TextInput', label: 'Name', name: 'name' }
      ]
    },
    {
      id: 'SCREEN_2',
      title: 'Feedback',
      terminal: true,
      elements: [...]
    }
  ],
  selectedScreenId: 'SCREEN_1'
}
```

#### **State Update Patterns**

**Immutable Updates:**

```typescript
// Add element - creates new array
addElement: (screenId, type) => {
  set((state) => ({
    screens: state.screens.map((screen) =>
      screen.id === screenId
        ? { ...screen, elements: [...screen.elements, newElement] }
        : screen
    ),
  }));
};

// Update element - creates new objects
updateElement: (screenId, updatedElement) => {
  set((state) => ({
    screens: state.screens.map((screen) =>
      screen.id === screenId
        ? {
            ...screen,
            elements: screen.elements.map((el) =>
              el.id === updatedElement.id ? { ...el, ...updatedElement } : el
            ),
          }
        : screen
    ),
  }));
};
```

### 🚀 Performance Optimizations

#### **React Optimizations**

- **Component Memoization**: `React.memo()` on expensive components
- **Callback Optimization**: `useCallback()` for event handlers
- **Conditional Rendering**: Only render visible panels
- **Virtual Scrolling**: For long component lists (planned)

#### **API Optimizations**

- **Debounced Updates**: Auto-save with 500ms debounce
- **Request Caching**: Cache flow data to reduce API calls
- **Batch Operations**: Group multiple updates into single request

#### **Build Optimizations**

- **Code Splitting**: Lazy load preview panels
- **Tree Shaking**: Remove unused Tailwind classes
- **Asset Optimization**: Compress images and icons
- **Bundle Analysis**: Monitor and optimize chunk sizes

### 🔧 Extension Points

#### **Adding Custom Components**

1. **Define Type**: Add to `ElementType` in `types.ts`
2. **Create Interface**: Define component properties
3. **Add to Palette**: Include in `Palette.tsx`
4. **Implement Preview**: Add rendering in `Canvas.tsx`
5. **Update Editor**: Add fields in `PropertyEditor.tsx`
6. **Map to JSON**: Add transformation in `jsonBuilder.ts`

#### **Custom Webhook Actions**

```javascript
// In backend/services/webhookService.js
async processMessage(message) {
  // Add custom logic here
  if (message.text.body === 'special_command') {
    // Custom handling
    await this.sendCustomResponse(message.from)
  }

  // Continue with normal trigger matching
  return this.matchTrigger(message)
}
```

### 📈 Scalability Considerations

#### **Frontend Scalability**

- **State Persistence**: LocalStorage for draft flows
- **Multi-flow Management**: Switch between multiple flows
- **Undo/Redo**: Command pattern for history (planned)
- **Real-time Collaboration**: WebSocket sync (planned)

#### **Backend Scalability**

- **Database**: Replace in-memory storage with PostgreSQL/MongoDB
- **Queue System**: Add Redis/Bull for webhook processing
- **Load Balancing**: Multiple backend instances
- **Caching Layer**: Redis for trigger lookups
- **Rate Limiting**: Prevent API abuse

### 🐛 Debugging Guide

#### **Frontend Debugging**

```typescript
// Enable detailed logging
localStorage.setItem("debug", "whatsapp:*");

// Inspect state
useFlowStore.getState().screens;

// Check JSON output
console.log(buildFlowJson(screens));
```

#### **Backend Debugging**

```javascript
// Enable debug mode
DEBUG=* npm start

// Log webhook payloads
console.log('Webhook received:', JSON.stringify(req.body, null, 2))

// Test trigger matching
curl -X POST http://localhost:3001/api/triggers/test \
  -H "Content-Type: application/json" \
  -d '{"keyword": "hello"}'
```

#### **Common Issues & Solutions**

**Issue**: Flow not showing in WhatsApp

- **Check**: Flow must be published (not DRAFT)
- **Solution**: Call `publishFlow(flowId)` after creation

**Issue**: Webhook not receiving messages

- **Check**: Webhook URL must be HTTPS in production
- **Solution**: Use ngrok for local testing or deploy to Railway

**Issue**: Components not updating

- **Check**: State immutability violations
- **Solution**: Always create new objects/arrays, never mutate

**Issue**: JSON export fails

- **Check**: Screen elements might have invalid data
- **Solution**: Validate all required fields before export

### 📝 Best Practices

#### **Code Organization**

- Keep components small and focused (Single Responsibility)
- Use TypeScript for type safety
- Extract reusable logic into custom hooks
- Organize by feature, not by type

#### **State Management**

- Keep state as flat as possible
- Derive computed values, don't store them
- Use selectors for complex queries
- Update state immutably

#### **API Integration**

- Handle errors gracefully with user-friendly messages
- Show loading states during async operations
- Implement retry logic for failed requests
- Cache responses to reduce API calls

#### **Testing Strategy**

- Unit test pure functions (jsonBuilder, validators)
- Integration test API services
- E2E test critical user flows
- Manual test with real WhatsApp before production

## � Support

For issues and questions:

- Open GitHub Issues for bug reports
- Check documentation above for architecture details
- Review WhatsApp Business API documentation at developers.facebook.com
