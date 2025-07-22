"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { TrendingUp, TrendingDown, Clock, CheckSquare, Users, Target, Calendar, BarChart3 } from "lucide-react"

const teamMetrics = [
  {
    name: "Sarah Chen",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "UI/UX Designer",
    tasksCompleted: 24,
    productivity: 94,
    trend: "up",
    trendValue: "+12%",
  },
  {
    name: "Mike Johnson",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Frontend Developer",
    tasksCompleted: 18,
    productivity: 87,
    trend: "up",
    trendValue: "+8%",
  },
  {
    name: "Emma Davis",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "UX Researcher",
    tasksCompleted: 15,
    productivity: 82,
    trend: "down",
    trendValue: "-3%",
  },
  {
    name: "Alex Kim",
    avatar: "/placeholder.svg?height=40&width=40",
    role: "Backend Developer",
    tasksCompleted: 21,
    productivity: 91,
    trend: "up",
    trendValue: "+15%",
  },
]

const projectStats = [
  {
    name: "Website Redesign",
    progress: 75,
    tasksTotal: 32,
    tasksCompleted: 24,
    dueDate: "2024-02-15",
    status: "on-track",
  },
  {
    name: "Mobile App",
    progress: 45,
    tasksTotal: 28,
    tasksCompleted: 13,
    dueDate: "2024-03-01",
    status: "at-risk",
  },
  {
    name: "Marketing Campaign",
    progress: 90,
    tasksTotal: 20,
    tasksCompleted: 18,
    dueDate: "2024-01-30",
    status: "ahead",
  },
]

const weeklyData = [
  { day: "Mon", completed: 12, created: 8 },
  { day: "Tue", completed: 15, created: 10 },
  { day: "Wed", completed: 18, created: 12 },
  { day: "Thu", completed: 14, created: 9 },
  { day: "Fri", completed: 20, created: 15 },
  { day: "Sat", completed: 8, created: 5 },
  { day: "Sun", completed: 6, created: 3 },
]

export default function AnalyticsPage() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Analytics</h1>
                <p className="text-gray-600 dark:text-gray-400">Track team performance and project insights</p>
              </div>
              <Select defaultValue="7days">
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 days</SelectItem>
                  <SelectItem value="30days">Last 30 days</SelectItem>
                  <SelectItem value="90days">Last 90 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Tasks</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">156</p>
                    </div>
                    <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                      <CheckSquare className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+12% from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">93</p>
                    </div>
                    <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                      <Target className="h-6 w-6 text-green-600 dark:text-green-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">+8% completion rate</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg. Time</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">2.4h</p>
                    </div>
                    <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                      <Clock className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                    <span className="text-sm text-red-600 dark:text-red-400">-15% from last week</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Team Members</p>
                      <p className="text-3xl font-bold text-gray-900 dark:text-white">12</p>
                    </div>
                    <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                      <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                    </div>
                  </div>
                  <div className="flex items-center mt-4">
                    <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                    <span className="text-sm text-green-600 dark:text-green-400">2 new members</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* Team Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5" />
                    <span>Team Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {teamMetrics.map((member) => (
                      <div
                        key={member.name}
                        className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={member.avatar || "/placeholder.svg"} />
                          <AvatarFallback>
                            {member.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-medium text-gray-900 dark:text-white">{member.name}</h4>
                            <div className="flex items-center space-x-2">
                              <Badge variant="outline" className="text-xs">
                                {member.tasksCompleted} tasks
                              </Badge>
                              <div
                                className={`flex items-center space-x-1 text-xs ${
                                  member.trend === "up" ? "text-green-600" : "text-red-600"
                                }`}
                              >
                                {member.trend === "up" ? (
                                  <TrendingUp className="h-3 w-3" />
                                ) : (
                                  <TrendingDown className="h-3 w-3" />
                                )}
                                <span>{member.trendValue}</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">{member.role}</p>
                          <div className="flex items-center space-x-2">
                            <Progress value={member.productivity} className="flex-1 h-2" />
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {member.productivity}%
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Status */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Project Status</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {projectStats.map((project) => (
                      <div key={project.name} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium text-gray-900 dark:text-white">{project.name}</h4>
                          <Badge
                            className={
                              project.status === "on-track"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                                : project.status === "ahead"
                                  ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                                  : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
                            }
                          >
                            {project.status === "on-track"
                              ? "On Track"
                              : project.status === "ahead"
                                ? "Ahead"
                                : "At Risk"}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-2">
                          <span>
                            {project.tasksCompleted}/{project.tasksTotal} tasks completed
                          </span>
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-3 w-3" />
                            <span>Due {new Date(project.dueDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Progress value={project.progress} className="flex-1 h-2" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{project.progress}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Weekly Activity Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <BarChart3 className="h-5 w-5" />
                  <span>Weekly Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {weeklyData.map((day) => (
                    <div key={day.day} className="flex items-center space-x-4">
                      <div className="w-12 text-sm font-medium text-gray-600 dark:text-gray-400">{day.day}</div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center space-x-2">
                          <div className="w-24 text-xs text-gray-500">Completed</div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${(day.completed / 25) * 100}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-gray-900 dark:text-white font-medium">{day.completed}</div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-24 text-xs text-gray-500">Created</div>
                          <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${(day.created / 25) * 100}%` }}
                            />
                          </div>
                          <div className="w-8 text-xs text-gray-900 dark:text-white font-medium">{day.created}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  )
}
