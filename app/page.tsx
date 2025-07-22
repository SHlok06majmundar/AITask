"use client"

import { useUser } from "@clerk/nextjs"
import { RedirectToSignIn } from "@clerk/nextjs"
import { DashboardHeader } from "@/components/dashboard-header"
import { Sidebar } from "@/components/sidebar"
import { TaskBoard } from "@/components/task-board"
import { AIAssistant } from "@/components/ai-assistant"
import { QuickStats } from "@/components/quick-stats"
import { RecentActivity } from "@/components/recent-activity"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!isSignedIn) {
    return <RedirectToSignIn />
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
              <div className="lg:col-span-3">
                <QuickStats />
              </div>
              <div className="lg:col-span-1">
                <AIAssistant />
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
              <div className="xl:col-span-2">
                <TaskBoard />
              </div>
              <div className="xl:col-span-1">
                <RecentActivity />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
