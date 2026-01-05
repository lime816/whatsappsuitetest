# Conversational Flow Designer - Implementation Plan

## Current State Analysis

### What You Have ✅
- **WhatsApp Flow Builder**: Drag-and-drop for creating WhatsApp Forms (single-screen forms)
- **Backend Automation**: Keyword triggers → WhatsApp Flow sending
- **Data Collection**: Form submissions stored in JSONB
- **Analytics System**: Performance tracking and monitoring

### What's Missing ❌
- **Conversational Flow Designer**: Multi-step message conversations (like Interakt workflows)
- **Message-Based Data Collection**: Collect data through chat messages instead of forms
- **Dynamic Conversation Routing**: Branch conversations based on user responses
- **Visual Conversation Builder**: Drag-and-drop for designing chat conversations

## The Gap: WhatsApp Flows vs Conversational Flows

### WhatsApp Flows (You Have This)
```
User: "contest"
Bot: Sends WhatsApp Flow (form)
User: Fills form → Submits
Bot: "Thank you!"
```

### Conversational Flows (You Need This)
```
User: "contest"
Bot: "What's your name?"
User: "John"
Bot: "Hi John! What's your age group? 1) 18-25 2) 26-35 3) 36-45"
User: "2"
Bot: "Great! What's your email?"
User: "john@email.com"
Bot: "Perfect! You're registered for the lucky draw!"
```

## Implementation Plan

### Phase 1: Conversational Flow Data Structure (Week 1)

**New Database Models:**
```sql
-- Conversational Flow Definition
CREATE TABLE conversation_flows (
  id UUID PRIMARY KEY,
  flow_id VARCHAR(50) UNIQUE,
  name VARCHAR(100),
  description TEXT,
  flow_data JSONB, -- Stores the conversation structure
  status VARCHAR(20) DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Conversation Sessions (extend existing Session model)
ALTER TABLE sessions ADD COLUMN conversation_flow_id VARCHAR(50);
ALTER TABLE sessions ADD COLUMN current_step INTEGER DEFAULT 0;
ALTER TABLE sessions ADD COLUMN conversation_variables JSONB DEFAULT '{}';
```

**Conversation Flow JSON Structure:**
```json
{
  "flowId": "lucky_draw_conversation",
  "name": "Lucky Draw Registration",
  "steps": [
    {
      "id": "welcome",
      "type": "message",
      "content": "Welcome to Lucky Draw 2024! What's your name?",
      "nextStep": "collect_name",
      "collectVariable": "participant_name"
    },
    {
      "id": "collect_name", 
      "type": "collect_text",
      "validation": {"required": true, "minLength": 2},
      "nextStep": "ask_age",
      "variable": "participant_name"
    },
    {
      "id": "ask_age",
      "type": "message_with_buttons",
      "content": "Hi {{participant_name}}! Choose your age group:",
      "buttons": [
        {"id": "18-25", "text": "18-25", "nextStep": "ask_email"},
        {"id": "26-35", "text": "26-35", "nextStep": "ask_email"},
        {"id": "36-45", "text": "36-45", "nextStep": "ask_email"}
      ],
      "variable": "age_group"
    }
  ]
}
```

### Phase 2: Conversation Engine (Week 2)

**Extend Webhook Service:**
```javascript
// Add to webhookService.js
async function handleConversationalFlow(message, contact) {
  const session = await getActiveConversationSession(contact.id);
  
  if (!session) {
    // No active conversation, check for flow triggers
    return handleRegularTriggers(message, contact);
  }
  
  // Continue existing conversation
  const flow = await getConversationFlow(session.conversation_flow_id);
  const currentStep = flow.steps[session.current_step];
  
  // Process user response based on step type
  const result = await processConversationStep(currentStep, message.text, session);
  
  if (result.completed) {
    // Save collected data and end conversation
    await saveConversationData(session);
    await endConversationSession(session.id);
  } else {
    // Move to next step
    await updateConversationSession(session.id, {
      current_step: result.nextStepIndex,
      conversation_variables: result.variables
    });
    
    // Send next message
    await sendConversationMessage(contact.phoneNumber, result.nextMessage);
  }
}
```

### Phase 3: Visual Conversation Designer (Week 3-4)

**New Frontend Components:**
- `ConversationCanvas.tsx` - Drag-and-drop conversation builder
- `ConversationNodePalette.tsx` - Available conversation elements
- `ConversationNodeEditor.tsx` - Edit node properties
- `ConversationPreview.tsx` - Preview conversation flow

**Conversation Node Types:**
1. **Message Node** - Send text to user
2. **Collect Text Node** - Wait for user text input
3. **Button Message Node** - Send message with buttons
4. **List Message Node** - Send message with list selection
5. **Condition Node** - Branch based on collected data
6. **API Call Node** - Call external service
7. **End Node** - Complete conversation and save data

### Phase 4: Integration & Testing (Week 5)

**Integration Points:**
- Connect conversation designer to existing trigger system
- Integrate with existing analytics and monitoring
- Add conversation metrics to existing dashboard
- Test with existing webhook infrastructure

## Technical Architecture

### Frontend Structure
```
src/
├── components/
│   ├── ConversationDesigner/
│   │   ├── ConversationCanvas.tsx
│   │   ├── NodePalette.tsx
│   │   ├── NodeEditor.tsx
│   │   └── ConversationPreview.tsx
│   └── FlowBuilder/ (existing)
├── services/
│   ├── conversationService.ts (new)
│   └── whatsappService.ts (existing)
└── types/
    └── conversationTypes.ts (new)
```

### Backend Structure
```
services/
├── conversationFlowService.js (new)
├── conversationEngine.js (new)
├── webhookService.js (extend existing)
└── triggerService.js (extend existing)
```

## Upgrade Strategy

### Database Migration Plan
1. **Backup existing data**
2. **Add new tables** for conversation flows
3. **Extend existing tables** (sessions, triggers)
4. **Migrate existing triggers** to support both flow types
5. **Test data integrity**

### Code Migration Plan
1. **Create new conversation modules** alongside existing code
2. **Extend webhook handler** to support both flow types
3. **Add conversation designer** as new frontend section
4. **Maintain backward compatibility** with existing flows
5. **Gradual feature rollout**

### Deployment Strategy
1. **Deploy backend changes** first (non-breaking)
2. **Test conversation engine** with existing infrastructure
3. **Deploy frontend designer** as beta feature
4. **Enable conversation flows** for testing
5. **Full production rollout**

This plan gives you the missing piece - conversational message-based flows - while keeping all your existing WhatsApp Flow capabilities intact. You'll have both single-screen forms AND multi-step conversations in one platform.