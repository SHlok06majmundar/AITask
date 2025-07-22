"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Calendar, Clock, User, Edit2, Trash2, Save, X } from "lucide-react"
import { toast } from "sonner"

interface Task {
  _id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "completed"
  priority: "low" | "medium" | "high"
  assignedTo: string
  assignedToName: string
  dueDate: string
  createdAt: string
  createdBy: string
  createdByName: string
}

export function TaskBoard() {
  const { user } = useUser()
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Task>>({})

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    const interval = setInterval(fetchTasks, 3000) // Real-time updates every 3 seconds
    return () => clearInterval(interval)
  }, [])

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (response.ok) {
        fetchTasks()
        toast.success("Task status updated")
      }
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const startEditing = (task: Task) => {
    setEditingTask(task._id)
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      dueDate: task.dueDate,
    })
  }

  const saveEdit = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editForm),
      })

      if (response.ok) {
        setEditingTask(null)
        setEditForm({})
        fetchTasks()
        toast.success("Task updated successfully")
      }
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        fetchTasks()
        toast.success("Task deleted successfully")
      }
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const cancelEdit = () => {
    setEditingTask(null)
    setEditForm({})
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      case "low":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "todo":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const todoTasks = tasks.filter((task) => task.status === "todo")
  const inProgressTasks = tasks.filter((task) => task.status === "in-progress")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  const TaskCard = ({ task }: { task: Task }) => (
    <Card className="mb-4 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        {editingTask === task._id ? (
          <div className="space-y-3">
            <Input
              value={editForm.title || ""}
              onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
              placeholder="Task title"
            />
            <Textarea
              value={editForm.description || ""}
              onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
              placeholder="Task description"
              rows={3}
            />
            <div className="flex gap-2">
              <Select
                value={editForm.priority}
                onValueChange={(value) => setEditForm({ ...editForm, priority: value as any })}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
              <Input
                type="date"
                value={editForm.dueDate || ""}
                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                className="w-40"
              />
            </div>
            <div className="flex gap-2">
              <Button size="sm" onClick={() => saveEdit(task._id)}>
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
              <Button size="sm" variant="outline" onClick={cancelEdit}>
                <X className="h-3 w-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold text-sm">{task.title}</h3>
              <div className="flex gap-1">
                <Button size="sm" variant="ghost" onClick={() => startEditing(task)} className="h-6 w-6 p-0">
                  <Edit2 className="h-3 w-3" />
                </Button>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0 text-red-600 hover:text-red-700">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Delete Task</AlertDialogTitle>
                      <AlertDialogDescription>
                        Are you sure you want to delete "{task.title}"? This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => deleteTask(task._id)} className="bg-red-600 hover:bg-red-700">
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

            <div className="flex flex-wrap gap-1 mb-3">
              <Badge className={getPriorityColor(task.priority)} variant="secondary">
                {task.priority}
              </Badge>
              <Badge className={getStatusColor(task.status)} variant="secondary">
                {task.status.replace("-", " ")}
              </Badge>
            </div>

            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3 w-3" />
                <span>{task.assignedToName}</span>
              </div>
              {task.dueDate && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                </div>
              )}
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{new Date(task.createdAt).toLocaleDateString()}</span>
              </div>
            </div>

            <div className="mt-3">
              <Select value={task.status} onValueChange={(value) => updateTaskStatus(task._id, value)}>
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todo">To Do</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  )

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gray-400"></div>
              To Do ({todoTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {todoTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {todoTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-500"></div>
              In Progress ({inProgressTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {inProgressTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {inProgressTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>}
          </CardContent>
        </Card>
      </div>

      <div>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
              Completed ({completedTasks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {completedTasks.map((task) => (
              <TaskCard key={task._id} task={task} />
            ))}
            {completedTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
