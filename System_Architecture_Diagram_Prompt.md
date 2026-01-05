# System Architecture Diagram Prompt

Create a comprehensive system architecture diagram for a WhatsApp Automation Platform with the following specifications:

## System Overview
Design a modern, scalable WhatsApp automation system that enables businesses to create interactive forms, automate conversations, and collect customer data through WhatsApp Business API.

## Core Components to Include

### **Frontend Layer**
- **Visual Flow Builder**: React-based drag & drop interface with canvas management
- **Real-Time Preview**: Live WhatsApp UI simulation
- **Property Editor**: Inline component configuration with validation
- **Analytics Dashboard**: Usage metrics, performance monitoring, and reporting
- **Template Library**: Pre-built flow templates and cloning system
- **Multi-Screen Navigation**: Canvas with screen management and routing

### **Backend Services Layer**
- **Flow Builder Service**: JSON generation and WhatsApp Flow API integration
- **Webhook Service**: Incoming message processing and event handling
- **Trigger Service**: Keyword matching and automated response logic
- **Message Queue Service**: Reliable message delivery with retry mechanisms
- **Analytics Service**: Data aggregation, metrics calculation, and reporting
- **Authentication Service**: User management and access control

### **Data Layer**
- **PostgreSQL Database**: Primary data storage with Prisma ORM
- **JSONB Storage**: Flexible schema for form responses and flow data
- **Redis Cache**: Session management, rate limiting, and performance optimization
- **File Storage**: Document and image uploads from WhatsApp users

### **External Integrations**
- **WhatsApp Business API**: Flow creation, message sending, and webhook endpoints
- **Cloud Infrastructure**: Railway deployment with auto-scaling capabilities
- **Monitoring Services**: System health, error tracking, and performance metrics

## Key Features to Highlight

### **Builder & Design Capabilities**
- Drag & drop interface with 20+ form components
- Real-time WhatsApp UI preview
- Auto-save with crash recovery
- Version control and rollback functionality
- Mobile-first responsive design

### **Automation & Messaging**
- Keyword-based trigger system
- Multi-screen conversation flows
- 24/7 automated responses
- Rate limiting and abuse prevention
- Message queuing for reliability

### **Data Management**
- Dynamic form validation
- Structured data collection
- File upload handling
- Export capabilities (CSV, Excel)
- Contact and session management

### **Analytics & Monitoring**
- Real-time system health monitoring
- Usage analytics and completion rates
- Performance metrics and optimization
- Audit logging and debugging tools

### **Security & Compliance**
- Input validation and sanitization
- Data encryption in transit and at rest
- Role-based access control
- GDPR compliance features
- Rate limiting and DDoS protection

## Architecture Requirements

### **Scalability**
- Horizontal scaling for high-volume messaging
- Load balancing across multiple instances
- Database connection pooling
- Caching strategies for performance

### **Reliability**
- Fault-tolerant message processing
- Automatic retry mechanisms
- Data backup and recovery procedures
- Health checks and monitoring

### **Performance**
- Sub-second response times
- Efficient database queries with indexing
- CDN integration for static assets
- Lazy loading and code splitting

### **Security**
- API authentication and authorization
- Secure webhook endpoints
- Environment-based configuration
- Encrypted data transmission

## Visual Design Guidelines

### **Layout Structure**
- Use a layered architecture approach (Frontend → API Gateway → Services → Data)
- Show clear data flow between components with directional arrows
- Group related services within bounded contexts
- Highlight external integrations and third-party services

### **Component Representation**
- Use distinct colors for different layers (Frontend: Blue, Backend: Green, Data: Orange)
- Include icons for major services (database, cache, queue, API)
- Show load balancers, CDN, and scaling indicators
- Represent security boundaries and access controls

### **Data Flow Visualization**
- User interactions from WhatsApp to system
- Webhook processing and message routing
- Form submission and data storage flows
- Analytics data collection and reporting
- Real-time updates and notifications

### **Technology Stack Indicators**
- React/TypeScript for frontend
- Node.js/Express for backend services
- PostgreSQL with Prisma ORM
- Redis for caching and sessions
- Railway for cloud deployment
- WhatsApp Business API integration

## Additional Considerations

### **Deployment Architecture**
- Show development, staging, and production environments
- Include CI/CD pipeline integration
- Database migration and backup strategies
- Monitoring and logging infrastructure

### **Network Architecture**
- API Gateway for request routing
- Load balancers for traffic distribution
- CDN for global content delivery
- VPC and security group configurations

### **Monitoring & Observability**
- Application performance monitoring
- Error tracking and alerting
- Log aggregation and analysis
- Business metrics and KPI tracking

Create a professional, detailed architecture diagram that clearly communicates the system's complexity while remaining accessible to both technical and business stakeholders. The diagram should demonstrate how this platform enables businesses to create sophisticated WhatsApp automation workflows with enterprise-grade reliability and performance.