/**
 * Winner Notification Routes
 * Handles API endpoints for sending winner notifications
 */

const express = require('express');
const router = express.Router();
const WinnerNotificationService = require('../services/winnerNotificationService');

const winnerService = new WinnerNotificationService();

/**
 * POST /api/winner-notifications/send
 * Send notification to a single winner
 */
router.post('/send', async (req, res) => {
  try {
    const { recipientPhone, recipientName, prizePosition, useTextFallback = true } = req.body;

    // Validate required fields
    if (!recipientPhone || !recipientName || !prizePosition) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientPhone, recipientName, prizePosition'
      });
    }

    // Validate parameters
    const validation = winnerService.validateParameters(recipientName, prizePosition);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.errors
      });
    }

    // Send notification (try template first)
    let result = await winnerService.sendWinnerNotification(
      recipientPhone,
      recipientName,
      prizePosition
    );

    // If template fails and fallback is enabled, try text message
    if (!result.success && useTextFallback) {
      console.log(`⚠️ Template failed for ${recipientName}, trying text message...`);
      result = await winnerService.sendWinnerNotificationText(
        recipientPhone,
        recipientName,
        prizePosition
      );
    }

    if (result.success) {
      res.json({
        success: true,
        message: 'Winner notification sent successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send winner notification',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in winner notification route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/winner-notifications/bulk
 * Send notifications to multiple winners
 */
router.post('/bulk', async (req, res) => {
  try {
    const { winners, useTextFallback = true } = req.body;

    // Validate winners array
    if (!Array.isArray(winners) || winners.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Winners must be a non-empty array'
      });
    }

    // Validate each winner object
    for (let i = 0; i < winners.length; i++) {
      const winner = winners[i];
      if (!winner.phoneNumber || !winner.name || !winner.position) {
        return res.status(400).json({
          success: false,
          error: `Winner at index ${i} is missing required fields: phoneNumber, name, position`
        });
      }

      const validation = winnerService.validateParameters(winner.name, winner.position);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: `Winner at index ${i} has invalid parameters`,
          details: validation.errors
        });
      }
    }

    // Send bulk notifications
    const results = await winnerService.sendBulkWinnerNotifications(winners, useTextFallback);

    res.json({
      success: true,
      message: 'Bulk winner notifications processed',
      data: results
    });

  } catch (error) {
    console.error('Error in bulk winner notification route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * GET /api/winner-notifications/template-info
 * Get information about the winner notification template
 */
router.get('/template-info', (req, res) => {
  res.json({
    success: true,
    template: {
      name: 'hello_world',
      category: 'UTILITY',
      language: 'en_US',
      components: {
        body: 'Hello World\nWelcome and congratulations!! This message demonstrates your ability to send a WhatsApp message notification from the Cloud API, hosted by Meta. Thank you for taking the time to test with us.\nWhatsApp Business Platform sample message'
      },
      variables: [],
      note: 'This is a fixed template without parameters. For winner notifications, the system will use text fallback with personalized content.',
      fallback: {
        type: 'text',
        message: 'Hello {{recipient_name}},\n\nWe\'re thrilled to inform you that you have won the {{prize_position}} prize in the Elanadu Lucky Draw Contest!\n\nOur team will contact you soon with details on how to claim your prize.\n\nThank you for participating and being part of the celebration!'
      }
    }
  });
});

/**
 * POST /api/winner-notifications/send-text
 * Send text notification to a single winner (no template)
 */
router.post('/send-text', async (req, res) => {
  try {
    const { recipientPhone, recipientName, prizePosition } = req.body;

    // Validate required fields
    if (!recipientPhone || !recipientName || !prizePosition) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: recipientPhone, recipientName, prizePosition'
      });
    }

    // Validate parameters
    const validation = winnerService.validateParameters(recipientName, prizePosition);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid parameters',
        details: validation.errors
      });
    }

    // Send text notification
    const result = await winnerService.sendWinnerNotificationText(
      recipientPhone,
      recipientName,
      prizePosition
    );

    if (result.success) {
      res.json({
        success: true,
        message: 'Winner text notification sent successfully',
        data: result
      });
    } else {
      res.status(500).json({
        success: false,
        error: 'Failed to send winner text notification',
        details: result.error
      });
    }

  } catch (error) {
    console.error('Error in winner text notification route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

/**
 * POST /api/winner-notifications/validate
 * Validate winner notification parameters
 */
router.post('/validate', (req, res) => {
  try {
    const { recipientName, prizePosition } = req.body;

    const validation = winnerService.validateParameters(recipientName, prizePosition);

    res.json({
      success: true,
      validation
    });

  } catch (error) {
    console.error('Error in validation route:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error',
      message: error.message
    });
  }
});

module.exports = router;
