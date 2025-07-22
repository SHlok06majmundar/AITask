"use client"

import { useUser } from "@clerk/nextjs"
import { redirect } from "next/navigation"
import { Sidebar } from "@/components/sidebar"
import { DashboardHeader } from "@/components/dashboard-header"
import { TaskBoard } from "@/components/task-board"
import { QuickStats } from "@/components/quick-stats"
import { RecentActivity } from "@/components/recent-activity"
import { LoadingSpinner } from "@/components/loading-spinner"

export default function Dashboard() {
  const { isLoaded, isSignedIn } = useUser()

  if (!isLoaded) {
    return <LoadingSpinner />
  }

  if (!isSignedIn) {
    redirect("/sign-in")
  }

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 dark:bg-gray-900">
          <div className="container mx-auto px-6 py-8">
            <div className="grid gap-6 mb-8 md:grid-cols-2 xl:grid-cols-4">
              <QuickStats />
            </div>
            <div className="grid gap-6 mb-8 md:grid-cols-2">
              <div className="md:col-span-2">
                <TaskBoard />
              </div>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <RecentActivity />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
