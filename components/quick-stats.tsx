"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { CheckSquare, Clock, Users, TrendingUp, AlertTriangle, Calendar } from "lucide-react"
import { useRealtimeTasks } from "@/lib/hooks/use-realtime-tasks"
import { LoadingSpinner } from "@/components/loading-spinner"

export function QuickStats() {
  const { tasks, loading } = useRealtimeTasks()

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="flex items-center justify-center h-24">
              <LoadingSpinner />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const completedTasks = tasks.filter((task) => task.status === "done").length
  const inProgressTasks = tasks.filter((task) => task.status === "in_progress").length
  const totalTasks = tasks.length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const upcomingDeadlines = tasks
    .filter((task) => task.dueDate && task.status !== "done")
    .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime())
    .slice(0, 3)

  const stats = [
    {
      title: "Tasks Completed",
      value: completedTasks.toString(),
      change: "+12%",
      changeType: "positive" as const,
      icon: CheckSquare,
      description: "This week",
      progress: completionRate,
    },
    {
      title: "In Progress",
      value: inProgressTasks.toString(),
      change: "+3",
      changeType: "neutral" as const,
      icon: Clock,
      description: "Active tasks",
      progress: totalTasks > 0 ? Math.round((inProgressTasks / totalTasks) * 100) : 0,
    },
    {
      title: "Total Tasks",
      value: totalTasks.toString(),
      change: "+5",
      changeType: "positive" as const,
      icon: Users,
      description: "All tasks",
      progress: 100,
    },
    {
      title: "Completion Rate",
      value: `${completionRate}%`,
      change: "+8%",
      changeType: "positive" as const,
      icon: TrendingUp,
      description: "Overall progress",
      progress: completionRate,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.title} className="relative overflow-hidden">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-gray-400" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-2">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</div>
                <Badge
                  variant={stat.changeType === "positive" ? "default" : "secondary"}
                  className={
                    stat.changeType === "positive"
                      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                      : ""
                  }
                >
                  {stat.change}
                </Badge>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stat.description}</p>
              <Progress value={stat.progress} className="h-1" />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5" />
            <span>Upcoming Deadlines</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {upcomingDeadlines.length > 0 ? (
            <div className="space-y-3">
              {upcomingDeadlines.map((task) => (
                <div
                  key={task._id}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        task.priority === "high"
                          ? "bg-red-500"
                          : task.priority === "medium"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                      }`}
                    />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{task.title}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{task.project?.name || "No Project"}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {new Date(task.dueDate!).toLocaleDateString()}
                    </Badge>
                    {task.priority === "high" && <AlertTriangle className="h-4 w-4 text-red-500" />}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No upcoming deadlines</h3>
              <p className="text-gray-500 dark:text-gray-400">All caught up! 🎉</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
