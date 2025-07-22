"use client"

import { useState } from "react"
import { useRealtimeTasks } from "@/lib/hooks/use-realtime-tasks"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Calendar, User, MoreHorizontal, Plus, Edit, Trash2, Save, X } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { toast } from "sonner"
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
  const { tasks, loading, createTask, updateTask, deleteTask } = useRealtimeTasks()
  const [editingTask, setEditingTask] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<Partial<Task>>({})
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [createForm, setCreateForm] = useState({
    title: "",
    description: "",
    priority: "medium" as Task["priority"],
    status: "todo" as Task["status"],
    dueDate: "",
  })

  if (loading) {
    return <LoadingSpinner />
  }

  const handleStatusChange = async (taskId: string, newStatus: Task["status"]) => {
    try {
      await updateTask(taskId, { status: newStatus })
      toast.success("Task status updated!")
    } catch (error) {
      toast.error("Failed to update task status")
    }
  }

  const handleEditTask = (task: Task) => {
    setEditingTask(task._id!)
    setEditForm({
      title: task.title,
      description: task.description,
      priority: task.priority,
      status: task.status,
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split("T")[0] : "",
    })
  }

  const handleSaveEdit = async () => {
    if (!editingTask) return

    try {
      await updateTask(editingTask, {
        ...editForm,
        dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined,
      })
      setEditingTask(null)
      setEditForm({})
      toast.success("Task updated successfully!")
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return

    try {
      await deleteTask(taskId)
      toast.success("Task deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete task")
    }
  }

  const handleCreateTask = async () => {
    if (!createForm.title.trim()) {
      toast.error("Task title is required")
      return
    }

    try {
      await createTask({
        ...createForm,
        dueDate: createForm.dueDate ? new Date(createForm.dueDate) : undefined,
      })
      setCreateForm({
        title: "",
        description: "",
        priority: "medium",
        status: "todo",
        dueDate: "",
      })
      setShowCreateDialog(false)
      toast.success("Task created successfully!")
    } catch (error) {
      toast.error("Failed to create task")
    }
  }

  return (
    <div className="space-y-6">
      {/* Create Task Button */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Task Board</h2>
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Task
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={createForm.title}
                  onChange={(e) => setCreateForm({ ...createForm, title: e.target.value })}
                  placeholder="Enter task title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={createForm.description}
                  onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                  placeholder="Enter task description"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={createForm.priority}
                    onValueChange={(value: Task["priority"]) => setCreateForm({ ...createForm, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <Select
                    value={createForm.status}
                    onValueChange={(value: Task["status"]) => setCreateForm({ ...createForm, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todo">To Do</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="done">Done</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input
                  type="date"
                  value={createForm.dueDate}
                  onChange={(e) => setCreateForm({ ...createForm, dueDate: e.target.value })}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateTask} className="flex-1">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Board */}
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
                        {editingTask === task._id ? (
                          <Input
                            value={editForm.title || ""}
                            onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                            className="text-sm font-medium"
                          />
                        ) : (
                          <CardTitle className="text-sm font-medium line-clamp-2">{task.title}</CardTitle>
                        )}
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            {editingTask === task._id ? (
                              <>
                                <DropdownMenuItem onClick={handleSaveEdit}>
                                  <Save className="h-4 w-4 mr-2" />
                                  Save
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setEditingTask(null)}>
                                  <X className="h-4 w-4 mr-2" />
                                  Cancel
                                </DropdownMenuItem>
                              </>
                            ) : (
                              <>
                                <DropdownMenuItem onClick={() => handleEditTask(task)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDeleteTask(task._id!)} className="text-red-600">
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      {editingTask === task._id ? (
                        <div className="space-y-3">
                          <Textarea
                            value={editForm.description || ""}
                            onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                            placeholder="Task description"
                            className="text-xs"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Select
                              value={editForm.priority}
                              onValueChange={(value: Task["priority"]) => setEditForm({ ...editForm, priority: value })}
                            >
                              <SelectTrigger className="h-8">
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
                              className="h-8 text-xs"
                            />
                          </div>
                        </div>
                      ) : (
                        <>
                          {task.description && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                              {task.description}
                            </p>
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
                            <div className="flex items-center text-xs text-gray-600 dark:text-gray-400 mb-3">
                              <User className="h-3 w-3 mr-1" />
                              {task.assignee.fullName || "Unassigned"}
                            </div>
                          )}

                          <div className="flex gap-1 flex-wrap">
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
                        </>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
