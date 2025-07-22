"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Button } from "@/components/ui/button"
import { Plus } from "lucide-react"

export default function TasksPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)

  useEffect(() => {
    if (isLoaded && !user) {
      router.push("/sign-in")
    }
  }, [isLoaded, user, router])

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-muted-foreground">Manage your team's tasks and projects</p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Create Task
        </Button>
      </div>

      <TaskBoard />

      <CreateTaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
    </div>
  )
}
