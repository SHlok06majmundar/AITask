"use client"
import { useUser } from "@clerk/nextjs"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { TaskBoard } from "@/components/task-board"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function TasksPage() {
  const { isLoaded, isSignedIn } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push("/sign-in")
    }
  }, [isLoaded, isSignedIn, router])

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    return <LoadingSpinner />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="mb-6">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Tasks</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage and organize your tasks</p>
            </div>
            <TaskBoard />
          </div>
        </main>
      </div>
    </div>
  )
}
