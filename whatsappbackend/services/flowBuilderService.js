const logger = require('../utils/logger');
const databaseService = require('./databaseService');
const { WhatsAppService } = require('./whatsappService');

// Flow JSON 7.3 version-specific features and validation
const FLOW_JSON_VERSION = '7.3';
const DATA_API_VERSION = '4.0';

// Facebook Flow JSON 7.3 specifications
const FLOW_LIMITS = {
  MAX_SCREENS: 20,
  MAX_COMPONENTS_PER_SCREEN: 50,
  MAX_FORM_COMPONENTS_PER_SCREEN: 20,
  MAX_TEXT_LENGTH: {
    TextHeading: 80,
    TextSubheading: 80,
    TextBody: 4096,
    TextCaption: 400,
    RichText: 4096
  },
  MAX_INPUT_LENGTH: {
    TextInput: 128,
    TextArea: 4096,
    label: 40,
    helperText: 80,
    description: 300
  }
};

class FlowBuilderService {
  constructor() {
    this.whatsappService = new WhatsAppService();
  }

  /**
   * Build WhatsApp Flow JSON from screen data
   */
  buildFlowJson(screens) {
    logger.info('🔨 Building Flow JSON from screens', { screenCount: screens.length });
    
    // CRITICAL: If no screens provided, return empty structure
    if (!screens || screens.length === 0) {
      logger.warn('⚠️ No screens provided to buildFlowJson');
      return {
        version: FLOW_JSON_VERSION,
        data_api_version: DATA_API_VERSION,
        screens: []
      };
    }

    // Validate Flow JSON 7.3 limits
    this.validateFlowLimits(screens);

    const flowJson = {
      version: FLOW_JSON_VERSION,
      data_api_version: DATA_API_VERSION
    };
    
    // Build routing model if there are multiple screens
    if (screens.length > 1) {
      const routingModel = {};
      screens.forEach((screen) => {
        const nextScreens = [];
        
        // Check Footer navigation
        const footer = screen.elements.find(e => e.type === 'Footer');
        if (footer && footer.action === 'navigate' && footer.nextScreen) {
          nextScreens.push(footer.nextScreen);
        }
        
        // Check NavigationList items
        const navList = screen.elements.find(e => e.type === 'NavigationList');
        if (navList && navList.listItems) {
          navList.listItems.forEach((item) => {
            if (item.nextScreen && !nextScreens.includes(item.nextScreen)) {
              nextScreens.push(item.nextScreen);
            }
          });
        }
        
        routingModel[screen.id] = nextScreens;
      });
      flowJson.routing_model = routingModel;
    }
    
    // Build screens array - this is THE MOST CRITICAL PART
    flowJson.screens = screens.map((screen, index) => {
      logger.debug(`🔨 Building screen ${index}:`, screen.id, screen.title);
      return this.buildScreen(screen, index, screens);
    });
    
    // Add global data model schema for dynamic components
    const globalDataModel = this.generateGlobalDataModel(screens);
    if (Object.keys(globalDataModel).length > 0) {
      flowJson.data = globalDataModel;
    }
    
    // Validate the final JSON against Flow JSON 7.3 specifications
    this.validateFlowJson(flowJson);
    
    logger.info('✅ Flow JSON built successfully', { 
      screens: flowJson.screens.length,
      hasRouting: !!flowJson.routing_model,
      hasGlobalData: !!flowJson.data
    });
    
    return flowJson;
  }

  /**
   * Create or update a flow with automatic WhatsApp sync
   */
  async createOrUpdateFlow(flowData) {
    try {
      const { screens, flowName, flowId } = flowData;
      
      // Generate WhatsApp Flow JSON
      const whatsappFlowJson = this.buildFlowJson(screens);
      
      // Store in database
      const storedFlow = await this.storeFlow({
        flowId,
        name: flowName,
        screens,
        whatsappJson: whatsappFlowJson,
        status: 'DRAFT'
      });
      
      // Auto-sync with WhatsApp if flowId exists
      let whatsappResult = null;
      if (flowId) {
        try {
          whatsappResult = await this.syncWithWhatsApp(flowId, whatsappFlowJson, flowName);
          
          // Update status based on WhatsApp sync
          await this.updateFlowStatus(storedFlow.id, 'SYNCED');
        } catch (whatsappError) {
          logger.error('WhatsApp sync failed:', whatsappError);
          await this.updateFlowStatus(storedFlow.id, 'SYNC_FAILED');
        }
      }
      
      return {
        success: true,
        flow: storedFlow,
        whatsappJson: whatsappFlowJson,
        whatsappSync: whatsappResult,
        message: 'Flow created/updated successfully'
      };
      
    } catch (error) {
      logger.error('Error creating/updating flow:', error);
      throw error;
    }
  }

  /**
   * Store flow in database
   */
  async storeFlow(flowData) {
    try {
      const existingFlow = flowData.flowId ? 
        await databaseService.getFlowByFlowId(flowData.flowId) : null;
      
      if (existingFlow) {
        // Update existing flow
        return await databaseService.updateFlow(existingFlow.id, {
          name: flowData.name,
          flowData: {
            screens: flowData.screens,
            whatsappJson: flowData.whatsappJson,
            version: FLOW_JSON_VERSION,
            updatedAt: new Date().toISOString()
          },
          status: flowData.status,
          version: FLOW_JSON_VERSION
        });
      } else {
        // Create new flow
        return await databaseService.createFlow({
          flowId: flowData.flowId || `flow_${Date.now()}`,
          name: flowData.name,
          description: `Flow created with ${flowData.screens.length} screens`,
          version: FLOW_JSON_VERSION,
          status: flowData.status,
          flowData: {
            screens: flowData.screens,
            whatsappJson: flowData.whatsappJson,
            version: FLOW_JSON_VERSION,
            createdAt: new Date().toISOString()
          }
        });
      }
    } catch (error) {
      logger.error('Error storing flow:', error);
      throw error;
    }
  }

  /**
   * Sync flow with WhatsApp Business API
   */
  async syncWithWhatsApp(flowId, whatsappJson, flowName) {
    try {
      logger.info(`🔄 Syncing flow ${flowId} with WhatsApp`);
      
      // Upload flow JSON to WhatsApp
      const uploadResult = await this.whatsappService.updateFlowWithBuilderJson(
        flowId, 
        whatsappJson, 
        flowName
      );
      
      logger.info('✅ WhatsApp sync completed', { flowId, uploadResult });
      return uploadResult;
      
    } catch (error) {
      logger.error('❌ WhatsApp sync failed:', error);
      throw error;
    }
  }

  /**
   * Update flow status
   */
  async updateFlowStatus(flowId, status) {
    try {
      return await databaseService.updateFlow(flowId, { status });
    } catch (error) {
      logger.error('Error updating flow status:', error);
      throw error;
    }
  }

  /**
   * Get flow with generated JSON
   */
  async getFlowWithJson(flowId) {
    try {
      const flow = await databaseService.getFlowByFlowId(flowId);
      if (!flow) {
        throw new Error(`Flow ${flowId} not found`);
      }
      
      // Regenerate JSON if needed
      const screens = flow.flowData?.screens || [];
      const whatsappJson = this.buildFlowJson(screens);
      
      return {
        ...flow,
        generatedJson: whatsappJson,
        screens
      };
    } catch (error) {
      logger.error('Error getting flow with JSON:', error);
      throw error;
    }
  }

  // === VALIDATION METHODS ===
  
  validateFlowLimits(screens) {
    // Validate screen count
    if (screens.length > FLOW_LIMITS.MAX_SCREENS) {
      logger.warn(`⚠️ Flow exceeds maximum screens: ${screens.length}/${FLOW_LIMITS.MAX_SCREENS}`);
    }

    screens.forEach((screen) => {
      // Validate component count per screen
      if (screen.elements.length > FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN) {
        logger.warn(`⚠️ Screen ${screen.id} exceeds maximum components: ${screen.elements.length}/${FLOW_LIMITS.MAX_COMPONENTS_PER_SCREEN}`);
      }

      // Validate form component count
      const formComponents = screen.elements.filter(el => this.isFormElement({ type: el.type }));
      if (formComponents.length > FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN) {
        logger.warn(`⚠️ Screen ${screen.id} exceeds maximum form components: ${formComponents.length}/${FLOW_LIMITS.MAX_FORM_COMPONENTS_PER_SCREEN}`);
      }

      // Validate text length limits
      screen.elements.forEach(el => {
        if (el.text && typeof el.text === 'string') {
          const limit = FLOW_LIMITS.MAX_TEXT_LENGTH[el.type];
          if (limit && el.text.length > limit) {
            logger.warn(`⚠️ ${el.type} text exceeds limit: ${el.text.length}/${limit} chars`);
          }
        }
      });
    });
  }

  validateFlowJson(flowJson) {
    // Validate required top-level properties
    if (!flowJson.version) {
      logger.error('❌ Missing required property: version');
    }
    
    if (!flowJson.data_api_version) {
      logger.error('❌ Missing required property: data_api_version');
    }
    
    if (!flowJson.screens || !Array.isArray(flowJson.screens)) {
      logger.error('❌ Missing or invalid screens array');
      return;
    }
    
    // Validate each screen
    flowJson.screens.forEach((screen, index) => {
      if (!screen.id) {
        logger.error(`❌ Screen ${index}: Missing required property 'id'`);
      }
      
      if (!screen.title) {
        logger.error(`❌ Screen ${screen.id}: Missing required property 'title'`);
      }
      
      if (!screen.layout || !screen.layout.type) {
        logger.error(`❌ Screen ${screen.id}: Missing or invalid layout`);
      }
      
      if (!screen.layout.children || !Array.isArray(screen.layout.children)) {
        logger.error(`❌ Screen ${screen.id}: Missing or invalid layout children`);
      }
      
      // Validate terminal screens
      if (screen.terminal && typeof screen.success !== 'boolean') {
        logger.error(`❌ Screen ${screen.id}: Terminal screen missing success property`);
      }
    });
    
    logger.debug('✅ Flow JSON validation completed');
  }

  // === HELPER METHODS ===
  // (Include all the helper methods from the frontend jsonBuilder.ts)
  // buildScreen, mapElement, generateGlobalDataModel, etc.
  
  buildScreen(screen, screenIndex, allScreens) {
    // Implementation from frontend jsonBuilder.ts
    // ... (copy the buildScreen method)
  }

  mapElement(element, screenIndex, elementIndex, currentScreen, allScreens) {
    // Implementation from frontend jsonBuilder.ts  
    // ... (copy the mapElement method)
  }

  generateGlobalDataModel(screens) {
    // Implementation from frontend jsonBuilder.ts
    // ... (copy the generateGlobalDataModel method)
  }

  isFormElement(element) {
    const formElementTypes = [
      'TextInput', 'EmailInput', 'PasswordInput', 'PhoneInput', 'TextArea',
      'CheckboxGroup', 'RadioButtonsGroup', 'ChipsSelector', 'Dropdown', 'OptIn',
      'DatePicker', 'CalendarPicker',
      'PhotoPicker', 'DocumentPicker',
      'Footer'
    ];
    return formElementTypes.includes(element.type);
  }
}

// Export singleton instance
const flowBuilderService = new FlowBuilderService();

module.exports = {
  FlowBuilderService,
  flowBuilderService
};