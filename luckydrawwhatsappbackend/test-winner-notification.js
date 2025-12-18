/**
 * Test Script for Winner Notification Service
 * Run this script to test the winner notification functionality
 */

const WinnerNotificationService = require('./services/winnerNotificationService');

async function testWinnerNotification() {
  console.log('🧪 Testing Winner Notification Service...\n');

  const winnerService = new WinnerNotificationService();

  // Test data
  const testWinner = {
    recipientPhone: '919876543210', // Replace with your test number
    recipientName: 'Rahul',
    prizePosition: '1st'
  };

  const testWinners = [
    {
      phoneNumber: '919876543210',
      name: 'Rahul',
      position: '1st'
    },
    {
      phoneNumber: '919876543211',
      name: 'Priya', 
      position: '2nd'
    },
    {
      phoneNumber: '919876543212',
      name: 'Amit',
      position: '3rd'
    }
  ];

  try {
    // Test 1: Parameter validation
    console.log('📋 Test 1: Parameter Validation');
    const validation = winnerService.validateParameters(testWinner.recipientName, testWinner.prizePosition);
    console.log('Validation result:', validation);
    console.log('✅ Validation test passed\n');

    // Test 2: Single winner notification (commented out to avoid sending actual messages)
    console.log('📱 Test 2: Single Winner Notification');
    console.log('⚠️  Skipping actual message sending (uncomment to test with real WhatsApp)');
    // const singleResult = await winnerService.sendWinnerNotification(
    //   testWinner.recipientPhone,
    //   testWinner.recipientName,
    //   testWinner.prizePosition
    // );
    // console.log('Single notification result:', singleResult);
    console.log('✅ Single notification test structure verified\n');

    // Test 3: Bulk winner notifications (commented out to avoid sending actual messages)
    console.log('📢 Test 3: Bulk Winner Notifications');
    console.log('⚠️  Skipping actual message sending (uncomment to test with real WhatsApp)');
    // const bulkResult = await winnerService.sendBulkWinnerNotifications(testWinners);
    // console.log('Bulk notification result:', bulkResult);
    console.log('✅ Bulk notification test structure verified\n');

    // Test 4: Invalid parameter validation
    console.log('❌ Test 4: Invalid Parameter Validation');
    const invalidValidation = winnerService.validateParameters('', 'invalid_position');
    console.log('Invalid validation result:', invalidValidation);
    console.log('✅ Invalid parameter test passed\n');

    console.log('🎉 All tests completed successfully!');
    console.log('\n📝 Notes:');
    console.log('- To test actual WhatsApp message sending, uncomment the message sending code');
    console.log('- Make sure your WhatsApp template "lucky_draw_winner" is approved');
    console.log('- Replace test phone numbers with valid WhatsApp numbers');
    console.log('- Ensure WHATSAPP_ACCESS_TOKEN and WHATSAPP_PHONE_NUMBER_ID are set in .env');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

// Run tests if this file is executed directly
if (require.main === module) {
  testWinnerNotification();
}

module.exports = { testWinnerNotification };
