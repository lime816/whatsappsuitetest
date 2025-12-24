const express = require('express');
const databaseService = require('../services/databaseService');
const logger = require('../utils/logger');

const router = express.Router();

// Get analytics dashboard data
router.get('/dashboard', async (req, res) => {
  try {
    const { startDate, endDate, metricType } = req.query;
    
    // Build filters
    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    if (metricType) filters.metricType = metricType;
    
    // Get analytics data
    const analytics = await databaseService.getAnalytics(filters);
    
    // Get summary statistics
    const [
      totalContacts,
      totalMessages,
      totalTriggers,
      totalFlows,
      totalFormSubmissions,
      recentWebhookEvents
    ] = await Promise.all([
      databaseService.prisma.contact.count(),
      databaseService.prisma.messageLog.count(),
      databaseService.prisma.trigger.count({ where: { isActive: true } }),
      databaseService.prisma.flow.count(),
      databaseService.prisma.formSubmission.count(),
      databaseService.prisma.webhookEvent.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' }
      })
    ]);
    
    // Calculate message statistics by type
    const messageStats = await databaseService.prisma.messageLog.groupBy({
      by: ['messageType'],
      _count: { messageType: true },
      where: filters.startDate ? {
        createdAt: {
          gte: filters.startDate,
          ...(filters.endDate && { lte: filters.endDate })
        }
      } : undefined
    });
    
    // Calculate trigger usage statistics
    const triggerStats = await databaseService.prisma.trigger.findMany({
      select: {
        triggerId: true,
        triggerType: true,
        usageCount: true,
        lastUsed: true,
        isActive: true
      },
      orderBy: { usageCount: 'desc' },
      take: 10
    });
    
    // Calculate daily message volume (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const dailyMessageVolume = await databaseService.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as count,
        message_type
      FROM message_logs 
      WHERE created_at >= ${thirtyDaysAgo}
      GROUP BY DATE(created_at), message_type
      ORDER BY date DESC
    `;
    
    // Calculate flow completion rates
    const flowStats = await databaseService.prisma.flow.findMany({
      select: {
        flowId: true,
        name: true,
        _count: {
          select: {
            formSubmissions: true
          }
        }
      }
    });
    
    res.json({
      success: true,
      data: {
        summary: {
          totalContacts,
          totalMessages,
          totalTriggers,
          totalFlows,
          totalFormSubmissions,
          period: {
            startDate: filters.startDate || thirtyDaysAgo,
            endDate: filters.endDate || new Date()
          }
        },
        analytics,
        messageStats: messageStats.map(stat => ({
          type: stat.messageType,
          count: stat._count.messageType
        })),
        triggerStats,
        dailyMessageVolume,
        flowStats: flowStats.map(flow => ({
          flowId: flow.flowId,
          name: flow.name,
          completions: flow._count.formSubmissions
        })),
        recentWebhookEvents: recentWebhookEvents.map(event => ({
          id: event.id,
          eventType: event.eventType,
          processed: event.processed,
          error: event.error,
          createdAt: event.createdAt
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting analytics dashboard:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics data',
      message: error.message
    });
  }
});

// Get message analytics
router.get('/messages', async (req, res) => {
  try {
    const { startDate, endDate, groupBy = 'day' } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    // Message volume over time
    let dateFormat;
    switch (groupBy) {
      case 'hour':
        dateFormat = 'YYYY-MM-DD HH24:00:00';
        break;
      case 'day':
        dateFormat = 'YYYY-MM-DD';
        break;
      case 'week':
        dateFormat = 'YYYY-"W"WW';
        break;
      case 'month':
        dateFormat = 'YYYY-MM';
        break;
      default:
        dateFormat = 'YYYY-MM-DD';
    }
    
    const messageVolume = await databaseService.prisma.$queryRaw`
      SELECT 
        TO_CHAR(created_at, ${dateFormat}) as period,
        message_type,
        status,
        COUNT(*) as count
      FROM message_logs 
      WHERE 1=1
        ${filters.startDate ? `AND created_at >= ${filters.startDate}` : ''}
        ${filters.endDate ? `AND created_at <= ${filters.endDate}` : ''}
      GROUP BY TO_CHAR(created_at, ${dateFormat}), message_type, status
      ORDER BY period DESC
    `;
    
    // Message success rates
    const successRates = await databaseService.prisma.messageLog.groupBy({
      by: ['status'],
      _count: { status: true },
      where: {
        ...(filters.startDate && {
          createdAt: {
            gte: filters.startDate,
            ...(filters.endDate && { lte: filters.endDate })
          }
        })
      }
    });
    
    // Top message templates
    const topTemplates = await databaseService.prisma.messageTemplate.findMany({
      select: {
        messageId: true,
        name: true,
        type: true,
        _count: {
          select: {
            messageLogs: true
          }
        }
      },
      orderBy: {
        messageLogs: {
          _count: 'desc'
        }
      },
      take: 10
    });
    
    res.json({
      success: true,
      data: {
        messageVolume,
        successRates: successRates.map(rate => ({
          status: rate.status,
          count: rate._count.status
        })),
        topTemplates: topTemplates.map(template => ({
          messageId: template.messageId,
          name: template.name,
          type: template.type,
          usageCount: template._count.messageLogs
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting message analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get message analytics',
      message: error.message
    });
  }
});

// Get trigger analytics
router.get('/triggers', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    // Trigger performance
    const triggerPerformance = await databaseService.prisma.trigger.findMany({
      select: {
        triggerId: true,
        triggerType: true,
        triggerValue: true,
        usageCount: true,
        lastUsed: true,
        isActive: true,
        createdAt: true
      },
      orderBy: { usageCount: 'desc' }
    });
    
    // Trigger usage over time (if we had trigger usage logs)
    const triggerStats = await databaseService.prisma.trigger.groupBy({
      by: ['triggerType'],
      _count: { triggerType: true },
      _avg: { usageCount: true },
      _sum: { usageCount: true }
    });
    
    res.json({
      success: true,
      data: {
        triggerPerformance,
        triggerStats: triggerStats.map(stat => ({
          type: stat.triggerType,
          count: stat._count.triggerType,
          averageUsage: stat._avg.usageCount,
          totalUsage: stat._sum.usageCount
        }))
      }
    });
  } catch (error) {
    logger.error('Error getting trigger analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get trigger analytics',
      message: error.message
    });
  }
});

// Get flow analytics
router.get('/flows', async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const filters = {};
    if (startDate) filters.startDate = new Date(startDate);
    if (endDate) filters.endDate = new Date(endDate);
    
    // Flow completion rates
    const flowCompletions = await databaseService.prisma.flow.findMany({
      select: {
        flowId: true,
        name: true,
        status: true,
        createdAt: true,
        formSubmissions: {
          select: {
            id: true,
            status: true,
            createdAt: true
          },
          where: {
            ...(filters.startDate && {
              createdAt: {
                gte: filters.startDate,
                ...(filters.endDate && { lte: filters.endDate })
              }
            })
          }
        }
      }
    });
    
    // Flow submission trends
    const submissionTrends = await databaseService.prisma.$queryRaw`
      SELECT 
        DATE(created_at) as date,
        flow_id,
        COUNT(*) as submissions
      FROM form_submissions 
      WHERE 1=1
        ${filters.startDate ? `AND created_at >= ${filters.startDate}` : ''}
        ${filters.endDate ? `AND created_at <= ${filters.endDate}` : ''}
      GROUP BY DATE(created_at), flow_id
      ORDER BY date DESC
    `;
    
    res.json({
      success: true,
      data: {
        flowCompletions: flowCompletions.map(flow => ({
          flowId: flow.flowId,
          name: flow.name,
          status: flow.status,
          totalSubmissions: flow.formSubmissions.length,
          completedSubmissions: flow.formSubmissions.filter(s => s.status === 'completed').length,
          completionRate: flow.formSubmissions.length > 0 
            ? (flow.formSubmissions.filter(s => s.status === 'completed').length / flow.formSubmissions.length) * 100 
            : 0
        })),
        submissionTrends
      }
    });
  } catch (error) {
    logger.error('Error getting flow analytics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get flow analytics',
      message: error.message
    });
  }
});

// Record custom analytics event
router.post('/events', async (req, res) => {
  try {
    const { metricType, metricValue, metadata } = req.body;
    
    if (!metricType || !metricValue) {
      return res.status(400).json({
        success: false,
        error: 'metricType and metricValue are required'
      });
    }
    
    const analyticsEntry = await databaseService.createAnalyticsEntry({
      metricType,
      metricValue,
      metadata
    });
    
    res.json({
      success: true,
      data: analyticsEntry
    });
  } catch (error) {
    logger.error('Error recording analytics event:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to record analytics event',
      message: error.message
    });
  }
});

// Get system health metrics
router.get('/health', async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    
    // Get database table sizes
    const tableSizes = await databaseService.prisma.$queryRaw`
      SELECT 
        schemaname,
        tablename,
        pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
        pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
      FROM pg_tables 
      WHERE schemaname = 'public'
      ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
    `;
    
    // Get recent activity
    const recentActivity = {
      messagesLast24h: await databaseService.prisma.messageLog.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      contactsLast24h: await databaseService.prisma.contact.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      }),
      submissionsLast24h: await databaseService.prisma.formSubmission.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      })
    };
    
    res.json({
      success: true,
      data: {
        database: dbHealth,
        tableSizes,
        recentActivity,
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    logger.error('Error getting health metrics:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to get health metrics',
      message: error.message
    });
  }
});

module.exports = router;