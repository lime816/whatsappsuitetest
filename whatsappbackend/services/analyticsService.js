const logger = require('../utils/logger');
const databaseService = require('./databaseService');
const { createErrorHandler } = require('../utils/flowErrorHandler');

/**
 * Analytics service for flow performance and usage tracking
 */
class AnalyticsService {
  constructor() {
    this.errorHandler = createErrorHandler('AnalyticsService');
    this.metricsBuffer = new Map(); // Temporary storage for high-frequency metrics
    this.flushInterval = 60000; // Flush metrics every minute
    
    // Start metrics flushing
    this.startMetricsFlushing();
  }

  /**
   * Track flow usage event
   */
  async trackFlowUsage(flowId, eventType, metadata = {}) {
    try {
      const metric = {
        metricType: `flow_${eventType}`,
        metricValue: {
          flowId,
          eventType,
          timestamp: new Date(),
          ...metadata
        },
        timestamp: new Date(),
        metadata: {
          source: 'flow_usage',
          ...metadata
        }
      };

      // Buffer high-frequency events
      if (this.isHighFrequencyEvent(eventType)) {
        this.bufferMetric(flowId, metric);
      } else {
        // Store immediately for important events
        await this.storeMetric(metric);
      }

      logger.debug('Flow usage tracked', {
        flowId,
        eventType,
        buffered: this.isHighFrequencyEvent(eventType)
      });

    } catch (error) {
      logger.error('Error tracking flow usage:', error);
    }
  }

  /**
   * Track flow completion
   */
  async trackFlowCompletion(flowId, contactId, formData, completionTime) {
    try {
      await this.trackFlowUsage(flowId, 'completion', {
        contactId,
        completionTime,
        formFieldCount: Object.keys(formData || {}).length,
        hasFormData: !!formData
      });

      // Store form submission
      if (formData) {
        await databaseService.createFormSubmission({
          contactId,
          flowId,
          formData,
          status: 'completed'
        });
      }

      logger.info('Flow completion tracked', { flowId, contactId });

    } catch (error) {
      logger.error('Error tracking flow completion:', error);
    }
  }

  /**
   * Track flow abandonment
   */
  async trackFlowAbandonment(flowId, contactId, lastScreenId, timeSpent) {
    try {
      await this.trackFlowUsage(flowId, 'abandonment', {
        contactId,
        lastScreenId,
        timeSpent,
        abandonmentPoint: lastScreenId
      });

      logger.info('Flow abandonment tracked', { flowId, contactId, lastScreenId });

    } catch (error) {
      logger.error('Error tracking flow abandonment:', error);
    }
  }

  /**
   * Track screen interaction
   */
  async trackScreenInteraction(flowId, screenId, contactId, interactionType, elementId = null) {
    try {
      await this.trackFlowUsage(flowId, 'screen_interaction', {
        contactId,
        screenId,
        interactionType,
        elementId
      });

    } catch (error) {
      logger.error('Error tracking screen interaction:', error);
    }
  }

  /**
   * Get flow analytics summary
   */
  async getFlowAnalytics(flowId, period = '7d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      // Calculate start date based on period
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(endDate.getDate() - 90);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get metrics from database
      const metrics = await databaseService.getAnalyticsByFlow(flowId, startDate, endDate);
      
      // Process metrics into analytics summary
      const analytics = this.processMetricsIntoAnalytics(metrics, period);
      
      return this.errorHandler.handleSuccess(
        'Flow analytics retrieved successfully',
        analytics,
        { operation: 'getFlowAnalytics', flowId, period }
      );

    } catch (error) {
      logger.error('Error getting flow analytics:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'getFlowAnalytics',
        flowId,
        period
      });
    }
  }

  /**
   * Get flow performance metrics
   */
  async getFlowPerformance(flowId, period = '7d') {
    try {
      const analytics = await this.getFlowAnalytics(flowId, period);
      
      if (!analytics.success) {
        return analytics;
      }

      const data = analytics.data;
      
      // Calculate performance metrics
      const performance = {
        completionRate: this.calculateCompletionRate(data),
        averageCompletionTime: this.calculateAverageCompletionTime(data),
        dropOffAnalysis: this.calculateDropOffAnalysis(data),
        popularScreens: this.calculatePopularScreens(data),
        errorRate: this.calculateErrorRate(data),
        userEngagement: this.calculateUserEngagement(data)
      };

      return this.errorHandler.handleSuccess(
        'Flow performance metrics calculated',
        performance,
        { operation: 'getFlowPerformance', flowId, period }
      );

    } catch (error) {
      logger.error('Error calculating flow performance:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'getFlowPerformance',
        flowId,
        period
      });
    }
  }

  /**
   * Get system-wide analytics
   */
  async getSystemAnalytics(period = '7d') {
    try {
      const endDate = new Date();
      const startDate = new Date();
      
      switch (period) {
        case '1d':
          startDate.setDate(endDate.getDate() - 1);
          break;
        case '7d':
          startDate.setDate(endDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(endDate.getDate() - 30);
          break;
        default:
          startDate.setDate(endDate.getDate() - 7);
      }

      // Get all metrics for the period
      const allMetrics = await databaseService.getAnalytics(startDate, endDate);
      
      // Process into system analytics
      const systemAnalytics = {
        totalFlows: await this.getTotalFlowCount(),
        totalInteractions: this.countMetricsByType(allMetrics, 'flow_start'),
        totalCompletions: this.countMetricsByType(allMetrics, 'flow_completion'),
        totalAbandonments: this.countMetricsByType(allMetrics, 'flow_abandonment'),
        averageCompletionRate: this.calculateSystemCompletionRate(allMetrics),
        topPerformingFlows: this.getTopPerformingFlows(allMetrics),
        systemHealth: await this.getSystemHealth(),
        period: {
          start: startDate,
          end: endDate,
          duration: period
        }
      };

      return this.errorHandler.handleSuccess(
        'System analytics retrieved successfully',
        systemAnalytics,
        { operation: 'getSystemAnalytics', period }
      );

    } catch (error) {
      logger.error('Error getting system analytics:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'getSystemAnalytics',
        period
      });
    }
  }

  /**
   * Generate analytics report
   */
  async generateAnalyticsReport(flowId = null, period = '7d', format = 'json') {
    try {
      let reportData;
      
      if (flowId) {
        // Generate flow-specific report
        const analytics = await this.getFlowAnalytics(flowId, period);
        const performance = await this.getFlowPerformance(flowId, period);
        
        reportData = {
          type: 'flow_report',
          flowId,
          period,
          analytics: analytics.success ? analytics.data : null,
          performance: performance.success ? performance.data : null,
          generatedAt: new Date()
        };
      } else {
        // Generate system-wide report
        const systemAnalytics = await this.getSystemAnalytics(period);
        
        reportData = {
          type: 'system_report',
          period,
          analytics: systemAnalytics.success ? systemAnalytics.data : null,
          generatedAt: new Date()
        };
      }

      // Format report based on requested format
      let formattedReport;
      switch (format) {
        case 'csv':
          formattedReport = this.formatReportAsCSV(reportData);
          break;
        case 'pdf':
          formattedReport = await this.formatReportAsPDF(reportData);
          break;
        default:
          formattedReport = reportData;
      }

      return this.errorHandler.handleSuccess(
        'Analytics report generated successfully',
        {
          report: formattedReport,
          format,
          size: JSON.stringify(formattedReport).length
        },
        { operation: 'generateAnalyticsReport', flowId, period, format }
      );

    } catch (error) {
      logger.error('Error generating analytics report:', error);
      return this.errorHandler.handleApiError(error, {
        operation: 'generateAnalyticsReport',
        flowId,
        period,
        format
      });
    }
  }

  // === HELPER METHODS ===

  /**
   * Check if event type is high frequency
   */
  isHighFrequencyEvent(eventType) {
    const highFrequencyEvents = [
      'screen_view',
      'element_interaction',
      'screen_interaction'
    ];
    return highFrequencyEvents.includes(eventType);
  }

  /**
   * Buffer metric for batch processing
   */
  bufferMetric(flowId, metric) {
    if (!this.metricsBuffer.has(flowId)) {
      this.metricsBuffer.set(flowId, []);
    }
    
    this.metricsBuffer.get(flowId).push(metric);
  }

  /**
   * Store metric in database
   */
  async storeMetric(metric) {
    try {
      await databaseService.createAnalytic(metric);
    } catch (error) {
      logger.error('Error storing metric:', error);
    }
  }

  /**
   * Start metrics flushing interval
   */
  startMetricsFlushing() {
    setInterval(async () => {
      await this.flushBufferedMetrics();
    }, this.flushInterval);
  }

  /**
   * Flush buffered metrics to database
   */
  async flushBufferedMetrics() {
    if (this.metricsBuffer.size === 0) return;

    try {
      const allMetrics = [];
      
      for (const [flowId, metrics] of this.metricsBuffer.entries()) {
        allMetrics.push(...metrics);
      }

      if (allMetrics.length > 0) {
        await databaseService.createAnalyticsBatch(allMetrics);
        logger.debug('Flushed buffered metrics', { count: allMetrics.length });
      }

      // Clear buffer
      this.metricsBuffer.clear();

    } catch (error) {
      logger.error('Error flushing buffered metrics:', error);
    }
  }

  /**
   * Process raw metrics into analytics summary
   */
  processMetricsIntoAnalytics(metrics, period) {
    const analytics = {
      period,
      totalEvents: metrics.length,
      eventsByType: {},
      timeline: {},
      uniqueUsers: new Set(),
      screens: {},
      completions: 0,
      abandonments: 0,
      averageSessionTime: 0
    };

    // Process each metric
    metrics.forEach(metric => {
      const eventType = metric.metricType.replace('flow_', '');
      const value = metric.metricValue;
      
      // Count by type
      analytics.eventsByType[eventType] = (analytics.eventsByType[eventType] || 0) + 1;
      
      // Timeline data (group by day)
      const day = metric.timestamp.toISOString().split('T')[0];
      if (!analytics.timeline[day]) {
        analytics.timeline[day] = {};
      }
      analytics.timeline[day][eventType] = (analytics.timeline[day][eventType] || 0) + 1;
      
      // Track unique users
      if (value.contactId) {
        analytics.uniqueUsers.add(value.contactId);
      }
      
      // Screen analytics
      if (value.screenId) {
        if (!analytics.screens[value.screenId]) {
          analytics.screens[value.screenId] = {
            views: 0,
            interactions: 0,
            abandonments: 0
          };
        }
        
        if (eventType === 'screen_interaction') {
          analytics.screens[value.screenId].interactions++;
        } else if (eventType === 'abandonment' && value.lastScreenId === value.screenId) {
          analytics.screens[value.screenId].abandonments++;
        }
      }
      
      // Count completions and abandonments
      if (eventType === 'completion') {
        analytics.completions++;
      } else if (eventType === 'abandonment') {
        analytics.abandonments++;
      }
    });

    // Convert unique users set to count
    analytics.uniqueUsers = analytics.uniqueUsers.size;

    return analytics;
  }

  /**
   * Calculate completion rate
   */
  calculateCompletionRate(analytics) {
    const total = analytics.completions + analytics.abandonments;
    return total > 0 ? (analytics.completions / total * 100).toFixed(2) : 0;
  }

  /**
   * Calculate average completion time
   */
  calculateAverageCompletionTime(analytics) {
    // This would require session tracking - simplified for now
    return 0; // TODO: Implement session time tracking
  }

  /**
   * Calculate drop-off analysis
   */
  calculateDropOffAnalysis(analytics) {
    const dropOff = [];
    
    for (const [screenId, screenData] of Object.entries(analytics.screens)) {
      const dropOffRate = screenData.views > 0 ? 
        (screenData.abandonments / screenData.views * 100).toFixed(2) : 0;
      
      dropOff.push({
        screenId,
        views: screenData.views,
        abandonments: screenData.abandonments,
        dropOffRate: parseFloat(dropOffRate)
      });
    }
    
    return dropOff.sort((a, b) => b.dropOffRate - a.dropOffRate);
  }

  /**
   * Calculate popular screens
   */
  calculatePopularScreens(analytics) {
    return Object.entries(analytics.screens)
      .map(([screenId, data]) => ({
        screenId,
        interactions: data.interactions,
        views: data.views
      }))
      .sort((a, b) => b.interactions - a.interactions)
      .slice(0, 10);
  }

  /**
   * Calculate error rate
   */
  calculateErrorRate(analytics) {
    const errors = analytics.eventsByType.error || 0;
    const total = analytics.totalEvents;
    return total > 0 ? (errors / total * 100).toFixed(2) : 0;
  }

  /**
   * Calculate user engagement
   */
  calculateUserEngagement(analytics) {
    const avgInteractionsPerUser = analytics.uniqueUsers > 0 ? 
      (analytics.eventsByType.screen_interaction || 0) / analytics.uniqueUsers : 0;
    
    return {
      uniqueUsers: analytics.uniqueUsers,
      totalInteractions: analytics.eventsByType.screen_interaction || 0,
      averageInteractionsPerUser: avgInteractionsPerUser.toFixed(2)
    };
  }

  /**
   * Get additional helper methods for system analytics
   */
  async getTotalFlowCount() {
    try {
      const flows = await databaseService.getAllFlows();
      return flows.length;
    } catch (error) {
      return 0;
    }
  }

  countMetricsByType(metrics, type) {
    return metrics.filter(m => m.metricType === type).length;
  }

  calculateSystemCompletionRate(metrics) {
    const completions = this.countMetricsByType(metrics, 'flow_completion');
    const abandonments = this.countMetricsByType(metrics, 'flow_abandonment');
    const total = completions + abandonments;
    return total > 0 ? (completions / total * 100).toFixed(2) : 0;
  }

  getTopPerformingFlows(metrics) {
    const flowStats = {};
    
    metrics.forEach(metric => {
      const flowId = metric.metricValue.flowId;
      if (!flowId) return;
      
      if (!flowStats[flowId]) {
        flowStats[flowId] = { completions: 0, abandonments: 0, interactions: 0 };
      }
      
      if (metric.metricType === 'flow_completion') {
        flowStats[flowId].completions++;
      } else if (metric.metricType === 'flow_abandonment') {
        flowStats[flowId].abandonments++;
      } else if (metric.metricType === 'flow_screen_interaction') {
        flowStats[flowId].interactions++;
      }
    });
    
    return Object.entries(flowStats)
      .map(([flowId, stats]) => ({
        flowId,
        ...stats,
        completionRate: stats.completions + stats.abandonments > 0 ? 
          (stats.completions / (stats.completions + stats.abandonments) * 100).toFixed(2) : 0
      }))
      .sort((a, b) => parseFloat(b.completionRate) - parseFloat(a.completionRate))
      .slice(0, 10);
  }

  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date()
    };
  }

  formatReportAsCSV(reportData) {
    // Simple CSV formatting - would be more sophisticated in production
    return JSON.stringify(reportData); // Placeholder
  }

  async formatReportAsPDF(reportData) {
    // PDF generation would require a library like puppeteer or pdfkit
    return reportData; // Placeholder
  }
}

// Create singleton instance
const analyticsService = new AnalyticsService();

module.exports = {
  AnalyticsService,
  analyticsService
};