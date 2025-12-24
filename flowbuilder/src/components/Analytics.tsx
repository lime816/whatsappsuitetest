import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MessageSquare, 
  Zap, 
  FileText,
  Activity,
  Calendar,
  RefreshCw,
  Download,
  Filter
} from 'lucide-react'

interface AnalyticsData {
  summary: {
    totalContacts: number
    totalMessages: number
    totalTriggers: number
    totalFlows: number
    totalFormSubmissions: number
    period: {
      startDate: string
      endDate: string
    }
  }
  messageStats: Array<{
    type: string
    count: number
  }>
  triggerStats: Array<{
    triggerId: string
    triggerType: string
    usageCount: number
    lastUsed: string | null
    isActive: boolean
  }>
  flowStats: Array<{
    flowId: string
    name: string
    completions: number
  }>
  dailyMessageVolume: Array<{
    date: string
    count: number
    message_type: string
  }>
  recentWebhookEvents: Array<{
    id: string
    eventType: string
    processed: boolean
    error: string | null
    createdAt: string
  }>
}

interface AnalyticsProps {
  onClose: () => void
}

export default function Analytics({ onClose }: AnalyticsProps) {
  const [data, setData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  const fetchAnalytics = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001'
      const params = new URLSearchParams({
        startDate: dateRange.startDate,
        endDate: dateRange.endDate
      })
      
      const response = await fetch(`${backendUrl}/api/analytics/dashboard?${params}`)
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`)
      }
      
      const result = await response.json()
      
      if (result.success) {
        setData(result.data)
      } else {
        throw new Error(result.error || 'Failed to fetch analytics')
      }
    } catch (err) {
      console.error('Error fetching analytics:', err)
      setError(err instanceof Error ? err.message : 'Failed to load analytics')
      
      // Mock data for demonstration when backend is not available
      setData({
        summary: {
          totalContacts: 156,
          totalMessages: 1247,
          totalTriggers: 8,
          totalFlows: 3,
          totalFormSubmissions: 89,
          period: {
            startDate: dateRange.startDate,
            endDate: dateRange.endDate
          }
        },
        messageStats: [
          { type: 'STANDARD_TEXT', count: 856 },
          { type: 'INTERACTIVE_BUTTON', count: 234 },
          { type: 'INTERACTIVE_LIST', count: 157 }
        ],
        triggerStats: [
          { triggerId: 'hello_trigger', triggerType: 'KEYWORD_MATCH', usageCount: 45, lastUsed: '2024-12-24T03:30:00Z', isActive: true },
          { triggerId: 'menu_trigger', triggerType: 'KEYWORD_MATCH', usageCount: 32, lastUsed: '2024-12-24T02:15:00Z', isActive: true },
          { triggerId: 'help_trigger', triggerType: 'KEYWORD_MATCH', usageCount: 18, lastUsed: '2024-12-23T18:45:00Z', isActive: true }
        ],
        flowStats: [
          { flowId: 'flow_registration', name: 'Registration Flow', completions: 45 },
          { flowId: 'flow_feedback', name: 'Feedback Flow', completions: 32 },
          { flowId: 'flow_support', name: 'Support Flow', completions: 12 }
        ],
        dailyMessageVolume: [
          { date: '2024-12-24', count: 45, message_type: 'STANDARD_TEXT' },
          { date: '2024-12-24', count: 23, message_type: 'INTERACTIVE_BUTTON' },
          { date: '2024-12-23', count: 67, message_type: 'STANDARD_TEXT' },
          { date: '2024-12-23', count: 34, message_type: 'INTERACTIVE_BUTTON' }
        ],
        recentWebhookEvents: [
          { id: '1', eventType: 'message_received', processed: true, error: null, createdAt: '2024-12-24T03:30:00Z' },
          { id: '2', eventType: 'flow_completion', processed: true, error: null, createdAt: '2024-12-24T03:25:00Z' },
          { id: '3', eventType: 'trigger_activated', processed: false, error: 'Rate limit exceeded', createdAt: '2024-12-24T03:20:00Z' }
        ]
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
  }, [dateRange])

  const StatCard = ({ icon: Icon, title, value, subtitle, color = 'blue' }: {
    icon: any
    title: string
    value: string | number
    subtitle?: string
    color?: string
  }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-gradient-to-br from-${color}-50 to-${color}-100 border border-${color}-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-all`}
    >
      <div className="flex items-center justify-between">
        <div>
          <p className={`text-${color}-600 text-sm font-medium`}>{title}</p>
          <p className={`text-${color}-900 text-2xl font-bold mt-1`}>{value}</p>
          {subtitle && <p className={`text-${color}-500 text-xs mt-1`}>{subtitle}</p>}
        </div>
        <div className={`w-12 h-12 bg-${color}-500 rounded-lg flex items-center justify-center`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  )

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-8 shadow-2xl">
          <div className="flex items-center space-x-3">
            <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-lg font-medium">Loading Analytics...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-900/95 backdrop-blur-sm z-50 overflow-y-auto"
    >
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Analytics Dashboard
              </h1>
              <p className="text-slate-400 mt-2">
                WhatsApp automation performance and insights
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              {/* Date Range Filter */}
              <div className="flex items-center gap-2 bg-slate-800 rounded-lg p-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <input
                  type="date"
                  value={dateRange.startDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
                  className="bg-transparent text-white text-sm border-none outline-none"
                />
                <span className="text-slate-400">to</span>
                <input
                  type="date"
                  value={dateRange.endDate}
                  onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
                  className="bg-transparent text-white text-sm border-none outline-none"
                />
              </div>
              
              <button
                onClick={fetchAnalytics}
                className="btn-secondary flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
              
              <button
                onClick={onClose}
                className="btn-primary"
              >
                Close
              </button>
            </div>
          </div>

          {error && (
            <div className="bg-red-900/50 border border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-400">
                <Activity className="w-5 h-5" />
                <span className="font-medium">Connection Error</span>
              </div>
              <p className="text-red-300 text-sm mt-1">{error}</p>
              <p className="text-red-200 text-xs mt-2">Showing demo data for preview</p>
            </div>
          )}

          {data && (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                <StatCard
                  icon={Users}
                  title="Total Contacts"
                  value={data.summary.totalContacts.toLocaleString()}
                  subtitle="Unique users"
                  color="blue"
                />
                <StatCard
                  icon={MessageSquare}
                  title="Messages Sent"
                  value={data.summary.totalMessages.toLocaleString()}
                  subtitle="All time"
                  color="green"
                />
                <StatCard
                  icon={Zap}
                  title="Active Triggers"
                  value={data.summary.totalTriggers}
                  subtitle="Automated responses"
                  color="purple"
                />
                <StatCard
                  icon={FileText}
                  title="Flows Created"
                  value={data.summary.totalFlows}
                  subtitle="Interactive forms"
                  color="orange"
                />
                <StatCard
                  icon={TrendingUp}
                  title="Form Submissions"
                  value={data.summary.totalFormSubmissions}
                  subtitle="Completed flows"
                  color="pink"
                />
              </div>

              {/* Charts and Details */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Message Types */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-400" />
                    Message Types
                  </h3>
                  <div className="space-y-3">
                    {data.messageStats.map((stat, index) => (
                      <div key={stat.type} className="flex items-center justify-between">
                        <span className="text-slate-300">{stat.type.replace(/_/g, ' ')}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{
                                width: `${(stat.count / Math.max(...data.messageStats.map(s => s.count))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-white font-medium w-12 text-right">{stat.count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Top Triggers */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Zap className="w-5 h-5 text-purple-400" />
                    Top Triggers
                  </h3>
                  <div className="space-y-3">
                    {data.triggerStats.slice(0, 5).map((trigger) => (
                      <div key={trigger.triggerId} className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-300">{trigger.triggerId}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${trigger.isActive ? 'bg-green-400' : 'bg-red-400'}`} />
                            <span className="text-xs text-slate-500">{trigger.triggerType}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-white font-medium">{trigger.usageCount} uses</div>
                          {trigger.lastUsed && (
                            <div className="text-xs text-slate-500">
                              {new Date(trigger.lastUsed).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Flow Performance */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5 text-orange-400" />
                    Flow Performance
                  </h3>
                  <div className="space-y-3">
                    {data.flowStats.map((flow) => (
                      <div key={flow.flowId} className="flex items-center justify-between">
                        <span className="text-slate-300">{flow.name}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-orange-500 h-2 rounded-full"
                              style={{
                                width: `${(flow.completions / Math.max(...data.flowStats.map(f => f.completions))) * 100}%`
                              }}
                            />
                          </div>
                          <span className="text-white font-medium w-8 text-right">{flow.completions}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recent Webhook Events */}
                <div className="bg-slate-800 rounded-xl p-6">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <Activity className="w-5 h-5 text-green-400" />
                    Recent Events
                  </h3>
                  <div className="space-y-3">
                    {data.recentWebhookEvents.slice(0, 5).map((event) => (
                      <div key={event.id} className="flex items-center justify-between">
                        <div>
                          <span className="text-slate-300">{event.eventType}</span>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`w-2 h-2 rounded-full ${event.processed ? 'bg-green-400' : 'bg-yellow-400'}`} />
                            <span className="text-xs text-slate-500">
                              {new Date(event.createdAt).toLocaleTimeString()}
                            </span>
                          </div>
                        </div>
                        {event.error && (
                          <div className="text-xs text-red-400 max-w-32 truncate">
                            {event.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </motion.div>
  )
}