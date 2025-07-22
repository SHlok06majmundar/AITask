"use client"

import { useRealtimeTasks } from "@/lib/hooks/use-realtime-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, Calendar, User } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import type { Task } from "@/lib/mongodb"

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "review", title: "Review", color: "bg-yellow-100 dark:bg-yellow-900" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" },
]

const priorityColors = {
  low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  high: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export function TaskBoard() {
  const { tasks, loading, updateTask } = useRealtimeTasks()

  if (loading) {
    return <LoadingSpinner />
  }

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await updateTask(taskId, { status: newStatus })
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {columns.map((column) => {
        const columnTasks = tasks.filter((task) => task.status === column.id)

        return (
          <div key={column.id} className="space-y-4">
            <div className={`rounded-lg p-4 ${column.color}`}>
              <h3 className="font-semibold text-gray-900 dark:text-white">{column.title}</h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">{columnTasks.length} tasks</p>
            </div>

            <div className="space-y-3">
              {columnTasks.map((task) => (
                <Card key={task._id} className="cursor-pointer hover:shadow-md transition-shadow">
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                      <Button variant="ghost" size="icon" className="h-6 w-6">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    {task.description && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>
                    )}

                    <div className="flex items-center justify-between mb-3">
                      <Badge variant="secondary" className={priorityColors[task.priority]}>
                        {task.priority}
                      </Badge>

                      {task.dueDate && (
                        <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <Calendar className="h-3 w-3 mr-1" />
                          {new Date(task.dueDate).toLocaleDateString()}
                        </div>
                      )}
                    </div>

                    {task.assignee && (
                      <div className="flex items-center text-xs text-gray-600 dark:text-gray-400">
                        <User className="h-3 w-3 mr-1" />
                        {task.assignee.fullName || "Unassigned"}
                      </div>
                    )}

                    <div className="mt-3 flex gap-1">
                      {columns.map((col) => (
                        <Button
                          key={col.id}
                          variant={task.status === col.id ? "default" : "outline"}
                          size="sm"
                          className="text-xs px-2 py-1 h-6"
                          onClick={() => handleStatusChange(task._id!, col.id as Task["status"])}
                        >
                          {col.title}
                        </Button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}
