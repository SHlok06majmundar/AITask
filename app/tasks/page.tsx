"use client"

import { useEffect, useState } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskBoard } from "@/components/task-board"
import { CreateTaskDialog } from "@/components/create-task-dialog"
import { Button } from "@/components/ui/button"
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator 
} from "@/components/ui/breadcrumb"
import { Plus, Home, CheckSquare } from "lucide-react"

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
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            {/* Breadcrumb Navigation */}
            <div className="mb-6">
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbLink 
                      href="/" 
                      className="flex items-center gap-1 hover:text-blue-600 transition-colors"
                    >
                      <Home className="h-4 w-4" />
                      Dashboard
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator />
                  <BreadcrumbItem>
                    <BreadcrumbPage className="flex items-center gap-1 font-medium">
                      <CheckSquare className="h-4 w-4" />
                      Tasks
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>

            {/* Page Header */}
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Task Management</h1>
                <p className="text-gray-600 dark:text-gray-400 mt-1">Organize and track your team's tasks and projects</p>
              </div>
              <Button 
                onClick={() => setIsCreateDialogOpen(true)} 
                className="bg-blue-600 hover:bg-blue-700 shadow-lg transition-all duration-200 hover:shadow-xl"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Task
              </Button>
            </div>

            <TaskBoard />

            <CreateTaskDialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen} />
          </div>
        </main>
      </div>
    </div>
  )
}
