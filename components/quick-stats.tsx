"use client"

import { useRealtimeTasks } from "@/lib/hooks/use-realtime-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckSquare, Clock, AlertCircle, TrendingUp } from "lucide-react"

export function QuickStats() {
  const { tasks } = useRealtimeTasks()

  const stats = {
    total: tasks.length,
    completed: tasks.filter((task) => task.status === "done").length,
    inProgress: tasks.filter((task) => task.status === "in_progress").length,
    overdue: tasks.filter((task) => task.dueDate && new Date(task.dueDate) < new Date() && task.status !== "done")
      .length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
          <CheckSquare className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.total}</div>
          <p className="text-xs text-muted-foreground">{stats.completed} completed</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">In Progress</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.inProgress}</div>
          <p className="text-xs text-muted-foreground">Currently active</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Overdue</CardTitle>
          <AlertCircle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{stats.overdue}</div>
          <p className="text-xs text-muted-foreground">Need attention</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completionRate}%</div>
          <p className="text-xs text-muted-foreground">Overall progress</p>
        </CardContent>
      </Card>
    </>
  )
}
