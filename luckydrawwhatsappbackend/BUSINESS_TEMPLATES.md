# 🏢 Business Templates for WhatsApp Automation

Ready-to-use automation templates for common business scenarios. Copy and customize these configurations for your specific needs.

## 🛍️ E-commerce Store

### Triggers Configuration
```json
[
  {
    "keyword": "catalog",
    "flowId": "your_catalog_flow_id",
    "message": "Browse our latest products:",
    "isActive": true
  },
  {
    "keyword": "order",
    "flowId": "your_order_flow_id", 
    "message": "Let's place your order:",
    "isActive": true
  },
  {
    "keyword": "track",
    "flowId": "your_tracking_flow_id",
    "message": "Track your order status:",
    "isActive": true
  },
  {
    "keyword": "return",
    "flowId": "your_return_flow_id",
    "message": "Process your return request:",
    "isActive": true
  }
]
```

### Custom Processing Logic
```javascript
// Add to webhookService.js processFormData function
async function processEcommerceData(phoneNumber, formData) {
  switch(formData.form_type) {
    case 'order':
      await createOrder(formData);
      await sendOrderConfirmation(phoneNumber, formData);
      break;
    case 'tracking':
      const status = await getOrderStatus(formData.order_id);
      await sendTrackingUpdate(phoneNumber, status);
      break;
    case 'return':
      await initiateReturn(formData);
      await sendReturnConfirmation(phoneNumber, formData);
      break;
  }
}
```

---

## 🏥 Healthcare/Medical Practice

### Triggers Configuration
```json
[
  {
    "keyword": "appointment",
    "flowId": "your_appointment_flow_id",
    "message": "Book your appointment:",
    "isActive": true
  },
  {
    "keyword": "symptoms",
    "flowId": "your_symptoms_flow_id",
    "message": "Please describe your symptoms:",
    "isActive": true
  },
  {
    "keyword": "prescription",
    "flowId": "your_prescription_flow_id",
    "message": "Prescription refill request:",
    "isActive": true
  },
  {
    "keyword": "emergency",
    "flowId": "your_emergency_flow_id",
    "message": "Emergency contact information:",
    "isActive": true
  }
]
```

### Custom Processing Logic
```javascript
async function processMedicalData(phoneNumber, formData) {
  switch(formData.form_type) {
    case 'appointment':
      await scheduleAppointment(formData);
      await sendAppointmentConfirmation(phoneNumber, formData);
      break;
    case 'symptoms':
      await logSymptoms(formData);
      await notifyMedicalStaff(formData);
      break;
    case 'emergency':
      await triggerEmergencyProtocol(phoneNumber, formData);
      break;
  }
}
```

---

## 🏨 Hotel/Restaurant

### Triggers Configuration
```json
[
  {
    "keyword": "reservation",
    "flowId": "your_reservation_flow_id",
    "message": "Make your reservation:",
    "isActive": true
  },
  {
    "keyword": "menu",
    "flowId": "your_menu_flow_id",
    "message": "View our menu:",
    "isActive": true
  },
  {
    "keyword": "delivery",
    "flowId": "your_delivery_flow_id",
    "message": "Order for delivery:",
    "isActive": true
  },
  {
    "keyword": "cancel",
    "flowId": "your_cancellation_flow_id",
    "message": "Cancel your reservation:",
    "isActive": true
  }
]
```

### Custom Processing Logic
```javascript
async function processHospitalityData(phoneNumber, formData) {
  switch(formData.form_type) {
    case 'reservation':
      await createReservation(formData);
      await sendReservationConfirmation(phoneNumber, formData);
      break;
    case 'delivery':
      await processDeliveryOrder(formData);
      await sendDeliveryConfirmation(phoneNumber, formData);
      break;
    case 'cancellation':
      await cancelReservation(formData.reservation_id);
      await sendCancellationConfirmation(phoneNumber);
      break;
  }
}
```

---

## 🎓 Educational Institution

### Triggers Configuration
```json
[
  {
    "keyword": "admission",
    "flowId": "your_admission_flow_id",
    "message": "Start your admission process:",
    "isActive": true
  },
  {
    "keyword": "courses",
    "flowId": "your_courses_flow_id",
    "message": "Explore our courses:",
    "isActive": true
  },
  {
    "keyword": "fees",
    "flowId": "your_fees_flow_id",
    "message": "Fee payment and information:",
    "isActive": true
  },
  {
    "keyword": "results",
    "flowId": "your_results_flow_id",
    "message": "Check your results:",
    "isActive": true
  }
]
```

---

## 🏢 Professional Services

### Triggers Configuration
```json
[
  {
    "keyword": "consultation",
    "flowId": "your_consultation_flow_id",
    "message": "Schedule a consultation:",
    "isActive": true
  },
  {
    "keyword": "quote",
    "flowId": "your_quote_flow_id",
    "message": "Get a project quote:",
    "isActive": true
  },
  {
    "keyword": "portfolio",
    "flowId": "your_portfolio_flow_id",
    "message": "View our work:",
    "isActive": true
  },
  {
    "keyword": "contact",
    "flowId": "your_contact_flow_id",
    "message": "Get in touch with us:",
    "isActive": true
  }
]
```

---

## 🚗 Automotive/Service Center

### Triggers Configuration
```json
[
  {
    "keyword": "service",
    "flowId": "your_service_flow_id",
    "message": "Schedule your service:",
    "isActive": true
  },
  {
    "keyword": "parts",
    "flowId": "your_parts_flow_id",
    "message": "Order spare parts:",
    "isActive": true
  },
  {
    "keyword": "warranty",
    "flowId": "your_warranty_flow_id",
    "message": "Check warranty status:",
    "isActive": true
  },
  {
    "keyword": "estimate",
    "flowId": "your_estimate_flow_id",
    "message": "Get repair estimate:",
    "isActive": true
  }
]
```

---

## 🏠 Real Estate

### Triggers Configuration
```json
[
  {
    "keyword": "viewing",
    "flowId": "your_viewing_flow_id",
    "message": "Schedule a property viewing:",
    "isActive": true
  },
  {
    "keyword": "mortgage",
    "flowId": "your_mortgage_flow_id",
    "message": "Mortgage information:",
    "isActive": true
  },
  {
    "keyword": "sell",
    "flowId": "your_selling_flow_id",
    "message": "Sell your property:",
    "isActive": true
  },
  {
    "keyword": "rent",
    "flowId": "your_rental_flow_id",
    "message": "Rental inquiries:",
    "isActive": true
  }
]
```

---

## 💼 Generic Business Template

### Universal Triggers
```json
[
  {
    "keyword": "hello",
    "flowId": "your_welcome_flow_id",
    "message": "Welcome! How can we help you?",
    "isActive": true
  },
  {
    "keyword": "info",
    "flowId": "your_info_flow_id",
    "message": "Get more information:",
    "isActive": true
  },
  {
    "keyword": "support",
    "flowId": "your_support_flow_id",
    "message": "Contact our support team:",
    "isActive": true
  },
  {
    "keyword": "feedback",
    "flowId": "your_feedback_flow_id",
    "message": "Share your feedback:",
    "isActive": true
  }
]
```

---

## 🔧 Implementation Guide

### 1. Choose Your Template
Select the template that best matches your business type.

### 2. Create WhatsApp Flows
For each trigger, create a corresponding WhatsApp Flow in Meta Business Manager.

### 3. Update Flow IDs
Replace `your_*_flow_id` with actual Flow IDs from Meta Business Manager.

### 4. Add Triggers via API
```bash
curl -X POST https://your-domain.com/api/triggers \
  -H "Content-Type: application/json" \
  -d '{
    "keyword": "appointment",
    "flowId": "123456789",
    "message": "Book your appointment:",
    "isActive": true
  }'
```

### 5. Customize Processing Logic
Add your business-specific logic to the `processFormData` function in `webhookService.js`.

### 6. Test Your Automation
Send test messages to verify everything works correctly.

---

## 📝 Customization Tips

### Adding Multiple Keywords
```javascript
// In triggerService.js, modify findMatchingTrigger to support multiple keywords
const trigger = {
  keywords: ['book', 'appointment', 'schedule'], // Multiple keywords
  flowId: 'your_flow_id',
  message: 'Book your appointment:'
};
```

### Conditional Responses
```javascript
// Add logic based on user data or time
if (isBusinessHours()) {
  await sendFlowMessage(phoneNumber, flowId, message);
} else {
  await sendTextMessage(phoneNumber, 'We are currently closed. We will respond during business hours.');
}
```

### Integration Examples
```javascript
// Database integration
await database.collection('leads').add({
  phoneNumber,
  formData,
  timestamp: new Date(),
  source: 'whatsapp'
});

// Email notification
await emailService.send({
  to: 'sales@company.com',
  subject: 'New WhatsApp Lead',
  body: `New inquiry from ${phoneNumber}: ${JSON.stringify(formData)}`
});

// CRM integration
await crmService.createContact({
  phone: phoneNumber,
  ...formData
});
```

---

**Choose your template and start automating!** 🚀

Each template is designed to be production-ready with minimal customization required.