const express = require('express');
const { 
  getAllTriggers, 
  createTrigger, 
  updateTrigger, 
  deleteTrigger,
  testTrigger 
} = require('../services/triggerService');
const { asyncHandler, handleRouteError, sendSuccessResponse } = require('../utils/errorHandler');
const { requireFields } = require('../utils/validation');

const router = express.Router();

// Get all triggers
router.get('/', asyncHandler(async (req, res) => {
  const triggers = getAllTriggers();
  sendSuccessResponse(res, { triggers, count: triggers.length });
}));

// Create new trigger
router.post('/', requireFields(['keyword', 'flowId']), asyncHandler(async (req, res) => {
  try {
    const { keyword, flowId, message, isActive = true } = req.body;

    const trigger = createTrigger({
      keyword,
      flowId,
      message: message || 'Please complete this form:',
      isActive
    });

    sendSuccessResponse(res, trigger, 'Trigger created successfully', 201);
  } catch (error) {
    handleRouteError(res, error, 'creating trigger');
  }
}));

// Update trigger
router.put('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const trigger = updateTrigger(id, updates);

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    sendSuccessResponse(res, trigger, 'Trigger updated successfully');
  } catch (error) {
    handleRouteError(res, error, 'updating trigger');
  }
}));

// Delete trigger
router.delete('/:id', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const success = deleteTrigger(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    sendSuccessResponse(res, null, 'Trigger deleted successfully');
  } catch (error) {
    handleRouteError(res, error, 'deleting trigger');
  }
}));

// Test trigger with a message
router.post('/test', requireFields(['message']), asyncHandler(async (req, res) => {
  try {
    const { message, phoneNumber = '1234567890' } = req.body;
    const result = await testTrigger(message, phoneNumber);
    sendSuccessResponse(res, result, 'Trigger test completed');
  } catch (error) {
    handleRouteError(res, error, 'testing trigger');
  }
}));

// Activate/deactivate trigger
router.patch('/:id/toggle', asyncHandler(async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const trigger = updateTrigger(id, { isActive });

    if (!trigger) {
      return res.status(404).json({
        success: false,
        error: 'Trigger not found'
      });
    }

    const message = `Trigger ${isActive ? 'activated' : 'deactivated'} successfully`;
    sendSuccessResponse(res, trigger, message);
  } catch (error) {
    handleRouteError(res, error, 'toggling trigger');
  }
}));

module.exports = router;