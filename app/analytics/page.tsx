"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
  Legend,
} from "recharts"
import {
  TrendingUp,
  TrendingDown,
  Users,
  CheckCircle,
  Clock,
  Target,
  Activity,
  ArrowLeft,
  RefreshCw,
} from "lucide-react"

interface AnalyticsData {
  productivity: {
    score: number
    trend: number
    tasksCompleted: number
    averageCompletionTime: number
  }
  team: {
    totalMembers: number
    activeMembers: number
    collaboration: number
    efficiency: number
  }
  tasks: {
    total: number
    completed: number
    inProgress: number
    overdue: number
    completionRate: number
  }
  timeTracking: {
    totalHours: number
    averageDaily: number
    mostProductiveHour: number
    efficiency: number
  }
  trends: {
    daily: Array<{
      date: string
      completed: number
      created: number
      productivity: number
    }>
    weekly: Array<{
      week: string
      tasks: number
      hours: number
      efficiency: number
    }>
    monthly: Array<{
      month: string
      productivity: number
      teamGrowth: number
      satisfaction: number
    }>
  }
  priorities: Array<{
    name: string
    value: number
    color: string
  }>
  categories: Array<{
    name: string
    completed: number
    total: number
    percentage: number
  }>
}

export default function AnalyticsPage() {
  const { user } = useUser()
  const router = useRouter()
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // Fetch analytics data
  const fetchAnalytics = async (showRefreshing = false) => {
    if (showRefreshing) setRefreshing(true)

    try {
      const response = await fetch("/api/analytics")
      if (response.ok) {
        const data = await response.json()
        setAnalyticsData(data)
        setLastUpdated(new Date())
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchAnalytics()
    // Real-time updates every 5 seconds
    const interval = setInterval(() => fetchAnalytics(), 5000)
    return () => clearInterval(interval)
  }, [])

  const handleRefresh = () => {
    fetchAnalytics(true)
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading analytics...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <Activity className="h-16 w-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Analytics Data</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-4">
              Start using the app to see your productivity insights
            </p>
            <Button onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh Data
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-4 sm:px-6 py-4 sm:py-8 max-w-full">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 sm:mb-8 gap-4">
              <div className="flex items-center space-x-2 sm:space-x-4 min-w-0">
                <Button variant="ghost" size="sm" onClick={() => router.back()} className="flex-shrink-0">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back</span>
                </Button>
                <div className="min-w-0">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white break-words">Analytics</h1>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mt-1">Track your productivity and team performance</p>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3 w-full sm:w-auto">
                <Badge variant="outline" className="text-green-600 border-green-600 text-xs sm:text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Data
                </Badge>
                <Badge variant="secondary" className="text-xs sm:text-sm truncate">
                  <span className="hidden sm:inline">Last updated: </span>
                  {lastUpdated.toLocaleTimeString()}
                </Badge>
                <Button variant="outline" size="sm" onClick={handleRefresh} disabled={refreshing} className="w-full sm:w-auto">
                  <RefreshCw className={`h-4 w-4 mr-1 sm:mr-2 ${refreshing ? "animate-spin" : ""}`} />
                  <span className="text-xs sm:text-sm">Refresh</span>
                </Button>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Productivity Score</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {analyticsData.productivity.score}%
                      </p>
                      <div className="flex items-center mt-2">
                        {analyticsData.productivity.trend > 0 ? (
                          <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-green-500 mr-1" />
                        ) : (
                          <TrendingDown className="h-3 w-3 sm:h-4 sm:w-4 text-red-500 mr-1" />
                        )}
                        <span
                          className={`text-xs sm:text-sm ${
                            analyticsData.productivity.trend > 0 ? "text-green-600" : "text-red-600"
                          }`}
                        >
                          {Math.abs(analyticsData.productivity.trend)}%
                        </span>
                      </div>
                    </div>
                    <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900 rounded-full flex-shrink-0">
                      <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Tasks Completed</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {analyticsData.tasks.completed}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">
                        {analyticsData.tasks.completionRate}% completion rate
                      </p>
                    </div>
                    <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900 rounded-full flex-shrink-0">
                      <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-green-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                      <p className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                        {analyticsData.team.totalMembers}
                      </p>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2">{analyticsData.team.activeMembers} active today</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Users className="h-6 w-6 text-purple-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Time Tracked</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">
                        {analyticsData.timeTracking.totalHours}h
                      </p>
                      <p className="text-sm text-gray-500 mt-2">{analyticsData.timeTracking.averageDaily}h daily avg</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                      <Clock className="h-6 w-6 text-orange-600" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Charts and Detailed Analytics */}
            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="productivity">Productivity</TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="insights">Insights</TabsTrigger>
              </TabsList>

              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Daily Productivity Trend */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Daily Productivity Trend</CardTitle>
                      <CardDescription>Your productivity over the last 7 days</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          productivity: {
                            label: "Productivity",
                            color: "hsl(var(--chart-1))",
                          },
                          completed: {
                            label: "Tasks Completed",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={analyticsData.trends.daily}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Line
                              type="monotone"
                              dataKey="productivity"
                              stroke="var(--color-productivity)"
                              strokeWidth={2}
                            />
                            <Line type="monotone" dataKey="completed" stroke="var(--color-completed)" strokeWidth={2} />
                          </LineChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Task Priority Distribution */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Task Priority Distribution</CardTitle>
                      <CardDescription>Breakdown of tasks by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          high: { label: "High", color: "#ef4444" },
                          medium: { label: "Medium", color: "#f59e0b" },
                          low: { label: "Low", color: "#10b981" },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={analyticsData.priorities}
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                              label={({ name, value }) => `${name}: ${value}`}
                            >
                              {analyticsData.priorities.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <ChartTooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>
                </div>

                {/* Task Categories Progress */}
                <Card>
                  <CardHeader>
                    <CardTitle>Task Categories Progress</CardTitle>
                    <CardDescription>Completion progress across different categories</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analyticsData.categories.map((category, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{category.name}</span>
                            <span className="text-sm text-gray-500">
                              {category.completed}/{category.total} ({category.percentage}%)
                            </span>
                          </div>
                          <Progress value={category.percentage} className="h-2" />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Productivity Tab */}
              <TabsContent value="productivity" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Weekly Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Weekly Performance</CardTitle>
                      <CardDescription>Tasks and hours tracked per week</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          tasks: {
                            label: "Tasks",
                            color: "hsl(var(--chart-1))",
                          },
                          hours: {
                            label: "Hours",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart data={analyticsData.trends.weekly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="week" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Bar dataKey="tasks" fill="var(--color-tasks)" />
                            <Bar dataKey="hours" fill="var(--color-hours)" />
                          </BarChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Efficiency Metrics */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Efficiency Metrics</CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Task Completion Rate</span>
                          <span className="text-sm text-gray-500">{analyticsData.tasks.completionRate}%</span>
                        </div>
                        <Progress value={analyticsData.tasks.completionRate} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Time Efficiency</span>
                          <span className="text-sm text-gray-500">{analyticsData.timeTracking.efficiency}%</span>
                        </div>
                        <Progress value={analyticsData.timeTracking.efficiency} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Team Collaboration</span>
                          <span className="text-sm text-gray-500">{analyticsData.team.collaboration}%</span>
                        </div>
                        <Progress value={analyticsData.team.collaboration} className="h-2" />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="grid grid-cols-2 gap-4 text-center">
                          <div>
                            <p className="text-2xl font-bold text-blue-600">
                              {analyticsData.productivity.averageCompletionTime}h
                            </p>
                            <p className="text-sm text-gray-500">Avg. Completion Time</p>
                          </div>
                          <div>
                            <p className="text-2xl font-bold text-green-600">
                              {analyticsData.timeTracking.mostProductiveHour}:00
                            </p>
                            <p className="text-sm text-gray-500">Most Productive Hour</p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Team Tab */}
              <TabsContent value="team" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Team Growth */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Growth</CardTitle>
                      <CardDescription>Monthly team expansion and productivity</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ChartContainer
                        config={{
                          teamGrowth: {
                            label: "Team Growth",
                            color: "hsl(var(--chart-1))",
                          },
                          productivity: {
                            label: "Productivity",
                            color: "hsl(var(--chart-2))",
                          },
                        }}
                        className="h-[300px]"
                      >
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={analyticsData.trends.monthly}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <ChartTooltip content={<ChartTooltipContent />} />
                            <Area
                              type="monotone"
                              dataKey="teamGrowth"
                              stackId="1"
                              stroke="var(--color-teamGrowth)"
                              fill="var(--color-teamGrowth)"
                            />
                            <Area
                              type="monotone"
                              dataKey="productivity"
                              stackId="1"
                              stroke="var(--color-productivity)"
                              fill="var(--color-productivity)"
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </ChartContainer>
                    </CardContent>
                  </Card>

                  {/* Team Performance */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Team Performance</CardTitle>
                      <CardDescription>Current team metrics and statistics</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-blue-600">{analyticsData.team.totalMembers}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-2xl font-bold text-green-600">{analyticsData.team.activeMembers}</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                        </div>
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Team Efficiency</span>
                          <span className="text-sm text-gray-500">{analyticsData.team.efficiency}%</span>
                        </div>
                        <Progress value={analyticsData.team.efficiency} className="h-2" />
                      </div>

                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium">Collaboration Score</span>
                          <span className="text-sm text-gray-500">{analyticsData.team.collaboration}%</span>
                        </div>
                        <Progress value={analyticsData.team.collaboration} className="h-2" />
                      </div>

                      <div className="pt-4 border-t">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Tasks in Progress</span>
                            <Badge variant="outline">{analyticsData.tasks.inProgress}</Badge>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-sm">Overdue Tasks</span>
                            <Badge variant="destructive">{analyticsData.tasks.overdue}</Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Insights Tab */}
              <TabsContent value="insights" className="space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Performance Insights */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Insights</CardTitle>
                      <CardDescription>AI-powered recommendations for improvement</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border-l-4 border-blue-500">
                        <h4 className="font-medium text-blue-900 dark:text-blue-100">Peak Productivity</h4>
                        <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                          Your most productive time is around {analyticsData.timeTracking.mostProductiveHour}:00.
                          Consider scheduling important tasks during this window.
                        </p>
                      </div>

                      <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg border-l-4 border-green-500">
                        <h4 className="font-medium text-green-900 dark:text-green-100">Task Completion</h4>
                        <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                          Great job! Your completion rate of {analyticsData.tasks.completionRate}% is above average.
                          Keep up the excellent work.
                        </p>
                      </div>

                      <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border-l-4 border-yellow-500">
                        <h4 className="font-medium text-yellow-900 dark:text-yellow-100">Team Collaboration</h4>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                          Consider increasing team collaboration. Current score is {analyticsData.team.collaboration}%.
                          Try scheduling more team meetings or collaborative tasks.
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Recommendations */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Recommendations</CardTitle>
                      <CardDescription>Actionable steps to boost productivity</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-3">
                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium">Optimize Task Scheduling</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Schedule high-priority tasks during your peak hours (
                              {analyticsData.timeTracking.mostProductiveHour}:00-
                              {analyticsData.timeTracking.mostProductiveHour + 2}:00)
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium">Reduce Overdue Tasks</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              You have {analyticsData.tasks.overdue} overdue tasks. Consider breaking them into smaller,
                              manageable chunks.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-purple-500 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium">Enhance Team Communication</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Increase team collaboration through regular check-ins and shared project updates.
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
                          <div>
                            <h4 className="font-medium">Time Management</h4>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Your average daily hours ({analyticsData.timeTracking.averageDaily}h) could be optimized
                              with better time blocking.
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </div>
  )
}
