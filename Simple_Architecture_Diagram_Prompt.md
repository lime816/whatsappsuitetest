# WhatsApp Automation System - Architecture Diagram Prompt

Create a clean system architecture diagram showing the following layers:

## Frontend Layer
**React/TypeScript Application**
- Visual Flow Builder (drag & drop interface)
- Real-time WhatsApp Preview
- Analytics Dashboard
- Property Editor & Canvas Management
- Template Library & Version Control

## Middleware Layer
**API Gateway & Services**
- CORS Configuration
- Rate Limiting Middleware
- Authentication & Authorization
- Input Validation & Sanitization
- Error Handling Middleware
- Request/Response Logging

## Backend Layer
**Node.js/Express Services**
- Flow Builder Service (JSON generation)
- Webhook Service (message processing)
- Trigger Service (keyword automation)
- Message Queue Service (reliable delivery)
- Analytics Service (metrics & monitoring)
- File Upload Service (media handling)

## Database Layer
**PostgreSQL + Redis**
- PostgreSQL (primary data storage)
  - Flows, Triggers, Contacts
  - Form Submissions, Message Logs
  - Analytics, System Config
- Redis Cache
  - Session Management
  - Rate Limiting Counters
  - Performance Optimization

## External Integrations
**WhatsApp Business API**
- Flow Creation & Management
- Message Sending & Receiving
- Webhook Endpoints
- Media Upload/Download

Show clear data flow arrows between layers, include security boundaries, and highlight the middleware components that handle cross-cutting concerns like authentication, rate limiting, and error handling.