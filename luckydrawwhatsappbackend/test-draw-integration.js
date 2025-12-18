const axios = require('axios');
require('dotenv').config();

async function testDrawIntegration() {
  console.log('🎯 Testing Draw Integration with WhatsApp Backend...\n');
  
  // Simulate the winners from your recent draw
  const winners = [
    {
      phoneNumber: '+919496397649',
      name: 'Krishnadev ks',
      position: '1st'
    },
    {
      phoneNumber: '+919496397649', // Using same number for testing
      name: 'Aakesh',
      position: '2nd'
    },
    {
      phoneNumber: '+919496397649', // Using same number for testing
      name: 'Babit',
      position: '3rd'
    }
  ];
  
  console.log('📱 Sending notifications to winners...');
  
  try {
    // Test bulk notification (like the main app would do)
    const response = await axios.post('http://localhost:3002/api/winner-notifications/bulk', {
      winners: winners,
      useTextFallback: true
    });
    
    console.log('✅ Bulk notification response:', JSON.stringify(response.data, null, 2));
    
    if (response.data.success) {
      console.log(`\n🎉 SUCCESS: ${response.data.data.successful} messages sent successfully!`);
      console.log(`❌ FAILED: ${response.data.data.failed} messages failed`);
      
      // Show individual results
      response.data.data.results.forEach((result, index) => {
        const winner = winners[index];
        if (result.success) {
          console.log(`✅ ${winner.name} (${winner.position}): Messages sent`);
          if (result.templateSent) console.log(`   📋 Template message sent`);
          if (result.textSent) console.log(`   📝 Text message sent`);
        } else {
          console.log(`❌ ${winner.name} (${winner.position}): Failed - ${result.error}`);
        }
      });
    }
    
  } catch (error) {
    console.error('❌ Integration test failed:');
    console.error('Error:', error.response?.data || error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n🔧 SOLUTION: WhatsApp backend is not running!');
      console.log('Run: npm run dev in the luckydrawwhatsappbackend folder');
    }
  }
}

testDrawIntegration();
