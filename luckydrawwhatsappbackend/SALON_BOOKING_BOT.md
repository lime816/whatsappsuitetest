# Bodhi Salon WhatsApp Booking Bot 🌿

This WhatsApp bot handles automated salon booking conversations, customer registration, and appointment management for Bodhi Salon & Spa.

## Features

### 🟦 1. User Identification
- **New Customers**: Automatic registration flow collecting name, DOB, and gender
- **Existing Customers**: Welcome back message with main menu

### 🟩 2. Main Menu Options
1. **Book Appointment** - Interactive service selection and booking
2. **View/Manage Booking** - Check upcoming appointments, reschedule, cancel
3. **Check Services & Prices** - Browse service categories and pricing
4. **Contact Salon** - Get salon contact information

### 🟧 3. Booking Flow
- **Service Selection**: Interactive list with categories (Haircut, Facial, Manicure, Hair Colour)
- **Date/Time Selection**: Natural language date/time input
- **Staff Preference**: Choose specific staff or anyone available
- **Confirmation**: Booking confirmation with details

### 🟥 4. Automated Events
- **Appointment Reminders**: 1 hour before appointment
- **Delay Notifications**: When staff marks delay in dashboard
- **Bill Delivery**: After service completion with PDF option

## API Endpoints

### Webhook
- `GET /webhook` - WhatsApp webhook verification
- `POST /webhook` - Process incoming WhatsApp messages

### Salon Automation
- `POST /api/salon/send-reminder` - Send appointment reminder
- `POST /api/salon/send-delay` - Send delay notification
- `POST /api/salon/send-bill` - Send bill notification
- `POST /api/salon/test-message` - Test bot with sample message

### Testing
- `POST /webhook/test-text` - Test text message webhook
- `POST /webhook/test-interactive` - Test interactive message webhook

## Environment Variables

```env
# WhatsApp Business API
WHATSAPP_ACCESS_TOKEN=your_access_token
WHATSAPP_PHONE_NUMBER_ID=your_phone_number_id
WHATSAPP_BUSINESS_ACCOUNT_ID=your_business_account_id
WEBHOOK_VERIFY_TOKEN=your_verify_token

# Database (Supabase PostgreSQL)
DATABASE_URL=your_supabase_database_url
DIRECT_URL=your_supabase_direct_url

# Salon Information
SALON_PHONE=+91-XXXXXXXXXX
SALON_ADDRESS=Bodhi Salon & Spa, Thrissur
SALON_HOURS=10 AM – 8 PM

# Server
PORT=3001
NODE_ENV=development
```

## Database Tables Used

### customers
- `customer_id`, `customer_name`, `phone_number`, `date_of_birth`, `gender`

### services
- `service_id`, `service_name`, `category`, `price`, `is_active`

### bookings
- `booking_id`, `customer_id`, `staff_id`, `scheduled_date`, `scheduled_time`

### staff
- `staff_id`, `staff_name`

## Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Configure Environment**
   ```bash
   cp .env.example .env
   # Edit .env with your credentials
   ```

3. **Start Server**
   ```bash
   npm run dev
   ```

4. **Test Bot**
   ```bash
   node test-salon-bot.js
   ```

## WhatsApp Business API Setup

1. **Create WhatsApp Business Account**
   - Go to Facebook Business Manager
   - Create WhatsApp Business API account

2. **Configure Webhook**
   - Webhook URL: `https://your-domain.com/webhook`
   - Verify Token: Set in `WEBHOOK_VERIFY_TOKEN`
   - Subscribe to `messages` field

3. **Get Access Token**
   - Generate permanent access token
   - Set in `WHATSAPP_ACCESS_TOKEN`

## Message Flow Examples

### New Customer Registration
```
Bot: Welcome to Bodhi Salon & Spa! 🌿
     Please share your full name to continue.

User: John Doe

Bot: Great, John Doe! Please share your Date of Birth (DD-MM-YYYY).

User: 15-06-1990

Bot: Please select your gender:
     [Female] [Male] [Other]

User: [Male]

Bot: Perfect! Your profile has been created. 🎉
     Welcome to Bodhi Salon & Spa, John Doe!
     
     What would you like to do today?
     [📅 Book Appointment] [📋 View Bookings] [💰 Services & Prices]
```

### Booking Flow
```
User: [📅 Book Appointment]

Bot: Please choose your service(s). You can select multiple services.
     [Select Service ▼]
     
     Hair Services
     - Haircut - ₹500
     - Hair Color - ₹2000
     
     Facial Services  
     - Basic Facial - ₹800
     - Premium Facial - ₹1500

User: [Haircut]

Bot: ✅ Haircut added!
     Type "done" to proceed or select another service.

User: done

Bot: Please share your preferred date and time for the appointment.
     Example: Tomorrow 2 PM or 25-12-2024 10:30 AM

User: Tomorrow 2 PM

Bot: Would you like a preferred staff member?
     [Choose Staff] [Anyone Available]

User: [Anyone Available]

Bot: 🎉 Your booking request has been received!
     📅 Services: Haircut
     💰 Total: ₹500
     We'll confirm your appointment shortly and send you the details.
```

## Integration with Main Backend

The salon booking bot can trigger events in the main Bodhi Salon backend:

### Appointment Reminders
```javascript
// Triggered by cron job 1 hour before appointment
POST /api/salon/send-reminder
{
  "phoneNumber": "+919876543210",
  "booking": {
    "scheduled_date": "2024-12-25",
    "scheduled_time": "14:00",
    "staff_name": "Sarah"
  }
}
```

### Delay Notifications
```javascript
// Triggered when staff marks delay in dashboard
POST /api/salon/send-delay
{
  "phoneNumber": "+919876543210",
  "delayMinutes": 15,
  "newTime": "14:15"
}
```

### Bill Notifications
```javascript
// Triggered when booking is marked as completed
POST /api/salon/send-bill
{
  "phoneNumber": "+919876543210",
  "bill": {
    "services": "Haircut, Facial",
    "totalAmount": 1500
  }
}
```

## Troubleshooting

### Common Issues

1. **Webhook Verification Failed**
   - Check `WEBHOOK_VERIFY_TOKEN` matches Facebook configuration
   - Ensure webhook URL is accessible

2. **Messages Not Sending**
   - Verify `WHATSAPP_ACCESS_TOKEN` is valid
   - Check `WHATSAPP_PHONE_NUMBER_ID` is correct
   - Ensure phone number is registered for WhatsApp Business

3. **Database Connection Issues**
   - Verify `DATABASE_URL` is correct
   - Check Supabase connection limits
   - Ensure database tables exist

### Testing

Use the test script to verify functionality:
```bash
node test-salon-bot.js
```

Check server logs for detailed error messages:
```bash
npm run dev
```

## Support

For issues or questions:
- Check server logs for error details
- Verify environment variables are set correctly
- Test with the provided test script
- Ensure WhatsApp Business API credentials are valid