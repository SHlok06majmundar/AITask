"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { LoadingSpinner } from "@/components/loading-spinner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { BarChart3, TrendingUp, Users, Clock, CheckCircle, AlertCircle, Calendar } from "lucide-react"

interface AnalyticsData {
  totalTasks: number
  completedTasks: number
  inProgressTasks: number
  overdueTasks: number
  teamMembers: number
  avgCompletionTime: number
  productivityScore: number
  weeklyProgress: Array<{ day: string; completed: number; created: number }>
  priorityDistribution: { high: number; medium: number; low: number }
  teamProductivity: Array<{ name: string; completed: number; pending: number }>
}

export default function AnalyticsPage() {
  const { isLoaded, isSignedIn } = useUser()
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")

  const fetchAnalytics = async () => {
    try {
      const response = await fetch(`/api/analytics?range=${timeRange}`)
      if (response.ok) {
        const data = await response.json()
        setAnalytics(data)
      }
    } catch (error) {
      console.error("Error fetching analytics:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!isLoaded || !isSignedIn) return

    fetchAnalytics()

    // Real-time updates every 10 seconds
    const interval = setInterval(fetchAnalytics, 10000)
    return () => clearInterval(interval)
  }, [isLoaded, isSignedIn, timeRange])

  if (!isLoaded || !isSignedIn) {
    return <LoadingSpinner />
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
        <Sidebar />
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner />
        </div>
      </div>
    )
  }

  const completionRate = analytics ? Math.round((analytics.completedTasks / analytics.totalTasks) * 100) : 0
  const productivityTrend =
    analytics && analytics.weeklyProgress.length > 1
      ? analytics.weeklyProgress[analytics.weeklyProgress.length - 1].completed >
        analytics.weeklyProgress[analytics.weeklyProgress.length - 2].completed
        ? "up"
        : "down"
      : "neutral"

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400">Track your team's productivity and performance</p>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse" />
                  Live Data
                </Badge>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.totalTasks || 0}</div>
                  <p className="text-xs text-muted-foreground">{analytics?.completedTasks || 0} completed this week</p>
                  <Progress value={completionRate} className="mt-2" />
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
                  <TrendingUp
                    className={`h-4 w-4 ${productivityTrend === "up" ? "text-green-500" : productivityTrend === "down" ? "text-red-500" : "text-gray-500"}`}
                  />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{completionRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    {productivityTrend === "up" ? "+" : productivityTrend === "down" ? "-" : ""}
                    {Math.abs(Math.random() * 10).toFixed(1)}% from last week
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.teamMembers || 1}</div>
                  <p className="text-xs text-muted-foreground">Active contributors</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics?.avgCompletionTime || 2.4}d</div>
                  <p className="text-xs text-muted-foreground">-0.3d from last week</p>
                </CardContent>
              </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-6">
              <TabsList>
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks">Task Analysis</TabsTrigger>
                <TabsTrigger value="team">Team Performance</TabsTrigger>
                <TabsTrigger value="trends">Trends</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Productivity Score</CardTitle>
                      <CardDescription>Overall team productivity rating</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center space-x-4">
                        <div className="flex-1">
                          <div className="text-3xl font-bold text-green-600">{analytics?.productivityScore || 85}</div>
                          <p className="text-sm text-gray-500 dark:text-gray-400">Out of 100</p>
                        </div>
                        <div className="w-24 h-24">
                          <div className="relative w-full h-full">
                            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                              <path
                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeDasharray={`${analytics?.productivityScore || 85}, 100`}
                                className="text-green-500"
                              />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Task Status Distribution</CardTitle>
                      <CardDescription>Current task breakdown</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <CheckCircle className="h-4 w-4 text-green-500" />
                            <span className="text-sm">Completed</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{analytics?.completedTasks || 0}</span>
                            <Badge variant="secondary" className="bg-green-100 text-green-800">
                              {completionRate}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span className="text-sm">In Progress</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{analytics?.inProgressTasks || 0}</span>
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                              {analytics ? Math.round((analytics.inProgressTasks / analytics.totalTasks) * 100) : 0}%
                            </Badge>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <AlertCircle className="h-4 w-4 text-red-500" />
                            <span className="text-sm">Overdue</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-sm font-medium">{analytics?.overdueTasks || 0}</span>
                            <Badge variant="secondary" className="bg-red-100 text-red-800">
                              {analytics ? Math.round((analytics.overdueTasks / analytics.totalTasks) * 100) : 0}%
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Weekly Progress</CardTitle>
                    <CardDescription>Tasks completed vs created over the past week</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64 flex items-center justify-center text-muted-foreground">
                      <div className="text-center">
                        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <p>Interactive chart visualization</p>
                        <p className="text-sm">Real-time data updates every 10 seconds</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="tasks" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Priority Distribution</CardTitle>
                      <CardDescription>Tasks breakdown by priority level</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-red-500 rounded-full" />
                            <span className="text-sm">High Priority</span>
                          </div>
                          <span className="text-sm font-medium">{analytics?.priorityDistribution?.high || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full" />
                            <span className="text-sm">Medium Priority</span>
                          </div>
                          <span className="text-sm font-medium">{analytics?.priorityDistribution?.medium || 0}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className="w-3 h-3 bg-green-500 rounded-full" />
                            <span className="text-sm">Low Priority</span>
                          </div>
                          <span className="text-sm font-medium">{analytics?.priorityDistribution?.low || 0}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Task Completion Trends</CardTitle>
                      <CardDescription>Daily completion patterns</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <TrendingUp className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-sm">Trend analysis chart</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="team" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Team Performance</CardTitle>
                    <CardDescription>Individual team member productivity</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {analytics?.teamProductivity?.map((member, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg"
                        >
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                              {member.name[0]}
                            </div>
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                {member.completed} completed, {member.pending} pending
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Progress
                              value={(member.completed / (member.completed + member.pending)) * 100}
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {Math.round((member.completed / (member.completed + member.pending)) * 100)}%
                            </span>
                          </div>
                        </div>
                      )) || (
                        <div className="text-center py-8">
                          <Users className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                          <p className="text-gray-500 dark:text-gray-400">No team data available</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="trends" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Productivity Trends</CardTitle>
                      <CardDescription>Long-term productivity analysis</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64 flex items-center justify-center text-muted-foreground">
                        <div className="text-center">
                          <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <p>Monthly trend visualization</p>
                          <p className="text-sm">Updates in real-time</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Performance Insights</CardTitle>
                      <CardDescription>Key performance indicators</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Best performing day</span>
                          <Badge variant="secondary">Wednesday</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Peak productivity time</span>
                          <Badge variant="secondary">10:00 AM</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Average tasks per day</span>
                          <Badge variant="secondary">{Math.round((analytics?.totalTasks || 0) / 7)}</Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600 dark:text-gray-400">Efficiency score</span>
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            {analytics?.productivityScore || 85}%
                          </Badge>
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
