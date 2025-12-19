const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Create PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Create Prisma adapter
const adapter = new PrismaPg(pool);

// Initialize Prisma client with adapter
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Starting database seed...');

  // Create default message templates
  const messageTemplates = [
    {
      messageId: 'msg_welcome_interactive',
      name: 'Welcome - Interactive Menu',
      type: 'INTERACTIVE_BUTTON',
      status: 'PUBLISHED',
      category: 'welcome',
      tags: ['welcome', 'menu', 'interactive'],
      contentPayload: {
        header: 'Welcome to Hospital Services! 🏥',
        body: 'Hello! How can we assist you today? Please choose an option below:',
        footer: 'Powered by Hospital Management System',
        buttons: [
          {
            buttonId: 'btn_book_appointment',
            title: '📅 Book Appointment',
            triggerId: 'trigger_book_appointment',
            nextAction: 'send_message',
            targetMessageId: 'msg_book_interactive'
          },
          {
            buttonId: 'btn_lab_tests',
            title: '🧪 Lab Tests',
            triggerId: 'trigger_lab_tests',
            nextAction: 'send_message',
            targetMessageId: 'msg_lab_interactive'
          },
          {
            buttonId: 'btn_emergency',
            title: '🚨 Emergency',
            triggerId: 'trigger_emergency',
            nextAction: 'send_message',
            targetMessageId: 'msg_emergency'
          }
        ]
      }
    },
    {
      messageId: 'msg_book_interactive',
      name: 'Book Appointment - Interactive',
      type: 'INTERACTIVE_BUTTON',
      status: 'PUBLISHED',
      category: 'appointment',
      tags: ['appointment', 'booking'],
      contentPayload: {
        header: 'Book Your Appointment 📅',
        body: 'Which type of appointment would you like to book?',
        footer: 'Select your preferred option',
        buttons: [
          {
            buttonId: 'btn_general_checkup',
            title: '👩‍⚕️ General Checkup',
            triggerId: 'trigger_general_checkup',
            nextAction: 'send_message',
            targetMessageId: 'msg_doctor_selection'
          },
          {
            buttonId: 'btn_specialist',
            title: '🩺 Specialist',
            triggerId: 'trigger_specialist',
            nextAction: 'send_message',
            targetMessageId: 'msg_specialist_selection'
          },
          {
            buttonId: 'btn_back_main',
            title: '⬅️ Back to Main',
            triggerId: 'trigger_back_main',
            nextAction: 'send_message',
            targetMessageId: 'msg_welcome_interactive'
          }
        ]
      }
    },
    {
      messageId: 'msg_emergency',
      name: 'Emergency Services - Interactive',
      type: 'INTERACTIVE_BUTTON',
      status: 'PUBLISHED',
      category: 'emergency',
      tags: ['emergency', 'urgent'],
      contentPayload: {
        header: '🚨 Emergency Services',
        body: 'This is for medical emergencies only. If this is a life-threatening situation, please call 108 immediately.\n\nFor non-emergency urgent care, choose an option:',
        footer: 'Emergency helpline: 108',
        buttons: [
          {
            buttonId: 'btn_urgent_care',
            title: '🏥 Urgent Care',
            triggerId: 'trigger_urgent_care',
            nextAction: 'send_message',
            targetMessageId: 'msg_urgent_care_info'
          },
          {
            buttonId: 'btn_ambulance',
            title: '🚑 Book Ambulance',
            triggerId: 'trigger_ambulance',
            nextAction: 'send_message',
            targetMessageId: 'msg_ambulance_booking'
          },
          {
            buttonId: 'btn_call_emergency',
            title: '📞 Call Emergency',
            triggerId: 'trigger_call_emergency',
            nextAction: 'send_message',
            targetMessageId: 'msg_emergency_contact'
          }
        ]
      }
    }
  ];

  // Create message templates
  for (const template of messageTemplates) {
    await prisma.messageTemplate.upsert({
      where: { messageId: template.messageId },
      update: template,
      create: template
    });
    console.log(`✅ Created/updated message template: ${template.name}`);
  }

  // Create default triggers
  const triggers = [
    {
      triggerId: 'trigger_hi',
      triggerType: 'KEYWORD_MATCH',
      triggerValue: { keywords: ['hi', 'hello', 'hey', 'start', 'menu'] },
      nextAction: 'send_message',
      targetId: 'msg_welcome_interactive',
      isActive: true,
      priority: 10
    },
    {
      triggerId: 'trigger_help',
      triggerType: 'KEYWORD_MATCH',
      triggerValue: { keywords: ['help', 'support', 'assist'] },
      nextAction: 'send_message',
      targetId: 'msg_welcome_interactive',
      isActive: true,
      priority: 5
    },
    {
      triggerId: 'trigger_book_appointment',
      triggerType: 'BUTTON_CLICK',
      triggerValue: { buttonId: 'btn_book_appointment' },
      nextAction: 'send_message',
      targetId: 'msg_book_interactive',
      isActive: true,
      priority: 0
    },
    {
      triggerId: 'trigger_emergency',
      triggerType: 'BUTTON_CLICK',
      triggerValue: { buttonId: 'btn_emergency' },
      nextAction: 'send_message',
      targetId: 'msg_emergency',
      isActive: true,
      priority: 0
    }
  ];

  // Create triggers
  for (const trigger of triggers) {
    await prisma.trigger.upsert({
      where: { triggerId: trigger.triggerId },
      update: trigger,
      create: trigger
    });
    console.log(`✅ Created/updated trigger: ${trigger.triggerId}`);
  }

  // Create sample flows
  const flows = [
    {
      flowId: 'flow_appointment_booking',
      name: 'Appointment Booking Flow',
      description: 'Interactive flow for booking medical appointments',
      version: '1.0',
      status: 'PUBLISHED',
      flowData: {
        screens: ['appointment_type', 'doctor_selection', 'time_slot', 'confirmation'],
        fields: ['appointment_type', 'doctor_id', 'preferred_date', 'preferred_time', 'patient_name', 'phone_number']
      }
    },
    {
      flowId: 'flow_contact_form',
      name: 'Contact Information Form',
      description: 'Basic contact information collection',
      version: '1.0',
      status: 'PUBLISHED',
      flowData: {
        screens: ['contact_info'],
        fields: ['name', 'email', 'phone', 'message']
      }
    }
  ];

  // Create flows
  for (const flow of flows) {
    await prisma.flow.upsert({
      where: { flowId: flow.flowId },
      update: flow,
      create: flow
    });
    console.log(`✅ Created/updated flow: ${flow.name}`);
  }

  // Create system configuration
  const systemConfigs = [
    {
      key: 'default_welcome_message',
      value: { messageId: 'msg_welcome_interactive' }
    },
    {
      key: 'business_hours',
      value: {
        monday: { start: '09:00', end: '17:00' },
        tuesday: { start: '09:00', end: '17:00' },
        wednesday: { start: '09:00', end: '17:00' },
        thursday: { start: '09:00', end: '17:00' },
        friday: { start: '09:00', end: '17:00' },
        saturday: { start: '09:00', end: '13:00' },
        sunday: { closed: true }
      }
    },
    {
      key: 'auto_response_enabled',
      value: { enabled: true }
    }
  ];

  // Create system configs
  for (const config of systemConfigs) {
    await prisma.systemConfig.upsert({
      where: { key: config.key },
      update: { value: config.value },
      create: config
    });
    console.log(`✅ Created/updated system config: ${config.key}`);
  }

  console.log('🎉 Database seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error during seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });