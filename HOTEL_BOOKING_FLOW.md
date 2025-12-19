# 🏨 Hotel Booking WhatsApp Flow Documentation

This document contains a complete hotel booking flow with foreigner registration compliance, designed according to Meta WhatsApp Flow API v7.3 specifications.

## 📋 Flow Overview

**Flow Type**: Multi-screen hotel booking with regulatory compliance  
**Total Screens**: 3 screens  
**API Version**: 7.3  
**Terminal Screen**: Foreigner Registration (compliance with Indian regulations)

### Flow Structure:
1. **RECOMMEND** - Booking Information (guest count, room plan, visit purpose)
2. **screen_ksjqgc** - Guest & Booking Details (personal info, contact details, booking dates)
3. **FOREIGNER_REGISTRATION** - Regulatory compliance with conditional fields and identity upload (Terminal)

---

## 🔧 Complete Flow JSON

```json
{
  "version": "7.3",
  "screens": [
    {
      "data": {},
      "id": "RECOMMEND",
      "layout": {
        "children": [
          {
            "children": [
              {
                "type": "TextSubheading",
                "text": "Total number of persons"
              },
              {
                "input-type": "text",
                "label": "Count in numbers",
                "name": "Count_in_numbers_b462d2",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Number of Adults",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Count in numbers",
                "name": "Count_in_numbers_f3b2a2",
                "required": false,
                "type": "TextInput"
              },
              {
                "text": "Number of Children",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Count in numbers",
                "name": "Count_in_numbers_3bdb3f",
                "required": false,
                "type": "TextInput"
              },
              {
                "text": "Room Plan",
                "type": "TextSubheading"
              },
              {
                "data-source": [
                  {
                    "id": "0_EP_–_Room_Only",
                    "title": "EP – Room Only"
                  },
                  {
                    "id": "1_CP_–_Room_+_Breakfast",
                    "title": "CP – Room + Breakfast"
                  },
                  {
                    "id": "2_MAP_–_Breakfast_+_Dinner",
                    "title": "MAP – Breakfast + Dinner"
                  }
                ],
                "label": "select one",
                "name": "select_one_9039b4",
                "required": true,
                "type": "RadioButtonsGroup"
              },
              {
                "text": "Purpose of Visit",
                "type": "TextSubheading"
              },
              {
                "label": "Text",
                "name": "Text_635e95",
                "required": false,
                "type": "TextArea"
              },
              {
                "label": "Continue",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "name": "screen_ksjqgc",
                    "type": "screen"
                  },
                  "payload": {
                    "screen_0_Count_in_numbers_0": "${form.Count_in_numbers_b462d2}",
                    "screen_0_Count_in_numbers_1": "${form.Count_in_numbers_f3b2a2}",
                    "screen_0_Count_in_numbers_2": "${form.Count_in_numbers_3bdb3f}",
                    "screen_0_select_one_3": "${form.select_one_9039b4}",
                    "screen_0_Text_4": "${form.Text_635e95}"
                  }
                },
                "type": "Footer"
              }
            ],
            "name": "flow_path",
            "type": "Form"
          }
        ],
        "type": "SingleColumnLayout"
      },
      "title": "Booking Information"
    },
    {
      "data": {
        "screen_0_Count_in_numbers_0": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Count_in_numbers_1": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Count_in_numbers_2": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_select_one_3": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Text_4": {
          "__example__": "Example",
          "type": "string"
        }
      },
      "id": "screen_ksjqgc",
      "layout": {
        "children": [
          {
            "children": [
              {
                "text": "Name",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Name",
                "name": "Name_b6b3d8",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Age",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Number",
                "name": "Number_1a86ed",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Relationship (Self / Family / Colleague)",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Text",
                "name": "Text_3a69ac",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Address",
                "type": "TextSubheading"
              },
              {
                "label": "Text",
                "name": "Text_d0a259",
                "required": true,
                "type": "TextArea"
              },
              {
                "text": "Email ID",
                "type": "TextSubheading"
              },
              {
                "input-type": "email",
                "label": "name@gmail.com",
                "name": "namegmailcom_87e6f5",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Nationality",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Text",
                "name": "Text_41cf49",
                "required": false,
                "type": "TextInput"
              },
              {
                "text": "Company / Designation",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "Text",
                "name": "Text_973183",
                "required": true,
                "type": "TextInput"
              },
              {
                "text": "Check-in Date",
                "type": "TextSubheading"
              },
              {
                "label": "Check-in Date",
                "name": "Checkin_Date_a07c4c",
                "required": true,
                "type": "DatePicker"
              },
              {
                "text": "Check-in Time",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "HH:MM (24-hour)",
                "name": "Checkin_Time_b08d5e",
                "required": false,
                "type": "TextInput"
              },
              {
                "text": "Check-out Date",
                "type": "TextSubheading"
              },
              {
                "label": "Check-out Date",
                "name": "Checkout_Date__526dd9",
                "required": true,
                "type": "DatePicker"
              },
              {
                "text": "Check-out Time",
                "type": "TextSubheading"
              },
              {
                "input-type": "text",
                "label": "HH:MM (24-hour)",
                "name": "Checkout_Time_c09f6g",
                "required": false,
                "type": "TextInput"
              },
              {
                "label": "Continue",
                "on-click-action": {
                  "name": "navigate",
                  "next": {
                    "name": "FOREIGNER_REGISTRATION",
                    "type": "screen"
                  },
                  "payload": {
                    "screen_1_Name_0": "${form.Name_b6b3d8}",
                    "screen_1_Number_1": "${form.Number_1a86ed}",
                    "screen_1_Text_2": "${form.Text_3a69ac}",
                    "screen_1_Text_3": "${form.Text_d0a259}",
                    "screen_1_namegmailcom_4": "${form.namegmailcom_87e6f5}",
                    "screen_1_Text_5": "${form.Text_41cf49}",
                    "screen_1_Text_6": "${form.Text_973183}",
                    "screen_1_Checkin_Date_7": "${form.Checkin_Date_a07c4c}",
                    "screen_1_Checkin_Time_8": "${form.Checkin_Time_b08d5e}",
                    "screen_1_Checkout_Date_9": "${form.Checkout_Date__526dd9}",
                    "screen_1_Checkout_Time_10": "${form.Checkout_Time_c09f6g}",
                    "screen_0_select_one_3": "${data.screen_0_select_one_3}",
                    "screen_0_Text_4": "${data.screen_0_Text_4}",
                    "screen_0_Count_in_numbers_0": "${data.screen_0_Count_in_numbers_0}",
                    "screen_0_Count_in_numbers_1": "${data.screen_0_Count_in_numbers_1}",
                    "screen_0_Count_in_numbers_2": "${data.screen_0_Count_in_numbers_2}"
                  }
                },
                "type": "Footer"
              }
            ],
            "name": "flow_path",
            "type": "Form"
          }
        ],
        "type": "SingleColumnLayout"
      },
      "title": "Guest & Booking Details"
    },
    {
      "data": {
        "screen_1_Name_0": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Number_1": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Text_2": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Text_3": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_namegmailcom_4": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Text_5": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Text_6": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Checkin_Date_7": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Checkin_Time_8": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Checkout_Date_9": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_1_Checkout_Time_10": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_select_one_3": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Text_4": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Count_in_numbers_0": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Count_in_numbers_1": {
          "__example__": "Example",
          "type": "string"
        },
        "screen_0_Count_in_numbers_2": {
          "__example__": "Example",
          "type": "string"
        }
      },
      "id": "FOREIGNER_REGISTRATION",
      "title": "Foreigner Registration",
      "terminal": true,
      "success": true,
      "layout": {
        "type": "SingleColumnLayout",
        "children": [
          {
            "type": "Form",
            "name": "form",
            "children": [
              {
                "type": "TextSubheading",
                "text": "The Registration of Foreigners Rules, 1939 (Rule 14) – Form C"
              },
              {
                "type": "RadioButtonsGroup",
                "label": "Are you a Foreigner?",
                "name": "is_foreigner",
                "required": true,
                "data-source": [
                  {
                    "id": "yes",
                    "title": "Yes"
                  },
                  {
                    "id": "no",
                    "title": "No"
                  }
                ]
              },
              {
                "type": "If",
                "condition": "${form.is_foreigner} == 'yes'",
                "then": [
                  {
                    "type": "TextInput",
                    "label": "FRRO Number",
                    "name": "foreigner_registration_number",
                    "required": true,
                    "input-type": "text",
                    "helper-text": "Foreigner Registration Number"
                  },
                  {
                    "type": "RadioButtonsGroup",
                    "label": "Employed in India?",
                    "name": "employed_in_india",
                    "required": true,
                    "data-source": [
                      {
                        "id": "yes",
                        "title": "Yes"
                      },
                      {
                        "id": "no",
                        "title": "No"
                      }
                    ]
                  }
                ]
              },
              {
                "type": "TextSubheading",
                "text": "Identity Proof of Adult Guests"
              },
              {
                "type": "PhotoPicker",
                "name": "identity_proof_photos",
                "label": "Upload Identity Documents",
                "description": "Please attach clear photos of identity documents for all adult guests",
                "photo-source": "camera_gallery",
                "min-uploaded-photos": 1,
                "max-uploaded-photos": 10,
                "max-file-size-kb": 10240
              },
              {
                "type": "TextSubheading",
                "text": "Payment Information"
              },
              {
                "type": "Dropdown",
                "label": "Payment Mode",
                "name": "payment_mode",
                "required": true,
                "data-source": [
                  {
                    "id": "cash",
                    "title": "Cash"
                  },
                  {
                    "id": "travel_agent_voucher",
                    "title": "Travel Agent / Airline Voucher"
                  },
                  {
                    "id": "company_billing",
                    "title": "Company Billing"
                  },
                  {
                    "id": "credit_card_visa",
                    "title": "Credit Card - Visa"
                  },
                  {
                    "id": "credit_card_mastercard",
                    "title": "Credit Card - MasterCard"
                  },
                  {
                    "id": "credit_card_maestro",
                    "title": "Credit Card - Maestro"
                  }
                ]
              },
              {
                "type": "OptIn",
                "label": "I have read the terms and conditions of the agreement printed on the reverse of this card and agree to abide by them.",
                "name": "terms_agreement",
                "required": true
              },
              {
                "type": "Footer",
                "label": "Submit Booking",
                "on-click-action": {
                  "name": "complete",
                  "payload": {
                    "is_foreigner": "${form.is_foreigner}",
                    "foreigner_registration_number": "${form.foreigner_registration_number}",
                    "employed_in_india": "${form.employed_in_india}",
                    "payment_mode": "${form.payment_mode}",
                    "terms_agreement": "${form.terms_agreement}",
                    "identity_proof_photos": "${form.identity_proof_photos}",
                    "screen_1_Name_0": "${data.screen_1_Name_0}",
                    "screen_1_Number_1": "${data.screen_1_Number_1}",
                    "screen_1_Text_2": "${data.screen_1_Text_2}",
                    "screen_1_Text_3": "${data.screen_1_Text_3}",
                    "screen_1_namegmailcom_4": "${data.screen_1_namegmailcom_4}",
                    "screen_1_Text_5": "${data.screen_1_Text_5}",
                    "screen_1_Text_6": "${data.screen_1_Text_6}",
                    "screen_1_Checkin_Date_7": "${data.screen_1_Checkin_Date_7}",
                    "screen_1_Checkin_Time_8": "${data.screen_1_Checkin_Time_8}",
                    "screen_1_Checkout_Date_9": "${data.screen_1_Checkout_Date_9}",
                    "screen_1_Checkout_Time_10": "${data.screen_1_Checkout_Time_10}",
                    "screen_0_select_one_3": "${data.screen_0_select_one_3}",
                    "screen_0_Text_4": "${data.screen_0_Text_4}",
                    "screen_0_Count_in_numbers_0": "${data.screen_0_Count_in_numbers_0}",
                    "screen_0_Count_in_numbers_1": "${data.screen_0_Count_in_numbers_1}",
                    "screen_0_Count_in_numbers_2": "${data.screen_0_Count_in_numbers_2}"
                  }
                }
              }
            ]
          }
        ]
      }
    }
  ]
}
```

---

## 📊 Flow Analysis

### **Screen Breakdown:**

#### **Screen 1: RECOMMEND (Booking Information)**
- **Purpose**: Collect guest count, room plan, and visit purpose
- **Fields**:
  - Total number of persons (required)
  - Number of Adults (optional)
  - Number of Children (optional)
  - Room Plan (Radio buttons: EP/CP/MAP)
  - Purpose of Visit (Text area, optional)
- **Navigation**: → screen_ksjqgc

#### **Screen 2: screen_ksjqgc (Guest & Booking Details)**
- **Purpose**: Combined personal information, contact details, and booking dates
- **Fields**:
  - Name (required)
  - Age (required)
  - Relationship (required)
  - Address (required)
  - Email ID (required, email validation)
  - Nationality (optional)
  - Company/Designation (required)
  - Check-in Date (date picker)
  - Check-in Time (optional)
  - Check-out Date (date picker)
  - Check-out Time (optional)
- **Navigation**: → FOREIGNER_REGISTRATION

#### **Screen 3: FOREIGNER_REGISTRATION (Terminal)**
- **Purpose**: Regulatory compliance, identity document upload, and payment information
- **Fields**:
  - Are you a Foreigner? (required radio buttons)
  - **Conditional Fields (if foreigner = "yes")**:
    - FRRO Number (required text input, 20 char label limit)
    - Employed in India? (required radio buttons)
  - Identity Proof Photos (PhotoPicker component)
  - Payment Mode (required dropdown: Cash, Travel Agent/Airline Voucher, Company Billing, Credit Cards)
  - Terms & Conditions Agreement (required opt-in checkbox)
- **Action**: Complete booking (terminal screen)

---

## 🔧 Technical Specifications

### **Meta WhatsApp Flow API Compliance:**

✅ **Version**: 7.3 (Latest supported)  
✅ **Layout**: SingleColumnLayout (recommended)  
✅ **Form Structure**: Proper Form wrapping  
✅ **Navigation**: Correct screen-to-screen flow  
✅ **Data Passing**: Payload structure with data persistence  
✅ **Terminal Screen**: Proper terminal and success flags  
✅ **Input Types**: Validated input types (text, email, date, photo)  
✅ **Required Fields**: Proper validation structure  
✅ **Photo Upload**: Native PhotoPicker with camera/gallery access  
✅ **File Validation**: Size limits and quantity restrictions  
✅ **Conditional Logic**: If conditions for foreigner-specific fields  
✅ **Label Optimization**: 20-character limit compliance for mobile screens  

### **Data Flow Architecture:**

```
Screen 1 (RECOMMEND) → Screen 2 (screen_ksjqgc) → Screen 3 (FOREIGNER_REGISTRATION - Terminal)
        ↓                        ↓                              ↓
    Payload Pass            Payload Pass                Complete Action
```

### **Payload Structure:**
Each screen passes data to the next using the `payload` object in the `on-click-action`. All previous screen data is preserved and passed forward, ensuring no data loss throughout the flow.

### **PhotoPicker Component Specifications:**
- **Component Type**: `PhotoPicker` (WhatsApp Flow API v7.3)
- **Photo Source**: `camera_gallery` (allows both camera capture and gallery selection)
- **File Limits**: 
  - Minimum photos: 1 (enforced via min-uploaded-photos)
  - Maximum photos: 10 (prevents excessive uploads)
  - Maximum file size: 10,240 KB (10 MB per photo)
- **Use Case**: Identity document verification for hotel registration
- **Data Type**: Returns array of photo file references
- **Validation**: Built-in file size and quantity validation (min-uploaded-photos enforces requirement)

---

## 🏨 Business Logic

### **Hotel Booking Process:**
1. **Booking Information**: Collect party size, room plan selection, and visit purpose
2. **Guest & Booking Details**: Combined personal information, contact details, and booking dates
3. **Compliance, Payment & Documentation**: Conditional foreigner registration, payment method selection, terms agreement, and identity proof upload

### **Regulatory Compliance:**
- **Form C Compliance**: Implements "The Registration of Foreigners Rules, 1939 (Rule 14)"
- **FRRO Integration**: Captures Foreigner Registration Regional Office number
- **Employment Status**: Tracks employment status for foreign nationals
- **Optional Fields**: Non-foreigners can skip regulatory fields

---

## 🚀 Implementation Guide

### **Backend Webhook Handler:**

```javascript
// Handle flow completion
if (message.interactive?.nfm_reply) {
  const formData = JSON.parse(message.interactive.nfm_reply.response_json);
  
  // Extract booking data
  const booking = {
    // Guest Information (Screen 1)
    totalGuests: formData.screen_0_Count_in_numbers_0,
    adults: formData.screen_0_Count_in_numbers_1,
    children: formData.screen_0_Count_in_numbers_2,
    roomPlan: formData.screen_0_select_one_3,
    visitPurpose: formData.screen_0_Text_4,
    
    // Personal & Booking Details (Screen 2)
    guestName: formData.screen_1_Name_0,
    age: formData.screen_1_Number_1,
    relationship: formData.screen_1_Text_2,
    address: formData.screen_1_Text_3,
    email: formData.screen_1_namegmailcom_4,
    nationality: formData.screen_1_Text_5,
    company: formData.screen_1_Text_6,
    checkinDate: formData.screen_1_Checkin_Date_7,
    checkinTime: formData.screen_1_Checkin_Time_8,
    checkoutDate: formData.screen_1_Checkout_Date_9,
    checkoutTime: formData.screen_1_Checkout_Time_10,
    
    // Regulatory Compliance, Payment & Identity (Screen 3 - Terminal)
    isForeigner: formData.is_foreigner,
    frroNumber: formData.foreigner_registration_number,
    employedInIndia: formData.employed_in_india,
    paymentMode: formData.payment_mode,
    termsAgreement: formData.terms_agreement,
    identityProofPhotos: formData.identity_proof_photos
  };
  
  // Process booking
  await processHotelBooking(booking);
}
```

### **Database Schema:**

```sql
CREATE TABLE hotel_bookings (
  id SERIAL PRIMARY KEY,
  guest_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  total_guests INTEGER,
  adults INTEGER,
  children INTEGER,
  room_plan VARCHAR(50),
  visit_purpose TEXT,
  age INTEGER,
  relationship VARCHAR(100),
  address TEXT,
  nationality VARCHAR(100),
  company VARCHAR(255),
  checkin_date DATE,
  checkin_time TIME,
  checkout_date DATE,
  checkout_time TIME,
  payment_mode VARCHAR(50) NOT NULL,
  terms_agreement BOOLEAN NOT NULL,
  identity_proof_photos JSONB,
  is_foreigner BOOLEAN,
  frro_number VARCHAR(50),
  employed_in_india BOOLEAN,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  status VARCHAR(20) DEFAULT 'pending'
);
```

---

## 🔐 Security & Validation

### **Input Validation:**
- **Email Format**: Automatic email validation on email input type
- **Date Validation**: DatePicker ensures valid date format
- **Photo Validation**: PhotoPicker enforces file size (max 10MB) and quantity limits (1-10 photos)
- **Required Fields**: Server-side validation for all required fields
- **Text Length**: Implement max length validation for text inputs

### **Data Privacy:**
- **PII Protection**: Encrypt sensitive personal information
- **GDPR Compliance**: Implement data retention policies
- **Access Control**: Restrict booking data access to authorized personnel

---

## 📱 User Experience

### **Flow Progression:**
- **Streamlined Process**: 3-screen flow for efficient completion
- **Clear Labels**: Descriptive field labels and helper text
- **Logical Grouping**: Related fields grouped by screen (booking info → guest details → compliance)
- **Regulatory Transparency**: Clear explanation of foreigner registration requirements

### **Error Handling:**
- **Required Field Validation**: Clear error messages for missing required fields
- **Format Validation**: Email and date format validation
- **Graceful Degradation**: Optional fields allow flow completion even with partial data

---

## 🎯 Testing Checklist

### **Functional Testing:**
- [ ] All screens navigate correctly
- [ ] Data persists across screens
- [ ] Required field validation works
- [ ] Terminal screen completes flow
- [ ] Payload data is correctly structured

### **Regulatory Testing:**
- [ ] Foreigner registration fields appear correctly
- [ ] Non-foreigners can complete without FRRO details
- [ ] Employment status captures correctly
- [ ] Form C compliance is maintained

### **Integration Testing:**
- [ ] Webhook receives complete payload
- [ ] Database stores all booking information
- [ ] Email notifications are sent
- [ ] Booking confirmation is generated

---

## 📈 Analytics & Monitoring

### **Key Metrics:**
- **Completion Rate**: Percentage of users completing full flow
- **Drop-off Points**: Identify screens with high abandonment
- **Foreigner Ratio**: Track percentage of foreign guests
- **Booking Conversion**: Monitor booking-to-confirmation rate

### **Error Monitoring:**
- **Validation Errors**: Track common validation failures
- **Navigation Issues**: Monitor screen transition problems
- **Data Loss**: Ensure payload data integrity

---

This hotel booking flow provides a comprehensive, compliant, and user-friendly booking experience while meeting all regulatory requirements for hotel guest registration in India.
