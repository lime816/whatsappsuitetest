const logger = require('../utils/logger');
const databaseService = require('./databaseService');
const { WhatsAppService } = require('./whatsappService');
const { validateFlow, validateScreen } = require('../utils/componentValidation');
const { createErrorHandler } = require('../utils/flowErrorHandler');
const { nanoid } = require('nanoid');

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
    this.errorHandler = createErrorHandler('FlowBuilderService');
  }

  /**
   * Build WhatsApp Flow JSON from screen data with validation
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

    // Validate flow before building JSON
    const validation = validateFlow(screens);
    if (!validation.isValid) {
      const errorMessage = `Flow validation failed: ${validation.errors.map(e => e.message).join(', ')}`;
      logger.error(errorMessage);
      throw new Error(errorMessage);
    }

    // Log warnings but continue
    if (validation.warnings.length > 0) {
      logger.warn('Flow validation warnings:', validation.warnings.map(w => w.message));
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
   * Create or update a flow with automatic WhatsApp sync and validation
   */
  async createOrUpdateFlow(flowData) {
    try {
      const { screens, flowName, flowId } = flowData;
      
      // Validate input
      if (!screens || !Array.isArray(screens) || screens.length === 0) {
        throw new Error('Screens array is required and must not be empty');
      }
      
      if (!flowName || !flowName.trim()) {
        throw new Error('Flow name is required');
      }
      
      // Validate flow structure
      const validation = validateFlow(screens);
      if (!validation.isValid) {
        return this.errorHandler.handleValidationError(validation, {
          operation: 'createOrUpdateFlow',
          flowName,
          flowId
        });
      }
      
      // Generate WhatsApp Flow JSON
      const whatsappFlowJson = this.buildFlowJson(screens);
      
      // Store in database
      const storedFlow = await this.storeFlow({
        flowId,
        name: flowName.trim(),
        screens,
        whatsappJson: whatsappFlowJson,
        status: 'DRAFT'
      });
      
      // Auto-sync with WhatsApp if flowId exists
      let whatsappResult = null;
      if (flowId) {
        try {
          whatsappResult = await this.syncWithWhatsApp(flowId, whatsappFlowJson, flowName.trim());
          
          // Update status based on WhatsApp sync
          await this.updateFlowStatus(storedFlow.id, 'SYNCED');
        } catch (whatsappError) {
          logger.error('WhatsApp sync failed:', whatsappError);
          await this.updateFlowStatus(storedFlow.id, 'SYNC_FAILED');
          
          // Return partial success with sync error
          return {
            success: true,
            flow: storedFlow,
            whatsappJson: whatsappFlowJson,
            whatsappSync: null,
            syncError: whatsappError.message,
            message: 'Flow created/updated but WhatsApp sync failed'
          };
        }
      }
      
      return this.errorHandler.handleSuccess(
        'Flow created/updated successfully',
        {
          flow: storedFlow,
          whatsappJson: whatsappFlowJson,
          whatsappSync: whatsappResult,
          validation: {
            isValid: validation.isValid,
            warnings: validation.warnings
          }
        },
        { operation: 'createOrUpdateFlow', flowName, flowId }
      );
      
    } catch (error) {
      logger.error('Error creating/updating flow:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'createOrUpdateFlow',
        flowName: flowData.flowName,
        flowId: flowData.flowId
      });
    }
  }

  /**
   * Get all flows with optional filtering
   */
  async getAllFlows(filters = {}) {
    try {
      const flows = await databaseService.getAllFlows(filters);
      
      return this.errorHandler.handleSuccess(
        'Flows retrieved successfully',
        flows,
        { operation: 'getAllFlows', filters }
      );
      
    } catch (error) {
      logger.error('Error getting all flows:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'getAllFlows',
        filters
      });
    }
  }

  /**
   * Delete a flow
   */
  async deleteFlow(flowId) {
    try {
      // Get flow details first
      const flow = await databaseService.getFlowByFlowId(flowId);
      if (!flow) {
        throw new Error(`Flow ${flowId} not found`);
      }
      
      // Delete from database
      await databaseService.deleteFlow(flow.id);
      
      // Optionally delete from WhatsApp (if needed)
      // Note: WhatsApp flows might need to be archived rather than deleted
      
      return this.errorHandler.handleSuccess(
        'Flow deleted successfully',
        { flowId },
        { operation: 'deleteFlow', flowId }
      );
      
    } catch (error) {
      logger.error('Error deleting flow:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'deleteFlow',
        flowId
      });
    }
  }

  /**
   * Validate flow without creating
   */
  async validateFlowOnly(screens) {
    try {
      if (!screens || !Array.isArray(screens)) {
        throw new Error('Screens array is required');
      }
      
      // Run comprehensive validation
      const validation = validateFlow(screens);
      
      // Try to generate JSON to catch any generation errors
      let jsonGenerationResult = null;
      try {
        const flowJson = this.buildFlowJson(screens);
        jsonGenerationResult = {
          success: true,
          version: flowJson.version,
          screenCount: flowJson.screens.length,
          hasRouting: !!flowJson.routing_model,
          hasGlobalData: !!flowJson.data
        };
      } catch (jsonError) {
        jsonGenerationResult = {
          success: false,
          error: jsonError.message
        };
      }
      
      return this.errorHandler.handleSuccess(
        'Flow validation completed',
        {
          validation: {
            isValid: validation.isValid,
            errors: validation.errors,
            warnings: validation.warnings
          },
          jsonGeneration: jsonGenerationResult,
          screenCount: screens.length
        },
        { operation: 'validateFlowOnly' }
      );
      
    } catch (error) {
      logger.error('Error validating flow:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'validateFlowOnly'
      });
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
      
      return this.errorHandler.handleSuccess(
        'Flow retrieved successfully',
        {
          ...flow,
          generatedJson: whatsappJson,
          screens
        },
        { operation: 'getFlowWithJson', flowId }
      );
      
    } catch (error) {
      logger.error('Error getting flow with JSON:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'getFlowWithJson',
        flowId
      });
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
  
  buildScreen(screen, screenIndex, allScreens) {
    logger.debug(`📄 buildScreen: ${screen.id} - "${screen.title}"`);
    logger.debug(`   Elements count: ${screen.elements.length}`);
    logger.debug(`   Element order: ${screen.elements.map((el, idx) => `${idx}:${el.type}(${el.id})`).join(', ')}`);
    
    // Map all elements - CRITICAL: Maintain exact order from screens array
    const elements = screen.elements.map((el, ei) => {
      const mapped = this.mapElement(el, screenIndex, ei, screen, allScreens);
      logger.debug(`   ✓ Mapped element ${ei}: ${el.type}(${el.id}) -> ${mapped.type}`);
      return mapped;
    });
    
    // Separate form elements from non-form elements while preserving relative order
    const formElements = elements.filter(el => this.isFormElement(el));
    const nonFormElements = elements.filter(el => !this.isFormElement(el));
    
    logger.debug(`   Form elements: ${formElements.length}, Non-form: ${nonFormElements.length}`);
    
    const children = [];
    
    // Add non-form elements first (in their original order)
    children.push(...nonFormElements);
    
    // If there are form elements, wrap them in a Form component
    if (formElements.length > 0) {
      // CRITICAL: Footer MUST be the last element in Form children
      // BUT maintain the relative order of other form elements
      const footerElements = formElements.filter(el => el.type === 'Footer');
      const otherFormElements = formElements.filter(el => el.type !== 'Footer');
      
      children.push({
        type: 'Form',
        name: 'flow_path',
        children: [...otherFormElements, ...footerElements]  // Footer at the end
      });
    }
    
    const screenObj = {
      id: screen.id,
      title: screen.title,
      layout: {
        type: 'SingleColumnLayout',
        children: children
      }
    };

    // Check if this is a terminal screen
    const footer = screen.elements.find(e => e.type === 'Footer');
    if (footer && footer.action === 'complete') {
      screenObj.terminal = true;
      screenObj.success = true;
      screenObj.data = {};
      logger.debug(`   ✓ Terminal screen: ${screen.id}`);
    }

    // Add enhanced data schema from previous screens for navigation
    if (screenIndex > 0 && (!footer || footer.action !== 'complete')) {
      const dataSchema = {};
      
      // Collect all form fields from previous screens with enhanced schema
      for (let i = 0; i < screenIndex; i++) {
        const prevScreen = allScreens[i];
        prevScreen.elements.forEach(el => {
          if (el.name) {
            const fieldSchema = this.generateFieldSchema(el);
            if (fieldSchema) {
              dataSchema[el.name] = fieldSchema;
            }
          }
        });
      }
      
      // Add current screen's conditional data requirements
      screen.elements.forEach(el => {
        if (el.type === 'If' && el.condition) {
          const conditionVars = this.extractDataVariables(el.condition);
          conditionVars.forEach(varName => {
            if (!dataSchema[varName]) {
              dataSchema[varName] = {
                type: 'boolean',
                __example__: true,
                __description__: `Condition variable for If component`
              };
            }
          });
        }
        
        if (el.type === 'Switch' && el.value) {
          const switchVars = this.extractDataVariables(el.value);
          switchVars.forEach(varName => {
            if (!dataSchema[varName]) {
              dataSchema[varName] = {
                type: 'string',
                __example__: 'default_value',
                __description__: `Switch value variable`
              };
            }
          });
        }
      });
      
      if (Object.keys(dataSchema).length > 0) {
        screenObj.data = dataSchema;
      }
    }

    logger.debug(`   ✅ Screen built:`, screenObj.id);
    return screenObj;
  }

  mapElement(element, screenIndex, elementIndex, currentScreen, allScreens) {
    switch (element.type) {
      case 'TextHeading':
        return { type: 'TextHeading', text: element.text, ...(element.visible !== undefined && { visible: element.visible }) };
      
      case 'TextSubheading':
        return { type: 'TextSubheading', text: element.text, ...(element.visible !== undefined && { visible: element.visible }) };
      
      case 'TextBody': {
        const result = { type: 'TextBody', text: element.text };
        if (element.fontWeight) result['font-weight'] = element.fontWeight;
        if (element.strikethrough) result.strikethrough = element.strikethrough;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.markdown) result.markdown = element.markdown;
        return result;
      }
      
      case 'TextCaption': {
        const result = { type: 'TextCaption', text: element.text };
        if (element.fontWeight) result['font-weight'] = element.fontWeight;
        if (element.strikethrough) result.strikethrough = element.strikethrough;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.markdown) result.markdown = element.markdown;
        return result;
      }
      
      case 'RichText': {
        const result = { type: 'RichText', text: element.text };
        if (element.visible !== undefined) result.visible = element.visible;
        result.markdown = true; // Flow JSON 7.3 feature: RichText supports markdown by default
        return result;
      }
      
      case 'TextInput': {
        const result = { 
          type: 'TextInput',
          'input-type': element.inputType || 'text',
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.pattern) result.pattern = element.pattern;
        if (element.helperText) result['helper-text'] = element.helperText;
        if (element.minChars) result['min-chars'] = element.minChars;
        if (element.maxChars) result['max-chars'] = element.maxChars;
        if (element.labelVariant) result['label-variant'] = element.labelVariant;
        if (element.initValue) result['init-value'] = element.initValue;
        if (element.errorMessage) result['error-message'] = element.errorMessage;
        return result;
      }
      
      case 'EmailInput': {
        const result = { 
          type: 'TextInput', 
          'input-type': 'email',
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.helperText) result['helper-text'] = element.helperText;
        return result;
      }
      
      case 'PasswordInput': {
        const result = { 
          type: 'TextInput', 
          'input-type': 'password',
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.helperText) result['helper-text'] = element.helperText;
        if (element.minChars) result['min-chars'] = element.minChars;
        if (element.maxChars) result['max-chars'] = element.maxChars;
        return result;
      }
      
      case 'PhoneInput': {
        const result = { 
          type: 'TextInput', 
          'input-type': 'phone',
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.helperText) result['helper-text'] = element.helperText;
        return result;
      }
      
      case 'CheckboxGroup': {
        const result = { 
          type: 'CheckboxGroup', 
          label: element.label, 
          name: element.name, 
          'data-source': element.dataSource
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.minSelectedItems) result['min-selected-items'] = element.minSelectedItems;
        if (element.maxSelectedItems) result['max-selected-items'] = element.maxSelectedItems;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.description) result.description = element.description;
        if (element.onSelectAction) result['on-select-action'] = element.onSelectAction;
        if (element.onUnselectAction) result['on-unselect-action'] = element.onUnselectAction;
        if (element.mediaSize) result['media-size'] = element.mediaSize;
        return result;
      }
      
      case 'RadioButtonsGroup': {
        const result = { 
          type: 'RadioButtonsGroup', 
          label: element.label, 
          name: element.name, 
          'data-source': element.options
        };
        if (element.required !== undefined) result.required = element.required;
        return result;
      }
      
      case 'ChipsSelector': {
        const result = { 
          type: 'ChipsSelector', 
          label: element.label, 
          name: element.name, 
          'data-source': element.dataSource
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.minSelectedItems) result['min-selected-items'] = element.minSelectedItems;
        if (element.maxSelectedItems) result['max-selected-items'] = element.maxSelectedItems;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.description) result.description = element.description;
        if (element.onSelectAction) result['on-select-action'] = element.onSelectAction;
        if (element.onUnselectAction) result['on-unselect-action'] = element.onUnselectAction;
        if (element.mediaSize) result['media-size'] = element.mediaSize;
        return result;
      }
      
      case 'TextArea': {
        const result = { 
          type: 'TextArea', 
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.maxLength) result['max-length'] = element.maxLength;
        if (element.helperText) result['helper-text'] = element.helperText;
        if (element.labelVariant) result['label-variant'] = element.labelVariant;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.initValue) result['init-value'] = element.initValue;
        if (element.errorMessage) result['error-message'] = element.errorMessage;
        return result;
      }
      
      case 'Dropdown': {
        const result = { 
          type: 'Dropdown', 
          label: element.label, 
          name: element.name, 
          'data-source': element.options
        };
        if (element.required !== undefined) result.required = element.required;
        return result;
      }
      
      case 'OptIn': {
        const result = { 
          type: 'OptIn', 
          label: element.label, 
          name: element.name
        };
        if (element.required !== undefined) result.required = element.required;
        if (element.visible !== undefined) result.visible = element.visible;
        return result;
      }
      
      case 'EmbeddedLink': {
        const result = { type: 'EmbeddedLink', text: element.text };
        if (element.url) result['on-click-action'] = { name: 'open_url', url: element.url };
        if (element.visible !== undefined) result.visible = element.visible;
        return result;
      }
      
      case 'DatePicker': {
        const result = { type: 'DatePicker', label: element.label, name: element.name };
        if (element.minDate) result['min-date'] = element.minDate;
        if (element.maxDate) result['max-date'] = element.maxDate;
        if (element.unavailableDates) result['unavailable-dates'] = element.unavailableDates;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.helperText) result['helper-text'] = element.helperText;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.required !== undefined) result.required = element.required;
        return result;
      }
      
      case 'CalendarPicker': {
        const result = { type: 'CalendarPicker', name: element.name, label: element.label };
        if (element.title) result.title = element.title;
        if (element.description) result.description = element.description;
        if (element.helperText) result['helper-text'] = element.helperText;
        if (element.required !== undefined) result.required = element.required;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.mode) result.mode = element.mode;
        if (element.minDate) result['min-date'] = element.minDate;
        if (element.maxDate) result['max-date'] = element.maxDate;
        if (element.unavailableDates) result['unavailable-dates'] = element.unavailableDates;
        return result;
      }
      
      case 'Image': {
        const result = { type: 'Image', src: element.src };
        if (element.width) result.width = element.width;
        if (element.height) result.height = element.height;
        if (element.scaleType) result['scale-type'] = element.scaleType;
        if (element.aspectRatio) result['aspect-ratio'] = element.aspectRatio;
        if (element.altText) result['alt-text'] = element.altText;
        return result;
      }
      
      case 'ImageCarousel': {
        const result = { 
          type: 'ImageCarousel', 
          images: element.images?.map((img) => ({
            src: img.src,
            ...(img.altText && { 'alt-text': img.altText })
          })) || []
        };
        if (element.aspectRatio) result['aspect-ratio'] = element.aspectRatio;
        if (element.scaleType) result['scale-type'] = element.scaleType;
        return result;
      }
      
      case 'PhotoPicker': {
        const result = { 
          type: 'PhotoPicker', 
          name: element.name,
          label: element.label,
          'photo-source': element.photoSource || 'camera_gallery',
          'min-uploaded-photos': element.minUploadedPhotos !== undefined ? element.minUploadedPhotos : 0,
          'max-uploaded-photos': element.maxUploadedPhotos || 10,
          'max-file-size-kb': element.maxFileSizeKb || 10240
        };
        if (element.description) result.description = element.description;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.errorMessage) result['error-message'] = element.errorMessage;
        return result;
      }
      
      case 'DocumentPicker': {
        const result = { 
          type: 'DocumentPicker', 
          name: element.name,
          label: element.label,
          'min-uploaded-documents': element.minUploadedDocuments !== undefined ? element.minUploadedDocuments : 0,
          'max-uploaded-documents': element.maxUploadedDocuments || 10,
          'max-file-size-kb': element.maxFileSizeKb || 10240
        };
        if (element.description) result.description = element.description;
        if (element.allowedMimeTypes && element.allowedMimeTypes.length > 0) result['allowed-mime-types'] = element.allowedMimeTypes;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        if (element.visible !== undefined) result.visible = element.visible;
        if (element.errorMessage) result['error-message'] = element.errorMessage;
        return result;
      }
      
      case 'NavigationList': {
        const result = { 
          type: 'NavigationList', 
          name: element.name, 
          'list-items': element.listItems.map(item => {
            const listItem = {
              id: item.id,
              'main-content': item.mainContent,
              ...(item.start && { start: item.start }),
              ...(item.end && { end: item.end })
            };
            
            // Add on-click-action for each list item if it has navigation
            if (item.nextScreen) {
              listItem['on-click-action'] = {
                name: 'navigate',
                next: {
                  type: 'screen',
                  name: item.nextScreen
                },
                payload: item.payload || {}
              };
            }
            
            return listItem;
          })
        };
        if (element.label) result.label = element.label;
        if (element.description) result.description = element.description;
        return result;
      }
      
      case 'Footer': {
        const result = {
          type: 'Footer',
          label: element.label
        };
        
        // Add new Footer properties
        if (element.leftCaption) result['left-caption'] = element.leftCaption;
        if (element.centerCaption) result['center-caption'] = element.centerCaption;
        if (element.rightCaption) result['right-caption'] = element.rightCaption;
        if (element.enabled !== undefined) result.enabled = element.enabled;
        
        if (element.action === 'navigate') {
          const payload = {};
          
          // Collect form fields from current screen (exclude Footer itself)
          if (currentScreen) {
            const currentScreenFormFields = currentScreen.elements.filter((elem) => 
              elem.name && elem.type !== 'Footer'
            );
            currentScreenFormFields.forEach((field) => {
              if (field.name) {
                payload[field.name] = `\${form.${field.name}}`;
              }
            });
          }
          
          result['on-click-action'] = {
            name: 'navigate',
            next: {
              type: 'screen',
              name: element.nextScreen
            },
            payload: payload
          };
        } else if (element.action === 'complete') {
          const payload = {};
          
          // Collect form fields from current screen (exclude Footer itself)
          if (currentScreen) {
            const currentScreenFormFields = currentScreen.elements.filter((elem) => 
              elem.name && elem.type !== 'Footer'
            );
            currentScreenFormFields.forEach((field) => {
              if (field.name) {
                payload[field.name] = `\${form.${field.name}}`;
              }
            });
          }
          
          // Collect data from previous screens (exclude Footer)
          if (allScreens) {
            for (let i = 0; i < screenIndex; i++) {
              const prevScreen = allScreens[i];
              prevScreen.elements.forEach((elem) => {
                if (elem.name && elem.type !== 'Footer') {
                  payload[elem.name] = `\${data.${elem.name}}`;
                }
              });
            }
          }
          
          result['on-click-action'] = {
            name: 'complete',
            payload: payload
          };
        }
        
        return result;
      }
      
      default:
        logger.warn(`Unknown element type: ${element.type}`);
        return { type: element.type, ...element };
    }
  }

  generateGlobalDataModel(screens) {
    const dataModel = {};
    
    screens.forEach((screen) => {
      screen.elements.forEach(el => {
        // Add form field data models
        if (el.name) {
          const fieldSchema = this.generateFieldSchema(el);
          if (fieldSchema) {
            dataModel[el.name] = fieldSchema;
          }
        }
        
        // Add conditional component data models
        if (el.type === 'If' && el.condition) {
          const conditionVars = this.extractDataVariables(el.condition);
          conditionVars.forEach(varName => {
            if (!dataModel[varName]) {
              dataModel[varName] = {
                type: 'boolean',
                __example__: true,
                __description__: `Condition variable for If component`
              };
            }
          });
        }
        
        if (el.type === 'Switch' && el.value) {
          const switchVars = this.extractDataVariables(el.value);
          switchVars.forEach(varName => {
            if (!dataModel[varName]) {
              dataModel[varName] = {
                type: 'string',
                __example__: 'default_value',
                __description__: `Switch value variable`
              };
            }
          });
        }
      });
    });
    
    return dataModel;
  }

  generateFieldSchema(element) {
    const baseSchema = {
      __example__: this.getExampleValue(element.type),
      __description__: `Data from ${element.type} component`
    };

    switch (element.type) {
      case 'TextInput':
      case 'EmailInput':
      case 'PasswordInput':
      case 'PhoneInput':
      case 'TextArea':
        return {
          type: 'string',
          ...baseSchema,
          ...(element.maxChars && { maxLength: element.maxChars }),
          ...(element.minChars && { minLength: element.minChars })
        };
      
      case 'CheckboxGroup':
      case 'ChipsSelector':
        return {
          type: 'array',
          items: { type: 'string' },
          ...baseSchema,
          __example__: ['option_1', 'option_2']
        };
      
      case 'RadioButtonsGroup':
      case 'Dropdown':
        return {
          type: 'string',
          ...baseSchema
        };
      
      case 'OptIn':
        return {
          type: 'boolean',
          ...baseSchema,
          __example__: true
        };
      
      case 'DatePicker':
      case 'CalendarPicker':
        return {
          type: 'string',
          format: 'date',
          pattern: '^\\d{4}-\\d{2}-\\d{2}$',
          ...baseSchema,
          __example__: '2024-01-01'
        };
      
      case 'PhotoPicker':
      case 'DocumentPicker':
        return {
          type: 'array',
          items: { type: 'string' },
          ...baseSchema,
          __example__: ['media_id_1'],
          __description__: `Media IDs from ${element.type} component`
        };
      
      default:
        return {
          type: 'string',
          ...baseSchema
        };
    }
  }

  extractDataVariables(expression) {
    const regex = /\$\{data\.([a-zA-Z_][a-zA-Z0-9_]*)\}/g;
    const variables = [];
    let match;
    
    while ((match = regex.exec(expression)) !== null) {
      if (!variables.includes(match[1])) {
        variables.push(match[1]);
      }
    }
    
    return variables;
  }

  getExampleValue(elementType) {
    switch (elementType) {
      case 'TextInput':
        return 'Sample text input';
      case 'EmailInput':
        return 'user@example.com';
      case 'PasswordInput':
        return 'SecurePass123';
      case 'PhoneInput':
        return '+1234567890';
      case 'TextArea':
        return 'Multi-line text content';
      case 'CheckboxGroup':
      case 'ChipsSelector':
        return ['option_1', 'option_2'];
      case 'RadioButtonsGroup':
      case 'Dropdown':
        return 'option_1';
      case 'OptIn':
        return true;
      case 'DatePicker':
      case 'CalendarPicker':
        return '2024-01-01';
      case 'PhotoPicker':
        return ['photo_media_id_1', 'photo_media_id_2'];
      case 'DocumentPicker':
        return ['document_media_id_1'];
      default:
        return 'Sample value';
    }
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