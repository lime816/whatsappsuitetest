import React, { useState } from 'react'

// Simple standalone flow creator - no store, no complexity
export function SimpleFlowCreator() {
  const [flowName, setFlowName] = useState('')
  const [isCreating, setIsCreating] = useState(false)

  // Hardcoded feedback screen - always uses this, never "Hello World"
  const feedbackScreen = {
    id: 'RECOMMEND',
    title: 'Feedback Form',
    terminal: true,
    elements: [
      {
        id: 'sub1',
        type: 'TextSubheading',
        text: 'Would you recommend us to a friend?'
      },
      {
        id: 'sub2',
        type: 'TextSubheading',
        text: 'How could we do better?'
      },
      {
        id: 'radio1',
        type: 'RadioButtonsGroup',
        label: 'Choose one',
        name: 'recommendation',
        required: true,
        options: [
          { id: '0_Yes', title: 'Yes' },
          { id: '1_No', title: 'No' }
        ]
      },
      {
        id: 'textarea1',
        type: 'TextArea',
        label: 'Leave your feedback',
        name: 'feedback_comment',
        required: false
      },
      {
        id: 'footer1',
        type: 'Footer',
        label: 'Submit',
        action: 'complete',
        payloadKeys: ['recommendation', 'feedback_comment']
      }
    ]
  }

  // Convert to WhatsApp Flow JSON format
  const buildWhatsAppJSON = () => {
    return {
      version: '7.2',
      screens: [
        {
          id: feedbackScreen.id,
          title: feedbackScreen.title,
          layout: {
            type: 'SingleColumnLayout',
            children: [
              {
                type: 'TextSubheading',
                text: 'Would you recommend us to a friend?'
              },
              {
                type: 'TextSubheading',
                text: 'How could we do better?'
              },
              {
                type: 'Form',
                name: 'flow_path',
                children: [
                  {
                    type: 'RadioButtonsGroup',
                    label: 'Choose one',
                    name: 'recommendation',
                    'data-source': [
                      { id: '0_Yes', title: 'Yes' },
                      { id: '1_No', title: 'No' }
                    ],
                    required: true
                  },
                  {
                    type: 'TextArea',
                    label: 'Leave your feedback',
                    name: 'feedback_comment',
                    required: false
                  },
                  {
                    type: 'Footer',
                    label: 'Submit',
                    'on-click-action': {
                      name: 'complete',
                      payload: {
                        recommendation: '${form.recommendation}',
                        feedback_comment: '${form.feedback_comment}'
                      }
                    }
                  }
                ]
              }
            ]
          },
          terminal: true
        }
      ]
    }
  }

  const handleCreateFlow = async () => {
    if (!flowName.trim()) {
      alert('⚠️ Please enter a flow name')
      return
    }

    setIsCreating(true)

    try {
      const flowJSON = buildWhatsAppJSON()
      
      console.log('🎯 Creating flow with FEEDBACK screen (not Hello World):', flowJSON)

      // Create flow structure only (DRAFT stage)
      const response = await fetch(
        `https://graph.facebook.com/v22.0/${import.meta.env.VITE_WHATSAPP_BUSINESS_ACCOUNT_ID}/flows`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_WHATSAPP_ACCESS_TOKEN}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            name: flowName.trim(),
            categories: ['SIGN_UP']
          })
        }
      )

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(`API Error: ${errorData.error?.message || 'Unknown error'}`)
      }

      const result = await response.json()

      // Show success with JSON
      const jsonWindow = window.open('', '_blank')
      if (jsonWindow) {
        jsonWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Flow JSON - ${flowName}</title>
              <style>
                body {
                  font-family: 'Segoe UI', system-ui, sans-serif;
                  padding: 40px;
                  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                  margin: 0;
                }
                .container {
                  max-width: 900px;
                  margin: 0 auto;
                  background: white;
                  border-radius: 12px;
                  box-shadow: 0 20px 60px rgba(0,0,0,0.3);
                  overflow: hidden;
                }
                .header {
                  background: #25D366;
                  color: white;
                  padding: 30px;
                  text-align: center;
                }
                .header h1 {
                  margin: 0;
                  font-size: 28px;
                }
                .header p {
                  margin: 10px 0 0 0;
                  opacity: 0.9;
                }
                .content {
                  padding: 30px;
                }
                .info-box {
                  background: #E3F2FD;
                  border-left: 4px solid #2196F3;
                  padding: 20px;
                  margin: 20px 0;
                  border-radius: 4px;
                }
                .info-box h3 {
                  margin-top: 0;
                  color: #1976D2;
                }
                .info-box ol {
                  margin: 10px 0;
                  padding-left: 20px;
                }
                .info-box li {
                  margin: 8px 0;
                  line-height: 1.6;
                }
                .json-container {
                  background: #1e1e1e;
                  border-radius: 8px;
                  padding: 20px;
                  margin: 20px 0;
                  position: relative;
                }
                pre {
                  margin: 0;
                  color: #d4d4d4;
                  font-family: 'Consolas', 'Monaco', monospace;
                  font-size: 13px;
                  line-height: 1.6;
                  overflow-x: auto;
                }
                .copy-btn {
                  position: absolute;
                  top: 15px;
                  right: 15px;
                  background: #25D366;
                  color: white;
                  border: none;
                  padding: 10px 20px;
                  border-radius: 6px;
                  cursor: pointer;
                  font-weight: 600;
                  font-size: 14px;
                  transition: all 0.2s;
                }
                .copy-btn:hover {
                  background: #20BA5A;
                  transform: translateY(-1px);
                }
                .copy-btn:active {
                  transform: translateY(0);
                }
                .success-badge {
                  display: inline-block;
                  background: #4CAF50;
                  color: white;
                  padding: 8px 16px;
                  border-radius: 20px;
                  font-size: 14px;
                  font-weight: 600;
                  margin: 10px 0;
                }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>✅ Flow Created Successfully!</h1>
                  <p>Your feedback form is ready for WhatsApp</p>
                </div>
                <div class="content">
                  <div class="success-badge">DRAFT Status • Flow ID: ${result.id}</div>
                  
                  <div class="info-box">
                    <h3>📋 Next Steps:</h3>
                    <ol>
                      <li>Click the <strong>"Copy JSON"</strong> button below</li>
                      <li>Go to <strong>WhatsApp Business Manager</strong></li>
                      <li>Navigate to <strong>Flows</strong> section</li>
                      <li>Find your flow: <strong>"${flowName}"</strong> (ID: ${result.id})</li>
                      <li>Click <strong>"Edit"</strong> or <strong>"Upload JSON"</strong></li>
                      <li>Paste the copied JSON and save</li>
                      <li>Test and <strong>Publish</strong> when ready!</li>
                    </ol>
                  </div>

                  <div class="json-container">
                    <button class="copy-btn" onclick="copyJSON()">📋 Copy JSON</button>
                    <pre id="jsonCode">${JSON.stringify(flowJSON, null, 2)}</pre>
                  </div>

                  <p style="text-align: center; color: #666; margin-top: 30px;">
                    <strong>✨ This is your FEEDBACK FORM</strong> - not "Hello World"!
                  </p>
                </div>
              </div>

              <script>
                function copyJSON() {
                  const jsonText = document.getElementById('jsonCode').textContent;
                  navigator.clipboard.writeText(jsonText).then(() => {
                    const btn = document.querySelector('.copy-btn');
                    btn.textContent = '✅ Copied!';
                    btn.style.background = '#4CAF50';
                    setTimeout(() => {
                      btn.textContent = '📋 Copy JSON';
                      btn.style.background = '#25D366';
                    }, 2000);
                  });
                }
              </script>
            </body>
          </html>
        `)
      }

      alert(`✅ Flow Created Successfully!

Flow Name: ${flowName}
Flow ID: ${result.id}
Status: DRAFT

📋 A new window opened with your JSON.
This is the FEEDBACK FORM - not "Hello World"!

Copy the JSON and upload it manually in WhatsApp Business Manager.`)

    } catch (error) {
      console.error('❌ Error:', error)
      alert(`❌ Error creating flow:\n\n${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-md p-6 mb-6">
      <h3 className="text-lg font-semibold mb-4 text-slate-900 dark:text-white">
        🚀 Create WhatsApp Flow (Feedback Form)
      </h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
            Flow Name
          </label>
          <input
            type="text"
            value={flowName}
            onChange={(e) => setFlowName(e.target.value)}
            placeholder="Enter flow name (e.g., Customer Feedback)"
            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
            disabled={isCreating}
          />
        </div>

        <button
          onClick={handleCreateFlow}
          disabled={isCreating || !flowName.trim()}
          className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg"
        >
          {isCreating ? (
            <>
              <span className="inline-block animate-spin mr-2">⏳</span>
              Creating Flow...
            </>
          ) : (
            <>
              ✨ Create Flow (DRAFT - No Asset Upload)
            </>
          )}
        </button>

        <div className="text-sm text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
          <p className="font-semibold mb-2">ℹ️ What this does:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Creates flow structure in <strong>DRAFT</strong> stage</li>
            <li>Generates <strong>Feedback Form JSON</strong> (not "Hello World")</li>
            <li>Opens popup with JSON for manual upload</li>
            <li>No automatic asset upload (avoids permission errors)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
