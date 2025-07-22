"use client"

import { useState, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Plus, Calendar, Clock, MessageSquare, Timer, CheckCircle2, Target, TrendingUp } from "lucide-react"
import { toast } from "sonner"

interface TeamTask {
  _id: string
  title: string
  description: string
  status: "todo" | "in-progress" | "review" | "completed"
  priority: "low" | "medium" | "high" | "urgent"
  progress: number
  assignedTo: string
  assignedToName: string
  assignedToImage: string
  createdBy: string
  createdByName: string
  createdByImage: string
  dueDate?: string
  tags: string[]
  comments: Array<{
    _id: string
    userId: string
    userName: string
    userImage: string
    comment: string
    createdAt: string
  }>
  timeTracking: {
    estimated: number
    actual: number
    sessions: Array<{
      _id: string
      userId: string
      userName: string
      duration: number
      description: string
      date: string
    }>
  }
  createdAt: string
  updatedAt: string
}

interface TeamMember {
  _id: string
  userId: string
  firstName: string
  lastName: string
  email: string
  imageUrl: string
  role: string
}

export function TeamTaskBoard() {
  const { user } = useUser()
  const [tasks, setTasks] = useState<TeamTask[]>([])
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTask, setSelectedTask] = useState<TeamTask | null>(null)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [timeLog, setTimeLog] = useState({ duration: "", description: "" })

  const [newTask, setNewTask] = useState({
    title: "",
    description: "",
    assignedTo: "",
    priority: "medium" as const,
    dueDate: "",
    tags: "",
  })

  const fetchTasks = async () => {
    try {
      const response = await fetch("/api/team/tasks")
      if (response.ok) {
        const data = await response.json()
        setTasks(data)
      }
    } catch (error) {
      console.error("Error fetching tasks:", error)
    }
  }

  const fetchTeamMembers = async () => {
    try {
      const response = await fetch("/api/team/my-members")
      if (response.ok) {
        const data = await response.json()
        setTeamMembers(data)
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
    fetchTeamMembers()

    // Real-time updates every 3 seconds
    const interval = setInterval(() => {
      fetchTasks()
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const createTask = async () => {
    if (!newTask.title.trim() || !newTask.assignedTo) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      const response = await fetch("/api/team/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newTask,
          tags: newTask.tags
            .split(",")
            .map((tag) => tag.trim())
            .filter(Boolean),
          teamId: user?.id,
        }),
      })

      if (response.ok) {
        toast.success("Task created successfully!")
        setNewTask({
          title: "",
          description: "",
          assignedTo: "",
          priority: "medium",
          dueDate: "",
          tags: "",
        })
        setIsCreateDialogOpen(false)
        fetchTasks()
      }
    } catch (error) {
      toast.error("Failed to create task")
    }
  }

  const updateTaskStatus = async (taskId: string, status: string) => {
    try {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return

      const response = await fetch(`/api/team/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, status }),
      })

      if (response.ok) {
        toast.success("Task status updated!")
        fetchTasks()
      }
    } catch (error) {
      toast.error("Failed to update task")
    }
  }

  const updateProgress = async (taskId: string, progress: number) => {
    try {
      const task = tasks.find((t) => t._id === taskId)
      if (!task) return

      const response = await fetch(`/api/team/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...task, progress }),
      })

      if (response.ok) {
        toast.success("Progress updated!")
        fetchTasks()
      }
    } catch (error) {
      toast.error("Failed to update progress")
    }
  }

  const addComment = async (taskId: string) => {
    if (!newComment.trim()) return

    try {
      const response = await fetch(`/api/team/tasks/${taskId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ comment: newComment }),
      })

      if (response.ok) {
        setNewComment("")
        fetchTasks()
        toast.success("Comment added!")
      }
    } catch (error) {
      toast.error("Failed to add comment")
    }
  }

  const logTime = async (taskId: string) => {
    if (!timeLog.duration || isNaN(Number(timeLog.duration))) {
      toast.error("Please enter a valid duration")
      return
    }

    try {
      const response = await fetch(`/api/team/tasks/${taskId}/time`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "log",
          duration: Number(timeLog.duration),
          description: timeLog.description,
        }),
      })

      if (response.ok) {
        setTimeLog({ duration: "", description: "" })
        fetchTasks()
        toast.success("Time logged successfully!")
      }
    } catch (error) {
      toast.error("Failed to log time")
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "bg-red-500 text-white"
      case "high":
        return "bg-orange-500 text-white"
      case "medium":
        return "bg-yellow-500 text-white"
      case "low":
        return "bg-green-500 text-white"
      default:
        return "bg-gray-500 text-white"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800"
      case "review":
        return "bg-purple-100 text-purple-800"
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
  const reviewTasks = tasks.filter((task) => task.status === "review")
  const completedTasks = tasks.filter((task) => task.status === "completed")

  const TaskCard = ({ task }: { task: TeamTask }) => (
    <Card className="mb-4 hover:shadow-md transition-all cursor-pointer" onClick={() => setSelectedTask(task)}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="font-semibold text-sm line-clamp-2">{task.title}</h3>
          <div className="flex gap-1">
            <Badge className={getPriorityColor(task.priority)} variant="secondary">
              {task.priority}
            </Badge>
          </div>
        </div>

        <p className="text-xs text-muted-foreground mb-3 line-clamp-2">{task.description}</p>

        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-xs">
            <span>Progress</span>
            <span>{task.progress}%</span>
          </div>
          <Progress value={task.progress} className="h-2" />
        </div>

        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={task.assignedToImage || "/placeholder.svg"} />
              <AvatarFallback>{task.assignedToName.charAt(0)}</AvatarFallback>
            </Avatar>
            <span className="text-xs">{task.assignedToName}</span>
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <MessageSquare className="h-3 w-3" />
            <span>{task.comments.length}</span>
          </div>
        </div>

        {task.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tag, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {tag}
              </Badge>
            ))}
            {task.tags.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{task.tags.length - 3}
              </Badge>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span>{task.timeTracking.actual}h logged</span>
          </div>
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Team Tasks</h2>
          <p className="text-muted-foreground">Collaborate and track progress together</p>
        </div>

        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Assign Task
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Create Team Task</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title *</label>
                <Input
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                  placeholder="Enter task title..."
                />
              </div>

              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Describe the task..."
                  rows={3}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Assign To *</label>
                <Select
                  value={newTask.assignedTo}
                  onValueChange={(value) => setNewTask({ ...newTask, assignedTo: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select team member" />
                  </SelectTrigger>
                  <SelectContent>
                    {teamMembers.map((member) => (
                      <SelectItem key={member.userId} value={member.userId}>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={member.imageUrl || "/placeholder.svg"} />
                            <AvatarFallback>{member.firstName.charAt(0)}</AvatarFallback>
                          </Avatar>
                          {member.firstName} {member.lastName}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select
                    value={newTask.priority}
                    onValueChange={(value: any) => setNewTask({ ...newTask, priority: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newTask.dueDate}
                    onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Tags</label>
                <Input
                  value={newTask.tags}
                  onChange={(e) => setNewTask({ ...newTask, tags: e.target.value })}
                  placeholder="frontend, urgent, bug (comma separated)"
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={createTask} className="flex-1">
                  Create Task
                </Button>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Task Board */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {/* To Do Column */}
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

        {/* In Progress Column */}
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
              {inProgressTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Review Column */}
        <div>
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                Review ({reviewTasks.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              {reviewTasks.map((task) => (
                <TaskCard key={task._id} task={task} />
              ))}
              {reviewTasks.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>}
            </CardContent>
          </Card>
        </div>

        {/* Completed Column */}
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
              {completedTasks.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No tasks</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Task Detail Modal */}
      {selectedTask && (
        <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                {selectedTask.title}
              </DialogTitle>
            </DialogHeader>

            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="details">Details</TabsTrigger>
                <TabsTrigger value="comments">Comments ({selectedTask.comments.length})</TabsTrigger>
                <TabsTrigger value="time">Time Tracking</TabsTrigger>
                <TabsTrigger value="progress">Progress</TabsTrigger>
              </TabsList>

              <TabsContent value="details" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Status</label>
                    <Select
                      value={selectedTask.status}
                      onValueChange={(value) => updateTaskStatus(selectedTask._id, value)}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="review">Review</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Badge className={getPriorityColor(selectedTask.priority)}>{selectedTask.priority}</Badge>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium">Description</label>
                  <p className="text-sm text-muted-foreground mt-1">{selectedTask.description}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTask.assignedToImage || "/placeholder.svg"} />
                      <AvatarFallback>{selectedTask.assignedToName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Assigned to</p>
                      <p className="text-xs text-muted-foreground">{selectedTask.assignedToName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={selectedTask.createdByImage || "/placeholder.svg"} />
                      <AvatarFallback>{selectedTask.createdByName.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="text-sm font-medium">Created by</p>
                      <p className="text-xs text-muted-foreground">{selectedTask.createdByName}</p>
                    </div>
                  </div>
                </div>

                {selectedTask.tags.length > 0 && (
                  <div>
                    <label className="text-sm font-medium">Tags</label>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedTask.tags.map((tag, index) => (
                        <Badge key={index} variant="outline">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="comments" className="space-y-4">
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedTask.comments.map((comment) => (
                    <div key={comment._id} className="flex gap-3 p-3 bg-muted rounded-lg">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={comment.userImage || "/placeholder.svg"} />
                        <AvatarFallback>{comment.userName.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.userName}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.createdAt).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm">{comment.comment}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Textarea
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder="Add a comment..."
                    rows={2}
                    className="flex-1"
                  />
                  <Button onClick={() => addComment(selectedTask._id)}>
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value="time" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedTask.timeTracking.actual}h</p>
                        <p className="text-sm text-muted-foreground">Time Logged</p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4">
                      <div className="text-center">
                        <p className="text-2xl font-bold">{selectedTask.timeTracking.sessions.length}</p>
                        <p className="text-sm text-muted-foreground">Sessions</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Log Time</h4>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={timeLog.duration}
                      onChange={(e) => setTimeLog({ ...timeLog, duration: e.target.value })}
                      className="w-24"
                    />
                    <Input
                      placeholder="Description (optional)"
                      value={timeLog.description}
                      onChange={(e) => setTimeLog({ ...timeLog, description: e.target.value })}
                      className="flex-1"
                    />
                    <Button onClick={() => logTime(selectedTask._id)}>
                      <Timer className="h-4 w-4 mr-2" />
                      Log
                    </Button>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Time Sessions</h4>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedTask.timeTracking.sessions.map((session) => (
                      <div key={session._id} className="flex justify-between items-center p-2 bg-muted rounded">
                        <div>
                          <p className="text-sm font-medium">{session.userName}</p>
                          <p className="text-xs text-muted-foreground">{session.description}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{session.duration}h</p>
                          <p className="text-xs text-muted-foreground">{new Date(session.date).toLocaleDateString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="progress" className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-sm font-medium">Progress</label>
                    <span className="text-sm font-medium">{selectedTask.progress}%</span>
                  </div>
                  <Progress value={selectedTask.progress} className="mb-4" />

                  <div className="flex gap-2">
                    {[0, 25, 50, 75, 100].map((value) => (
                      <Button
                        key={value}
                        variant={selectedTask.progress === value ? "default" : "outline"}
                        size="sm"
                        onClick={() => updateProgress(selectedTask._id, value)}
                      >
                        {value}%
                      </Button>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardContent className="p-4 text-center">
                      <CheckCircle2 className="h-8 w-8 mx-auto mb-2 text-green-500" />
                      <p className="text-sm font-medium">Status</p>
                      <Badge className={getStatusColor(selectedTask.status)}>
                        {selectedTask.status.replace("-", " ")}
                      </Badge>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardContent className="p-4 text-center">
                      <TrendingUp className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                      <p className="text-sm font-medium">Completion</p>
                      <p className="text-lg font-bold">{selectedTask.progress}%</p>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
