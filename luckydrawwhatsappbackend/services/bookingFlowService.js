/**
 * Booking Flow Service
 * Handles the complete WhatsApp booking flow for Bodhi Salon
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const whatsappService = require('./whatsappService');

class BookingFlowService {
  constructor() {
    // Session storage (in production, use Redis or database)
    this.sessions = new Map();
  }

  /**
   * Get or create user session
   */
  getSession(phoneNumber) {
    if (!this.sessions.has(phoneNumber)) {
      this.sessions.set(phoneNumber, {
        phoneNumber,
        currentStep: 'welcome',
        selectedServices: [],
        selectedLocation: null,
        selectedDate: null,
        selectedTime: null,
        selectedStaff: null,
        totalCost: 0,
        totalDuration: 0,
        customerId: null,
        customerName: null
      });
    }
    return this.sessions.get(phoneNumber);
  }

  /**
   * Update session data
   */
  updateSession(phoneNumber, data) {
    const session = this.getSession(phoneNumber);
    Object.assign(session, data);
    this.sessions.set(phoneNumber, session);
    return session;
  }

  /**
   * Clear session
   */
  clearSession(phoneNumber) {
    this.sessions.delete(phoneNumber);
  }

  /**
   * Send welcome message based on customer status
   */
  async sendWelcomeMessage(phoneNumber) {
    try {
      // Check if customer exists
      const customer = await prisma.customer.findUnique({
        where: { phone_number: phoneNumber }
      });

      if (customer) {
        // Existing customer
        this.updateSession(phoneNumber, {
          customerId: customer.customer_id,
          customerName: customer.customer_name,
          currentStep: 'main_menu'
        });

        return await this.sendMainMenu(phoneNumber, customer.customer_name);
      } else {
        // New customer - start registration
        this.updateSession(phoneNumber, { currentStep: 'registration_name' });
        
        return await whatsappService.sendTextMessage(
          phoneNumber,
          '🌿 *Welcome to Bodhi Salon & Spa!*\n\n' +
          'Before we begin, let\'s create your profile.\n\n' +
          'Please share your *full name*:'
        );
      }
    } catch (error) {
      console.error('Error sending welcome message:', error);
      throw error;
    }
  }

  /**
   * Send main menu
   */
  async sendMainMenu(phoneNumber, customerName = 'there') {
    const buttons = [
      {
        type: 'reply',
        reply: {
          id: 'btn_book_appointment',
          title: '📅 Book Appointment'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_view_bookings',
          title: '📋 My Bookings'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_services_prices',
          title: '💰 Services & Prices'
        }
      }
    ];

    return await whatsappService.sendInteractiveMessage(
      phoneNumber,
      {
        type: 'button',
        header: {
          type: 'text',
          text: 'Welcome back to Bodhi Salon! 🌿'
        },
        body: {
          text: `Hello ${customerName}! How can we assist you today?`
        },
        footer: {
          text: 'Bodhi Salon & Spa • Thrissur'
        },
        action: {
          buttons
        }
      }
    );
  }

  /**
   * Send service selection list
   */
  async sendServiceSelection(phoneNumber) {
    try {
      // Fetch active services from database
      const services = await prisma.service.findMany({
        where: { is_active: true },
        orderBy: { service_category: 'asc' }
      });

      // Group services by category
      const servicesByCategory = {};
      services.forEach(service => {
        const category = service.service_category || 'Other';
        if (!servicesByCategory[category]) {
          servicesByCategory[category] = [];
        }
        servicesByCategory[category].push(service);
      });

      // Build sections for interactive list
      const sections = Object.entries(servicesByCategory).map(([category, categoryServices]) => ({
        title: category,
        rows: categoryServices.slice(0, 10).map(service => ({
          id: `service_${service.service_id}`,
          title: service.service_name.substring(0, 24), // WhatsApp limit
          description: `₹${service.price} • ${service.duration_minutes} mins`
        }))
      }));

      this.updateSession(phoneNumber, { currentStep: 'service_selection' });

      return await whatsappService.sendInteractiveMessage(
        phoneNumber,
        {
          type: 'list',
          header: {
            type: 'text',
            text: 'Choose Your Service 💇'
          },
          body: {
            text: 'Please select the service(s) you\'d like to book. You can select multiple services.\n\n*Tip:* Select one service at a time.'
          },
          footer: {
            text: 'All prices include GST'
          },
          action: {
            button: 'View Services',
            sections
          }
        }
      );
    } catch (error) {
      console.error('Error sending service selection:', error);
      throw error;
    }
  }

  /**
   * Add service to session
   */
  async addService(phoneNumber, serviceId) {
    try {
      const service = await prisma.service.findUnique({
        where: { service_id: parseInt(serviceId) }
      });

      if (!service) {
        throw new Error('Service not found');
      }

      const session = this.getSession(phoneNumber);
      
      // Check if service already added
      const alreadyAdded = session.selectedServices.find(s => s.id === service.service_id);
      if (alreadyAdded) {
        return await whatsappService.sendTextMessage(
          phoneNumber,
          '⚠️ This service is already added to your booking.'
        );
      }

      // Add service
      session.selectedServices.push({
        id: service.service_id,
        name: service.service_name,
        price: parseFloat(service.price),
        duration: service.duration_minutes
      });

      // Update totals
      session.totalCost = session.selectedServices.reduce((sum, s) => sum + s.price, 0);
      session.totalDuration = session.selectedServices.reduce((sum, s) => sum + s.duration, 0);

      this.updateSession(phoneNumber, session);

      // Send confirmation with options
      return await this.sendServiceAddedConfirmation(phoneNumber);
    } catch (error) {
      console.error('Error adding service:', error);
      throw error;
    }
  }

  /**
   * Send service added confirmation
   */
  async sendServiceAddedConfirmation(phoneNumber) {
    const session = this.getSession(phoneNumber);
    
    const servicesList = session.selectedServices
      .map((s, i) => `${i + 1}. ${s.name} - ₹${s.price}`)
      .join('\n');

    const buttons = [
      {
        type: 'reply',
        reply: {
          id: 'btn_add_more_services',
          title: '➕ Add More'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_continue_location',
          title: '✅ Continue'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_cancel_booking',
          title: '❌ Cancel'
        }
      }
    ];

    return await whatsappService.sendInteractiveMessage(
      phoneNumber,
      {
        type: 'button',
        header: {
          type: 'text',
          text: 'Service Added! ✅'
        },
        body: {
          text: `*Selected Services:*\n${servicesList}\n\n` +
                `*Total Duration:* ${session.totalDuration} mins\n` +
                `*Estimated Cost:* ₹${session.totalCost}\n\n` +
                'Would you like to add more services or continue?'
        },
        footer: {
          text: 'You can book multiple services together'
        },
        action: {
          buttons
        }
      }
    );
  }

  /**
   * Send location selection
   */
  async sendLocationSelection(phoneNumber) {
    this.updateSession(phoneNumber, { currentStep: 'location_selection' });

    const buttons = [
      {
        type: 'reply',
        reply: {
          id: 'btn_location_salon',
          title: '🏢 At Salon'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_location_home',
          title: '🏠 Home Service'
        }
      },
      {
        type: 'reply',
        reply: {
          id: 'btn_back_services',
          title: '⬅️ Back'
        }
      }
    ];

    return await whatsappService.sendInteractiveMessage(
      phoneNumber,
      {
        type: 'button',
        header: {
          type: 'text',
          text: 'Choose Service Location 📍'
        },
        body: {
          text: 'Where would you like to receive the service?\n\n' +
                '🏠 *Home Service:* We come to you\n' +
                '🏢 *Salon:* Visit our salon in Thrissur\n\n' +
                '*Note:* Some services may only be available at specific locations.'
        },
        footer: {
          text: 'Home service may have additional charges'
        },
        action: {
          buttons
        }
      }
    );
  }

  /**
   * Send date selection prompt
   */
  async sendDateSelection(phoneNumber, location) {
    this.updateSession(phoneNumber, { 
      selectedLocation: location,
      currentStep: 'date_selection' 
    });

    return await whatsappService.sendTextMessage(
      phoneNumber,
      '📅 *When would you like to book?*\n\n' +
      'Please share your preferred date and time:\n\n' +
      '*Examples:*\n' +
      '• Tomorrow 2 PM\n' +
      '• 25-12-2024 10:30 AM\n' +
      '• Next Monday 3 PM\n' +
      '• Today 5 PM\n\n' +
      '*Salon Hours:* 10:00 AM - 8:00 PM (Daily)'
    );
  }

  /**
   * Parse date/time from user input
   */
  parseDateTimeInput(input) {
    const now = new Date();
    const lowerInput = input.toLowerCase().trim();

    // Handle "tomorrow"
    if (lowerInput.includes('tomorrow')) {
      const tomorrow = new Date(now);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const timeMatch = lowerInput.match(/(\d{1,2})\s*(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        if (timeMatch[2].toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (timeMatch[2].toLowerCase() === 'am' && hour === 12) hour = 0;
        tomorrow.setHours(hour, 0, 0, 0);
      }
      return tomorrow;
    }

    // Handle "today"
    if (lowerInput.includes('today')) {
      const today = new Date(now);
      const timeMatch = lowerInput.match(/(\d{1,2})\s*(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        if (timeMatch[2].toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (timeMatch[2].toLowerCase() === 'am' && hour === 12) hour = 0;
        today.setHours(hour, 0, 0, 0);
      }
      return today;
    }

    // Handle DD-MM-YYYY format
    const dateMatch = input.match(/(\d{1,2})-(\d{1,2})-(\d{4})/);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1;
      const year = parseInt(dateMatch[3]);
      const date = new Date(year, month, day);
      
      const timeMatch = input.match(/(\d{1,2}):?(\d{2})?\s*(am|pm)/i);
      if (timeMatch) {
        let hour = parseInt(timeMatch[1]);
        const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
        if (timeMatch[3].toLowerCase() === 'pm' && hour !== 12) hour += 12;
        if (timeMatch[3].toLowerCase() === 'am' && hour === 12) hour = 0;
        date.setHours(hour, minute, 0, 0);
      }
      return date;
    }

    return null;
  }

  /**
   * Get available time slots
   */
  async getAvailableTimeSlots(date, duration) {
    try {
      const dateStr = date.toISOString().split('T')[0];
      
      // Get all bookings for the date
      const bookings = await prisma.booking.findMany({
        where: {
          booking_date: {
            gte: new Date(dateStr + 'T00:00:00Z'),
            lt: new Date(dateStr + 'T23:59:59Z')
          }
        },
        include: {
          services: {
            include: {
              service: true
            }
          }
        }
      });

      // Generate time slots (10 AM to 8 PM, every 30 mins)
      const slots = [];
      const startHour = 10;
      const endHour = 20;
      
      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const slotTime = new Date(date);
          slotTime.setHours(hour, minute, 0, 0);
          
          // Check if slot is available
          const isAvailable = this.isSlotAvailable(slotTime, duration, bookings);
          
          if (isAvailable) {
            slots.push({
              time: slotTime,
              display: slotTime.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit',
                hour12: true 
              })
            });
          }
        }
      }

      return slots;
    } catch (error) {
      console.error('Error getting available slots:', error);
      return [];
    }
  }

  /**
   * Check if time slot is available
   */
  isSlotAvailable(slotTime, duration, bookings) {
    const slotEnd = new Date(slotTime.getTime() + duration * 60000);
    
    for (const booking of bookings) {
      const bookingStart = new Date(booking.booking_time);
      const bookingDuration = booking.services.reduce((sum, bs) => 
        sum + (bs.service?.duration_minutes || 60), 0
      );
      const bookingEnd = new Date(bookingStart.getTime() + bookingDuration * 60000);
      
      // Check for overlap
      if (slotTime < bookingEnd && slotEnd > bookingStart) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Send time slot selection
   */
  async sendTimeSlotSelection(phoneNumber, dateTime) {
    const session = this.getSession(phoneNumber);
    
    // Get available slots
    const slots = await this.getAvailableTimeSlots(dateTime, session.totalDuration);
    
    if (slots.length === 0) {
      return await whatsappService.sendTextMessage(
        phoneNumber,
        '😔 Sorry, no slots available on this date.\n\n' +
        'Please try:\n' +
        '• Another date\n' +
        '• Different time\n' +
        '• Call us at +91-XXXXXXXXXX\n\n' +
        'Type a new date to try again.'
      );
    }

    // Take first 3 slots for buttons
    const buttons = slots.slice(0, 3).map((slot, index) => ({
      type: 'reply',
      reply: {
        id: `btn_slot_${index}`,
        title: `🕘 ${slot.display}`
      }
    }));

    this.updateSession(phoneNumber, { 
      selectedDate: dateTime,
      availableSlots: slots,
      currentStep: 'time_slot_selection' 
    });

    return await whatsappService.sendInteractiveMessage(
      phoneNumber,
      {
        type: 'button',
        header: {
          type: 'text',
          text: 'Available Time Slots ⏰'
        },
        body: {
          text: `📅 *Date:* ${dateTime.toLocaleDateString()}\n` +
                `⏱️ *Duration:* ${session.totalDuration} mins\n\n` +
                'Please select your preferred time slot:\n\n' +
                '✅ = Available'
        },
        footer: {
          text: 'Slots shown based on service duration'
        },
        action: {
          buttons
        }
      }
    );
  }

  /**
   * Send staff selection
   */
  async sendStaffSelection(phoneNumber, slotIndex) {
    try {
      const session = this.getSession(phoneNumber);
      const selectedSlot = session.availableSlots[slotIndex];
      
      if (!selectedSlot) {
        throw new Error('Invalid slot selection');
      }

      this.updateSession(phoneNumber, { 
        selectedTime: selectedSlot.time,
        currentStep: 'staff_selection' 
      });

      // Get active staff
      const staff = await prisma.staff.findMany({
        where: { status: true },
        orderBy: { staff_name: 'asc' }
      });

      // Build staff list
      const rows = [
        {
          id: 'staff_any',
          title: '✨ Any Available Staff',
          description: 'We\'ll assign the best available'
        },
        ...staff.map(s => ({
          id: `staff_${s.staff_id}`,
          title: s.staff_name.substring(0, 24),
          description: s.position || 'Professional Stylist'
        }))
      ];

      return await whatsappService.sendInteractiveMessage(
        phoneNumber,
        {
          type: 'list',
          header: {
            type: 'text',
            text: 'Choose Your Stylist 👨‍🦰👩‍🦰'
          },
          body: {
            text: 'Would you like to choose a specific staff member or let us assign the best available stylist?\n\n' +
                  '*All our staff are highly trained professionals.*'
          },
          footer: {
            text: 'Staff availability shown for selected time'
          },
          action: {
            button: 'Select Staff',
            sections: [{
              title: 'Available Staff',
              rows
            }]
          }
        }
      );
    } catch (error) {
      console.error('Error sending staff selection:', error);
      throw error;
    }
  }

  /**
   * Send booking confirmation
   */
  async sendBookingConfirmation(phoneNumber, staffId) {
    try {
      const session = this.getSession(phoneNumber);
      
      let staffName = 'Any Available Staff';
      if (staffId !== 'any') {
        const staff = await prisma.staff.findUnique({
          where: { staff_id: parseInt(staffId) }
        });
        staffName = staff ? staff.staff_name : 'Any Available Staff';
      }

      this.updateSession(phoneNumber, { 
        selectedStaff: staffId,
        currentStep: 'booking_confirmation' 
      });

      const servicesList = session.selectedServices
        .map(s => `• ${s.name} - ₹${s.price}`)
        .join('\n');

      const buttons = [
        {
          type: 'reply',
          reply: {
            id: 'btn_confirm_booking',
            title: '✅ Confirm Booking'
          }
        },
        {
          type: 'reply',
          reply: {
            id: 'btn_edit_booking',
            title: '✏️ Edit Details'
          }
        },
        {
          type: 'reply',
          reply: {
            id: 'btn_cancel_booking_final',
            title: '❌ Cancel'
          }
        }
      ];

      return await whatsappService.sendInteractiveMessage(
        phoneNumber,
        {
          type: 'button',
          header: {
            type: 'text',
            text: 'Confirm Your Booking 📋'
          },
          body: {
            text: '*Booking Summary:*\n\n' +
                  `👤 *Customer:* ${session.customerName}\n` +
                  `📞 *Phone:* ${phoneNumber}\n\n` +
                  `💇 *Services:*\n${servicesList}\n\n` +
                  `📍 *Location:* ${session.selectedLocation}\n` +
                  `📅 *Date:* ${session.selectedDate.toLocaleDateString()}\n` +
                  `⏰ *Time:* ${session.selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n` +
                  `👨‍🦰 *Staff:* ${staffName}\n\n` +
                  `⏱️ *Total Duration:* ${session.totalDuration} mins\n` +
                  `💰 *Estimated Cost:* ₹${session.totalCost}\n\n` +
                  '*Please confirm to proceed with booking.*'
          },
          footer: {
            text: 'You\'ll receive a confirmation message'
          },
          action: {
            buttons
          }
        }
      );
    } catch (error) {
      console.error('Error sending booking confirmation:', error);
      throw error;
    }
  }

  /**
   * Create booking in database
   */
  async createBooking(phoneNumber) {
    try {
      const session = this.getSession(phoneNumber);
      
      // Determine staff ID
      let staffId;
      if (session.selectedStaff === 'any') {
        // Find available staff
        const staff = await prisma.staff.findFirst({
          where: { status: true }
        });
        staffId = staff ? staff.staff_id : null;
      } else {
        staffId = parseInt(session.selectedStaff);
      }

      if (!staffId) {
        throw new Error('No staff available');
      }

      // Create booking
      const booking = await prisma.booking.create({
        data: {
          customer_id: session.customerId,
          staff_id: staffId,
          service_type: session.selectedLocation === 'Salon' ? 'Salon' : 'Home',
          service_address: session.selectedLocation === 'Home' ? 'Customer Address' : null,
          booking_date: session.selectedDate,
          booking_time: session.selectedTime,
          booking_status: 'Pending',
          special_notes: `Booked via WhatsApp`
        }
      });

      // Add services
      for (const service of session.selectedServices) {
        await prisma.bookingService.create({
          data: {
            booking_id: booking.booking_id,
            service_id: service.id,
            quantity: 1,
            price_at_booking: service.price
          }
        });
      }

      // Send success message
      await this.sendBookingSuccess(phoneNumber, booking.booking_id);

      // Clear session
      this.clearSession(phoneNumber);

      return booking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  /**
   * Send booking success message
   */
  async sendBookingSuccess(phoneNumber, bookingId) {
    const session = this.getSession(phoneNumber);
    
    const servicesList = session.selectedServices
      .map(s => s.name)
      .join(', ');

    return await whatsappService.sendTextMessage(
      phoneNumber,
      '🎉 *Booking Confirmed!*\n\n' +
      `*Booking ID:* #${bookingId}\n\n` +
      '📋 *Details:*\n' +
      `📅 ${session.selectedDate.toLocaleDateString()} at ${session.selectedTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}\n` +
      `💇 ${servicesList}\n` +
      `📍 ${session.selectedLocation}\n\n` +
      `💰 *Amount:* ₹${session.totalCost}\n` +
      '💳 *Payment:* At salon/after service\n\n' +
      '*Important Notes:*\n' +
      '• Please arrive 5 minutes early\n' +
      '• Cancellation allowed up to 2 hours before\n' +
      '• You\'ll receive a reminder 1 hour before\n\n' +
      '*Need help?* Reply with \'help\' or call us\n\n' +
      'Thank you for choosing Bodhi Salon & Spa! 🌿'
    );
  }
}

module.exports = new BookingFlowService();
