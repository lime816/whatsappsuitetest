/**
 * Test script for Lucky Draw flow
 * Run with: node test-lucky-draw.js
 */

const axios = require('axios');

const BASE_URL = 'http://localhost:3001';
const TEST_PHONE = '+1234567890';

async function testLuckyDrawFlow() {
  console.log('🧪 Testing Lucky Draw Flow\n');

  try {
    // Test 1: Send "Join" message
    console.log('📝 Test 1: Sending "Join" message...');
    const joinResponse = await axios.post(`${BASE_URL}/api/webhook/test-text`, {
      message: 'Join',
      phoneNumber: TEST_PHONE
    });
    console.log('✅ Join message sent successfully');
    console.log('Response:', joinResponse.data);
    console.log('');

    // Wait a bit
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Test 2: Send name
    console.log('📝 Test 2: Sending name "John Doe"...');
    const nameResponse = await axios.post(`${BASE_URL}/api/webhook/test-text`, {
      message: 'John Doe',
      phoneNumber: TEST_PHONE
    });
    console.log('✅ Name sent successfully');
    console.log('Response:', nameResponse.data);
    console.log('');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📊 Expected Results:');
    console.log('1. Welcome message sent to user');
    console.log('2. Participant saved to database');
    console.log('3. Success confirmation sent');
    console.log('4. Brochure sent (if PDF exists)');
    console.log('\n💡 Check your server logs for detailed output');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
  }
}

// Run tests
console.log('🚀 Starting Lucky Draw Flow Tests');
console.log('📍 Server:', BASE_URL);
console.log('📱 Test Phone:', TEST_PHONE);
console.log('');

testLuckyDrawFlow();
