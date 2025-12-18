const axios = require('axios');
require('dotenv').config();

async function testWhatsAppToken() {
  try {
    console.log('🧪 Testing WhatsApp Access Token...');
    
    const response = await axios.post(
      `https://graph.facebook.com/v18.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`,
      {
        messaging_product: "whatsapp",
        to: "+919496397649", // Using the winner's phone from your log
        type: "template",
        template: {
          name: "hello_world",
          language: {
            code: "en_US"
          }
        }
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Token is valid! Message sent successfully');
    console.log('Message ID:', response.data.messages[0].id);
    
  } catch (error) {
    console.error('❌ Token test failed:');
    console.error('Error:', error.response?.data?.error || error.message);
    
    if (error.response?.data?.error?.code === 190) {
      console.log('\n🔧 SOLUTION: Your access token has expired!');
      console.log('1. Go to: https://business.facebook.com');
      console.log('2. Navigate to: WhatsApp > API Setup');
      console.log('3. Generate a new temporary access token');
      console.log('4. Update WHATSAPP_ACCESS_TOKEN in your .env file');
      console.log('5. Restart the server');
    }
  }
}

testWhatsAppToken();
