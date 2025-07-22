"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Plus, MoreHorizontal, Calendar, Flag } from "lucide-react"
import { useRealtimeTasks } from "@/lib/hooks/use-realtime-tasks"
import { LoadingSpinner } from "@/components/loading-spinner"
import { CreateTaskDialog } from "@/components/create-task-dialog"

const columns = [
  { id: "todo", title: "To Do", color: "bg-gray-100 dark:bg-gray-800" },
  { id: "in_progress", title: "In Progress", color: "bg-blue-100 dark:bg-blue-900" },
  { id: "review", title: "Review", color: "bg-yellow-100 dark:bg-yellow-900" },
  { id: "done", title: "Done", color: "bg-green-100 dark:bg-green-900" },
]

export function TaskBoard() {
  const { tasks, loading, updateTask, deleteTask } = useRealtimeTasks()
  const [showCreateDialog, setShowCreateDialog] = useState(false)

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center h-64">
          <LoadingSpinner />
        </CardContent>
      </Card>
    )
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-500"
      case "medium":
        return "bg-yellow-500"
      case "low":
        return "bg-green-500"
      default:
        return "bg-gray-500"
    }
  }

  const getTasksByStatus = (status: string) => {
    return tasks.filter((task) => task.status === status)
  }

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      await updateTask(taskId, {
        status: newStatus as any,
        completedAt: newStatus === "done" ? new Date() : null,
      })
    } catch (error) {
      console.error("Failed to update task status:", error)
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId)
    } catch (error) {
      console.error("Failed to delete task:", error)
    }
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Task Board</CardTitle>
            <Button size="sm" onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {columns.map((column) => (
              <div key={column.id} className="space-y-3">
                <div className={`p-3 rounded-lg ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-sm">{column.title}</h3>
                    <Badge variant="secondary" className="text-xs">
                      {getTasksByStatus(column.id).length}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 min-h-[400px]">
                  {getTasksByStatus(column.id).map((task) => (
                    <Card key={task._id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center space-x-2">
                            <div className={`w-2 h-2 rounded-full ${getPriorityColor(task.priority)}`} />
                            <Flag className="h-3 w-3 text-gray-400" />
                          </div>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <MoreHorizontal className="h-3 w-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>Edit</DropdownMenuItem>
                              <DropdownMenuItem>Duplicate</DropdownMenuItem>
                              {columns.map((col) => (
                                <DropdownMenuItem key={col.id} onClick={() => handleStatusChange(task._id!, col.id)}>
                                  Move to {col.title}
                                </DropdownMenuItem>
                              ))}
                              <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteTask(task._id!)}>
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>

                        <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-3 line-clamp-2">{task.description}</p>

                        <div className="flex flex-wrap gap-1 mb-3">
                          <Badge variant="outline" className="text-xs px-1 py-0">
                            {task.priority}
                          </Badge>
                          {task.project && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              {task.project.name}
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            {task.assignee && (
                              <>
                                <Avatar className="h-6 w-6">
                                  <AvatarImage src={task.assignee.imageUrl || "/placeholder.svg"} />
                                  <AvatarFallback className="text-xs">
                                    {task.assignee.fullName
                                      ?.split(" ")
                                      .map((n) => n[0])
                                      .join("") || "U"}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-xs text-gray-500">{task.assignee.fullName}</span>
                              </>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-gray-400">
                            {task.dueDate && (
                              <div className="flex items-center space-x-1">
                                <Calendar className="h-3 w-3" />
                                <span className="text-xs">{new Date(task.dueDate).toLocaleDateString()}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <CreateTaskDialog open={showCreateDialog} onOpenChange={setShowCreateDialog} />
    </>
  )
}
