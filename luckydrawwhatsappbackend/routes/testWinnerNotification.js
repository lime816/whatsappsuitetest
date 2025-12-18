/**
 * Test Winner Notification Routes
 * Provides testing endpoints for winner notification functionality
 */

const express = require('express');
const router = express.Router();
const WinnerNotificationService = require('../services/winnerNotificationService');

const winnerService = new WinnerNotificationService();

/**
 * GET /api/test-winner-notification
 * Test page for winner notification functionality
 */
router.get('/', (req, res) => {
  const testPage = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Winner Notification Test</title>
    <style>
        body { 
            font-family: Arial, sans-serif; 
            max-width: 800px; 
            margin: 0 auto; 
            padding: 20px;
            background-color: #f5f5f5;
        }
        .container {
            background: white;
            padding: 30px;
            border-radius: 10px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 { 
            color: #333; 
            text-align: center;
            margin-bottom: 30px;
        }
        .form-group { 
            margin-bottom: 20px; 
        }
        label { 
            display: block; 
            margin-bottom: 5px; 
            font-weight: bold;
            color: #555;
        }
        input, select { 
            width: 100%; 
            padding: 12px; 
            border: 1px solid #ddd; 
            border-radius: 5px;
            font-size: 16px;
            box-sizing: border-box;
        }
        button { 
            background: #007bff; 
            color: white; 
            padding: 12px 24px; 
            border: none; 
            border-radius: 5px; 
            cursor: pointer;
            font-size: 16px;
            margin-right: 10px;
            margin-bottom: 10px;
        }
        button:hover { 
            background: #0056b3; 
        }
        .success { 
            background: #28a745; 
        }
        .success:hover { 
            background: #1e7e34; 
        }
        .warning { 
            background: #ffc107; 
            color: #212529;
        }
        .warning:hover { 
            background: #e0a800; 
        }
        #result { 
            margin-top: 20px; 
            padding: 15px; 
            border-radius: 5px; 
            white-space: pre-wrap;
            font-family: monospace;
            font-size: 14px;
        }
        .success-result { 
            background: #d4edda; 
            border: 1px solid #c3e6cb; 
            color: #155724;
        }
        .error-result { 
            background: #f8d7da; 
            border: 1px solid #f5c6cb; 
            color: #721c24;
        }
        .template-info {
            background: #e7f3ff;
            border: 1px solid #b8daff;
            border-radius: 5px;
            padding: 15px;
            margin-bottom: 20px;
        }
        .template-info h3 {
            margin-top: 0;
            color: #004085;
        }
        .template-content {
            background: #f8f9fa;
            border-left: 4px solid #007bff;
            padding: 10px 15px;
            margin: 10px 0;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🏆 Winner Notification Test</h1>
        
        <div class="template-info">
            <h3>📋 Template Information</h3>
            <p><strong>Template Name:</strong> elanadu_mega_draw_winner</p>
            <div class="template-content">
                "Hello {{recipient_name}}, We're thrilled to inform you that you have won the {{prize_position}} prize in the Elanadu Lucky Draw Contest! Our team will contact you soon with details on how to claim your prize. Thank you for participating and being part of the celebration!"
            </div>
            <p><strong>Fallback:</strong> If template fails, system will send as plain text message</p>
        </div>

        <form id="testForm">
            <div class="form-group">
                <label for="phone">📱 Phone Number (with country code):</label>
                <input type="text" id="phone" name="phone" placeholder="+919876543210" required>
            </div>
            
            <div class="form-group">
                <label for="name">👤 Winner Name:</label>
                <input type="text" id="name" name="name" placeholder="Rahul Kumar" required>
            </div>
            
            <div class="form-group">
                <label for="prize">🏆 Prize Position:</label>
                <select id="prize" name="prize" required>
                    <option value="">Select Prize Position</option>
                    <option value="1st">1st Prize</option>
                    <option value="2nd">2nd Prize</option>
                    <option value="3rd">3rd Prize</option>
                </select>
            </div>
            
            <button type="button" onclick="sendTemplate()">📤 Send Template Message</button>
            <button type="button" onclick="sendText()" class="success">📝 Send Text Message</button>
            <button type="button" onclick="getTemplateInfo()" class="warning">ℹ️ Get Template Info</button>
        </form>
        
        <div id="result"></div>
    </div>

    <script>
        async function sendTemplate() {
            const phone = document.getElementById('phone').value;
            const name = document.getElementById('name').value;
            const prize = document.getElementById('prize').value;
            
            if (!phone || !name || !prize) {
                showResult('Please fill all fields', 'error');
                return;
            }
            
            showResult('Sending template message...', 'info');
            
            try {
                const response = await fetch('/api/winner-notifications/send', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipientPhone: phone,
                        recipientName: name,
                        prizePosition: prize,
                        useTextFallback: true
                    })
                });
                
                const data = await response.json();
                showResult(JSON.stringify(data, null, 2), data.success ? 'success' : 'error');
            } catch (error) {
                showResult('Error: ' + error.message, 'error');
            }
        }
        
        async function sendText() {
            const phone = document.getElementById('phone').value;
            const name = document.getElementById('name').value;
            const prize = document.getElementById('prize').value;
            
            if (!phone || !name || !prize) {
                showResult('Please fill all fields', 'error');
                return;
            }
            
            showResult('Sending text message...', 'info');
            
            try {
                const response = await fetch('/api/winner-notifications/send-text', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        recipientPhone: phone,
                        recipientName: name,
                        prizePosition: prize
                    })
                });
                
                const data = await response.json();
                showResult(JSON.stringify(data, null, 2), data.success ? 'success' : 'error');
            } catch (error) {
                showResult('Error: ' + error.message, 'error');
            }
        }
        
        async function getTemplateInfo() {
            showResult('Getting template information...', 'info');
            
            try {
                const response = await fetch('/api/winner-notifications/template-info');
                const data = await response.json();
                showResult(JSON.stringify(data, null, 2), 'success');
            } catch (error) {
                showResult('Error: ' + error.message, 'error');
            }
        }
        
        function showResult(message, type) {
            const resultDiv = document.getElementById('result');
            resultDiv.textContent = message;
            resultDiv.className = type === 'success' ? 'success-result' : 
                                 type === 'error' ? 'error-result' : '';
        }
    </script>
</body>
</html>
  `;
  
  res.send(testPage);
});

/**
 * POST /api/test-winner-notification/bulk-test
 * Test bulk winner notifications with sample data
 */
router.post('/bulk-test', async (req, res) => {
  try {
    const { testPhone } = req.body;
    
    if (!testPhone) {
      return res.status(400).json({
        success: false,
        error: 'Test phone number is required'
      });
    }
    
    // Sample winners data for testing
    const sampleWinners = [
      {
        phoneNumber: testPhone,
        name: 'Test Winner 1',
        position: '1st'
      },
      {
        phoneNumber: testPhone,
        name: 'Test Winner 2', 
        position: '2nd'
      },
      {
        phoneNumber: testPhone,
        name: 'Test Winner 3',
        position: '3rd'
      }
    ];
    
    console.log('🧪 Running bulk winner notification test...');
    const results = await winnerService.sendBulkWinnerNotifications(sampleWinners, true);
    
    res.json({
      success: true,
      message: 'Bulk test completed',
      data: results
    });
    
  } catch (error) {
    console.error('Error in bulk test:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
