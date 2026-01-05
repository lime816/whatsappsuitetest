const logger = require('../utils/logger');
const { validateFlow, validateScreen, validateComponent } = require('../utils/componentValidation');
const { flowBuilderService } = require('./flowBuilderService');
const { whatsappService } = require('./whatsappService');

/**
 * Test result structure
 */
class TestResult {
  constructor(testName, testType = 'validation') {
    this.testName = testName;
    this.testType = testType;
    this.success = true;
    this.errors = [];
    this.warnings = [];
    this.details = {};
    this.duration = 0;
    this.timestamp = new Date();
  }

  addError(message, details = null) {
    this.success = false;
    this.errors.push({ message, details, timestamp: new Date() });
  }

  addWarning(message, details = null) {
    this.warnings.push({ message, details, timestamp: new Date() });
  }

  setDetails(details) {
    this.details = { ...this.details, ...details };
  }

  setDuration(startTime) {
    this.duration = Date.now() - startTime;
  }
}

/**
 * Test suite for flow validation and functionality
 */
class FlowTestRunner {
  constructor() {
    this.testResults = [];
    this.isRunning = false;
  }

  /**
   * Run comprehensive flow tests
   */
  async runFlowTests(screens, options = {}) {
    const startTime = Date.now();
    this.isRunning = true;
    this.testResults = [];

    logger.info('🧪 Starting flow test suite', {
      screenCount: screens.length,
      options
    });

    try {
      // 1. Validation Tests
      await this.runValidationTests(screens);

      // 2. JSON Generation Tests
      await this.runJsonGenerationTests(screens);

      // 3. Structure Tests
      await this.runStructureTests(screens);

      // 4. WhatsApp API Tests (if enabled)
      if (options.includeApiTests) {
        await this.runApiTests(screens, options);
      }

      // 5. Performance Tests
      if (options.includePerformanceTests) {
        await this.runPerformanceTests(screens);
      }

      const totalDuration = Date.now() - startTime;
      const summary = this.generateTestSummary(totalDuration);

      logger.info('✅ Flow test suite completed', summary);
      return summary;

    } catch (error) {
      logger.error('❌ Flow test suite failed:', error);
      throw error;
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Run validation tests
   */
  async runValidationTests(screens) {
    const testResult = new TestResult('Flow Validation', 'validation');
    const startTime = Date.now();

    try {
      // Test overall flow validation
      const flowValidation = validateFlow(screens);
      testResult.setDetails({
        flowValidation: {
          isValid: flowValidation.isValid,
          errorCount: flowValidation.errors.length,
          warningCount: flowValidation.warnings.length
        }
      });

      if (!flowValidation.isValid) {
        flowValidation.errors.forEach(error => {
          testResult.addError(`Flow validation: ${error.message}`, error);
        });
      }

      flowValidation.warnings.forEach(warning => {
        testResult.addWarning(`Flow validation: ${warning.message}`, warning);
      });

      // Test individual screen validation
      const screenResults = [];
      screens.forEach((screen, index) => {
        const screenValidation = validateScreen(screen);
        screenResults.push({
          screenId: screen.id,
          screenIndex: index,
          isValid: screenValidation.isValid,
          errorCount: screenValidation.errors.length,
          warningCount: screenValidation.warnings.length
        });

        if (!screenValidation.isValid) {
          screenValidation.errors.forEach(error => {
            testResult.addError(`Screen ${index + 1} (${screen.id}): ${error.message}`, error);
          });
        }
      });

      testResult.setDetails({
        ...testResult.details,
        screenResults
      });

    } catch (error) {
      testResult.addError('Validation test failed', error.message);
    }

    testResult.setDuration(startTime);
    this.testResults.push(testResult);
  }

  /**
   * Run JSON generation tests
   */
  async runJsonGenerationTests(screens) {
    const testResult = new TestResult('JSON Generation', 'generation');
    const startTime = Date.now();

    try {
      // Test JSON generation
      const flowJson = flowBuilderService.buildFlowJson(screens);
      
      testResult.setDetails({
        jsonGenerated: true,
        version: flowJson.version,
        dataApiVersion: flowJson.data_api_version,
        screenCount: flowJson.screens?.length || 0,
        hasRoutingModel: !!flowJson.routing_model,
        hasGlobalData: !!flowJson.data
      });

      // Validate generated JSON structure
      if (!flowJson.version) {
        testResult.addError('Generated JSON missing version');
      }

      if (!flowJson.data_api_version) {
        testResult.addError('Generated JSON missing data_api_version');
      }

      if (!flowJson.screens || !Array.isArray(flowJson.screens)) {
        testResult.addError('Generated JSON missing or invalid screens array');
      }

      // Test JSON serialization
      try {
        const jsonString = JSON.stringify(flowJson);
        const jsonSize = new Blob([jsonString]).size;
        
        testResult.setDetails({
          ...testResult.details,
          jsonSize: `${(jsonSize / 1024).toFixed(2)} KB`,
          serializable: true
        });

        // Warn if JSON is very large
        if (jsonSize > 1024 * 1024) { // 1MB
          testResult.addWarning('Generated JSON is very large (>1MB)');
        }

      } catch (serializationError) {
        testResult.addError('JSON serialization failed', serializationError.message);
      }

    } catch (error) {
      testResult.addError('JSON generation failed', error.message);
    }

    testResult.setDuration(startTime);
    this.testResults.push(testResult);
  }

  /**
   * Run structure tests
   */
  async runStructureTests(screens) {
    const testResult = new TestResult('Flow Structure', 'structure');
    const startTime = Date.now();

    try {
      const structureAnalysis = {
        totalScreens: screens.length,
        totalComponents: 0,
        componentTypes: {},
        formScreens: 0,
        terminalScreens: 0,
        navigationPaths: [],
        orphanedScreens: [],
        circularReferences: []
      };

      // Analyze each screen
      screens.forEach((screen, index) => {
        structureAnalysis.totalComponents += screen.elements.length;

        // Count component types
        screen.elements.forEach(element => {
          structureAnalysis.componentTypes[element.type] = 
            (structureAnalysis.componentTypes[element.type] || 0) + 1;
        });

        // Check for form screens
        const hasFormElements = screen.elements.some(el => 
          ['TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea',
           'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
           'DatePicker', 'CalendarPicker', 'PhotoPicker', 'DocumentPicker'].includes(el.type)
        );
        
        if (hasFormElements) {
          structureAnalysis.formScreens++;
        }

        // Check for terminal screens
        const footer = screen.elements.find(el => el.type === 'Footer');
        if (footer && footer.action === 'complete') {
          structureAnalysis.terminalScreens++;
        }

        // Analyze navigation paths
        if (footer && footer.action === 'navigate' && footer.nextScreen) {
          structureAnalysis.navigationPaths.push({
            from: screen.id,
            to: footer.nextScreen,
            type: 'footer'
          });
        }

        // Check NavigationList items
        screen.elements.forEach(element => {
          if (element.type === 'NavigationList' && element.listItems) {
            element.listItems.forEach(item => {
              if (item.nextScreen) {
                structureAnalysis.navigationPaths.push({
                  from: screen.id,
                  to: item.nextScreen,
                  type: 'navigation_list'
                });
              }
            });
          }
        });
      });

      // Find orphaned screens (screens not referenced by any navigation)
      const referencedScreens = new Set(structureAnalysis.navigationPaths.map(path => path.to));
      const firstScreenId = screens[0]?.id;
      
      screens.forEach(screen => {
        if (screen.id !== firstScreenId && !referencedScreens.has(screen.id)) {
          structureAnalysis.orphanedScreens.push(screen.id);
        }
      });

      // Check for circular references
      const visited = new Set();
      const recursionStack = new Set();
      
      function detectCycle(screenId, path = []) {
        if (recursionStack.has(screenId)) {
          structureAnalysis.circularReferences.push([...path, screenId]);
          return;
        }
        
        if (visited.has(screenId)) return;
        
        visited.add(screenId);
        recursionStack.add(screenId);
        
        const outgoingPaths = structureAnalysis.navigationPaths.filter(p => p.from === screenId);
        outgoingPaths.forEach(pathObj => {
          detectCycle(pathObj.to, [...path, screenId]);
        });
        
        recursionStack.delete(screenId);
      }
      
      if (firstScreenId) {
        detectCycle(firstScreenId);
      }

      testResult.setDetails(structureAnalysis);

      // Add warnings for potential issues
      if (structureAnalysis.terminalScreens === 0) {
        testResult.addWarning('Flow has no terminal screens (screens with complete action)');
      }

      if (structureAnalysis.orphanedScreens.length > 0) {
        testResult.addWarning(`Found ${structureAnalysis.orphanedScreens.length} orphaned screens: ${structureAnalysis.orphanedScreens.join(', ')}`);
      }

      if (structureAnalysis.circularReferences.length > 0) {
        testResult.addError(`Found circular navigation references: ${structureAnalysis.circularReferences.map(cycle => cycle.join(' → ')).join(', ')}`);
      }

    } catch (error) {
      testResult.addError('Structure analysis failed', error.message);
    }

    testResult.setDuration(startTime);
    this.testResults.push(testResult);
  }

  /**
   * Run WhatsApp API tests
   */
  async runApiTests(screens, options) {
    const testResult = new TestResult('WhatsApp API', 'api');
    const startTime = Date.now();

    try {
      // Test API connection
      const connectionTest = await whatsappService.testConnection();
      testResult.setDetails({
        connectionTest: {
          success: connectionTest.success,
          phoneNumber: connectionTest.phoneNumber,
          verifiedName: connectionTest.verifiedName
        }
      });

      if (!connectionTest.success) {
        testResult.addError('WhatsApp API connection failed');
        testResult.setDuration(startTime);
        this.testResults.push(testResult);
        return;
      }

      // Test flow creation (if test flow ID provided)
      if (options.testFlowId) {
        try {
          const flowJson = flowBuilderService.buildFlowJson(screens);
          const updateResult = await whatsappService.updateFlowWithBuilderJson(
            options.testFlowId,
            flowJson,
            options.testFlowName || 'Test Flow'
          );

          testResult.setDetails({
            ...testResult.details,
            flowUpdateTest: {
              success: updateResult.success,
              flowId: options.testFlowId,
              assetId: updateResult.assetId
            }
          });

        } catch (apiError) {
          testResult.addError('Flow update test failed', apiError.message);
        }
      }

      // Test message sending (if test phone number provided)
      if (options.testPhoneNumber && options.testFlowId) {
        try {
          const sendResult = await whatsappService.sendFlowMessage(
            options.testPhoneNumber,
            options.testFlowId,
            'Test flow message from automated testing'
          );

          testResult.setDetails({
            ...testResult.details,
            messageSendTest: {
              success: sendResult.success,
              messageId: sendResult.messageId,
              phoneNumber: options.testPhoneNumber
            }
          });

        } catch (sendError) {
          testResult.addWarning('Flow message send test failed', sendError.message);
        }
      }

    } catch (error) {
      testResult.addError('API test suite failed', error.message);
    }

    testResult.setDuration(startTime);
    this.testResults.push(testResult);
  }

  /**
   * Run performance tests
   */
  async runPerformanceTests(screens) {
    const testResult = new TestResult('Performance', 'performance');
    const startTime = Date.now();

    try {
      const performanceMetrics = {
        jsonGenerationTime: 0,
        validationTime: 0,
        memoryUsage: process.memoryUsage(),
        componentComplexity: 0
      };

      // Test JSON generation performance
      const jsonStartTime = Date.now();
      const flowJson = flowBuilderService.buildFlowJson(screens);
      performanceMetrics.jsonGenerationTime = Date.now() - jsonStartTime;

      // Test validation performance
      const validationStartTime = Date.now();
      validateFlow(screens);
      performanceMetrics.validationTime = Date.now() - validationStartTime;

      // Calculate component complexity
      screens.forEach(screen => {
        screen.elements.forEach(element => {
          let complexity = 1;
          
          // Add complexity for options/items
          if (element.options) complexity += element.options.length * 0.1;
          if (element.dataSource) complexity += element.dataSource.length * 0.1;
          if (element.listItems) complexity += element.listItems.length * 0.2;
          if (element.images) complexity += element.images.length * 0.1;
          
          // Add complexity for conditional logic
          if (element.type === 'If') complexity += 2;
          if (element.type === 'Switch') complexity += (element.cases?.length || 0) * 0.5;
          
          performanceMetrics.componentComplexity += complexity;
        });
      });

      testResult.setDetails(performanceMetrics);

      // Add warnings for performance issues
      if (performanceMetrics.jsonGenerationTime > 1000) {
        testResult.addWarning(`JSON generation is slow (${performanceMetrics.jsonGenerationTime}ms)`);
      }

      if (performanceMetrics.validationTime > 500) {
        testResult.addWarning(`Validation is slow (${performanceMetrics.validationTime}ms)`);
      }

      if (performanceMetrics.componentComplexity > 100) {
        testResult.addWarning(`High component complexity (${performanceMetrics.componentComplexity.toFixed(1)})`);
      }

    } catch (error) {
      testResult.addError('Performance test failed', error.message);
    }

    testResult.setDuration(startTime);
    this.testResults.push(testResult);
  }

  /**
   * Generate test summary
   */
  generateTestSummary(totalDuration) {
    const summary = {
      totalTests: this.testResults.length,
      passedTests: this.testResults.filter(r => r.success).length,
      failedTests: this.testResults.filter(r => !r.success).length,
      totalErrors: this.testResults.reduce((sum, r) => sum + r.errors.length, 0),
      totalWarnings: this.testResults.reduce((sum, r) => sum + r.warnings.length, 0),
      totalDuration,
      testResults: this.testResults,
      timestamp: new Date()
    };

    summary.successRate = (summary.passedTests / summary.totalTests * 100).toFixed(1);

    return summary;
  }

  /**
   * Get test results
   */
  getTestResults() {
    return {
      isRunning: this.isRunning,
      results: this.testResults,
      summary: this.testResults.length > 0 ? this.generateTestSummary(0) : null
    };
  }

  /**
   * Clear test results
   */
  clearResults() {
    this.testResults = [];
    logger.info('Test results cleared');
  }
}

// Create singleton instance
const testRunner = new FlowTestRunner();

module.exports = {
  FlowTestRunner,
  TestResult,
  testRunner
};