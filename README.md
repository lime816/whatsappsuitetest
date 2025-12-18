# WhatsApp Suite

A comprehensive WhatsApp automation suite consisting of two main components:

## Projects

### 1. Lucky Draw WhatsApp Backend (`luckydrawwhatsappbackend/`)
A Node.js backend service that handles WhatsApp integration for lucky draw campaigns and salon booking systems.

**Features:**
- WhatsApp webhook integration
- Lucky draw management
- Salon booking flow
- Interactive message handling
- Winner notification system
- Customer registration and management

**Key Services:**
- Booking flow management
- Lucky draw operations
- Message library
- WhatsApp API integration
- Winner notifications

### 2. Lucky Draw Flow Builder (`luckydrawflowbuilder/`)
A flow builder application for creating and managing WhatsApp conversation flows.

## Getting Started

Each project has its own setup instructions:

1. **Backend Setup**: See `luckydrawwhatsappbackend/README.md` and `luckydrawwhatsappbackend/SETUP_GUIDE.md`
2. **Flow Builder Setup**: See `luckydrawflowbuilder/` directory for specific instructions

## Project Structure

```
whatsappsuite/
├── luckydrawwhatsappbackend/    # Backend API and WhatsApp integration
│   ├── services/                # Core business logic
│   ├── routes/                  # API endpoints
│   ├── utils/                   # Utility functions
│   └── scripts/                 # Test and utility scripts
└── luckydrawflowbuilder/        # Flow builder application
```

## Documentation

- Backend documentation and guides are available in the `luckydrawwhatsappbackend/` directory
- Each component includes detailed setup and troubleshooting guides

## Contributing

Please refer to individual project documentation for development guidelines and contribution instructions.