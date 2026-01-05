const express = require('express');
const router = express.Router();
const { flowBuilderService } = require('../services/flowBuilderService');
const { testRunner } = require('../services/testRunnerService');
const { validateRequiredFields } = require('../utils/validation');
const { flowErrorMiddleware } = require('../utils/flowErrorHandler');
const logger = require('../utils/logger');

/**
 * POST /api/flows
 * Create or update a flow with automatic WhatsApp sync
 */
router.post('/', async (req, res) => {
  try {
    const { screens, flowName, flowId } = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(req.body, ['screens', 'flowName']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Validate screens array
    if (!Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Screens must be a non-empty array'
      });
    }

    logger.info('📝 Creating/updating flow', { 
      flowName, 
      flowId, 
      screenCount: screens.length 
    });

    const result = await flowBuilderService.createOrUpdateFlow({
      screens,
      flowName,
      flowId
    });

    res.json(result);

  } catch (error) {
    logger.error('Error in POST /api/flows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * PUT /api/flows/:flowId
 * Update existing flow
 */
router.put('/:flowId', async (req, res) => {
  try {
    const { flowId } = req.params;
    const { screens, flowName } = req.body;
    
    logger.info('📝 Updating flow', { flowId, flowName });

    const result = await flowBuilderService.createOrUpdateFlow({
      screens,
      flowName,
      flowId
    });

    res.json(result);

  } catch (error) {
    logger.error('Error in PUT /api/flows/:flowId:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flows/:flowId
 * Get flow with generated JSON
 */
router.get('/:flowId', async (req, res) => {
  try {
    const { flowId } = req.params;
    
    logger.info('📖 Getting flow', { flowId });

    const flow = await flowBuilderService.getFlowWithJson(flowId);

    res.json({
      success: true,
      data: flow
    });

  } catch (error) {
    logger.error('Error in GET /api/flows/:flowId:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      });
    }

    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flows
 * Get all flows
 */
router.get('/', async (req, res) => {
  try {
    const { status } = req.query;
    
    logger.info('📖 Getting all flows', { status });

    const flows = await flowBuilderService.getAllFlows({ status });

    res.json({
      success: true,
      data: flows
    });

  } catch (error) {
    logger.error('Error in GET /api/flows:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flows/:flowId/sync
 * Manually sync flow with WhatsApp
 */
router.post('/:flowId/sync', async (req, res) => {
  try {
    const { flowId } = req.params;
    
    logger.info('🔄 Manual sync flow', { flowId });

    const flow = await flowBuilderService.getFlowWithJson(flowId);
    const syncResult = await flowBuilderService.syncWithWhatsApp(
      flowId, 
      flow.generatedJson, 
      flow.name
    );

    // Update flow status
    await flowBuilderService.updateFlowStatus(flow.id, 'SYNCED');

    res.json({
      success: true,
      data: syncResult,
      message: 'Flow synced with WhatsApp successfully'
    });

  } catch (error) {
    logger.error('Error in POST /api/flows/:flowId/sync:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flows/generate-json
 * Generate WhatsApp JSON from screens (without saving)
 */
router.post('/generate-json', async (req, res) => {
  try {
    const { screens } = req.body;
    
    // Validate screens array
    if (!Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Screens must be a non-empty array'
      });
    }

    logger.info('🔨 Generating JSON from screens', { screenCount: screens.length });

    const whatsappJson = flowBuilderService.buildFlowJson(screens);

    res.json({
      success: true,
      data: {
        whatsappJson,
        screenCount: screens.length,
        version: whatsappJson.version
      }
    });

  } catch (error) {
    logger.error('Error in POST /api/flows/generate-json:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flows/validate
 * Validate flow without creating (validation-only endpoint)
 */
router.post('/validate', async (req, res) => {
  try {
    const { screens } = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(req.body, ['screens']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Validate screens array
    if (!Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Screens must be a non-empty array'
      });
    }

    logger.info('🔍 Validating flow', { screenCount: screens.length });

    const result = await flowBuilderService.validateFlowOnly(screens);
    res.json(result);

  } catch (error) {
    logger.error('Error in POST /api/flows/validate:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/flows/test
 * Run comprehensive flow tests
 */
router.post('/test', async (req, res) => {
  try {
    const { screens, options = {} } = req.body;
    
    // Validate required fields
    const validation = validateRequiredFields(req.body, ['screens']);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error
      });
    }

    // Validate screens array
    if (!Array.isArray(screens) || screens.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Screens must be a non-empty array'
      });
    }

    logger.info('🧪 Running flow tests', { 
      screenCount: screens.length,
      options 
    });

    const testResults = await testRunner.runFlowTests(screens, options);

    res.json({
      success: true,
      data: testResults
    });

  } catch (error) {
    logger.error('Error in POST /api/flows/test:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/flows/test-results
 * Get current test results
 */
router.get('/test-results', (req, res) => {
  try {
    const results = testRunner.getTestResults();
    
    res.json({
      success: true,
      data: results
    });

  } catch (error) {
    logger.error('Error in GET /api/flows/test-results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * DELETE /api/flows/test-results
 * Clear test results
 */
router.delete('/test-results', (req, res) => {
  try {
    testRunner.clearResults();
    
    res.json({
      success: true,
      message: 'Test results cleared'
    });

  } catch (error) {
    logger.error('Error in DELETE /api/flows/test-results:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

// Apply error handling middleware
router.use(flowErrorMiddleware);

module.exports = router;